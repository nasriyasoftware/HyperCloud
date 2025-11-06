import atomix from "@nasriya/atomix";
import mimex from "@nasriya/mimex";
import overwatch from "@nasriya/overwatch";
import routeCache from "../../cache/routeCache";
import type { HyperCloudRequestHandler, MimeType, StaticRouteOptions } from "../../../docs/docs";

import fs from 'fs';
import path from 'path';
import HTTPError from "../../../utils/errors/HTTPError";

const CACHE_SCOPE = 'hypercloud_static_routes' as const;

class StaticRoute {
    readonly #_root: string;
    readonly #_configs = {
        caseSensitive: false,
        subDomain: '*' as '*' | string,
        method: 'GET',
        handler: null as unknown as HyperCloudRequestHandler,
        dotfiles: 'ignore' as 'allow' | 'ignore' | 'deny',
        path: [] as string[],
    }

    readonly #_utils = Object.freeze({
        initialize: {
            dotfiles: (options: StaticRouteOptions) => {
                if ('dotfiles' in options) {
                    if (typeof options.dotfiles !== 'string') { throw new TypeError(`The route's dotfiles options is expecting a string value, but instead got ${typeof options.dotfiles}`) }
                    const values = ['allow', 'ignore', 'deny'];
                    if (!values.includes(options.dotfiles)) { throw new RangeError(`The route's dotfiles value that you provided is invalid. Possible values are: ${values.join(', ')}.`) }

                }
            },
            path: (options: StaticRouteOptions) => {
                if ('path' in options) {
                    if (typeof options.path !== 'string') { throw new TypeError(`The route's path only accepts a string value, but instead got ${typeof options.path}`) }
                    if (options.path.length === 0) { throw new SyntaxError(`The rout's path cannot be an empty string`) }
                    this.#_configs.path = options.path.split('/').filter(i => i.length > 0);
                }
            },
            subDomain: (options: StaticRouteOptions) => {
                if ('subDomain' in options) {
                    if (typeof options.subDomain !== 'string') { throw new TypeError(`The route's subDomain option is expecting a string value, but instead got ${typeof options.subDomain}`) }
                    this.#_configs.subDomain = options.subDomain;
                }
            },
            caseSensitive: (options: StaticRouteOptions) => {
                if ('caseSensitive' in options) {
                    if (typeof options.caseSensitive !== 'boolean') { throw new TypeError(`The Route's caseSensitive option is expecting a boolean value, but instead got ${typeof options.caseSensitive}`) }
                    this.#_configs.caseSensitive = options.caseSensitive;
                }
            },
            route: async () => {
                await this.#_utils.cache.route();
                await overwatch.watchFolder(this.#_root, {
                    onRemove: async (event) => {
                        try {
                            const record = routeCache.files.inspect({ filePath: event.path, scope: CACHE_SCOPE, caseSensitive: this.#_configs.caseSensitive });
                            if (!record) { return }

                            await routeCache.files.remove({
                                filePath: event.path,
                                scope: CACHE_SCOPE,
                                caseSensitive: this.#_configs.caseSensitive
                            })
                        } catch (error) {
                            console.error(`Failed to remove ${event.path} from cache:`, error);
                        }
                    },
                    onAdd: async (event) => {
                        try {
                            await this.#_utils.cache.createRecord(event.path);
                        } catch (error) {
                            console.error(`Failed to add ${event.path} to cache:`, error);
                        }
                    }
                });
            }
        },
        cache: {
            createRecord: async (filePath: string) => {
                const fileName = path.basename(filePath);
                if (fileName.startsWith('.') && this.#_configs.dotfiles !== 'allow') {
                    return;
                }

                return routeCache.files.set(filePath, {
                    scope: CACHE_SCOPE,
                    ttl: 1_000 * 60 * 60 // 1 hour
                });
            },
            path: (dir: string, setPromises: Promise<void>[]) => {
                const content = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of content) {
                    const contentPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        this.#_utils.cache.path(contentPath, setPromises);
                    } else {
                        const createPromise = this.#_utils.cache.createRecord(contentPath)
                        setPromises.push(createPromise);
                    }
                }
            },
            route: async () => {
                const stats = fs.statSync(this.#_root);
                const promises: Promise<void>[] = [];

                if (stats.isDirectory()) {
                    this.#_utils.cache.path(this.#_root, promises);
                } else {
                    const createPromise = this.#_utils.cache.createRecord(this.#_root);
                    promises.push(createPromise);
                }

                await Promise.all(promises);
            }
        },
        getFileMime: (filePath: string) => {
            const ext = path.extname(filePath);
            const mimes = mimex.getMimes(ext);
            return mimes ? mimes[0] : 'text/plain';
        },
        parseFile: (_reqPath: string[]) => {
            // Remove the initial path (the virtual path) and keep the root path
            const reqPath = _reqPath.slice(this.#_configs.path.length, _reqPath.length).join(path.sep);
            const filePath = path.join(this.#_root, reqPath);

            // Prevent path traversal attacks
            if (!atomix.path.isSubPath(filePath, this.#_root)) {
                const error = new Error(`Path traversal attack detected on path: ${filePath}`);
                error.name = 'PathTraversalError';
                throw error;
            }

            const fileName = path.basename(filePath);
            const mimeType = this.#_utils.getFileMime(filePath) as MimeType;

            return { path: filePath, name: fileName, mimeType }
        }
    })

    readonly #_handlers = {
        cacheHandler: (async (request, response, next) => {
            try {
                if (request.path.length < this.#_configs.path.length) {
                    return response.pages.serverError({
                        error: new Error(`Request path is shorter than route prefix. Possible framework route-matching bug.`)
                    });
                }

                // Parse the file from the request
                const reqFile = this.#_utils.parseFile(request.path);

                // Check the file against the policy
                if (reqFile.name.startsWith('.')) {
                    if (this.#_configs.dotfiles === 'ignore') { return next() }
                    if (this.#_configs.dotfiles === 'deny') { return response.pages.forbidden() }
                }

                // Check if the file exists
                const fileRecord = routeCache.files.inspect({
                    filePath: reqFile.path,
                    scope: CACHE_SCOPE,
                    caseSensitive: this.#_configs.caseSensitive
                });

                if (!fileRecord) { return next(); }

                // Define headers values
                const modifiedDate = new Date(fileRecord.file.stats.mtime);
                const eTag = fileRecord.file.eTag;

                // Check for conditional headers
                const ifNoneMatch = request.headers['if-none-match'];
                const ifModifiedSince = request.headers['if-modified-since'];

                if (ifNoneMatch || ifModifiedSince) {
                    // Normalize ETag (strip quotes if present)
                    const normalizedIfNoneMatch = ifNoneMatch?.replace(/^W\//, '').replace(/(^"|"$)/g, '');

                    // Validate modification date
                    const clientDate = ifModifiedSince ? new Date(ifModifiedSince) : null;
                    const isDateValid = clientDate instanceof Date && !isNaN(clientDate.getTime());

                    // Check for matches
                    const isEtagMatch = normalizedIfNoneMatch === eTag;
                    const isDateMatch = isDateValid && clientDate >= modifiedDate;

                    // Return 304 if resource not modified
                    if (isEtagMatch || isDateMatch) {
                        return response.status(304).end();
                    }
                }

                response.setHeader('etag', eTag);
                response.setHeader('last-modified', modifiedDate.toUTCString());

                const readResponse = await routeCache.files.read({
                    key: fileRecord.key,
                    scope: CACHE_SCOPE,
                    caseSensitive: this.#_configs.caseSensitive
                });

                if (!readResponse) { return next(); }

                response.setHeader('Cachify-Status', readResponse.status)
                response.send(readResponse.content, reqFile.mimeType);
            } catch (error) {
                if (error instanceof Error && error.name === 'PathTraversalError') {
                    response.pages.forbidden();
                    return;
                }

                console.error(error);
                response.pages.serverError({ error: error as Error });
            }
        }) as HyperCloudRequestHandler
    }

    constructor(root: string, options: StaticRouteOptions) {
        atomix.fs.canAccessSync(root, { permissions: 'Read', throwError: true });

        this.#_root = root;
        this.#_utils.initialize.dotfiles(options);
        this.#_utils.initialize.path(options);
        this.#_utils.initialize.subDomain(options);
        this.#_utils.initialize.caseSensitive(options);

        this.#_configs.handler = this.#_handlers.cacheHandler;
        void this.#_utils.initialize.route().catch(console.error);
    }

    get subDomain(): '*' | string { return this.#_configs.subDomain }
    get caseSensitive() { return this.#_configs.caseSensitive }
    get method() { return this.#_configs.method }
    get path() { return this.#_configs.path }
    get handler() { return this.#_configs.handler }
}

export default StaticRoute;