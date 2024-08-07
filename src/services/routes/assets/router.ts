import HyperCloudServer from '../../../server';
import { HttpMethod, HyperCloudRequestHandler, StaticRouteOptions } from '../../../docs/docs';
import Route from './route';
import StaticRoute from './staticRoute';
import helpers from '../../../utils/helpers';

import fs from 'fs';
import path from 'path';

export class Router {
    #_server: HyperCloudServer | undefined;
    #_routes = { static: [] as StaticRoute[], dynamic: [] as Route[] }

    #_defaults = {
        caseSensitive: false,
        subDomain: '*'
    }

    #_utils = Object.freeze({
        /**Create a route based on a method */
        createRoute: (method: 'USE' | HttpMethod, path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) => {
            const caseSensitive = options && 'caseSensitive' in options ? options.caseSensitive : this.#_defaults.caseSensitive;
            const subDomain = options && 'subDomain' in options ? options.subDomain : this.#_defaults.subDomain;

            const route = new Route({ path, handler, method, caseSensitive, subDomain });
            if (this.#_server instanceof HyperCloudServer) {
                this.#_server._routesManager.add(route);
            } else {
                this.#_routes.dynamic.push(route);
            }
        },
        createStaticRoute: (root: string, options?: StaticRouteOptions) => {
            const caseSensitive = options && 'caseSensitive' in options ? options.caseSensitive : this.#_defaults.caseSensitive;
            const subDomain = options && 'subDomain' in options ? options.subDomain : this.#_defaults.subDomain;
            const userPath = options && 'path' in options ? options.path : '/';
            const path = userPath.startsWith('/') ? userPath : `/${userPath}`;
            const dotfiles = options && 'dotfiles' in options ? options.dotfiles : 'ignore';

            const route = new StaticRoute(root, { path, subDomain, caseSensitive, dotfiles });
            if (this.#_server instanceof HyperCloudServer) {
                this.#_server._routesManager.add(route);
            } else {
                this.#_routes.static.push(route);
            }
        }
    })

    constructor(server?: HyperCloudServer, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        if (server instanceof HyperCloudServer) { this.#_server = server }

        if (options && 'caseSensitive' in options && typeof options.caseSensitive === 'boolean') { this.#_defaults.caseSensitive = options.caseSensitive }
        if (options && 'subDomain' in options && typeof options.subDomain === 'string') { this.#_defaults.subDomain = options.subDomain }
    }

    /**
     * A property used when to get the data from this router
     * when extended by the server.
     * @private
     */
    get _data() {
        if (this.#_server instanceof HyperCloudServer) { return null }

        return {
            routes: { static: this.#_routes.static, dynamic: this.#_routes.dynamic },
            options: { ...this.#_defaults }
        }
    }

    /**
     * Set your site's **favicon** by providing a path to a `favicon.ico` file.
     * 
     * The route will be mounted on the root path: `/favicon.ico`. You can also
     * provide a `png` image as the favicon, for example: `favicon.png`, but the
     * favicon will still be accessible by `/favicon.ico`.
     */
    favicon(faviconPath: string, eTag?: string) {
        if (typeof faviconPath !== 'string') { throw new TypeError(`The favicon path that you provided cannot be of type ${typeof faviconPath}, only pass a string as a value`) }
        const validity = helpers.checkPathAccessibility(faviconPath);
        if (validity.valid !== true) { throw `The favicon path you provided (${faviconPath}) is not valid. Make sure it's accessible and does exist` }

        const stats = fs.statSync(faviconPath);
        if (!stats.isDirectory()) { throw `The favicon path you provided (${faviconPath}) is not a directory` }

        const content = fs.readdirSync(faviconPath, { withFileTypes: true });
        const file = content.find(i => i.isFile() && i.name.startsWith('favicon'));
        if (!file) { throw `The favicon path you provided (${faviconPath}) does not contain a favicon file` }

        const route = new Route({
            path: '/favicon.ico',
            caseSensitive: true,
            method: 'GET',
            handler: (_, response) => {
                response.status(200).sendFile(path.join(faviconPath, file.name), {
                    lastModified: true,
                    cacheControl: true,
                    maxAge: '3 days',
                    eTag: eTag,
                })
            }
        })

        if (this.#_server instanceof HyperCloudServer) {
            this.#_server._routesManager.add(route);
        } else {
            this.#_routes.dynamic.push(route)
        }
    }

    /**
     * A static middleware
     * @param {string} root The root directory to serve statically
     * @param {StaticRouteOptions} [options] static options
     */
    static(root: string, options?: StaticRouteOptions) {
        this.#_utils.createStaticRoute(root, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    use(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'USE';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    get(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'GET';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    post(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'POST';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    put(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'PUT';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    delete(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'DELETE';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    patch(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'PATCH';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    head(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'HEAD';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    options(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'OPTIONS';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    trace(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'TRACE';
        this.#_utils.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    connect(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }) {
        const method = 'CONNECT';
        this.#_utils.createRoute(method, path, handler, options);
    }
}

export default Router;