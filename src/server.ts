import http2 from 'http2';
import http from 'http';
import fs from 'fs';
import path from 'path';

import helpers from './utils/helpers';
import SSLManager from './services/ssl/manager';
import { HyperCloudInitFile, HyperCloudManagementOptions, HyperCloudRequestHandler, HyperCloudServerHandlers, HyperCloudSystem, Protocol, Protocols, SSLConfigs, SecureServerOptions, ServerOptions, ServerPlusSecureOptions } from './docs/docs';

import initializer from './services/handler/initializer';
import HyperCloudResponse from './services/handler/assets/response';
import RenderingManager from './services/viewEngine/manager';
import RoutesManager from './services/routes/manager';
import RequestRoutesManager from './services/routes/assets/routesInitiator';
import Router from './services/routes/assets/router';

/**HyperCloud HTTP2 server */
class HyperCloudServer {
    private _recievedReqNum = 0;
    _system: HyperCloudSystem = {
        httpsServer: null as unknown as http2.Http2SecureServer,
        httpServer: null as unknown as http.Server,
        SSL: null as unknown as SSLManager
    }

    private readonly _rendering: RenderingManager;
    private readonly _routesManager: RoutesManager;

    private readonly _config = {
        protocol: { port: 0, callback: undefined } as Protocol,
        secure: false,
        ssl: {
            domains: [] as string[],
            email: null as unknown as string,
            self_signed: false,
            cert: null as string | null,
            key: null as string | null,
            certName: null as string | null,
            staging: false,
            storePath: null as string | null
        } as SSLConfigs,
        verbose: false,
        initialized: false,
        trusted_proxies: [] as string[],
        locals: {},
        cronJobs: {},
        handlers: {} as Record<string, Function>,
        languages: {
            default: 'en',
            supported: ['en']
        }
    }

    private readonly _utils = Object.freeze({
        config: {
            /**
             * @param {string} filePath The path of the configurations file. Or pass ```default``` to read from the default config. file.
             * @returns {HyperCloudInitOptions} Initialization options
             */
            read: (filePath: string): ServerPlusSecureOptions => {
                if (filePath === 'default') {
                    filePath = path.resolve('./config.json');
                    const validity = helpers.checkPathAccessibility(filePath);
                    if (!validity.valid) {
                        if (!validity.errors.exist) {
                            helpers.printConsole(`To use the default config file, you need to initialize the server manually and set the "saveConfig" property to (true) without specifying a "configPath".`)
                            throw `No default configurations found.`;
                        }

                        if (validity.errors.accessible) {
                            throw `You don't have enough permissions to access ${filePath}`;
                        }
                    }

                    const fileStr = fs.readFileSync(filePath, { encoding: 'utf8' });
                    try {
                        const file = JSON.parse(fileStr);
                        return file;
                    } catch (error) {
                        throw `The default configuration file is damaged, corrupteed, or not a valid JSON file.`
                    }
                }

                if (typeof filePath !== 'string') { throw `The configuration path that you've passed is invalid. Expected a string but instead got ${typeof filePath}` }


                const validity = helpers.checkPathAccessibility(filePath);
                if (!validity.valid) {
                    if (!validity.errors.exist) {
                        helpers.printConsole(`To save your configurations, you need to initialize the server manually and set the "saveConfig" property to (true), then specify a path to store the configs using the "configPath" property.`);
                        throw `Your configuration file was not found.`;
                    }

                    if (validity.errors.accessible) {
                        throw `You don't have enough permissions to access ${filePath}`;
                    }
                }

                const fileStr = fs.readFileSync(filePath, { encoding: 'utf8' });
                try {
                    const file = JSON.parse(fileStr);
                    return file;
                } catch (error) {
                    throw `Your configuration file is damaged, corrupteed, or not a valid JSON file.`
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
        this._rendering = new RenderingManager(this);
        this._rendering.addViews(path.resolve(path.join(__dirname, './services/pages')));
        this._routesManager = new RoutesManager();

        try {
            if (helpers.is.undefined(userOptions) || userOptions === null) { throw `The server configuration is missing` }
            if (!helpers.is.realObject(userOptions)) { throw `The server configuration is expecting an object, but instead got ${typeof userOptions}` }

            let isFromFile = false;
            if ('path' in userOptions) {
                // Initialize the server from the config file.
                if (typeof userOptions.path !== 'string') { throw `The server configuration path must be a string, instead got ${typeof userOptions.path}` }
                const savedConfig = this._utils.config.read(userOptions.path);
                userOptions = savedConfig;
                isFromFile = true;
            }

            const options = userOptions as unknown as SecureServerOptions | ServerOptions;
            const config_src = isFromFile ? 'file' : 'options';

            if ('callback' in options) {
                if (typeof options.callback === 'function') { this._config.protocol.callback = options.callback }
            }

            if ('secure' in options) {
                if (typeof options.secure !== 'boolean') { throw `The secure option in the configuration ${config_src} is expecting a boolean value, instead got ${typeof options.secure}` }
                if (options.secure === true) {
                    this._config.secure = true;

                    if ('ssl' in options) {
                        if (helpers.is.undefined(options.ssl) || !helpers.is.realObject(options.ssl)) { throw `The SSL options used in server configurations ${config_src} is expectd to be an object, instead got ${options.ssl}` }

                        if ('cert' in options.ssl || 'key' in options.ssl) {
                            if ('cert' in options.ssl) {
                                if (typeof options.ssl.cert !== 'string') { throw `The "cert" option in server's configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.cert}` }
                                if (!(options.ssl.cert.startsWith('---- BEGIN CERTIFICATE----') && options.ssl.cert.startsWith('----END CERTIFICATE----'))) {
                                    throw `The provided certificate (cert) in the configuration ${config_src} is not a valid certificate`;
                                }

                                this._config.ssl.cert = options.ssl.cert;
                            }

                            if ('key' in options.ssl) {
                                if (typeof options.ssl.key !== 'string') { throw `The "key" option in server's configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.key}` }
                                if (!(options.ssl.key.startsWith('-----BEGIN') && options.ssl.key.startsWith('PRIVATE KEY-----'))) {
                                    throw `The provided private key (key) in the configuration ${config_src} is not a valid key`;
                                }

                                this._config.ssl.key = options.ssl.key;
                            }
                        } else {
                            // Check if the user wants a self-signed certificate
                            if ('self_signed' in options.ssl) {
                                if (typeof options.ssl.self_signed !== 'boolean') { throw `The "self_signed" SSL option in the configuration ${config_src} is expecting a boolean value, instead got ${typeof options.ssl.self_signed}` }
                                if (options.ssl.self_signed === true) { this._config.ssl.self_signed = true }
                            }

                            // Check the options to generate an SSL certificate via Let's Encrypt
                            if (this._config.ssl.self_signed !== true) {

                                if ('email' in options.ssl) {
                                    if (!helpers.is.validString(options.ssl.email)) { throw `The "email" SSL option in the configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.email}` }
                                    if (!helpers.validate.email(options.ssl.email)) { throw `The provided email (${options.ssl.email}) is not a valid email address` }
                                    this._config.ssl.email = options.ssl.email;
                                } else {
                                    throw `The "email" SSL option in the configuration ${config_src} is missing.`
                                }

                                if ('certName' in options.ssl && !helpers.is.undefined(options.ssl.certName)) {
                                    if (!helpers.is.validString(options.ssl.certName)) { throw `The "certName" SSL option in the configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.certName}` }
                                    this._config.ssl.certName = options.ssl.certName;
                                } else {
                                    this._config.ssl.certName = helpers.getProjectName().replace(/-/g, '');
                                }

                                if ('domains' in options.ssl && !helpers.is.undefined(options.ssl.domains)) {
                                    if (Array.isArray(options.ssl.domains)) {
                                        if (!helpers.validate.domains(options.ssl.domains)) { throw `The provided domains array (${options.ssl.domains.join(', ')}) is not a valid domains array` }
                                        this._config.ssl.domains = options.ssl.domains;
                                    } else {
                                        throw `The "domains" property expected an array as a value but instead got ${typeof options.ssl.domains}`
                                    }
                                } else {
                                    throw `The "domains" SSL option in the configuration ${config_src} is missing.`;
                                }
                            }
                        }

                        if ('storePath' in options.ssl && !helpers.is.undefined(options.ssl.storePath)) {
                            const validity = helpers.checkPathAccessibility(options.ssl.storePath);
                            if (validity.valid) {
                                this._config.ssl.storePath = options.ssl.storePath;
                            } else {
                                if (!validity.errors.isString) { throw new TypeError(`Invalid "storePath" was provided. Expected a string but instead got ${typeof options.ssl.storePath}`) }
                                if (!validity.errors.exist) { throw new Error(`The "storePath" that you've provided (${options.ssl.storePath}) doesn't exist`) }
                                if (!validity.errors.accessible) { throw Error(`You don't have enough read permissions to access ${options.ssl.storePath}`) }
                            }
                        } else {
                            this._config.ssl.storePath = path.join(process.cwd(), 'SSL');
                        }

                    } else {
                        this._config.ssl.self_signed = true;
                    }
                }
            }

            if ('port' in options) {
                if (typeof options.port === 'number') {
                    if (options.port > 0) {
                        this._config.protocol.port = options.port;
                    } else {
                        throw `The port in the configuration ${config_src} is expecting a positive number, but instead got ${options.port}`
                    }
                } else {
                    throw `The port in the configuration ${config_src} is expecting a number, but instead got ${typeof options.port}`
                }
            } else {
                this._config.protocol.port = this._config.secure ? 443 : 80;
            }

            if ('proxy' in options && options.proxy) {
                const validProxies: string[] = [];

                if (options.proxy.isLocal === true) {
                    validProxies.push('127.0.0.1');
                }

                if (options.proxy.isDockerContainer === true) {
                    validProxies.push('172.17.0.1');
                }

                if ('trusted_proxies' in options.proxy) {
                    const invalidProxies: string[] = [];

                    if (!Array.isArray(options.proxy?.trusted_proxies)) {
                        throw `The server expected an array of trusted proxies in the "trusted_proxies" property but instead got ${typeof options.proxy.trusted_proxies}`;
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

                this._config.trusted_proxies = validProxies;
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
                                protocol: this._config.protocol,
                                secure: this._config.secure,
                                ssl: this._config.ssl,
                                proxy: this._config.trusted_proxies
                            }

                            this._utils.config.save(savePath, toSave)
                        }
                    }
                }
            }

            if (addOpt?.saveConfig === true && typeof addOpt.configPath === 'string' && addOpt.configPath.length > 0) {
                this._utils.config.save(addOpt.configPath, options);
            }
        } catch (error) {
            if (typeof error === 'string') { error = `Cannot initialize the server: ${error}` }
            helpers.printConsole(error);
            throw new Error('Cannot initialize the server');
        }
    }

    get defaultLanguage() { return this._config.languages.default }
    /**
     * Set or get the default language of the server
     * @param {string} lang The default language
     */
    set defaultLanguage(lang: string) {
        if (this._config.languages.supported.includes(lang)) {
            this._config.languages.default = lang;
        } else {
            throw `Cannot set default language: ${lang} is not supported`;
        }
    }

    /**@returns {string[]} */
    get supportedLanguages(): string[] { return this._config.languages.supported }
    /**
     * Set or get the server's supported languages
     * @param {string|string[]} langs A list of supported languages
     */
    set supportedLanguages(langs: string | string[]) {
        if (!(typeof langs === 'string' || Array.isArray(langs))) {
            throw new TypeError(`The server's "supportedLanguages" accepts a string or a list of strings, but instead got ${typeof langs}`)
        }

        if (typeof langs === 'string') {
            if (langs.length === 0) { throw `The server's "supportedLanguages" cannot be an empty string` }
            this._config.languages.supported = [langs.toLowerCase()];
        } else {
            langs = [...new Set(langs)];

            if (langs.length === 0) {
                throw `The server's "supportedLanguages" recieved an empty array`;
            }

            const supported: string[] = [];
            for (const lang of langs) {
                if (typeof lang === 'string' && lang.length > 0) {
                    supported.push(lang.toLowerCase());
                } else {
                    throw new TypeError(`The server's "supportedLanguages" accepts a list of strings, but one or more of its items are invalid`);
                }
            }

            this._config.languages.supported = supported;
        }

        if (!this._config.languages.supported.includes(this._config.languages.default)) {
            helpers.printConsole(`The server recieved a new list of supported languages, but the default language (${this.defaultLanguage}) is not part of the new list.`);
            helpers.printConsole(`Setting the new default language to: ${this.supportedLanguages[0] || 'en'}`);
            this.defaultLanguage = this.supportedLanguages[0] || 'en';
        }
    }

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
    Router(options?: { caseSensitive?: boolean; subDomain?: string; }): Router {
        return new Router(this, options || {})
    }

    /**
     * The `server.locals` object has properties that are local
     * variables within the application, and will be available
     * in templates rendered with `{@link HyperCloudResponse.render}`.
     * @returns {Object}
     */
    get locals(): object { return this._config.locals }
    set locals(value) {
        if (helpers.is.realObject(value)) {
            this._config.locals = value;
        } else {
            throw new TypeError(`The "server.locals" property expected an object with key:value pairs, but instead got ${typeof value}`)
        }
    }

    get rendering() { return this._rendering }

    /**
     * Start listening
     * @returns {Promise<void>}
     */
    listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (!this._config.initialized) { throw 'Please initialize the server first.' }
                this._config.initialized = true;

                const protocol = this._config.protocol;
                const server: http2.Http2Server | http.Server = this._config.secure ? this._system.httpsServer : this._system.httpServer;

                server.on('request', async (req, res) => {
                    /**A copy of the response to throw an error */
                    let resTemp: HyperCloudResponse = {} as unknown as HyperCloudResponse;
                    try {
                        res.on('close', () => {
                            if (resTemp) { resTemp.__closed = true }
                        });

                        this._recievedReqNum++;
                        const request_id = `ns${btoa(`request-num:${this._recievedReqNum};date:${new Date().toISOString()}`)}`;
                        req.id = request_id;
                        const request = await initializer.createRequest(this, req, { trusted_proxies: this._config.trusted_proxies });
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
                            resTemp.pages.serverError({
                                lang: this.defaultLanguage,
                                locals: {
                                    title: `Server Error (500)`,
                                    subtitle: 'Server Error (500)',
                                    message: `Ops! We're experincing some difficulties, pleaes refresh the page or try again later.\n\nIf you're the site owner and the error persisted, please review the your site logs and open an issue on Github.\n\nError Code: 0x00008`
                                }
                            });
                        } else {
                            console.error(error);
                            res.statusCode = 500;
                            res.end();
                        }
                    }
                })

                server.listen(protocol.port, () => {
                    console.info(`HyperCloud Server is listening ${this._config.secure ? 'securely ' : ''}on port #${protocol.port}`);
                    protocol.callback?.();
                    resolve();
                })
            } catch (error) {
                if (typeof error === 'string') { error = `Unable to start listening: ${error}` }
                reject(error);
            }
        })
    }

    /**@private */
    get __routesManager() { return this._routesManager }
    /**@private */
    get __handlers(): Record<string, Function> { return this._config.handlers }

    /**
     * Define handlers for various scenarios
     * @param {HyperCloudServerHandlers} name The name of the handler from the options or any other name
     * @param {HyperCloudRequestHandler} handler A function to handle responses called by the system
     * @throws {TypeError} If the `name` isn't a `string`.
     * @throws {SyntaxError} If the `name` is an empty `string` or doesn't start with a letter.
     * @throws {TypeError} If the `handler` isn't a `function`.
     */
    setHandler(name: HyperCloudServerHandlers, handler: HyperCloudRequestHandler) {
        if (typeof name !== 'string') { throw new TypeError(`The handler name must be a string but got ${typeof name}`) }
        if (name.length === 0) { throw new SyntaxError(`The handler name cannot be empty`) }
        const letterRegex = /^[a-zA-Z]/;
        if (!letterRegex.test(name)) { throw new SyntaxError(`The handler name can only starts with an (a-z/A-Z) letter.`) }
        if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }
        const paramsNum = handler.length;

        if (name === 'onHTTPError') {
            if (paramsNum !== 4) { throw new RangeError(`The provided onHTTPError handler has ${paramsNum} parameters. The expected number of parameters is 4; (request, response, next, error)`) }
        } else {
            if (paramsNum !== 3) { throw new RangeError(`The provided handler has ${paramsNum} parameters. The expected number of parameters is 3`) }
        }

        this._config.handlers[name] = handler;
    }
}

export { ServerOptions, SecureServerOptions, HyperCloudInitFile, HyperCloudManagementOptions }
export default HyperCloudServer;