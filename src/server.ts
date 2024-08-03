import http from 'http';
import http2 from 'http2';
import fs from 'fs';
import path from 'path';

import helpers from './utils/helpers';
import SSLManager from './services/ssl/manager';
import { HelmetConfigOptions, HyperCloudInitFile, HyperCloudManagementOptions, HyperCloudRequestErrorHandler, HyperCloudRequestHandler, HyperCloudServerHandlers, OptionalProtocol, SecureServerOptions, ServerOptions } from './docs/docs';

import initializer from './services/handler/initializer';
import HyperCloudResponse from './services/handler/assets/response';
import RenderingManager from './services/renderer/manager';
import RoutesManager from './services/routes/manager';
import RequestRoutesManager from './services/routes/assets/routesInitiator';
import Router from './services/routes/assets/router';
import HelmetManager from './services/helmet/manager';
import RateLimitingManager from './services/rateLimiter/rateLimiter';
import LanguagesManager from './services/languages/manager';

const _dirname = __dirname;

/**HyperCloud HTTP2 server */
export class HyperCloudServer {
    #_recievedReqNum = 0;
    readonly #_system = {
        httpServer: undefined as http.Server | undefined,
        httpsServer: undefined as http2.Http2SecureServer | undefined
    }

    readonly #_helmet: HelmetManager;

    readonly #_config = {
        secure: false,
        ssl: {
            type: 'selfSigned',
            storePath: undefined as string | undefined,
            letsEncrypt: {
                email: undefined as unknown as string,
                domains: [] as string[],
                certName: undefined as unknown as string,
                staging: false,
                challengePort: 80
            },
            credentials: {
                cert: undefined as unknown as string,
                key: undefined as unknown as string,
            }
        },
        trusted_proxies: [] as string[],
        locals: {} as Record<string, string>,
        cronJobs: {},
        handlers: {} as Record<string, Function>,
        siteName: {} as Record<string, string>
    }

    readonly #_utils = Object.freeze({
        config: {
            /**
             * @param {string} filePath The path of the configurations file. Or pass ```default``` to read from the default config. file.
             * @returns {HyperCloudInitOptions} Initialization options
             */
            read: (filePath: string): SecureServerOptions | ServerOptions => {
                if (filePath === 'default') {
                    filePath = path.resolve('./config.json');
                }

                try {
                    return helpers.loadJSON(filePath) as unknown as SecureServerOptions | ServerOptions;
                } catch (error) {
                    if (error instanceof Error) { error.message = `Unable to read server's config file: ${error.message}` }
                    throw error
                }
            },
            /**
             * @param {string} filePath 
             * @param {HyperCloudInitOptions} options 
             * @returns {void}
             */
            save: (filePath: string, options: any): void => {
                if (filePath === 'default') {
                    filePath = path.resolve('./');
                } else {
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath);
                    }
                }

                fs.writeFileSync(path.resolve(`${filePath}/config.json`), JSON.stringify(options, null, 4), { encoding: 'utf-8' });
            }
        }
    })

    constructor(userOptions?: SecureServerOptions | ServerOptions | HyperCloudInitFile, addOpt?: HyperCloudManagementOptions) {
        this.languages = new LanguagesManager();
        this._routesManager = new RoutesManager();
        this.#_helmet = new HelmetManager(this);
        this.rateLimiter = new RateLimitingManager(this);
        this.rendering = new RenderingManager(this);
        this.rendering.pages.register(path.resolve(path.join(_dirname, './services/pages')));

        try {
            if (helpers.is.undefined(userOptions)) { return }
            if (helpers.isNot.realObject(userOptions)) { throw `The server configuration is expecting an object, but instead got ${typeof userOptions}` }

            let isFromFile = false;
            if ('path' in userOptions) {
                // Initialize the server from the config file.
                if (typeof userOptions.path !== 'string') { throw `The server configuration path must be a string, instead got ${typeof userOptions.path}` }
                const savedConfig = this.#_utils.config.read(userOptions.path);
                userOptions = savedConfig;
                isFromFile = true;
            }

            const options = userOptions as unknown as SecureServerOptions | ServerOptions;
            const config_src = isFromFile ? 'file' : 'options';

            if ('secure' in options) {
                if (typeof options.secure !== 'boolean') { throw `The secure option in the configuration ${config_src} is expecting a boolean value, instead got ${typeof options.secure}` }
                if (options.secure === true) {
                    this.#_config.secure = true;

                    if ('ssl' in options) {
                        if (helpers.is.undefined(options.ssl) || helpers.isNot.realObject(options.ssl)) { throw `The SSL options used in server configurations ${config_src} is expectd to be an object, instead got ${options.ssl}` }

                        switch (options.ssl.type) {
                            case 'credentials': {
                                if ('credentials' in options) {
                                    if (helpers.is.undefined(options.ssl.credentials) || helpers.isNot.realObject(options.ssl.credentials)) { throw `The SSL "credentials" option is expecting an object, but instead got ${typeof options.ssl.credentials}` }

                                    if ('cert' in options.ssl.credentials && 'key' in options.ssl.credentials) {
                                        if ('cert' in options.ssl.credentials) {
                                            if (typeof options.ssl.credentials.cert !== 'string') { throw `The "cert" option in server's configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.credentials.cert}` }
                                            if (!(options.ssl.credentials.cert.startsWith('---- BEGIN CERTIFICATE----') && options.ssl.credentials.cert.startsWith('----END CERTIFICATE----'))) {
                                                throw `The provided certificate (cert) in the configuration ${config_src} is not a valid certificate`;
                                            }

                                            this.#_config.ssl.credentials.cert = options.ssl.credentials.cert;
                                        }

                                        if ('key' in options.ssl.credentials) {
                                            if (typeof options.ssl.credentials.key !== 'string') { throw `The "key" option in server's configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.credentials.key}` }
                                            if (!(options.ssl.credentials.key.startsWith('-----BEGIN') && options.ssl.credentials.key.startsWith('PRIVATE KEY-----'))) {
                                                throw `The provided private key (key) in the configuration ${config_src} is not a valid key`;
                                            }

                                            this.#_config.ssl.credentials.key = options.ssl.credentials.key;
                                        }
                                    } else {
                                        throw `The SSL credentials object has been passed but is missing the "cert" and/or "key" values.`
                                    }
                                } else {
                                    throw `The SSL type was set to "credentials" without specifying a credentials object`;
                                }

                            }
                                break;

                            case 'letsEncrypt': {
                                if (helpers.is.undefined(options.ssl.letsEncrypt) || helpers.isNot.realObject(options.ssl.letsEncrypt)) { throw `The SSL "letsEncrypt" option is expecting an object, but instead got ${typeof options.ssl.letsEncrypt}` }

                                if ('email' in options.ssl.letsEncrypt && !helpers.is.undefined(options.ssl.letsEncrypt)) {
                                    if (!helpers.is.validString(options.ssl.letsEncrypt.email)) { throw `The options.ssl.letsEncrypt.email option in the configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.letsEncrypt.email}` }
                                    if (!helpers.validate.email(options.ssl.letsEncrypt.email)) { throw `The provided options.ssl.letsEncrypt.email (${options.ssl.letsEncrypt.email}) is not a valid email address` }
                                    this.#_config.ssl.letsEncrypt.email = options.ssl.letsEncrypt.email;
                                } else {
                                    throw `The "email" SSL option in the configuration ${config_src} is missing.`
                                }

                                if ('domains' in options.ssl.letsEncrypt && !helpers.is.undefined(options.ssl.letsEncrypt.domains)) {
                                    if (Array.isArray(options.ssl.letsEncrypt.domains)) {
                                        if (!helpers.validate.domains(options.ssl.letsEncrypt.domains)) { throw `The provided domains array (${options.ssl.letsEncrypt.domains.join(', ')}) is not a valid domains array` }
                                        this.#_config.ssl.letsEncrypt.domains = options.ssl.letsEncrypt.domains;
                                    } else {
                                        throw `The options.ssl.letsEncrypt.domains property expected an array as a value but instead got ${typeof options.ssl.letsEncrypt.domains}`
                                    }
                                } else {
                                    throw `The options.ssl.letsEncrypt.domains option in the configuration ${config_src} is missing.`;
                                }

                                if ('certName' in options.ssl.letsEncrypt && !helpers.is.undefined(options.ssl.letsEncrypt.certName)) {
                                    if (!helpers.is.validString(options.ssl.letsEncrypt.certName)) { throw `The options.ssl.letsEncrypt.certName option in the configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.letsEncrypt.certName}` }
                                    this.#_config.ssl.letsEncrypt.certName = options.ssl.letsEncrypt.certName;
                                } else {
                                    this.#_config.ssl.letsEncrypt.certName = helpers.getProjectName().replace(/-/g, '');
                                }

                                if ('staging' in options.ssl.letsEncrypt && !helpers.is.undefined(options.ssl.letsEncrypt.staging)) {
                                    if (typeof options.ssl.letsEncrypt.staging !== 'boolean') { throw `The typeof options.ssl.letsEncrypt.staging option was used with an invalid value. Expected a boolean value but got ${typeof options.ssl.letsEncrypt.staging}` }
                                    this.#_config.ssl.letsEncrypt.staging = options.ssl.letsEncrypt.staging;
                                }

                                if ('challengePort' in options.ssl.letsEncrypt && !helpers.is.undefined(options.ssl.letsEncrypt.challengePort)) {
                                    if (typeof options.ssl.letsEncrypt.challengePort !== 'number') { throw `The options.ssl.letsEncrypt.challengePort is expecting a number value, but instead got ${typeof options.ssl.letsEncrypt.challengePort}` }
                                    if (options.ssl.letsEncrypt.challengePort <= 0) { throw `The options.ssl.letsEncrypt.challengePort is expecting a port number greater than zero. You choosed: ${options.ssl.letsEncrypt.challengePort}` }
                                    this.#_config.ssl.letsEncrypt.challengePort = options.ssl.letsEncrypt.challengePort;
                                }
                            }
                        }

                        if ('storePath' in options.ssl && !helpers.is.undefined(options.ssl.storePath)) {
                            const validity = helpers.checkPathAccessibility(options.ssl.storePath);
                            if (validity.valid === true) {
                                this.#_config.ssl.storePath = options.ssl.storePath;
                            } else {
                                if (validity.errors.notString) { throw new TypeError(`Invalid "storePath" was provided. Expected a string but instead got ${typeof options.ssl.storePath}`) }
                                if (validity.errors.doesntExist) { throw new Error(`The "storePath" that you've provided (${options.ssl.storePath}) doesn't exist`) }
                                if (validity.errors.notAccessible) { throw Error(`You don't have enough read permissions to access ${options.ssl.storePath}`) }
                            }
                        } else {
                            this.#_config.ssl.storePath = path.join(process.cwd(), 'SSL');
                        }

                    } else {
                        this.#_config.ssl.type = 'selfSigned'
                    }
                }
            }

            if ('proxy' in options && !helpers.is.undefined(options.proxy)) {
                if (helpers.isNot.realObject(options.proxy)) { throw `The options.proxy expected a real object but instead got ${typeof options.proxy}` }
                const validProxies: string[] = [];

                if ('isLocal' in options.proxy && options.proxy.isLocal === true) {
                    validProxies.push('127.0.0.1');
                }

                if ('isDockerContainer' in options.proxy && options.proxy.isDockerContainer === true) {
                    validProxies.push('172.17.0.1');
                }

                if ('trusted_proxies' in options.proxy) {
                    const invalidProxies: string[] = [];

                    if (!Array.isArray(options.proxy?.trusted_proxies)) {
                        throw `The server expected an array of trusted proxies in the options.proxy.trusted_proxies property but instead got ${typeof options.proxy.trusted_proxies}`;
                    }

                    for (let proxy of options.proxy.trusted_proxies) {
                        if (proxy === 'localhost') { proxy = '127.0.0.1' }
                        if (proxy === 'docker') { proxy = '172.17.0.1' }

                        if (helpers.validate.ipAddress(proxy)) {
                            if (!validProxies.includes(proxy)) { validProxies.push(proxy) }
                        } else {
                            if (!invalidProxies.includes(proxy)) { invalidProxies.push(proxy) }
                        }
                    }

                    if (invalidProxies.length > 0) {
                        helpers.printConsole(invalidProxies)
                        throw `The server expected an array of trusted proxies, but some of them were invalid: ${invalidProxies.join(', ')}`;
                    }
                }

                if (validProxies.length === 0) {
                    throw `The 'proxy' option in the HyperCloud server was used without valid proxy IP addresses.`
                }

                this.#_config.trusted_proxies = validProxies;
            }

            if ('languages' in options) {
                if (helpers.is.undefined(options.languages) || helpers.isNot.realObject(options.languages)) { throw `The options.languages option has been used with an invalid value. Expected an object but instead got ${typeof options.languages}` }

                if ('supported' in options.languages && !helpers.is.undefined(options.languages.supported)) {
                    this.languages.supported = options.languages.supported;
                }

                if ('default' in options.languages && !helpers.is.undefined(options.languages.default)) {
                    this.languages.default = options.languages.default;
                }
            }

            if ('locals' in options && !helpers.is.undefined(options.locals)) {
                this.rendering.assets.locals.set(options.locals);
            }

            if ('handlers' in options && !helpers.is.undefined(options.handlers)) {
                if (helpers.isNot.realObject(options.handlers)) { throw `The options.handler was used with an invalid value. Expected an object but instead got ${typeof options.handlers}` }
                for (const name in options.handlers) {
                    const handlerName = name as HyperCloudServerHandlers;
                    this.handlers[handlerName](options.handlers[handlerName])
                }
            }

            if (!isFromFile) {
                if (!helpers.is.undefined(addOpt) && helpers.is.realObject(addOpt)) {
                    if ('saveConfig' in addOpt) {
                        if (typeof addOpt.saveConfig !== 'boolean') { throw `The saveConfig option in the server's management options expects a boolean value, but instead got ${addOpt.saveConfig}` }
                        if (addOpt.saveConfig === true) {

                            const savePath = (() => {
                                if ('configPath' in addOpt) {
                                    if (helpers.is.undefined(addOpt.configPath) || !helpers.is.validString(addOpt.configPath)) { throw `The "configPath" option in the server's management options expects a string value, but instead got ${addOpt.configPath}` }
                                    return addOpt.configPath;
                                } else {
                                    return 'default';
                                }
                            })();

                            const toSave = {
                                secure: this.#_config.secure,
                                ssl: this.#_config.ssl,
                                proxy: { trusted_proxies: this.#_config.trusted_proxies },
                                locals: this.#_config.locals,
                                languages: {
                                    default: this.languages.default,
                                    supported: this.languages.supported
                                },
                            }

                            this.#_utils.config.save(savePath, toSave)
                        }
                    }
                }
            }
        } catch (error) {
            if (typeof error === 'string') { error = `Cannot initialize the server: ${error}` }
            helpers.printConsole(error);
            throw new Error('Cannot initialize the server');
        }
    }

    /**
     * Set or get your site/brand name. This name is used
     * for rendering pages and in other places
    */
    readonly siteName = {
        /**
         * Set your site's name
         * @example
         * server.siteName.set('Nasriya Software');          // Setting a name for the default language
         * server.siteName.set('ناصرية سوفتوير', 'ar');     // Setting a name for the "ar" language
         * @param name The name of your site or brand
         * @param lang The language you want your site name to be associated with
         */
        set: (name: string, lang?: string) => {
            if (!helpers.is.validString(name)) { throw new Error(`The site name must be a string, but instead got ${typeof name}`) }
            if (lang === undefined) { lang = this.languages.default } else {
                if (this.languages.supported.includes(lang)) {
                    this.#_config.siteName[lang] = name;
                } else {
                    throw new Error(`The language you choose (${lang}) for your (${name}) site name is not supported. Make sure to first add "${lang}" to the supported languages`);
                }
            }
        },
        /**
         * Get the name of your site/brand based on the language
         * @example
         * // Getting the name of the default language
         * server.siteName.get();       // returns: "Nasriya Software"
         * server.siteName.get('ar');   // returns: "ناصرية سوفتوير"
         * @param lang The language your site name is associated with
         */
        get: (lang?: string) => {
            if (lang === undefined) { lang = this.languages.default }
            if (!this.languages.supported.includes(lang)) { throw new Error(`Unable to get the site name for the "${lang}" language because it's not a supported language`) }
            return this.#_config.siteName[lang];
        },
        /**
         * Set multiple site names for different languages.
         * @example
         * server.siteName.multilingual({
         *     default: 'Nasriya Software',
         *     ar: 'ناصرية سوفتوير'
         * });
         * @param record An object where the keys are language codes and the values are the site names.
         */
        multilingual: (record: Record<string, string>) => {
            if (helpers.isNot.realObject(record)) { throw new TypeError(`The server's multilingual site names' can only be an object, instead got ${typeof record}`) }
            if ('default' in record) {
                record[this.languages.default] = record.default;
                delete record.default;                
            } else {
                throw new Error(`The server's multilingual site names' object is missing the "default" language`);
            }

            for (const lang in record) {
                if (helpers.isNot.validString(record[lang])) { throw new TypeError(`One the site names' multilingual object is expected to be a key:value pairs of strings, instead, one of the values ${record[lang]} was ${typeof record[lang]}`) }
                this.#_config.siteName[lang] = record[lang];
            }
        }
    } as const

    public readonly languages: LanguagesManager;
    public readonly rateLimiter: RateLimitingManager;
    public readonly rendering: RenderingManager;
    /**@private */
    public readonly _routesManager: RoutesManager;
    /**@private */
    get _handlers(): Record<string, Function> { return this.#_config.handlers }

    readonly handlers = Object.freeze({
        notFound: (handler: HyperCloudRequestHandler) => {
            const handlerName = 'notFound';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        },
        serverError: (handler: HyperCloudRequestHandler) => {
            const handlerName = 'serverError';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        }, unauthorized: (handler: HyperCloudRequestHandler) => {
            const handlerName = 'unauthorized';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        }, forbidden: (handler: HyperCloudRequestHandler) => {
            const handlerName = 'forbidden';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        }, userSessions: (handler: HyperCloudRequestHandler) => {
            const handlerName = 'forbidden';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        }, logger: (handler: HyperCloudRequestHandler) => {
            const handlerName = 'logger';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        }, onHTTPError: (handler: HyperCloudRequestErrorHandler) => {
            const handlerName = 'onHTTPError';
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
            const reqParams = 4;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) { throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`) }
            this.#_config.handlers[handlerName] = handler;
        }
    })

    /**
     * A protection "helmet" module that serves as a middleware or multiple middlewares
     * that you can use on your routes.
     * 
     * You can customize the behavior with options
     */
    helmet(options?: HelmetConfigOptions) { this.#_helmet.config(options) }

    /**
     * Increase productivity by spreading routes into multiple files. All
     * you need to do is to `export` the created server into the file that
     * you want to create routes on, then mount the routes on the `Router`.
     * 
     * **Example**:
     * ```ts
     * // Main file: main.js
     * import hypercloud from '@nasriya/hypercloud';
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
    Router(options?: { caseSensitive?: boolean; subDomain?: string; }): Router {
        return new Router(this, options || {})
    }

    /**
     * Extend the functionality of the server
     * @param value 
     * @example
     * import { Router } from '@nasriya/hypercloud';
     * 
     * const router = new Router();
     * 
     * router.get('/', (req, res, next) => {
     *      console.log(req.__toJSON());
     *      next();
     * })
     * 
     * server.extend(router);
     */
    extend(value: Router) {
        if (value instanceof Router) {
            if (!value._data) { return }
            const routes = [...value._data.routes.dynamic, ...value._data.routes.static];
            for (const route of routes) {
                this._routesManager.add(route);
            }

            return;
        }
    }

    /**
     * Start listening for incoming requests
     * @param port Specify the port number of the protocol for the server. Default: `443` for secure servers and `80` for plain HTTP ones.
     * @param callback Pass a callback function to run when the server starts listening.
     * @returns {Promise<void|http2.Http2SecureServer>} If secure connection is configured, a `Promise<http2.Http2SecureServer>` will be returned, otherwise, a `Promise<void>` will be returned.
     */
    async listen(port: number, callback?: Function): Promise<void | http2.Http2SecureServer> {
        try {
            if (this.#_config.secure) {
                const { cert, key } = await (async () => {
                    if (this.#_config.ssl.type === 'credentials') {
                        return { cert: this.#_config.ssl.credentials.cert, key: this.#_config.ssl.credentials.key }
                    } else {
                        return new SSLManager().generate({
                            type: this.#_config.ssl.type as "selfSigned" | "letsEncrypt",
                            storePath: this.#_config.ssl.storePath,
                            letsEncrypt: this.#_config.ssl.letsEncrypt
                        })
                    }
                })()

                this.#_system.httpsServer = http2.createSecureServer({ cert, key, allowHTTP1: true })
            } else {
                this.#_system.httpServer = http.createServer();
            }

            const server: http2.Http2SecureServer | http.Server = (this.#_config.secure ? this.#_system.httpsServer : this.#_system.httpServer) as http2.Http2SecureServer | http.Server;
            server.on('request', async (req, res) => {
                /**A copy of the response to throw an error */
                let resTemp: HyperCloudResponse = {} as unknown as HyperCloudResponse;
                try {
                    res.on('close', () => {
                        if (resTemp) { resTemp._closed = true }
                    });

                    this.#_recievedReqNum++;
                    const request_id = `ns${btoa(`request-num:${this.#_recievedReqNum};date:${new Date().toISOString()}`)}`;
                    // @ts-ignore
                    req.id = request_id;
                    const request = await initializer.createRequest(this, req, { trusted_proxies: this.#_config.trusted_proxies });
                    const response = initializer.createResponse(this, request, res);
                    resTemp = response;

                    // Set the custom server headers
                    res.setHeader('X-Frame-Options', 'DENY');
                    res.setHeader('X-Server', 'Nasriya HyperCloud');
                    res.setHeader('X-Request-ID', request_id);

                    const matchedRoutes = this._routesManager.match(request);
                    if (matchedRoutes.length > 0) {
                        new RequestRoutesManager(matchedRoutes, request, response);
                    } else {
                        response.status(404).pages.notFound();
                    }
                } catch (error) {
                    if (!helpers.is.undefined(resTemp) && resTemp instanceof HyperCloudResponse) {
                        resTemp.pages.serverError({ error: error as Error });
                    } else {
                        console.error(error);
                        res.statusCode = 500;
                        res.end();
                    }
                }
            })

            if (port !== undefined) {
                if (typeof port !== 'number') { throw `The port used in the protocol (${port}) should be a number, instead got ${typeof port}` }
                if (port <= 0) { throw `The port has been assigned an invalid value (${port}). Ports are numbers greater than zero` }
                if (callback !== undefined && typeof callback !== 'function') { throw `The protocol.callback should be a callback function, instead got ${typeof callback}` }
            } else {
                port = this.#_config.secure ? 443 : 80;
            }


            await Promise.allSettled([this.rendering.pages.scan(), this.rendering.components.scan()]);
            helpers.printConsole('Checking/Updating cache storage...');
            await this.rendering.cache.update.everything();

            return new Promise((resolve, reject) => {
                const res = server.listen(port, () => {
                    console.info(`HyperCloud Server is listening ${this.#_config.secure ? 'securely ' : ''}on port #${port}`);
                    callback?.();
                })

                if (this.#_config.secure) { resolve(res as http2.Http2SecureServer) } else { resolve() }
            })
        } catch (error) {
            if (typeof error === 'string') { error = `Unable to start listening: ${error}` }
            throw error;
        }
    }

    /**
     * Stops the server from accepting new connections and keeps existing connections.
     * This method is asynchronous, the server is finally closed when all connections
     * are ended and the server emits a `close` event. The optional callback will be
     * called once the `close` event occurs. Unlike that event, it will be called with
     * an Error as its only argument if the server was not open when it was closed.
     * @param callback Called when the server is closed.
     */
    close(callback: (err?: Error) => void) {
        const runninServer = this.#_system.httpServer ? 'http' : 'https';
        const finalCallback = typeof callback === 'function' ? callback : (err?: Error) => console.info(`HyperCloud HTTP${runninServer === 'https' ? 's' : ''} Server is now closed.`);

        if (this.#_system.httpServer) { this.#_system.httpServer.close(finalCallback) }
        if (this.#_system.httpsServer) { this.#_system.httpsServer.close(finalCallback) }
        return this;
    }
}

export default HyperCloudServer;