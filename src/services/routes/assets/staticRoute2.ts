import atomix from "@nasriya/atomix";
import cachify from "@nasriya/cachify";
import { HyperCloudRequestHandler, StaticRouteOptions } from "../../../docs/docs";
import { HyperCloudRequest, HyperCloudResponse } from "../../../hypercloud";

import fs from 'fs';
import path from 'path';

class StaticRoute {
    readonly #_root: string;
    readonly #_configs = {
        caseSensitive: false,
        subDomain: '*' as '*' | string,
        method: 'GET',
        handler: null as unknown as HyperCloudRequestHandler,
        dotfiles: 'ignore' as 'allow' | 'ignore' | 'deny',
        path: [] as string[],
        memoryCache: true
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
            memoryCache: (options: StaticRouteOptions) => {
                if ('memoryCache' in options) {
                    if (typeof options.memoryCache !== 'boolean') { throw new TypeError(`The Route's memoryCache option is expecting a boolean value, but instead got ${typeof options.memoryCache}`) }
                    this.#_configs.memoryCache = options.memoryCache;
                }
            },
        },
        cachePath: async (dir: string, setPromises: Promise<unknown>[]) => {
            const content = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of content) {
                if (item.isDirectory()) {
                    this.#_utils.cachePath(path.join(dir, item.name), setPromises);
                } else {
                    setPromises.push(cachify.files.set(path.join(dir, item.name), {
                        preload: true,
                        initiator: 'warmup'
                    }));
                }
            }
        },
        cacheRoot: async () => {
            const stats = fs.statSync(this.#_root);
            const promises: Promise<unknown>[] = [];
            if (stats.isDirectory()) {
                this.#_utils.cachePath(this.#_root, promises);
            } else {
                promises.push(cachify.files.set(this.#_root, {
                    preload: true,
                    initiator: 'warmup'
                }));
            }

            await Promise.all(promises);
        },
        validate: {
            routePath: (request: HyperCloudRequest, response: HyperCloudResponse) => {

            }
        }
    })

    constructor(root: string, options: StaticRouteOptions) {
        atomix.fs.canAccessSync(root, { permissions: 'Read', throwError: true });

        this.#_root = root;
        this.#_utils.initialize.dotfiles(options);
        this.#_utils.initialize.path(options);
        this.#_utils.initialize.subDomain(options);
        this.#_utils.initialize.caseSensitive(options);
        this.#_utils.initialize.memoryCache(options);

        if (this.#_configs.memoryCache) {
            this.#_utils.cacheRoot().then(() => {
                this.#_configs.handler = (request, response, next) => {
                    try {
                        if (request.path.length < this.#_configs.path.length) {
                            return response.pages.serverError({
                                error: new Error(`Request path is shorter than route prefix. Possible framework route-matching bug.`)
                            });
                        }

                        // Remove the initial path (the virtual path) and keep the root path
                        const reqPath = request.path.slice(this.#_configs.path.length, request.path.length);

                        const fileRecord = cachify.files.inspect({ filePath: reqPath.join(path.sep) });
                        if (!fileRecord) {
                            return response.pages.notFound();
                        }

                        response.setHeader('Content-Type', fileRecord);
                    } catch (error) {
                        console.error(error);
                        response.pages.serverError({ error: error as Error });
                    }
                }
            })
        } else {

        }
    }

    get subDomain(): '*' | string { return this.#_configs.subDomain }
    get caseSensitive() { return this.#_configs.caseSensitive }
    get method() { return this.#_configs.method }
    get path() { return this.#_configs.path }
    get handler() { return this.#_configs.handler }
}