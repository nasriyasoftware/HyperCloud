"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = __importDefault(require("./route"));
const staticRoute_1 = __importDefault(require("./staticRoute"));
const helpers_1 = __importDefault(require("../../../utils/helpers"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Router {
    #_server;
    #_defaults = {
        caseSensitive: false,
        subDomain: '*'
    };
    #_utils = Object.freeze({
        /**Create a route based on a method */
        createRoute: (method, path, handler, options) => {
            const caseSensitive = options && 'caseSensitive' in options ? options.caseSensitive : this.#_defaults.caseSensitive;
            const subDomain = options && 'subDomain' in options ? options.subDomain : this.#_defaults.subDomain;
            const route = new route_1.default({ path, handler, method, caseSensitive, subDomain });
            this.#_server._routesManager.add(route);
        },
        createStaticRoute: (root, options) => {
            const caseSensitive = options && 'caseSensitive' in options ? options.caseSensitive : this.#_defaults.caseSensitive;
            const subDomain = options && 'subDomain' in options ? options.subDomain : this.#_defaults.subDomain;
            const path = options && 'path' in options ? options.path : '/';
            const dotfiles = options && 'dotfiles' in options ? options.dotfiles : 'ignore';
            const route = new staticRoute_1.default(root, { path, subDomain, caseSensitive, dotfiles });
            this.#_server._routesManager.add(route);
        }
    });
    constructor(server, options) {
        this.#_server = server;
        if (options && 'caseSensitive' in options && typeof options.caseSensitive === 'boolean') {
            this.#_defaults.caseSensitive = options.caseSensitive;
        }
        if (options && 'subDomain' in options && typeof options.subDomain === 'string') {
            this.#_defaults.subDomain = options.subDomain;
        }
    }
    /**
     * Set your site's **favicon** by providing a path to a `favicon.ico` file.
     *
     * The route will be mounted on the root path: `/favicon.ico`. You can also
     * provide a `png` image as the favicon, for example: `favicon.png`, but the
     * favicon will still be accessible by `/favicon.ico`.
     */
    favicon(faviconPath, eTag) {
        if (typeof faviconPath !== 'string') {
            throw new TypeError(`The favicon path that you provided cannot be of type ${typeof faviconPath}, only pass a string as a value`);
        }
        const validity = helpers_1.default.checkPathAccessibility(faviconPath);
        if (validity.valid !== true) {
            throw `The favicon path you provided (${faviconPath}) is not valid. Make sure it's accessible and does exist`;
        }
        const stats = fs_1.default.statSync(faviconPath);
        if (!stats.isDirectory()) {
            throw `The favicon path you provided (${faviconPath}) is not a directory`;
        }
        const content = fs_1.default.readdirSync(faviconPath, { withFileTypes: true });
        const file = content.find(i => i.isFile() && i.name.startsWith('favicon'));
        if (!file) {
            throw `The favicon path you provided (${faviconPath}) does not contain a favicon file`;
        }
        const route = new route_1.default({
            path: '/favicon.ico',
            caseSensitive: true,
            method: 'GET',
            handler: (_, response) => {
                response.status(200).sendFile(path_1.default.join(faviconPath, file.name), {
                    lastModified: true,
                    cacheControl: true,
                    maxAge: '3 days',
                    eTag: eTag,
                });
            }
        });
        this.#_server._routesManager.add(route);
    }
    /**
     * A static middleware
     * @param {string} root The root directory to serve statically
     * @param {StaticRouteOptions} [options] static options
     */
    static(root, options) {
        this.#_utils.createStaticRoute(root, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    use(path, handler, options) {
        const method = 'USE';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    get(path, handler, options) {
        const method = 'GET';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    post(path, handler, options) {
        const method = 'POST';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    put(path, handler, options) {
        const method = 'PUT';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    delete(path, handler, options) {
        const method = 'DELETE';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    patch(path, handler, options) {
        const method = 'PATCH';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    head(path, handler, options) {
        const method = 'HEAD';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    options(path, handler, options) {
        const method = 'OPTIONS';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    trace(path, handler, options) {
        const method = 'TRACE';
        this.#_utils.createRoute(method, path, handler, options);
    }
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    connect(path, handler, options) {
        const method = 'CONNECT';
        this.#_utils.createRoute(method, path, handler, options);
    }
}
exports.default = Router;
