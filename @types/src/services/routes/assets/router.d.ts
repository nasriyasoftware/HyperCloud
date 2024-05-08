import HyperCloudServer from '../../../server';
import { HyperCloudRequestHandler, StaticRouteOptions } from '../../../docs/docs';

/** Represents a router for handling HTTP requests. */
declare class Router {
    /**
     * Creates an instance of Router.
     * @param server The HyperCloudServer instance.
     * @param options The options for the router.
     */
    constructor(server: HyperCloudServer, options?: { caseSensitive?: boolean; subDomain?: string; });

    /**
     * Set the favicon for the site.
     * @param faviconPath The path to the favicon file.
     * @param eTag Optional ETag for caching.
     */
    favicon(faviconPath: string, eTag?: string): void;

    /**
     * Create a static route.
     * @param root The root directory to serve statically.
     * @param options Optional configuration for the static route.
     */
    static(root: string, options?: StaticRouteOptions): void;

    /**
     * Set a middleware for handling requests.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    use(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a GET route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    get(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a POST route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    post(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a PUT route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    put(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a DELETE route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    delete(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a PATCH route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    patch(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a HEAD route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    head(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set an OPTIONS route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    options(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a TRACE route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    trace(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;

    /**
     * Set a CONNECT route handler.
     * @param path The route path.
     * @param handler A function to handle the request.
     * @param options Optional configuration for the route.
     */
    connect(path: string, handler: HyperCloudRequestHandler, options?: { caseSensitive?: boolean; subDomain?: string; }): void;
}

export default Router;