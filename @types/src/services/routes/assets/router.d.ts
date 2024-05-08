import HyperCloudServer from '../../../server';
import { HyperCloudRequestHandler, StaticRouteOptions } from '../../../docs/docs';

/** Represents a router for handling HTTP requests. */
declare class Router {
    /**
     * Creates an instance of Router.
     * @param server The HyperCloudServer instance.
     * @param options The options for the router.
     */
    constructor(server: HyperCloudServer, options: { caseSensitive?: boolean; subDomain?: string; });

    /**
     * Sets the favicon for the site.
     * @param faviconPath The path to the favicon file.
     * @param eTag Optional ETag for caching.
     */
    favicon(faviconPath: string, eTag?: string): void;

    /**
     * Creates a static middleware for serving static files.
     * @param root The root directory to serve statically.
     * @param options Additional options for the static middleware.
     */
    static(root: string, options: StaticRouteOptions): void;

    /**
     * Creates a route for handling requests with any HTTP method.
     * @param path The route path.
     * @param handler The request handler function.
     * @param options Additional options for the route.
     */
    use(path: string, handler: HyperCloudRequestHandler, options: { caseSensitive?: boolean; subDomain?: string; }): void;

    // Methods for specific HTTP methods...

    /**
     * Creates a route for handling GET requests.
     * @param path The route path.
     * @param handler The request handler function.
     * @param options Additional options for the route.
     */
    get(path: string, handler: HyperCloudRequestHandler, options: { caseSensitive?: boolean; subDomain?: string; }): void;

    // Other HTTP method routes...

    /**
     * Creates a route for handling CONNECT requests.
     * @param path The route path.
     * @param handler The request handler function.
     * @param options Additional options for the route.
     */
    connect(path: string, handler: HyperCloudRequestHandler, options: { caseSensitive?: boolean; subDomain?: string; }): void;
}

export default Router;