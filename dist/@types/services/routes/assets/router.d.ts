import HyperCloudServer from '../../../server';
import { HyperCloudRequestHandler, StaticRouteOptions } from '../../../docs/docs';
declare class Router {
    #private;
    constructor(server: HyperCloudServer, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    });
    /**
     * Set your site's **favicon** by providing a path to a `favicon.ico` file.
     *
     * The route will be mounted on the root path: `/favicon.ico`. You can also
     * provide a `png` image as the favicon, for example: `favicon.png`, but the
     * favicon will still be accessible by `/favicon.ico`.
     */
    favicon(faviconPath: string, eTag?: string): void;
    /**
     * A static middleware
     * @param {string} root The root directory to serve statically
     * @param {StaticRouteOptions} [options] static options
     */
    static(root: string, options?: StaticRouteOptions): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    use(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    get(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    post(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    put(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    delete(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    patch(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    head(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    options(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    trace(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
    /**
     *
     * @param {string} path The route path
     * @param {HyperCloudRequestHandler} handler A function to handle the request
     * @param {{caseSensitive?: boolean, subDomain?: string}} [options] Route options
     */
    connect(path: string, handler: HyperCloudRequestHandler, options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): void;
}
export default Router;
