"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const http2_1 = __importDefault(require("http2"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helpers_1 = __importDefault(require("./utils/helpers"));
const manager_1 = __importDefault(require("./services/ssl/manager"));
const initializer_1 = __importDefault(require("./services/handler/initializer"));
const response_1 = __importDefault(require("./services/handler/assets/response"));
const manager_2 = __importDefault(require("./services/viewEngine/manager"));
const manager_3 = __importDefault(require("./services/routes/manager"));
const routesInitiator_1 = __importDefault(require("./services/routes/assets/routesInitiator"));
const router_1 = __importDefault(require("./services/routes/assets/router"));
const manager_4 = __importDefault(require("./services/helmet/manager"));
const rateLimiter_1 = __importDefault(require("./services/rateLimiter/rateLimiter"));
/**HyperCloud HTTP2 server */
class HyperCloudServer {
    #_recievedReqNum = 0;
    #_system = {
        httpServer: undefined,
        httpsServer: undefined
    };
    #_helmet;
    #_config = {
        secure: false,
        ssl: {
            type: 'selfSigned',
            storePath: undefined,
            letsEncrypt: {
                email: undefined,
                domains: [],
                certName: undefined,
                staging: false,
                challengePort: 80
            },
            credentials: {
                cert: undefined,
                key: undefined,
            }
        },
        trusted_proxies: [],
        locals: {},
        cronJobs: {},
        handlers: {},
        languages: { default: 'en', supported: ['en'] }
    };
    #_utils = Object.freeze({
        config: {
            /**
             * @param {string} filePath The path of the configurations file. Or pass ```default``` to read from the default config. file.
             * @returns {HyperCloudInitOptions} Initialization options
             */
            read: (filePath) => {
                if (filePath === 'default') {
                    filePath = path_1.default.resolve('./config.json');
                    const validity = helpers_1.default.checkPathAccessibility(filePath);
                    if (validity.valid !== true) {
                        if (validity.errors.exist !== true) {
                            helpers_1.default.printConsole(`To use the default config file, you need to initialize the server manually and set the "saveConfig" property to (true) without specifying a "configPath".`);
                            throw `No default configurations found.`;
                        }
                        if (validity.errors.accessible) {
                            throw `You don't have enough permissions to access ${filePath}`;
                        }
                    }
                    const fileStr = fs_1.default.readFileSync(filePath, { encoding: 'utf8' });
                    try {
                        const file = JSON.parse(fileStr);
                        return file;
                    }
                    catch (error) {
                        throw `The default configuration file is damaged, corrupteed, or not a valid JSON file.`;
                    }
                }
                if (typeof filePath !== 'string') {
                    throw `The configuration path that you've passed is invalid. Expected a string but instead got ${typeof filePath}`;
                }
                const validity = helpers_1.default.checkPathAccessibility(filePath);
                if (validity.valid !== true) {
                    if (validity.errors.exist !== true) {
                        helpers_1.default.printConsole(`To save your configurations, you need to initialize the server manually and set the "saveConfig" property to (true), then specify a path to store the configs using the "configPath" property.`);
                        throw `Your configuration file was not found.`;
                    }
                    if (validity.errors.accessible) {
                        throw `You don't have enough permissions to access ${filePath}`;
                    }
                }
                const fileStr = fs_1.default.readFileSync(filePath, { encoding: 'utf8' });
                try {
                    const file = JSON.parse(fileStr);
                    return file;
                }
                catch (error) {
                    throw `Your configuration file is damaged, corrupteed, or not a valid JSON file.`;
                }
            },
            /**
             * @param {string} filePath
             * @param {HyperCloudInitOptions} options
             * @returns {void}
             */
            save: (filePath, options) => {
                if (filePath === 'default') {
                    filePath = path_1.default.resolve('./');
                }
                else {
                    if (!fs_1.default.existsSync(filePath)) {
                        fs_1.default.mkdirSync(filePath);
                    }
                }
                fs_1.default.writeFileSync(path_1.default.resolve(`${filePath}/config.json`), JSON.stringify(options, null, 4), { encoding: 'utf-8' });
            }
        }
    });
    constructor(userOptions, addOpt) {
        this.rendering = new manager_2.default(this);
        this.rendering.addViews(path_1.default.resolve(path_1.default.join(__dirname, './services/pages')));
        this._routesManager = new manager_3.default();
        this.#_helmet = new manager_4.default(this);
        this.rateLimiter = new rateLimiter_1.default(this);
        try {
            if (helpers_1.default.is.undefined(userOptions)) {
                return;
            }
            if (!helpers_1.default.is.realObject(userOptions)) {
                throw `The server configuration is expecting an object, but instead got ${typeof userOptions}`;
            }
            let isFromFile = false;
            if ('path' in userOptions) {
                // Initialize the server from the config file.
                if (typeof userOptions.path !== 'string') {
                    throw `The server configuration path must be a string, instead got ${typeof userOptions.path}`;
                }
                const savedConfig = this.#_utils.config.read(userOptions.path);
                userOptions = savedConfig;
                isFromFile = true;
            }
            const options = userOptions;
            const config_src = isFromFile ? 'file' : 'options';
            if ('secure' in options) {
                if (typeof options.secure !== 'boolean') {
                    throw `The secure option in the configuration ${config_src} is expecting a boolean value, instead got ${typeof options.secure}`;
                }
                if (options.secure === true) {
                    this.#_config.secure = true;
                    if ('ssl' in options) {
                        if (helpers_1.default.is.undefined(options.ssl) || !helpers_1.default.is.realObject(options.ssl)) {
                            throw `The SSL options used in server configurations ${config_src} is expectd to be an object, instead got ${options.ssl}`;
                        }
                        switch (options.ssl.type) {
                            case 'credentials':
                                {
                                    if ('credentials' in options) {
                                        if (helpers_1.default.is.undefined(options.ssl.credentials) || !helpers_1.default.is.realObject(options.ssl.credentials)) {
                                            throw `The SSL "credentials" option is expecting an object, but instead got ${typeof options.ssl.credentials}`;
                                        }
                                        if ('cert' in options.ssl.credentials && 'key' in options.ssl.credentials) {
                                            if ('cert' in options.ssl.credentials) {
                                                if (typeof options.ssl.credentials.cert !== 'string') {
                                                    throw `The "cert" option in server's configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.credentials.cert}`;
                                                }
                                                if (!(options.ssl.credentials.cert.startsWith('---- BEGIN CERTIFICATE----') && options.ssl.credentials.cert.startsWith('----END CERTIFICATE----'))) {
                                                    throw `The provided certificate (cert) in the configuration ${config_src} is not a valid certificate`;
                                                }
                                                this.#_config.ssl.credentials.cert = options.ssl.credentials.cert;
                                            }
                                            if ('key' in options.ssl.credentials) {
                                                if (typeof options.ssl.credentials.key !== 'string') {
                                                    throw `The "key" option in server's configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.credentials.key}`;
                                                }
                                                if (!(options.ssl.credentials.key.startsWith('-----BEGIN') && options.ssl.credentials.key.startsWith('PRIVATE KEY-----'))) {
                                                    throw `The provided private key (key) in the configuration ${config_src} is not a valid key`;
                                                }
                                                this.#_config.ssl.credentials.key = options.ssl.credentials.key;
                                            }
                                        }
                                        else {
                                            throw `The SSL credentials object has been passed but is missing the "cert" and/or "key" values.`;
                                        }
                                    }
                                    else {
                                        throw `The SSL type was set to "credentials" without specifying a credentials object`;
                                    }
                                }
                                break;
                            case 'letsEncrypt': {
                                if (helpers_1.default.is.undefined(options.ssl.letsEncrypt) || !helpers_1.default.is.realObject(options.ssl.letsEncrypt)) {
                                    throw `The SSL "letsEncrypt" option is expecting an object, but instead got ${typeof options.ssl.letsEncrypt}`;
                                }
                                if ('email' in options.ssl.letsEncrypt && !helpers_1.default.is.undefined(options.ssl.letsEncrypt)) {
                                    if (!helpers_1.default.is.validString(options.ssl.letsEncrypt.email)) {
                                        throw `The options.ssl.letsEncrypt.email option in the configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.letsEncrypt.email}`;
                                    }
                                    if (!helpers_1.default.validate.email(options.ssl.letsEncrypt.email)) {
                                        throw `The provided options.ssl.letsEncrypt.email (${options.ssl.letsEncrypt.email}) is not a valid email address`;
                                    }
                                    this.#_config.ssl.letsEncrypt.email = options.ssl.letsEncrypt.email;
                                }
                                else {
                                    throw `The "email" SSL option in the configuration ${config_src} is missing.`;
                                }
                                if ('domains' in options.ssl.letsEncrypt && !helpers_1.default.is.undefined(options.ssl.letsEncrypt.domains)) {
                                    if (Array.isArray(options.ssl.letsEncrypt.domains)) {
                                        if (!helpers_1.default.validate.domains(options.ssl.letsEncrypt.domains)) {
                                            throw `The provided domains array (${options.ssl.letsEncrypt.domains.join(', ')}) is not a valid domains array`;
                                        }
                                        this.#_config.ssl.letsEncrypt.domains = options.ssl.letsEncrypt.domains;
                                    }
                                    else {
                                        throw `The options.ssl.letsEncrypt.domains property expected an array as a value but instead got ${typeof options.ssl.letsEncrypt.domains}`;
                                    }
                                }
                                else {
                                    throw `The options.ssl.letsEncrypt.domains option in the configuration ${config_src} is missing.`;
                                }
                                if ('certName' in options.ssl.letsEncrypt && !helpers_1.default.is.undefined(options.ssl.letsEncrypt.certName)) {
                                    if (!helpers_1.default.is.validString(options.ssl.letsEncrypt.certName)) {
                                        throw `The options.ssl.letsEncrypt.certName option in the configuration ${config_src} is expecting a string value, instead got ${typeof options.ssl.letsEncrypt.certName}`;
                                    }
                                    this.#_config.ssl.letsEncrypt.certName = options.ssl.letsEncrypt.certName;
                                }
                                else {
                                    this.#_config.ssl.letsEncrypt.certName = helpers_1.default.getProjectName().replace(/-/g, '');
                                }
                                if ('staging' in options.ssl.letsEncrypt && !helpers_1.default.is.undefined(options.ssl.letsEncrypt.staging)) {
                                    if (typeof options.ssl.letsEncrypt.staging !== 'boolean') {
                                        throw `The typeof options.ssl.letsEncrypt.staging option was used with an invalid value. Expected a boolean value but got ${typeof options.ssl.letsEncrypt.staging}`;
                                    }
                                    this.#_config.ssl.letsEncrypt.staging = options.ssl.letsEncrypt.staging;
                                }
                                if ('challengePort' in options.ssl.letsEncrypt && !helpers_1.default.is.undefined(options.ssl.letsEncrypt.challengePort)) {
                                    if (typeof options.ssl.letsEncrypt.challengePort !== 'number') {
                                        throw `The options.ssl.letsEncrypt.challengePort is expecting a number value, but instead got ${typeof options.ssl.letsEncrypt.challengePort}`;
                                    }
                                    if (options.ssl.letsEncrypt.challengePort <= 0) {
                                        throw `The options.ssl.letsEncrypt.challengePort is expecting a port number greater than zero. You choosed: ${options.ssl.letsEncrypt.challengePort}`;
                                    }
                                    this.#_config.ssl.letsEncrypt.challengePort = options.ssl.letsEncrypt.challengePort;
                                }
                            }
                        }
                        if ('storePath' in options.ssl && !helpers_1.default.is.undefined(options.ssl.storePath)) {
                            const validity = helpers_1.default.checkPathAccessibility(options.ssl.storePath);
                            if (validity.valid === true) {
                                this.#_config.ssl.storePath = options.ssl.storePath;
                            }
                            else {
                                if (validity.errors.isString !== true) {
                                    throw new TypeError(`Invalid "storePath" was provided. Expected a string but instead got ${typeof options.ssl.storePath}`);
                                }
                                if (validity.errors.exist !== true) {
                                    throw new Error(`The "storePath" that you've provided (${options.ssl.storePath}) doesn't exist`);
                                }
                                if (validity.errors.accessible !== true) {
                                    throw Error(`You don't have enough read permissions to access ${options.ssl.storePath}`);
                                }
                            }
                        }
                        else {
                            this.#_config.ssl.storePath = path_1.default.join(process.cwd(), 'SSL');
                        }
                    }
                    else {
                        this.#_config.ssl.type = 'selfSigned';
                    }
                }
            }
            if ('proxy' in options && !helpers_1.default.is.undefined(options.proxy)) {
                if (!helpers_1.default.is.realObject(options.proxy)) {
                    throw `The options.proxy expected a real object but instead got ${typeof options.proxy}`;
                }
                const validProxies = [];
                if ('isLocal' in options.proxy && options.proxy.isLocal === true) {
                    validProxies.push('127.0.0.1');
                }
                if ('isDockerContainer' in options.proxy && options.proxy.isDockerContainer === true) {
                    validProxies.push('172.17.0.1');
                }
                if ('trusted_proxies' in options.proxy) {
                    const invalidProxies = [];
                    if (!Array.isArray(options.proxy?.trusted_proxies)) {
                        throw `The server expected an array of trusted proxies in the options.proxy.trusted_proxies property but instead got ${typeof options.proxy.trusted_proxies}`;
                    }
                    for (let proxy of options.proxy.trusted_proxies) {
                        if (proxy === 'localhost') {
                            proxy = '127.0.0.1';
                        }
                        if (proxy === 'docker') {
                            proxy = '172.17.0.1';
                        }
                        if (helpers_1.default.validate.ipAddress(proxy)) {
                            if (!validProxies.includes(proxy)) {
                                validProxies.push(proxy);
                            }
                        }
                        else {
                            if (!invalidProxies.includes(proxy)) {
                                invalidProxies.push(proxy);
                            }
                        }
                    }
                    if (invalidProxies.length > 0) {
                        helpers_1.default.printConsole(invalidProxies);
                        throw `The server expected an array of trusted proxies, but some of them were invalid: ${invalidProxies.join(', ')}`;
                    }
                }
                if (validProxies.length === 0) {
                    throw `The 'proxy' option in the HyperCloud server was used without valid proxy IP addresses.`;
                }
                this.#_config.trusted_proxies = validProxies;
            }
            if ('languages' in options) {
                if (helpers_1.default.is.undefined(options.languages) || !helpers_1.default.is.realObject(options.languages)) {
                    throw `The options.languages option has been used with an invalid value. Expected an object but instead got ${typeof options.languages}`;
                }
                if ('supported' in options.languages && !helpers_1.default.is.undefined(options.languages.supported)) {
                    this.supportedLanguages = options.languages.supported;
                }
                if ('default' in options.languages && !helpers_1.default.is.undefined(options.languages.default)) {
                    this.defaultLanguage = options.languages.default;
                }
            }
            if ('locals' in options && !helpers_1.default.is.undefined(options.locals)) {
                this.locals = options.locals;
            }
            if ('handlers' in options && !helpers_1.default.is.undefined(options.handlers)) {
                if (!helpers_1.default.is.realObject(options.handlers)) {
                    throw `The options.handler was used with an invalid value. Expected an object but instead got ${typeof options.handlers}`;
                }
                for (const name in options.handlers) {
                    const handlerName = name;
                    this.handlers[handlerName](options.handlers[handlerName]);
                }
            }
            if (!isFromFile) {
                if (!helpers_1.default.is.undefined(addOpt) && helpers_1.default.is.realObject(addOpt)) {
                    if ('saveConfig' in addOpt) {
                        if (typeof addOpt.saveConfig !== 'boolean') {
                            throw `The saveConfig option in the server's management options expects a boolean value, but instead got ${addOpt.saveConfig}`;
                        }
                        if (addOpt.saveConfig === true) {
                            const savePath = (() => {
                                if ('configPath' in addOpt) {
                                    if (helpers_1.default.is.undefined(addOpt.configPath) || !helpers_1.default.is.validString(addOpt.configPath)) {
                                        throw `The "configPath" option in the server's management options expects a string value, but instead got ${addOpt.configPath}`;
                                    }
                                    return addOpt.configPath;
                                }
                                else {
                                    return 'default';
                                }
                            })();
                            const toSave = {
                                secure: this.#_config.secure,
                                ssl: this.#_config.ssl,
                                proxy: { trusted_proxies: this.#_config.trusted_proxies },
                                locals: this.#_config.locals,
                                languages: this.#_config.languages,
                            };
                            this.#_utils.config.save(savePath, toSave);
                        }
                    }
                }
            }
        }
        catch (error) {
            if (typeof error === 'string') {
                error = `Cannot initialize the server: ${error}`;
            }
            helpers_1.default.printConsole(error);
            throw new Error('Cannot initialize the server');
        }
    }
    get defaultLanguage() { return this.#_config.languages.default; }
    /**
     * Set or get the default language of the server
     * @param {string} lang The default language
     */
    set defaultLanguage(lang) {
        if (this.#_config.languages.supported.includes(lang)) {
            this.#_config.languages.default = lang;
        }
        else {
            throw `Cannot set default language: ${lang} is not supported`;
        }
    }
    get supportedLanguages() { return this.#_config.languages.supported; }
    /**
     * Set or get the server's supported languages
     * @param {string|string[]} langs A list of supported languages
     */
    set supportedLanguages(langs) {
        if (!(typeof langs === 'string' || Array.isArray(langs))) {
            throw new TypeError(`The server's "supportedLanguages" accepts a string or a list of strings, but instead got ${typeof langs}`);
        }
        if (typeof langs === 'string') {
            if (langs.length === 0) {
                throw `The server's "supportedLanguages" cannot be an empty string`;
            }
            this.#_config.languages.supported = [langs.toLowerCase()];
        }
        else {
            langs = [...new Set(langs)];
            if (langs.length === 0) {
                throw `The server's "supportedLanguages" recieved an empty array`;
            }
            const supported = [];
            for (const lang of langs) {
                if (typeof lang === 'string' && lang.length > 0) {
                    supported.push(lang.toLowerCase());
                }
                else {
                    throw new TypeError(`The server's "supportedLanguages" accepts a list of strings, but one or more of its items are invalid`);
                }
            }
            this.#_config.languages.supported = supported;
        }
        if (!this.#_config.languages.supported.includes(this.#_config.languages.default)) {
            helpers_1.default.printConsole(`The server recieved a new list of supported languages, but the default language (${this.defaultLanguage}) is not part of the new list.`);
            helpers_1.default.printConsole(`Setting the new default language to: ${this.supportedLanguages[0] || 'en'}`);
            this.defaultLanguage = this.supportedLanguages[0] || 'en';
        }
    }
    /**
     * The `server.locals` object has properties that are local
     * variables within the application, and will be available
     * in templates rendered with `{@link HyperCloudResponse.render}`.
     */
    get locals() { return this.#_config.locals; }
    set locals(value) {
        if (helpers_1.default.is.realObject(value)) {
            this.#_config.locals = value;
        }
        else {
            throw new TypeError(`The "server.locals" property expected an object with key:value pairs, but instead got ${typeof value}`);
        }
    }
    rateLimiter;
    rendering;
    /**@private */
    _routesManager;
    /**@private */
    get _handlers() { return this.#_config.handlers; }
    handlers = Object.freeze({
        notFound: (handler) => {
            const handlerName = 'notFound';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        },
        serverError: (handler) => {
            const handlerName = 'serverError';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        }, unauthorized: (handler) => {
            const handlerName = 'unauthorized';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        }, forbidden: (handler) => {
            const handlerName = 'forbidden';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        }, userSessions: (handler) => {
            const handlerName = 'forbidden';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        }, logger: (handler) => {
            const handlerName = 'logger';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 3;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        }, onHTTPError: (handler) => {
            const handlerName = 'onHTTPError';
            if (typeof handler !== 'function') {
                throw new TypeError(`The provided handler isn't a function but a type of ${typeof handler}`);
            }
            const reqParams = 4;
            const handlerParams = handler.length;
            if (handlerParams !== reqParams) {
                throw new RangeError(`The provided handler has ${handlerParams} parameters. The expected number of parameters is ${reqParams}`);
            }
            this.#_config.handlers[handlerName] = handler;
        }
    });
    /**
     * A protection "helmet" module that serves as a middleware or multiple middlewares
     * that you can use on your routes.
     *
     * You can customize the
     */
    helmet(options) { this.#_helmet.config(options); }
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
    Router(options) {
        return new router_1.default(this, options || {});
    }
    /**
     * Start listening for incoming requests
     * @param protocol Specify the port number of the protocol for the server. Default: `443` for secure servers and `80` for plain HTTP ones. You can pass a callback too.
     * @param callback Pass a callback function to run when the server starts listening.
     * @returns {Promise<void|http2.Http2SecureServer>} If secure connection is configured, a `Promise<http2.Http2SecureServer>` will be returned, otherwise, a `Promise<void>` will be returned.
     */
    async listen(protocol) {
        try {
            if (this.#_config.secure) {
                const { cert, key } = await (async () => {
                    if (this.#_config.ssl.type === 'credentials') {
                        return { cert: this.#_config.ssl.credentials.cert, key: this.#_config.ssl.credentials.key };
                    }
                    else {
                        return new manager_1.default().generate({
                            type: this.#_config.ssl.type,
                            storePath: this.#_config.ssl.storePath,
                            letsEncrypt: this.#_config.ssl.letsEncrypt
                        });
                    }
                })();
                this.#_system.httpsServer = http2_1.default.createSecureServer({ cert, key });
            }
            else {
                this.#_system.httpServer = http_1.default.createServer();
            }
            const server = (this.#_config.secure ? this.#_system.httpsServer : this.#_system.httpServer);
            server.on('request', async (req, res) => {
                /**A copy of the response to throw an error */
                let resTemp = {};
                try {
                    res.on('close', () => {
                        if (resTemp) {
                            resTemp._closed = true;
                        }
                    });
                    this.#_recievedReqNum++;
                    const request_id = `ns${btoa(`request-num:${this.#_recievedReqNum};date:${new Date().toISOString()}`)}`;
                    // @ts-ignore
                    req.id = request_id;
                    const request = await initializer_1.default.createRequest(this, req, { trusted_proxies: this.#_config.trusted_proxies });
                    const response = initializer_1.default.createResponse(this, request, res);
                    resTemp = response;
                    // Set the custom server headers
                    res.setHeader('X-Frame-Options', 'DENY');
                    res.setHeader('X-Server', 'Nasriya HyperCloud');
                    res.setHeader('X-Request-ID', request_id);
                    const matchedRoutes = this._routesManager.match(request);
                    if (matchedRoutes.length > 0) {
                        new routesInitiator_1.default(matchedRoutes, request, response);
                    }
                    else {
                        response.status(404).pages.notFound();
                    }
                }
                catch (error) {
                    if (!helpers_1.default.is.undefined(resTemp) && resTemp instanceof response_1.default) {
                        resTemp.pages.serverError({
                            lang: this.defaultLanguage,
                            locals: {
                                title: `Server Error (500)`,
                                subtitle: 'Server Error (500)',
                                message: `Ops! We're experincing some difficulties, pleaes refresh the page or try again later.\n\nIf you're the site owner and the error persisted, please review the your site logs and open an issue on Github.\n\nError Code: 0x00008`
                            }
                        });
                    }
                    else {
                        console.error(error);
                        res.statusCode = 500;
                        res.end();
                    }
                }
            });
            const { port, callback } = (() => {
                if (helpers_1.default.is.undefined(protocol)) {
                    return { port: this.#_config.secure ? 443 : 80, callback: undefined };
                }
                if ('port' in protocol) {
                    if (typeof protocol.port !== 'number') {
                        throw `The port used in the protocol (${protocol.port}) should be a number, instead got ${typeof protocol.port}`;
                    }
                    if (protocol.port <= 0) {
                        throw `The port has been assigned an invalid value (${protocol.port}). Ports are numbers greater than zero`;
                    }
                    if ('callback' in protocol) {
                        if (typeof protocol.callback !== 'function') {
                            throw `The protocol.callback should be a callback function, instead got ${typeof protocol.callback}`;
                        }
                        return { port: protocol.port, callback: protocol.callback };
                    }
                    else {
                        return { port: protocol.port, callback: undefined };
                    }
                }
                else {
                    return { port: this.#_config.secure ? 443 : 80, callback: undefined };
                }
            })();
            return new Promise((resolve, reject) => {
                const res = server.listen(port, () => {
                    console.info(`HyperCloud Server is listening ${this.#_config.secure ? 'securely ' : ''}on port #${port}`);
                    callback?.();
                });
                if (this.#_config.secure) {
                    resolve(res);
                }
                else {
                    resolve();
                }
            });
        }
        catch (error) {
            if (typeof error === 'string') {
                error = `Unable to start listening: ${error}`;
            }
            throw error;
        }
    }
}
exports.default = HyperCloudServer;
