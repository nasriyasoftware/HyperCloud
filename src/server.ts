
import http2 from 'http2';
import http from 'http';
import fs from 'fs';
import path from 'path';

import helpers from './utils/helpers';
import SSLManager from './services/ssl/manager';
import { ProtocolsOptions, SSLCredentials, SSLOptions } from './utils/classes';
import { HyperCloudInitFile, HyperCloudInitOptions, HyperCloudManagementOptions, HyperCloudRequestHandler, HyperCloudServerHandlers, HyperCloudSystem, Protocols, SSLConfigs } from './docs/docs';

import initializer from './services/handler/initializer';
import HyperCloudResponse from './services/handler/assets/response';
import RenderingManager from './services/viewEngine/manager';
import RoutesManager from './services/routes/manager';
import RequestRoutesManager from './services/routes/assets/routesInitiator';
import Router from './services/routes/assets/router';
import HyperCloudRequest from './services/handler/assets/request';
import HyperCloudUser from './services/handler/assets/user';

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

    private _config = {
        protocols: { http: { port: 0, callback: undefined }, https: { port: 0, callback: undefined } } as Protocols,
        /**@type {SSLConfigs} */
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
        secure: false,
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

    _utils = Object.freeze({
        config: {
            /**
             * @param {string} filePath The path of the configurations file. Or pass ```default``` to read from the default config. file.
             * @returns {HyperCloudInitOptions} Initialization options
             */
            read: (filePath: string): HyperCloudInitOptions => {
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
            save: (filePath: string, options: HyperCloudInitOptions): void => {
                if (filePath === 'default') {
                    filePath = path.resolve('./');
                } else {
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath);
                    }
                }

                fs.writeFileSync(path.resolve(`${filePath}/config.json`), JSON.stringify(options, null, 4), { encoding: 'utf-8' });
            },
            validate: {
                /**@param {string} filePath */
                file: (filePath: string) => {
                    try {
                        const config = this._utils.config.read(filePath);
                        /**@type {HyperCloudInitOptions} */
                        const opts: HyperCloudInitOptions = {
                            protocols: new ProtocolsOptions(config.protocols),
                        }

                        if (config.ssl) {
                            if ('cert' in config.ssl && config.ssl.cert) {
                                opts.ssl = new SSLCredentials(config.ssl)
                            }

                            if ('email' in config.ssl && config.ssl.email) {
                                opts.ssl = new SSLOptions(config.ssl)
                            }
                        }

                        this._utils.config.validate.options(opts, true);
                    } catch (error) {
                        throw error;
                    }
                },
                /**
                 * @param {HyperCloudInitOptions} options 
                 * @param {boolean} [fromFile] Default: ```false```.
                 */
                options: (options: HyperCloudInitOptions, fromFile: boolean = false) => {
                    try {
                        if (!('protocols' in options && options.protocols instanceof ProtocolsOptions)) {
                            if (fromFile === true) {
                                helpers.printConsole(`The configuration file is missing the protocols property.`)
                                throw `The configuration file is not a valid HyperCloud initialization file.`;
                            } else {
                                helpers.printConsole(`Your configurations are missing the protocols property.`)
                                throw `Your configurations are not an instance of ProtocolsOptions.`;
                            }
                        }

                        /**Validating config file */
                        const protocols = options.protocols;
                        if (protocols.http.enabled) {
                            this._config.protocols.http.port = protocols.http.port;
                            if (typeof protocols.http.callback === 'string') { this._config.protocols.http.callback = protocols.http.callback }
                        }

                        if (protocols.https.enabled) {
                            this._config.protocols.https.port = protocols.https.port;
                            if (typeof protocols.https.callback === 'string') { this._config.protocols.https.callback = protocols.https.callback }
                            this._config.secure = true;
                        }

                        if (options.ssl) {
                            let valid = false;
                            if (options.ssl instanceof SSLCredentials) {
                                this._config.ssl.cert = options.ssl.cert;
                                this._config.ssl.key = options.ssl.key;
                                valid = true;
                            }

                            if (options.ssl instanceof SSLOptions) {
                                this._config.ssl.email = options.ssl.email;
                                this._config.ssl.domains = options.ssl.domains;
                                this._config.ssl.certName = options.ssl.certName;
                                this._config.ssl.self_signed = options.ssl.self_signed;
                                this._config.ssl.staging = options.ssl.staging;
                                this._config.ssl.storePath = options.ssl.storePath;
                                valid = true
                            }

                            if (!valid) {
                                if (fromFile === true) {
                                    throw `The configuration file uses the HTTPS protocol without implementing SSL configs.`;
                                } else {
                                    throw `The server configurations use the HTTPS protocol without implementing SSL configs.`;
                                }
                            }
                        }
                    } catch (error) {
                        throw error;
                    }
                }
            }
        }
    })

    constructor() {
        this._rendering = new RenderingManager(this);
        this._rendering.addViews(path.resolve(path.join(__dirname, './services/pages')));
        this._routesManager = new RoutesManager()
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
     * ```js
     * // Main file: main.js
     * const hypercloud = require('nasriya-hypercloud');
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
     * ```js
     * const server = require('./main.js');
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
     * @param {{ caseSensitive?: boolean, subDomain?: string}} options 
     * @returns {Router}
     */
    Router(options: { caseSensitive?: boolean; subDomain?: string; }): Router {
        return new Router(this, options || {})
    }

    /**
     * Initialize the server
     * @param {HyperCloudInitOptions|HyperCloudInitFile} options Pass ```HyperCloudInitOptions``` to manually initialize the server, or use ```HyperCloudInitFile``` to initialize the server from a file
     * @param {HyperCloudManagementOptions} [addOpt] Management options 
     * @returns {Promise} HyperCloud HTTP2 server
     * @example 
     * // Example: HTTP server only
     * const server = require('nasriya-hypercloud');
     * 
     * const protocols = new server.Protocols({
     *      http: { port: 80, callback: () => console.log('HTTP Server is now listening') }
     * })
     * 
     * server.initialize({ protocols }).listen();
     * @example
     * // Example: HTTPS server with Key and Certificate
     * const server = require('nasriya-hypercloud');
     * 
     * const protocols = new server.Protocols({
     *      https: { port: 443, callback: () => console.log('HTTPS Server is now listening') }
     * })
     * 
     * const ssl = new server.SSLCredentials({ cert: '<certificate_string>', key: '<key_string>' })
     * 
     * server.initialize({ protocols, ssl }).listen();
     * @example
     * // Example: HTTPS server with SSL Options
     * const server = require('nasriya-hypercloud');
     * 
     * const protocols = new server.Protocols({
     *      https: { port: 443, callback: () => console.log('HTTPS Server is now listening') }
     * })
     * 
     * const ssl = new server.SSLCredentials({
     *      email: 'email@yourdomain.com',
     *      domains: ['yourdomain.com', 'auth.yourdomain.com'],
     *      self_signed: false, // Issue a self-signed certificate, if set to true, the following two properties will be ignored
     *      staging: false, // Only set this to true when testing the SSL certificates' functionalities, set to false on production code
     *      certName: 'your_project_or_company' // This value must be consistent
     * })
     * 
     * server.initialize({ protocols, ssl }).listen();
     * @example
     * // Example: Enable debugging
     * const server = require('nasriya-hypercloud');
     * 
     * server.initialize(options, { verbose: true }).listen();
     * @example
     * // Save configurations
     * const server = require('nasriya-hypercloud');
     * const path = require('path');
     * 
     * server.initialize(options, { saveConfig: true, configPath: path.resolve('./') })
     */
    async initialize(options: HyperCloudInitOptions | HyperCloudInitFile, addOpt: HyperCloudManagementOptions): Promise<any> {
        try {
            if (this._config.initialized) {
                throw 'The server is already initialized.';
            }

            if ('path' in options && options.path) {
                // Initialize the server from the config file.
                this._utils.config.validate.file(options.path);
            }

            if ('protocols' in options && options.protocols) {
                this._utils.config.validate.options(options);
                if (addOpt?.saveConfig === true && typeof addOpt.configPath === 'string' && addOpt.configPath.length > 0) {
                    this._utils.config.save(addOpt.configPath, options);
                }
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

            // Initialize the server
            //console.log(this._config)
            if (typeof this._config.protocols.https.port === 'number' && this._config.protocols.https.port > 0) {
                const creds = { cert: '', key: '' }

                // Extract/generate SSL
                if (this._config.ssl.cert && this._config.ssl.key) {
                    creds.cert = this._config.ssl.cert;
                    creds.key = this._config.ssl.key;
                } else {
                    this._system.SSL = new SSLManager(this._config.ssl, this._config.protocols.http.port);
                    const { key, cert } = await this._system.SSL.generate();
                    creds.cert = cert;
                    creds.key = key;
                }

                this._system.httpsServer = http2.createSecureServer({ ...creds, allowHTTP1: true });
            } else if (typeof this._config.protocols.http.port === 'number' && this._config.protocols.http.port > 0) {
                this._system.httpServer = http.createServer();
            } else {
                helpers.printConsole('No protocols were configured for initialization');
            }

            this._config.initialized = true;
        } catch (error) {
            if (typeof error === 'string') { error = `Cannot initialize the server: ${error}` }
            helpers.printConsole(error);
            throw 'Cannot initialize the server';
        }
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

                const protocol = this._config.protocols[this._config.secure ? 'https' : 'http'];
                /**@type {http2.Http2Server | http.Server} */
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
                            console.error(error)
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
        if (paramsNum !== 3) { throw new RangeError(`The provided handler has ${paramsNum}. The expected number of parameters is 3`) }

        this._config.handlers[name] = handler;
    }
}

export default HyperCloudServer;