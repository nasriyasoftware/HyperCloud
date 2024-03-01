global.HyperCloud_ServerVerbose = false;

const http2 = require('http2');
const http = require('http');
const fs = require('fs');
const path = require('path');

const helpers = require('./utils/helpers');
const SSLManager = require('./services/ssl/manager');
const classes = require('./utils/classes');
const Docs = require('./utils/docs');

const initializer = require('./services/handler/initializer');
const HyperCloudResponse = require('./services/handler/assets/response');
const RenderingManager = require('./services/viewEngine/manager');
const RoutesManager = require('./services/routes/manager');
const RequestRoutesManager = require('./services/routes/assets/routesInitiator');
const Router = require('./services/routes/assets/router');
const HyperCloudRequest = require('./services/handler/assets/request');

/**HyperCloud HTTP2 server */
class HyperCloudServer {
    #recievedReqNum = 0;
    /**@type {Docs.HyperCloudSystem} */
    #_system = {
        httpsServer: null,
        httpServer: null,
        SSL: null
    }

    /**@type {RenderingManager} */
    #rendering;
    /**@type {RoutesManager} */
    #routesManager;

    #_config = {
        /**@type {Docs.Protocols} */
        protocols: { http: { port: 0, callback: undefined }, https: { port: 0, callback: undefined } },
        /**@type {Docs.SSLConfigs} */
        ssl: {
            domains: [],
            email: null,
            self_signed: false,
            cert: null,
            key: null,
            certName: null,
            staging: false,
            storePath: null
        },
        secure: false,
        verbose: false,
        initialized: false,
        /**@type {string[]} */
        trusted_proxies: null,
        locals: {},
        cronJobs: {},
        handlers: {}
    }

    #_helpers = Object.freeze({
        config: {
            /**
             * @param {string} filePath The path of the configurations file. Or pass ```default``` to read from the default config. file.
             * @returns {Docs.HyperCloudInitOptions} Initialization options
             */
            read: (filePath) => {
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
             * @param {Docs.HyperCloudInitOptions} options 
             * @returns {void}
             */
            save: (filePath, options) => {
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
                file: (filePath) => {
                    try {
                        const config = this.#_helpers.config.read(filePath);
                        /**@type {Docs.HyperCloudInitOptions} */
                        const opts = {
                            protocols: new classes.ProtocolsOptions(config.protocols),
                        }

                        if (config.ssl) {
                            if ('cert' in config.ssl && config.ssl.cert) {
                                opts.ssl = new classes.SSLCredentials(config.ssl)
                            }

                            if ('email' in config.ssl && config.ssl.email) {
                                opts.ssl = new classes.SSLOptions(config.ssl)
                            }
                        }

                        this.#_helpers.config.validate.options(opts, true);
                    } catch (error) {
                        throw error;
                    }
                },
                /**
                 * @param {Docs.HyperCloudInitOptions} options 
                 * @param {boolean} [fromFile] Default: ```false```.
                 */
                options: (options, fromFile = false) => {
                    try {
                        if (!('protocols' in options && options.protocols instanceof classes.ProtocolsOptions)) {
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
                            this.#_config.protocols.http.port = protocols.http.port;
                            if (typeof protocols.http.callback === 'string') { this.#_config.protocols.http.callback = protocols.http.callback }
                        }

                        if (protocols.https.enabled) {
                            this.#_config.protocols.https.port = protocols.https.port;
                            if (typeof protocols.https.callback === 'string') { this.#_config.protocols.https.callback = protocols.https.callback }
                            this.#_config.secure = true;
                        }

                        if (options.ssl) {
                            let valid = false;
                            if (options.ssl instanceof classes.SSLCredentials) {
                                this.#_config.ssl.cert = options.ssl.cert;
                                this.#_config.ssl.key = options.ssl.key;
                                valid = true;
                            }

                            if (options.ssl instanceof classes.SSLOptions) {
                                this.#_config.ssl.email = options.ssl.email;
                                this.#_config.ssl.domains = options.ssl.domains;
                                this.#_config.ssl.certName = options.ssl.certName;
                                this.#_config.ssl.self_signed = options.ssl.self_signed;
                                this.#_config.ssl.staging = options.ssl.staging;
                                this.#_config.ssl.storePath = options.ssl.storePath;
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
        this.#rendering = new RenderingManager(this);
        this.#rendering.addViews(path.resolve(path.join(__dirname, './services/pages')));
        this.#routesManager = new RoutesManager()
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
    Router(options) {
        return new Router(this, options || {})
    }

    /**
     * Initialize the server
     * @param {Docs.HyperCloudInitOptions|Docs.HyperCloudInitFile} options Pass ```HyperCloudInitOptions``` to manually initialize the server, or use ```HyperCloudInitFile``` to initialize the server from a file
     * @param {Docs.HyperCloudInitFile} [addOpt] Management options 
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
    async initialize(options, addOpt) {
        try {
            if (this.#_config.initialized) {
                throw 'The server is already initialized.';
            }

            if ('path' in options && options.path) {
                // Initialize the server from the config file.
                this.#_helpers.config.validate.file(options.path);
            }

            if ('protocols' in options && options.protocols) {
                this.#_helpers.config.validate.options(options);
                if (addOpt?.saveConfig === true && typeof addOpt.configPath === 'string' && addOpt.configPath.length > 0) {
                    this.#_helpers.config.save(addOpt.configPath, options);
                }
            }

            if ('proxy' in options && options.proxy) {
                const validProxies = [];

                if (options.proxy.isLocal === true) {
                    validProxies.push('127.0.0.1');
                }

                if (options.proxy.isDockerContainer === true) {
                    validProxies.push('172.17.0.1');
                }

                if ('trusted_proxies' in options.proxy) {
                    const invalidProxies = [];

                    if (!Array.isArray(options.proxy?.trusted_proxies)) {
                        throw `The server expected an array of trusted proxies in the "trusted_proxies" property but instead got ${typeof options.proxy.trusted_proxies}`;
                    }

                    for (const proxy of options.proxy.trusted_proxies) {
                        if (proxy === 'localhost') { proxy === '127.0.0.1' }
                        if (proxy === 'docker') { proxy === '172.17.0.1' }

                        if (helpers.validate.ipAddress(proxy)) {
                            if (!validProxies.includes(proxy)) { validProxies.push(proxy) }
                            validTrustedProxies++;
                        } else {
                            if (!invalidProxies.includes(proxy)) { invalidProxies.push(proxy) }
                        }
                    }

                    if (invalidProxies.length >= 0) {
                        throw `The server expected an array of trusted proxies, but some of them were invalid: ${invalidProxies.join(', ')}`;
                    }
                }

                if (validProxies.length === 0) {
                    throw `The 'proxy' option in the HyperCloud server was used without valid proxy IP addresses.`
                }

                this.#_config.trusted_proxies = validProxies;
            }

            // Initialize the server
            //console.log(this.#_config)
            if (typeof this.#_config.protocols.https.port === 'number' && this.#_config.protocols.https.port > 0) {
                const creds = { cert: null, key: null }

                // Extract/generate SSL
                if (this.#_config.ssl.cert) {
                    creds.cert = this.#_config.ssl.cert;
                    creds.key = this.#_config.ssl.key;
                } else {
                    this.#_system.SSL = new SSLManager(this.#_config.ssl, this.#_config.protocols.http.port);
                    const { key, cert } = await this.#_system.SSL.generate();
                    creds.cert = cert;
                    creds.key = key;
                }

                this.#_system.httpsServer = http2.createSecureServer({ ...creds, allowHTTP1: true });
            } else if (typeof this.#_config.protocols.http.port === 'number' && this.#_config.protocols.http.port > 0) {
                this.#_system.httpServer = http.createServer();
            } else {
                helpers.printConsole('No protocols were configured for initialization');
            }

            this.#_config.initialized = true;
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
    get locals() { return this.#_config.locals }
    set locals(value) {
        if (helpers.isRealObject(value)) {
            this.#_config.locals = value;
        } else {
            throw new TypeError(`The "server.locals" property expected an object with key:value pairs, but instead got ${typeof value}`)
        }
    }

    get rendering() { return this.#rendering }

    /**
     * Start listening
     * @returns {Promise<void>}
     */
    listen() {
        return new Promise((resolve, reject) => {
            try {
                if (!this.#_config.initialized) { throw 'Please initialize the server first.' }
                this.#_config.initialized = true;

                const protocol = this.#_config.protocols[this.#_config.secure ? 'https' : 'http'];
                /**@type {http2.Http2Server | http.Server} */
                const server = this.#_config.secure ? this.#_system.httpsServer : this.#_system.httpServer;

                server.on('request', async (req, res) => {
                    let resTemp; // A copy of the response to throw an error;
                    try {
                        this.#recievedReqNum++;
                        const request_id = `ns${btoa(`request-num:${this.#recievedReqNum};date:${new Date().toISOString()}`)}`;
                        req.id = request_id;
                        const request = await initializer.createRequest(this, req, { trusted_proxies: this.#_config.trusted_proxies });
                        const response = initializer.createResponse(this, request, res);
                        resTemp = response;

                        // Set the custom server headers
                        res.setHeader('X-Frame-Options', 'DENY');
                        res.setHeader('X-Server', 'Nasriya HyperCloud');
                        res.setHeader('X-Request-ID', request_id);

                        const matchedRoutes = this.#routesManager.match(request);
                        if (matchedRoutes.length > 0) {
                            new RequestRoutesManager(matchedRoutes, request, response);
                        } else {
                            response.status(404).pages.notFound();
                        }
                    } catch (error) {
                        if (resTemp instanceof HyperCloudResponse) {
                            resTemp.pages.serverError({ error });
                        } else {
                            console.error(error)
                            res.statusCode = 500;
                            res.end();
                        }
                    }
                })

                server.listen(protocol.port, () => {
                    console.info(`HyperCloud Server is listening ${this.#_config.secure ? 'securely ' : ''}on port #${protocol.port}`);
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
    get _routesManager() { return this.#routesManager }
    /**@private */
    get _handlers() { return this.#_config.handlers }

    /**
     * Define handlers for various scenarios
     * @param {'notFound'|'serverError'|'unauthorized'|'forbidden'|string} name The name of the handler
     * @param {(request: HyperCloudRequest, response: HyperCloudResponse, next: Function) => void} handler A function to handle responses called by the system
     * @throws {TypeError} If the `name` isn't a `string`.
     * @throws {SyntaxError} If the `name` is an empty `string` or doesn't start with a letter.
     * @throws {TypeError} If the `handler` isn't a `function`.
     */
    setHandler(name, handler) {
        if (typeof name !== 'string') { throw new TypeError(`The handler name must be a string but got ${typeof name}`) }
        if (name.length === 0) { throw new SyntaxError(`The handler name cannot be empty`) }
        const letterRegex = /^[a-zA-Z]/;
        if (!letterRegex.test(name)) { throw new SyntaxError(`The handler name can only starts with an (a-z/A-Z) letter.`) }
        if (typeof handler !== 'function') { throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`) }

        this.#_config.handlers[name] = handler;
    }
}

module.exports = HyperCloudServer