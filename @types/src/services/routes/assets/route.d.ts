import { HttpMethod, HyperCloudRequestHandler, RouteOptions } from '../../../docs/docs';

/** Represents a route in the application. */
declare class Route {
    /**
     * Creates an instance of Route.
     * @param {RouteOptions} options - The options to initialize the route.
     */
    constructor(options: RouteOptions);

    /** Gets the subDomain of the route. */
    get subDomain(): '*' | string;
    /** Gets the case sensitivity of the route. */
    get caseSensitive(): boolean;
    /** Gets the HTTP method of the route. */
    get method(): 'USE' | HttpMethod;
    /** Gets the path of the route. */
    get path(): string[];
    /** Gets the handler function of the route. */
    get handler(): HyperCloudRequestHandler;
    /** Gets the parameters of the route. */
    get params(): Record<string, any>;
    /** Sets the parameters of the route. */
    set params(value: Record<string, any>);
}

export default Route;
