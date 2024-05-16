/// <reference types="node" />
import http2 from 'http2';
import { HelmetConfigOptions, HyperCloudInitFile, HyperCloudManagementOptions, HyperCloudRequestErrorHandler, HyperCloudRequestHandler, OptionalProtocol, SecureServerOptions, ServerOptions } from './docs/docs';
import RenderingManager from './services/viewEngine/manager';
import RoutesManager from './services/routes/manager';
import Router from './services/routes/assets/router';
/**HyperCloud HTTP2 server */
declare class HyperCloudServer {
    #private;
    constructor(userOptions?: SecureServerOptions | ServerOptions | HyperCloudInitFile, addOpt?: HyperCloudManagementOptions);
    get defaultLanguage(): string;
    /**
     * Set or get the default language of the server
     * @param {string} lang The default language
     */
    set defaultLanguage(lang: string);
    get supportedLanguages(): string[];
    /**
     * Set or get the server's supported languages
     * @param {string|string[]} langs A list of supported languages
     */
    set supportedLanguages(langs: string | string[]);
    /**
     * The `server.locals` object has properties that are local
     * variables within the application, and will be available
     * in templates rendered with `{@link HyperCloudResponse.render}`.
     */
    get locals(): Record<string, string>;
    set locals(value: Record<string, string>);
    get rendering(): RenderingManager;
    /**@private */
    get _routesManager(): RoutesManager;
    /**@private */
    get _handlers(): Record<string, Function>;
    readonly handlers: Readonly<{
        notFound: {
            set: (handler: HyperCloudRequestHandler) => void;
            get: () => HyperCloudRequestHandler;
        };
        serverError: {
            set: (handler: HyperCloudRequestHandler) => void;
            get: () => HyperCloudRequestHandler;
        };
        unauthorized: {
            set: (handler: HyperCloudRequestHandler) => void;
            get: () => HyperCloudRequestHandler;
        };
        forbidden: {
            set: (handler: HyperCloudRequestHandler) => void;
            get: () => HyperCloudRequestHandler;
        };
        userSessions: {
            set: (handler: HyperCloudRequestHandler) => void;
            get: () => HyperCloudRequestHandler;
        };
        logger: {
            set: (handler: HyperCloudRequestHandler) => void;
            get: () => HyperCloudRequestHandler;
        };
        onHTTPError: {
            set: (handler: HyperCloudRequestErrorHandler) => void;
            get: () => HyperCloudRequestErrorHandler;
        };
    }>;
    /**
     * A protection "helmet" module that serves as a middleware or multiple middlewares
     * that you can use on your routes.
     *
     * You can customize the
     */
    helmet(options: HelmetConfigOptions): void;
    /**
     * Increase productivity by spreading routes into multiple files. All
     * you need to do is to `export` the created server into the file that
     * you want to create routes on, then mount the routes on the `Router`.
     *
     * **Example**:
     * ```ts
     * // Main file: main.js
     * import hypercloud from 'nasriya-hypercloud';
     * const server = hypercloud.Server();
     *
     * const router = server.Router();
     *
     * // Create routes on the main file
     * router.get('/', (request, response) => {
     *      response.status(200).end(<h1>HyperCloud</h1>);
     * })
     *
     * // Export the router
     * module.exports = server;
     * ```
     * Now import the server on the API file:
     * ```ts
     * import server from './main.js';
     *
     * // Define a router for the APIs. All routes defined on this
     * // router will be under the `api` sub-domain, unless
     * // explicitly specified.
     * const router = server.Router({subDomain: 'api'});
     *
     * router.get('v1/users', (request, response) => {
     *      response.status(200).json([{id: 'ahmad_id', name: 'Ahmad', role: 'Admin'}])
     * })
     *
     * router.post('v1/users', (request, response) => {
     *      response.status(201).json(request.body)
     * })
     * ```
     * Each created `Router` has a reference to the `HyperCloudServer`
     * that created it. So routes are automatically mounted on the server.
     * @param {{ caseSensitive?: boolean, subDomain?: string}} [options]
     * @returns {Router}
     */
    Router(options?: {
        caseSensitive?: boolean;
        subDomain?: string;
    }): Router;
    /**
     * Start listening for incoming requests
     * @param protocol Specify the port number of the protocol for the server. Default: `443` for secure servers and `80` for plain HTTP ones. You can pass a callback too.
     * @param callback Pass a callback function to run when the server starts listening.
     * @returns {Promise<void|http2.Http2SecureServer>} If secure connection is configured, a `Promise<http2.Http2SecureServer>` will be returned, otherwise, a `Promise<void>` will be returned.
     */
    listen(protocol?: OptionalProtocol): Promise<void | http2.Http2SecureServer>;
}
export default HyperCloudServer;
