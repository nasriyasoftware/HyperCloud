const HyperCloudServer = require('../../../server')
const Docs = require('../../../utils/docs');
const Route = require('./route');
const StaticRoute = require('./staticRoute');

class Router {
    /**@type {HyperCloudServer} */
    #server;

    #defaults = {
        caseSensitive: false,
        subDomain: '*'
    }

    /**
     * 
     * @param {HyperCloudServer} server 
     * @param {{caseSensitive?: boolean, subDomain?: string}} options 
     */
    constructor(server, options) {
        this.#server = server;
        if ('caseSensitive' in options && typeof options.caseSensitive === 'boolean') { this.#defaults.caseSensitive = options.caseSensitive }
        if ('subDomain' in options && typeof options.subDomain === 'string') { this.#defaults.subDomain = options.subDomain }
    }

    #helpers = Object.freeze({
        /**
         * Create a route based on a method
         * @param {'USE'|Docs.HttpMethod} method 
         * @param {string} path 
         * @param {Docs.HyperCloudRequestHandler} handler 
         * @param {{caseSensitive?: boolean, subDomain?: string}} options 
         */
        createRoute: (method, path, handler, options) => {
            const caseSensitive = options && 'caseSensitive' in options ? options.caseSensitive : this.#defaults.caseSensitive;
            const subDomain = options && 'subDomain' in options ? options.subDomain : this.#defaults.subDomain;

            const route = new Route({ path, handler, method, caseSensitive, subDomain });
            this.#server._routesManager.add(route);
        },
        createStaticRoute: (root, options) => { 
            const caseSensitive = options && 'caseSensitive' in options ? options.caseSensitive : this.#defaults.caseSensitive;
            const subDomain = options && 'subDomain' in options ? options.subDomain : this.#defaults.subDomain;
            const path = options && 'path' in options ? options.path : '/';
            const dotfiles = options && 'dotfiles' in options ? options.dotfiles : 'ignore';

            const route = new StaticRoute(root, { path, subDomain, caseSensitive, dotfiles });
            this.#server._routesManager.add(route);
        }
    })

    /**
     * A static middleware
     * @param {string} root The root directory to serve statically
     * @param {Docs.StaticRouteOptions} [options] static options
     */
    static(root, options= {}) {
        this.#helpers.createStaticRoute(root, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    use(path, handler, options) {
        const method = 'USE';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    get(path, handler, options) {
        const method = 'GET';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    post(path, handler, options) {
        const method = 'POST';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    put(path, handler, options) {
        const method = 'PUT';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    delete(path, handler, options) {
        const method = 'DELETE';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    patch(path, handler, options) {
        const method = 'PATCH';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    head(path, handler, options) {
        const method = 'HEAD';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    options(path, handler, options) {
        const method = 'OPTIONS';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    trace(path, handler, options) {
        const method = 'TRACE';
        this.#helpers.createRoute(method, path, handler, options);
    }

    /**
     * 
     * @param {string} path The route path
     * @param {Docs.HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    connect(path, handler, options) {
        const method = 'CONNECT';
        this.#helpers.createRoute(method, path, handler, options);
    }
}



module.exports = Router;