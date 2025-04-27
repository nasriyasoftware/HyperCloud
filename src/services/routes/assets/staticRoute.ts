import { StaticRouteOptions, HyperCloudRequestHandler } from '../../../docs/docs';
import helpers from '../../../utils/helpers';

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
            }
        }
    })

    constructor(root: string, options: StaticRouteOptions) {
        const validity = helpers.checkPathAccessibility(root);
        if (validity.valid !== true) {
            const errors = validity.errors;
            if (errors.notString) { throw new Error(`The root directory should be a string value, instead got ${typeof root}`) }
            if (errors.doesntExist) { throw new Error(`The provided root directory (${root}) doesn't exist.`) }
            if (errors.notAccessible) { throw new Error(`Unable to access (${root}): read permission denied.`) }
        }

        this.#_root = root;
        this.#_utils.initialize.dotfiles(options);
        this.#_utils.initialize.path(options);
        this.#_utils.initialize.subDomain(options);
        this.#_utils.initialize.caseSensitive(options);

        this.#_configs.handler = (request, response, next) => {
            try {
                if (request.path.length < this.#_configs.path.length) { return response.status(500).end({ data: `Internal server error (500).\n\nIf you're a visitor please wait a few minutes.` }) }
                // Remove the initial path (the virtual path) and keep the root path
                const reqPath = request.path.slice(this.#_configs.path.length, request.path.length);

                for (let i = 0; i < reqPath.length; i++) {
                    const pathSegment = reqPath[i];
                    const isLast = i + 1 >= reqPath.length;

                    if (pathSegment.startsWith('.')) {
                        if (this.#_configs.dotfiles === 'ignore') { return next() }
                        if (this.#_configs.dotfiles === 'deny') { return response.pages.unauthorized() }
                    }

                    if (!isLast) { continue }

                    const copy = [...reqPath]; // Create a copy of the request path array
                    copy.pop(); // Removes the last item (resource name) from the copy array    

                    // Resolve the folder path from the root directory and the request path
                    const folder = path.resolve(path.join(this.#_root, ...copy));
                    // Check folder path validity                       
                    const validity = helpers.checkPathAccessibility(folder);
                    if (validity.valid !== true) { return next() }

                    // Check if the path is an actual directory
                    const folderStats = fs.statSync(folder);
                    if (!folderStats.isDirectory()) { return next() }

                    const filename = pathSegment;
                    // Read the content of the folder
                    const content = fs.readdirSync(folder, { withFileTypes: true });

                    const file = content.find(i => {
                        if (this.#_configs.caseSensitive) {
                            if (i.name === filename) { return true }
                        } else {
                            if (i.name.toLowerCase() === filename.toLowerCase()) { return true }
                        }

                        return false
                    })

                    if (!file || !file.isFile()) { return next() }

                    // Check the eTag value if it does exist
                    const eTagsPath = path.join(folder, 'eTags.json');
                    const eTagValidity = helpers.checkPathAccessibility(eTagsPath);
                    if (eTagValidity.valid) {
                        const eTags = JSON.parse(fs.readFileSync(eTagsPath, { encoding: 'utf-8' }))
                        if (helpers.is.realObject(eTags)) {
                            if (file.name in eTags) { response.setHeader('etag', eTags[file.name]) }
                        }
                    }

                    const filePath = path.join(folder, file.name);
                    return response.sendFile(filePath, {
                        lastModified: true,
                        acceptRanges: true,
                        cacheControl: true,
                        maxAge: '3 days'
                    })
                }

                next();
            } catch (error) {
                console.error(error);
                response.status(500).json({ type: 'server_error', code: 500, href: request.href, message: "An internal server error occurred." })
            }
        }
    }

    
    get subDomain(): '*' | string { return this.#_configs.subDomain }
    get caseSensitive() { return this.#_configs.caseSensitive }
    get method() { return this.#_configs.method }
    get path() { return this.#_configs.path }
    get handler() { return this.#_configs.handler }
}

export default StaticRoute;