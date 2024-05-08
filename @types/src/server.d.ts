import { HyperCloudInitFile, HyperCloudManagementOptions, HyperCloudRequestHandler, HyperCloudServerHandlers, SecureServerOptions, ServerOptions } from './docs/docs';
import RenderingManager from './services/viewEngine/manager';
import RoutesManager from './services/routes/manager';
import Router from './services/routes/assets/router';


/** HyperCloud HTTP2 server */
declare class HyperCloudServer {
    constructor(userOptions?: SecureServerOptions | ServerOptions | HyperCloudInitFile, addOpt?: HyperCloudManagementOptions)

    /** Get the default language of the server */
    get defaultLanguage(): string;
    /** Set the default language of the server */
    set defaultLanguage(lang: string);
    /** Get the supported languages of the server */
    get supportedLanguages(): string[];
    /** Set the supported languages of the server */
    set supportedLanguages(langs: string | string[]);

    /** Get the local variables of the server */
    get locals(): object;
    /** Set the local variables of the server */
    set locals(value: any);
    /** Get the rendering manager of the server */
    get rendering(): RenderingManager;
    /** Get the internal routes manager of the server */
    get __routesManager(): RoutesManager;
    /** Get the internal handlers of the server */
    get __handlers(): Record<string, Function>;

    /**
     * Create a new Router instance for defining routes.
     * @param options - Router options such as case sensitivity and subdomain.
     * @returns A new Router instance.
     */
    Router(options: { caseSensitive?: boolean; subDomain?: string; }): Router;

    /**
     * Set a request handler for various scenarios.
     * @param name - The name of the handler.
     * @param handler - The handler function.
     * @throws If the handler name or function is invalid.
    */
    setHandler(name: HyperCloudServerHandlers, handler: HyperCloudRequestHandler): void;

    /** Start listening for incoming requests */
    listen(): Promise<void>;
}

export { HyperCloudInitFile, HyperCloudManagementOptions };
export default HyperCloudServer;