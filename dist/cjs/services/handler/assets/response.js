"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mimes_json_1 = __importDefault(require("../../../data/mimes.json"));
const extensions_json_1 = __importDefault(require("../../../data/extensions.json"));
const helpers_1 = __importDefault(require("../../../utils/helpers"));
const renderer_1 = __importDefault(require("../../viewEngine/renderer"));
const cookies_1 = __importDefault(require("./cookies"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ms_1 = __importDefault(require("ms"));
const extensions = !helpers_1.default.is.undefined(extensions_json_1.default) ? extensions_json_1.default : [];
/**
 * TODO: Change all the server examples to use my own server class
 */
/**This class is used internallly, not by the user */
class HyperCloudResponse {
    #_server;
    #_req;
    #_res;
    #_cookies;
    #_preservedHeaders = ['x-server', 'x-request-id'];
    #_encodings = Object.freeze([
        "ascii",
        "utf8",
        "utf-8",
        "utf16le",
        "utf-16le",
        "ucs2",
        "ucs-2",
        "base64",
        "base64url",
        "latin1",
        "binary",
        "hex"
    ]);
    #_status = Object.seal({
        closed: false
    });
    #_next = undefined;
    constructor(server, req, res) {
        this.#_server = server;
        this.#_req = req;
        this.#_res = res;
        this.#_cookies = new cookies_1.default(this);
    }
    get pages() {
        return Object.freeze({
            /**
             * Return a not found `404` response.
             *
             * By default, **HyperCloud** returns its own `404` page. To return your
             * own page use the {@link HyperCloudServer.setHandler} method.
             * @example
             * // Use the default 404 page
             * response.pages.notFound({
             *      lang: 'en',
             *      title: '404 - Not Found',
             *      subtitle: 'This page cannot be found',
             *      home: 'Home'
             * });
             *
             * // All options are "optional" and can be omitted
             * response.pages.notFound(); // Renders the default 404 page
             * @example
             * // Setting your own handler
             * server.setHandler('notFound', (request, response, next) => {
             *      // Decide what to do here
             * })
             * @param {NotFoundResponseOptions} [options] Rendering options
             */
            notFound: (options) => {
                if (typeof this.#_server._handlers.notFound === 'function') {
                    try {
                        // Run the user defined handler for not-found resources
                        this.#_server._handlers.notFound(this.#_req, this, this._next);
                    }
                    catch (error) {
                        this.pages.serverError({ error: error });
                    }
                }
                else {
                    const viewName = 'hypercloud_404';
                    const renderOptions = {
                        cacheControl: false,
                        statusCode: 404,
                        locals: {
                            lang: options?.lang || this.#_req.language,
                            title: options?.locals?.title || `404 - Page Not Found`,
                            subtitle: options?.locals?.subtitle || 'Oops. Looks like you took a wrong turn.',
                            homeBtnLabel: options?.locals?.home || 'HOME'
                        }
                    };
                    return this.render(viewName, renderOptions);
                }
            },
            /**
             * Return an unauthorized `401` response.
             *
             * By default, **HyperCloud** returns its own `401` page. To return your
             * own page use the {@link HyperCloudServer.setHandler} method.
             * @example
             * // Use the default 401 page
             * response.pages.unauthorized({
             *      lang: 'en',
             *      title: '401 - Unauthorized',
             *      commands: {*
             *          code: 'ERROR CODE',
             *          description: 'ERROR DESCRIPTION',
             *          cause: 'ERROR POSSIBLY CAUSED BY',
             *          allowed: 'SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS',
             *          regards: 'HAVE A NICE DAY :-)'
             *        },
             *        content: {
             *          code: 'HTTP 401 Unauthorized',
             *          description: 'Access Denied. You Do Not Have The Permission To Access This Page',
             *          cause: 'execute access unauthorized, read access unauthorized, write access unauthorized',
             *          allowed: [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
             *        }
             * });
             *
             * // All options are "optional" and can be omitted
             * response.pages.unauthorized(); // Renders the default 401 page
             * @example
             * // Setting your own handler
             * server.setHandler('unauthorized', (request, response, next) => {
             *      // Decide what to do here
             * })
             * @param {ForbiddenAndUnauthorizedOptions} [options]
             */
            unauthorized: (options) => {
                if (typeof this.#_server._handlers.unauthorized === 'function') {
                    try {
                        // Run the user defined handler for not-found resources
                        this.#_server._handlers.unauthorized(this.#_req, this, this._next);
                    }
                    catch (error) {
                        this.pages.serverError({ error: error });
                    }
                }
                else {
                    const viewName = 'hypercloud_401_403';
                    /**@type {RenderingOptions} */
                    const renderOptions = {
                        cacheControl: false,
                        statusCode: 401,
                        locals: {
                            lang: options?.lang || this.#_req.language,
                            title: options?.locals?.title || 'Unauthorized',
                            code: 401,
                            commands: {
                                code: options?.locals?.commands?.code || 'ERROR CODE',
                                description: options?.locals?.commands?.description || 'ERROR DESCRIPTION',
                                cause: options?.locals?.commands?.cause || 'ERROR POSSIBLY CAUSED BY',
                                allowed: options?.locals?.commands?.allowed || 'SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS',
                                regards: options?.locals?.commands?.regards || 'HAVE A NICE DAY :-)'
                            },
                            content: {
                                code: options?.locals?.content?.code || 'HTTP 401 Unauthorized',
                                description: options?.locals?.content?.description || 'Access Denied. You Do Not Have The Permission To Access This Page On This Server',
                                cause: options?.locals?.content?.cause || 'execute access unauthorized, read access unauthorized, write access unauthorized, ssl required, ssl 128 required, ip address rejected, client certificate required, site access denied, too many users, invalid configuration, password change, mapper denied access, client certificate revoked, directory listing denied, client access licenses exceeded, client certificate is untrusted or invalid, client certificate has expired or is not yet valid, passport logon failed, source access denied, infinite depth is denied, too many requests from the same client ip',
                                allowed: options?.locals?.content?.allowed || [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
                            }
                        }
                    };
                    return this.render(viewName, renderOptions);
                }
            },
            /**
             * Return a forbidden `403` response.
             *
             * By default, **HyperCloud** returns its own `403` page. To return your
             * own page use the {@link HyperCloudServer.setHandler} method.
             * @example
             * // Use the default 403 page
             * response.pages.forbidden({
             *      lang: 'en',
             *      title: '403 - Forbidden',
             *      commands: {*
             *          code: 'ERROR CODE',
             *          description: 'ERROR DESCRIPTION',
             *          cause: 'ERROR POSSIBLY CAUSED BY',
             *          allowed: 'SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS',
             *          regards: 'HAVE A NICE DAY :-)'
             *        },
             *        content: {
             *          code: 'HTTP 403 Forbidden',
             *          description: 'Access Denied. You Do Not Have The Permission To Access This Page',
             *          cause: 'execute access forbidden, read access forbidden, write access forbidden',
             *          allowed: [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
             *        }
             * });
             *
             * // All options are "optional" and can be omitted
             * response.pages.forbidden(); // Renders the default 403 page
             * @example
             * // Setting your own handler
             * server.setHandler('forbidden', (request, response, next) => {
             *      // Decide what to do here
             * })
             * @param {ForbiddenAndUnauthorizedOptions} options
             */
            forbidden: (options) => {
                if (typeof this.#_server._handlers.forbidden === 'function') {
                    try {
                        // Run the user defined handler for not-found resources
                        this.#_server._handlers.forbidden(this.#_req, this, this._next);
                    }
                    catch (error) {
                        this.pages.serverError({ error: error });
                    }
                }
                else {
                    const viewName = 'hypercloud_401_403';
                    /**@type {RenderingOptions} */
                    const renderOptions = {
                        cacheControl: false,
                        statusCode: 403,
                        locals: {
                            lang: options?.lang || this.#_req.language,
                            title: options?.locals?.title || 'Forbidden',
                            code: 403,
                            commands: {
                                code: options?.locals?.commands?.code || 'ERROR CODE',
                                description: options?.locals?.commands?.description || 'ERROR DESCRIPTION',
                                cause: options?.locals?.commands?.cause || 'ERROR POSSIBLY CAUSED BY',
                                allowed: options?.locals?.commands?.allowed || 'SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS',
                                regards: options?.locals?.commands?.regards || 'HAVE A NICE DAY :-)'
                            },
                            content: {
                                code: options?.locals?.content?.code || 'HTTP 403 Forbidden',
                                description: options?.locals?.content?.description || 'Access Denied. You Do Not Have The Permission To Access This Page On This Server',
                                cause: options?.locals?.content?.cause || 'execute access forbidden, read access forbidden, write access forbidden, ssl required, ssl 128 required, ip address rejected, client certificate required, site access denied, too many users, invalid configuration, password change, mapper denied access, client certificate revoked, directory listing denied, client access licenses exceeded, client certificate is untrusted or invalid, client certificate has expired or is not yet valid, passport logon failed, source access denied, infinite depth is denied, too many requests from the same client ip',
                                allowed: options?.locals?.content?.allowed || [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
                            }
                        }
                    };
                    return this.render(viewName, renderOptions);
                }
            },
            /**
             * Return a server error `500` response.
             *
             * By default, **HyperCloud** returns its own `500` page. To return your
             * own page use the {@link HyperCloudServer.setHandler} method.
             * @example
             * // Use the default 500 page
             * response.pages.serverError({
             *      lang: 'en',
             *      title: '500 - Server Error',
             *      subtitle: 'Internal <code>Server error<span>!</span></code>',
             *      message: '<p> We\'re sorry, but something went wrong on our end. </p>'
             * });
             *
             * // All options are "optional" and can be omitted
             * response.pages.serverError(); // Renders the default 500 page
             * @example
             * // Setting your own handler
             * server.setHandler('serverError', (request, response, next) => {
             *      // Decide what to do here
             * })
             * @param {ServerErrorOptions} options
             */
            serverError: (options) => {
                if ('error' in options) {
                    const dashLine = '#'.repeat(50);
                    const diver = `${dashLine}\n${dashLine}`;
                    helpers_1.default.printConsole(diver);
                    console.error(`A server error has occurred`);
                    helpers_1.default.printConsole(`${new Date().toUTCString()} - Page Load Error - Request ID: ${this.#_req.id}`);
                    helpers_1.default.printConsole(`Request:\n${this.#_req._toString()}`);
                    helpers_1.default.printConsole(options.error);
                    helpers_1.default.printConsole(diver);
                }
                if (typeof this.#_server._handlers.serverError === 'function' && options?.bypassHandler !== true) {
                    try {
                        // Run the user defined handler for not-found resources
                        this.#_server._handlers.serverError(this.#_req, this, this._next);
                    }
                    catch (error) {
                        this.pages.serverError({ bypassHandler: true });
                    }
                }
                else {
                    const viewName = 'hypercloud_500';
                    /**@type {RenderingOptions} */
                    const renderOptions = {
                        cacheControl: false,
                        statusCode: 500,
                        locals: {
                            lang: options?.lang || this.#_req.language,
                            title: options?.locals?.title || 'Server Error',
                            subtitle: options?.locals?.subtitle || 'Internal <code>Server&nbsp;error<span>!</span></code>',
                            message: options?.locals?.message || `<p> We're sorry, but something went wrong on our end. Our team has been notified, and we're working to fix the issue as soon as possible. </p>\n<p>In the meantime, you can try refreshing the page or coming back later. If the problem persists, feel free to <a href="/contact-us">contact us</a> for further assistance.</p>\n<p>Thank you for your understanding.</p>`,
                        }
                    };
                    return this.render(viewName, renderOptions);
                }
            }
        });
    }
    /**
     * HyperCloud's next() function
     * @private
    */
    get _next() { return this.#_next; }
    set _next(value) {
        if (typeof value === 'function') {
            this.#_next = value;
        }
    }
    /**
     * Redirect the client to a new location
     * @param {string} url A relative or full path URL.
     * @param {RedirectCode} [code] A redirect code. Default `307`. Learn more about [redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections).
     */
    redirect(url, code = 307) {
        try {
            if (typeof url !== 'string') {
                throw new TypeError(`The redirect URL should be a string, but instead got ${typeof url}`);
            }
            if (typeof code === 'number' || typeof code === 'string') {
                if (typeof code === 'string') {
                    try {
                        code = Number.parseInt(code);
                    }
                    catch (error) {
                        throw new TypeError(`The redirect code should be a number, instead got ${typeof code}`);
                    }
                }
                const codes = [300, 301, 302, 303, 304, 307, 308];
                if (!codes.includes(code)) {
                    throw new RangeError(`Invalid redirect code: ${code}. Learn more about redirections at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections`);
                }
                this.status(code).setHeader('Location', url);
                return this.end();
            }
            else {
                throw new TypeError(`The redirect code should be a number, instead got ${typeof code}`);
            }
        }
        catch (error) {
            if (typeof error === 'string') {
                error = `Unable to redirect: ${error}`;
            }
            if (error instanceof Error) {
                error.message = `Unable to redirect: ${error.message}`;
            }
            throw error;
        }
    }
    /**
     * Render an `ejs` template with the provided options.
     * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the
     * @param {RenderingOptions} options
     * @returns {HyperCloudResponse}
     */
    render(name, options) {
        try {
            const renderer = new renderer_1.default(this);
            const html = renderer.render(name, options?.locals || {});
            this.setHeader('Content-Type', 'text/html');
            if ('cacheControl' in options) {
                if (typeof options.cacheControl !== 'boolean') {
                    throw new TypeError(`The "cacheControl" option in response.render expected a boolean value but instead got ${typeof options.cacheControl}`);
                }
                if (options.cacheControl === true) {
                    const ONEYEAR = 31_536_000_000; // in ms
                    let maxAge = 0;
                    let immutable = false;
                    if (!('maxAge' in options)) {
                        throw new SyntaxError('The sendFile cache-control was enabled without providing the maxAge');
                    }
                    if (!(typeof options.maxAge === 'number' || typeof options.maxAge === 'string')) {
                        throw new TypeError(`The maxAge property should be either a number or string, but instead got ${typeof options.maxAge}`);
                    }
                    if (typeof options.maxAge === 'number') {
                        maxAge = options.maxAge;
                    }
                    if (typeof options.maxAge === 'string') {
                        if (options.maxAge.length === 0) {
                            throw new SyntaxError(`The maxAge string value cannot be empty`);
                        }
                        const value = (0, ms_1.default)(options.maxAge);
                        if (typeof value !== 'number') {
                            throw new SyntaxError(`${options.maxAge} is not a valid maxAge value`);
                        }
                        maxAge = value;
                    }
                    if (options.maxAge < 0) {
                        throw new RangeError(`The maxAge cannot be a negative value`);
                    }
                    if ((options.maxAge) > ONEYEAR) {
                        throw new RangeError(`The maxAge value should not be more than one year`);
                    }
                    if ('immutable' in options) {
                        if (typeof options.immutable !== 'boolean') {
                            throw new TypeError(`The immutable property only accepts boolean values, but instead got ${typeof options.immutable}`);
                        }
                        immutable = true;
                    }
                    const expiryDate = new Date(Date.now() + maxAge).toUTCString();
                    this.setHeader('Cache-Control', `public, max-age=${maxAge}${immutable ? ', immutable' : ''}`);
                    this.setHeader('Expires', expiryDate);
                }
                else {
                    this.setHeader('Cache-Control', 'no-cache');
                }
            }
            else {
                this.setHeader('Cache-Control', 'no-cache');
            }
            if ('statusCode' in options) {
                if (typeof options.statusCode !== 'number') {
                    throw new TypeError(`The "statusCode" option in response.render expected a number value but instead got ${typeof options.statusCode}`);
                }
                this.status(options.statusCode);
            }
            if ('eTag' in options && options.eTag) {
                if (typeof options.eTag !== 'string') {
                    throw new TypeError(`The "eTag" option in response.render expected a string value but got ${typeof options.eTag}`);
                }
                this.setHeader('etag', options.eTag);
            }
            this.write({ chunk: html, encoding: 'utf-8' });
            return this.end();
        }
        catch (error) {
            if (typeof error === 'string') {
                error = `Unable to render page: ${error}`;
            }
            if (error instanceof Error) {
                error.message = `Unable to render page: ${error.message}`;
            }
            throw error;
        }
    }
    /**
     * Download a file using the `response.sendFile` method.
     * @param {string} filePath The file path (relative/absolute). When providing a relative path, you must specify the `root` in the `options` argument
     * @param {DownloadFileOptions} options Options for sending the file
     * @returns {http2.Http2ServerResponse|undefined}
     */
    downloadFile(filePath, options) {
        const sendOptions = helpers_1.default.is.realObject(options) ? { ...options, download: true } : { download: true };
        return this.sendFile(filePath, sendOptions);
    }
    /**
     * Send a file back to the client
     * @param {string} filePath The file path (relative/absolute). When providing a relative path, you must specify the `root` in the `options` argument
     * @param {SendFileOptions} [options] Options for sending the file
     * @returns {http2.Http2ServerResponse|undefined}
     */
    sendFile(filePath, options) {
        const root = process.cwd();
        try {
            // Basic filePath validations
            if (typeof filePath !== 'string') {
                throw new TypeError(`The sendFile expected a file path to be passed as its first argument, but instead got ${typeof filePath}`);
            }
            if (filePath.length === 0) {
                throw new SyntaxError('The file path cannot be an empty string');
            }
            // Validating the root path if provided
            if (options && 'root' in options) {
                if (typeof options.root !== 'string') {
                    throw new TypeError(`The root path of the file should be of type string, but instead got ${typeof options.root}`);
                }
                if (options.root.length === 0) {
                    throw new SyntaxError(`The root path cannot be an empty string`);
                }
                const rootAvail = helpers_1.default.checkPathAccessibility(options.root);
                if (!rootAvail.valid) {
                    if (rootAvail.errors.exist) {
                        throw `The provided root path (${options.root}) doesn't exist`;
                    }
                    if (rootAvail.errors.accessible) {
                        throw `You don't have enough permissions to access the root path: ${options.root}`;
                    }
                }
                filePath = path_1.default.resolve(options.root, filePath);
                if (!filePath.startsWith(options.root)) {
                    throw new RangeError(`When providing a relative filePath, the relative path must not escape the provided root directory`);
                }
            }
            // Validating the file path
            const fileAvail = helpers_1.default.checkPathAccessibility(filePath);
            if (!fileAvail.valid) {
                if (fileAvail.errors.exist) {
                    throw `The provided filePath (${filePath}) doesn't exist`;
                }
                if (fileAvail.errors.accessible) {
                    throw `You don't have enough permissions to access the file path: ${filePath}`;
                }
            }
            const paths = filePath.split('\\');
            const fileName = paths[paths.length - 1];
            // Handling dotFiles
            if (fileName.startsWith('.')) {
                if (options && 'dotfiles' in options) {
                    const allowed = ['allow', 'deny', 'ignore'];
                    if (!allowed.includes(options.dotfiles || '')) {
                        throw new TypeError(`The dotfiles property was provided with an unsupported value. Only "allow", "deny", and "ignore" are supported`);
                    }
                    const choice = options.dotfiles;
                    if (choice === 'ignore') {
                        if ('notFoundFile' in options) {
                            const notFoundAvail = helpers_1.default.checkPathAccessibility(options.notFoundFile);
                            if (!notFoundAvail.valid) {
                                if (notFoundAvail.errors.isString) {
                                    throw `The notFoundFile path should be a string, instead got ${typeof options.notFoundFile}`;
                                }
                                if (notFoundAvail.errors.exist) {
                                    throw `The notFoundFile path (${options.notFoundFile}) doesn't exist`;
                                }
                                if (notFoundAvail.errors.accessible) {
                                    throw `You don't have enough permissions to access the notFoundFile path: ${options.notFoundFile}`;
                                }
                            }
                            if (!options.notFoundFile?.toLowerCase().startsWith(root.toLowerCase())) {
                                throw new RangeError(`The not 404 file (${options.notFoundFile}) is not in your root directory.`);
                            }
                            this.setHeader('Content-Type', 'text/html');
                            this.write({ chunk: fs_1.default.readFileSync(options.notFoundFile) });
                            this.end();
                            return;
                        }
                        else {
                            this.status(404).json({ message: 'File not found', code: 404 });
                            return;
                        }
                    }
                    if (choice === 'deny') {
                        if ('unauthorizedFile' in options) {
                            const unAuthAvail = helpers_1.default.checkPathAccessibility(options.unauthorizedFile);
                            if (!unAuthAvail.valid) {
                                if (unAuthAvail.errors.isString) {
                                    throw `The unauthorizedFile path should be a string, instead got ${typeof options.unauthorizedFile}`;
                                }
                                if (unAuthAvail.errors.exist) {
                                    throw `The unauthorizedFile path (${options.unauthorizedFile}) doesn't exist`;
                                }
                                if (unAuthAvail.errors.accessible) {
                                    throw `You don't have enough permissions to access the unauthorizedFile path: ${options.unauthorizedFile}`;
                                }
                            }
                            if (!options.unauthorizedFile?.toLowerCase().startsWith(root.toLowerCase())) {
                                throw new RangeError(`The not 401 file (${options.unauthorizedFile}) is not in your root directory.`);
                            }
                            this.setHeader('Content-Type', 'text/html');
                            this.write({ chunk: fs_1.default.readFileSync(options.unauthorizedFile) });
                            this.end();
                            return;
                        }
                        else {
                            this.status(401).json({ message: 'Unauthorized', code: 401 });
                            return;
                        }
                    }
                }
            }
            // Validate the modification property (if provided)
            if (options && 'lastModified' in options) {
                if (typeof options.lastModified !== 'boolean') {
                    throw new TypeError(`The lastModified option can only be a boolean type, but instead got ${typeof options.lastModified}`);
                }
            }
            // Get the file stats
            const stats = fs_1.default.statSync(filePath);
            // Set the modification time
            if (!options || options?.lastModified !== false) {
                this.setHeader('Last-Modified', stats.mtime.toUTCString());
            }
            // Checking the cache-control
            if (options && 'cacheControl' in options) {
                if (typeof options.cacheControl !== 'boolean') {
                    throw new TypeError(`The cacheControl option can only be a boolean type, but instead got ${typeof options.cacheControl}`);
                }
                if (options.cacheControl) {
                    const ONEYEAR = 31_536_000_000; // in ms
                    let maxAge = 0;
                    let immutable = false;
                    if (!('maxAge' in options)) {
                        throw new SyntaxError('The sendFile cache-control was enabled without providing the maxAge');
                    }
                    if (!(typeof options.maxAge === 'number' || typeof options.maxAge === 'string')) {
                        throw new TypeError(`The maxAge property should be either a number or string, but instead got ${typeof options.maxAge}`);
                    }
                    if (typeof options.maxAge === 'number') {
                        maxAge = options.maxAge;
                    }
                    if (typeof options.maxAge === 'string') {
                        if (options.maxAge.length === 0) {
                            throw new SyntaxError(`The maxAge string value cannot be empty`);
                        }
                        const value = (0, ms_1.default)(options.maxAge);
                        if (typeof value !== 'number') {
                            throw new SyntaxError(`${options.maxAge} is not a valid maxAge value`);
                        }
                        maxAge = value;
                    }
                    if (options.maxAge < 0) {
                        throw new RangeError(`The maxAge cannot be a negative value`);
                    }
                    if (options.maxAge > ONEYEAR) {
                        throw new RangeError(`The maxAge value should not be more than one year`);
                    }
                    if ('immutable' in options) {
                        if (typeof options.immutable !== 'boolean') {
                            throw new TypeError(`The immutable property only accepts boolean values, but instead got ${typeof options.immutable}`);
                        }
                        immutable = true;
                    }
                    const expiryDate = new Date(Date.now() + maxAge).toUTCString();
                    this.setHeader('Cache-Control', `public, max-age=${maxAge}${immutable ? ', immutable' : ''}`);
                    this.setHeader('Expires', expiryDate);
                }
            }
            // Applying the headers
            if (options && 'headers' in options) {
                const headers = Object.keys(options.headers || {});
                if (typeof options.headers === 'object' && headers.length > 0) {
                    const preserved = [...this.#_preservedHeaders, 'last-modified', 'cache-control', 'expires'];
                    const headersUsed = [...preserved];
                    for (const headerInput of headers) {
                        const headerName = headerInput.toLowerCase();
                        if (!headersUsed.includes(headerName)) {
                            headersUsed.push(headerName);
                            this.setHeader(headerName, options.headers[headerInput]);
                        }
                    }
                }
            }
            if ('eTag' in options && options.eTag) {
                if (typeof options.eTag !== 'string') {
                    throw new TypeError(`The "eTag" option in response.sendFile expected a string value but got ${typeof options.eTag}`);
                }
                this.setHeader('etag', options.eTag);
            }
            // Preparing the mime-type
            const exts = fileName.split('.').filter(i => i.length > 0);
            const extension = `.${exts[exts.length - 1]}`;
            const mime = extensions.find(i => i.extension === extension)?.mime;
            // Check if the download option is triggered or not
            if (options && 'download' in options) {
                if (typeof options.download !== 'boolean') {
                    throw new TypeError(`The download property should be a boolean value, but instead got ${typeof options.download}`);
                }
                this.setHeader('Content-Type', 'application/octet-stream');
                this.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            }
            else {
                this.setHeader('Content-Type', mime);
            }
            // Checking the range settings
            if (options && 'acceptRanges' in options) {
                if (typeof options.acceptRanges !== 'boolean') {
                    throw new TypeError(`The acceptRanges option only accepts boolean values, but instead got ${typeof options.acceptRanges}`);
                }
                const range = this.req.headers.range;
                // Check if the request has ranges
                if (range) {
                    // Function to parse the Range header
                    const parseRangeHeader = (range, size) => {
                        const [start, end] = range.replace(/bytes=/, '').split('-');
                        const parsedStart = parseInt(start, 10);
                        const parsedEnd = parseInt(end, 10);
                        const validStart = isNaN(parsedStart) ? 0 : Math.max(0, parsedStart);
                        const validEnd = isNaN(parsedEnd) ? size - 1 : Math.min(size - 1, parsedEnd);
                        return [validStart, validEnd];
                    };
                    const totalSize = stats.size;
                    const [start, end] = parseRangeHeader(range, totalSize);
                    const chunkSize = (end - start) + 1;
                    this.status(206);
                    this.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
                    this.setHeader('Accept-Ranges', 'bytes');
                    this.setHeader('Content-Length', chunkSize);
                    const fileStream = fs_1.default.createReadStream(filePath, { start, end });
                    return fileStream.pipe(this.#_res);
                }
            }
            this.status(200).setHeader('Content-Length', stats.size);
            const fileStream = fs_1.default.createReadStream(filePath);
            return fileStream.pipe(this.#_res);
        }
        catch (error) {
            if (options && 'serverErrorFile' in options) {
                const errValidity = helpers_1.default.checkPathAccessibility(options.serverErrorFile);
                if (!errValidity.valid) {
                    if (errValidity.errors.isString) {
                        throw `The serverErrorFile path should be a string, instead got ${typeof options.serverErrorFile}`;
                    }
                    if (errValidity.errors.exist) {
                        throw `The serverErrorFile path (${options.serverErrorFile}) doesn't exist`;
                    }
                    if (errValidity.errors.accessible) {
                        throw `You don't have enough permissions to access the errValidity path: ${options.serverErrorFile}`;
                    }
                }
                if (!options.serverErrorFile?.toLowerCase().startsWith(root.toLowerCase())) {
                    throw new RangeError(`The not 500 file (${options.serverErrorFile}) is not in your root directory.`);
                }
                this.setHeader('Content-Type', 'text/html');
                this.write({ chunk: fs_1.default.readFileSync(options.serverErrorFile) });
                console.error(error);
                this.status(500).end();
                return;
            }
            if (error instanceof Error) {
                error.message = `Unable to send file: ${error.message}`;
            }
            throw error;
        }
    }
    /**
     * Send a response.
     *
     * Examples:
     * @example
     * // Send buffer
     * response.send(Buffer.from('wahoo'));
     * // Send JSON
     * response.send({ some: 'json' });
     * //Send HTML content
     * response.send('<p>some html</p>');
     * // Sending plain text
     * response.status(404).send('Sorry, cant find that');
     * // Sending a file
     * const fs = require('fs');
     * response.status(200).send(fs.readFileSync('./style.css', { encoding: 'utf8' }), 'text/css');
     * @param {string|object|Buffer} data The data to be sent
     * @param {MimeType} [contentType] Specify  the type of content
     */
    send(data, contentType) {
        let type = null;
        if (typeof data === 'string') {
            if (typeof contentType === 'string' && mimes_json_1.default.includes(contentType.toLowerCase())) {
                type = contentType;
            }
            else if (helpers_1.default.isHTML(data)) {
                type = 'text/html';
            }
            else {
                type = 'text/plain';
            }
        }
        else if (Buffer.isBuffer(data)) {
            if (typeof contentType === 'string' && mimes_json_1.default.includes(contentType.toLowerCase())) {
                type = contentType;
            }
            else {
                type = 'application/octet-stream';
            }
        }
        else if (Array.isArray(data) || (typeof data === 'object' && data !== null)) {
            data = JSON.stringify(data);
            if (typeof contentType === 'string' && mimes_json_1.default.includes(contentType.toLowerCase())) {
                type = contentType;
            }
            else {
                type = 'application/json';
            }
        }
        else {
            throw new TypeError(`${typeof data} is not a valid data type. Expected an Object, String, or Buffer, but instead got ${typeof data}`);
        }
        this.setHeader('Content-Type', type);
        this.write({ chunk: data });
        return this.end();
    }
    /**
     * Send JSON response.
     * *Examples:*
     * @example
     * response.json(null);
     * response.json({ user: 'tj' });
     * response.status(500).json('oh noes!');
     * response.status(404).json('I dont have that');
     * @param {object|Array} data
     */
    json(data) {
        if (!(Array.isArray(data) || (typeof data === 'object' && data !== null))) {
            throw new TypeError("Invalid input. Expected either an object or an array.");
        }
        this.setHeader('Content-Type', 'application/json');
        this.write({ chunk: JSON.stringify(data) });
        return this.end();
    }
    /**
     * When using implicit headers (not calling `response.writeHead()` explicitly),
     * this method controls the status code that will be sent to the client when
     * the headers get flushed.
     *
     * ```js
     * response.status(404);
     * ```
     * @param {number} statusCode The status code of the request
     * @returns {this}
     */
    status(statusCode) {
        try {
            this.statusCode = statusCode;
        }
        catch (error) {
            throw error;
        }
        return this;
    }
    /**
     * Add an event handler
     * @param {EventConfig} config
     */
    addListener(config) {
        const events = ['close', 'drain', 'error', 'finish', 'pipe', 'unpipe'];
        if (events.includes(config?.event)) {
            throw `${config.event} is not a valid response event`;
        }
        if (typeof config?.listener !== 'function') {
            throw 'The event listener must be a function';
        }
        this.#_res.addListener(config.event, config.listener);
        return this;
    }
    /**
     * Returns a copy of the array of listeners for the event named eventName.
     *
     * ```js
     * server.on('connection', (stream) => {
     *      console.log('someone connected!');
     * });
     *
     * console.log(util.inspect(server.listeners('connection')));
     * // Prints: [ [Function] ]
     * ```
     * @param {string|symbol} eventName The event name
     */
    listeners(eventName) {
        return this.#_res.listeners(eventName);
    }
    /**
     * This method adds HTTP trailing headers (a header but at the end of the message) to the response.
     *
     * Attempting to set a header field name or value that contains invalid characters will result in a ```TypeError``` being thrown.
     * @param {http2.OutgoingHttpHeaders} trailers
     */
    addTrailers(trailers) {
        this.#_res.addTrailers(trailers);
    }
    /**
     * This method signals to the server that all of
     * the response headers and body have been sent;
     * that server should consider this message complete.
     * The method, ```response.end()```, MUST be called on each response.
     *
     * If data is specified, it is equivalent to calling
     * ```response.write(data, encoding)``` followed by ```response.end(callback)```.
     *
     * If ```callback``` is specified, it will be called when the response stream is finished.
     * @param {ResponseEndOptions} [options] End stream options
     * @returns {this}
     */
    end(options) {
        if (helpers_1.default.is.undefined(options) || !helpers_1.default.is.realObject(options)) {
            this.#_res.end();
            return this;
        }
        const params = {
            data: options && 'data' in options && options.data ? options.data : null,
            callback: options && 'callback' in options && typeof options.callback === 'function' ? options.callback : null,
            encoding: options && 'encoding' in options && typeof options.encoding === 'string' && this.#_encodings.includes(options.encoding) ? options.encoding : null
        };
        if (params.data) {
            if (params.encoding && params.callback) {
                this.#_res.end(params.data, params.encoding, params.callback);
            }
            else if (params.callback) {
                this.#_res.end(params.data, params.callback);
            }
            else {
                this.#_res.end(params.data);
            }
        }
        else if (params.callback) {
            this.#_res.end(params.callback);
        }
        else {
            this.#_res.end();
        }
        return this;
    }
    /**
     * Reads out a header that has already been queued but not sent to the client. The name is case-insensitive.
     *
     * ```js
     * const contentType = response.getHeader('content-type');
     * ```
     * @param {string} name The header name
     * @returns {string} The header value
     */
    getHeader(name) {
        return this.#_res.getHeader(name);
    }
    /**
     * Returns an array containing the unique names of the current outgoing headers. All header names are lowercase.
     *
     * ```js
     *  response.setHeader('Foo', 'bar');
     *  response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);
     *
     *  const headerNames = response.getHeaderNames();
     *  // headerNames === ['foo', 'set-cookie']
     * ```
     * @returns {string[]} The names of the provided headers
     */
    getHeaderNames() {
        return this.#_res.getHeaderNames();
    }
    /**
     * Returns a shallow copy of the current outgoing headers.
     * Since a shallow copy is used, array values may be mutated
     * without additional calls to various header-related http
     * module methods. The keys of the returned object are the
     * header names and the values are the respective header values.
     * All header names are lowercase.
     *
     * The object returned by the ```response.getHeaders()``` method *does
     * not* prototypically inherit from the JavaScript ```Object```. This means
     * that typicalObject methods such as ```obj.toString()```, ```obj.hasOwnProperty()```,
     * and others are not defined and *will not work*.
     * @returns {http2.OutgoingHttpHeaders}
     */
    getHeaders() {
        return this.#_res.getHeaders();
    }
    /**
     * Returns ```true``` if the header identified by name is currently
     * set in the outgoing headers. The header ```name``` matching is case-insensitive.
     *
     * ```js
     * const hasContentType = response.hasHeader('content-type');
     * ```
     * @param {string} name The name of the header
     * @returns {boolean}
     */
    hasHeader(name) {
        return this.#_res.hasHeader(name);
    }
    /**
     * Returns the number of listeners listening for the event named ```eventName```.
     * If ```listener``` is provided, it will return how many times the listener is
     * found in the list of the listeners of the event.
     * @param {string|symbol} eventName The name of the event being listened for
     * @param {function} [listener] The event handler function
     * @returns {number}
     */
    listenerCount(eventName, listener) {
        return this.#_res.listenerCount(eventName, listener);
    }
    /**
     * Alias for ```emitter.removeListener()```.
     * @param {string|symbol} eventName he name of the event being listened for
     * @param {EventCallback} listener The event handler function
     * @returns {this}
     */
    off(eventName, listener) {
        this.#_res.off(eventName, listener);
        return this;
    }
    /**
     * Adds the ```listener``` function to the end of the listeners array
     * for the event named ```event```. No checks are made to see if
     * the ```listener``` has already been added. Multiple calls passing
     * the same combination of ```event``` and ```listener``` will result in
     * the ```listener``` being added, and called, multiple times.
     *
     * ```js
     * server.on({ event: 'connection', listener: (stream) => {
     *      console.log('someone connected!');
     * }});
     * ```
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     *
     * By default, event listeners are invoked in the order they are added.
     * The ```emitter.prependListener()``` method can be used as an alternative to
     * add the event listener to the beginning of the listeners array.
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * const myEE = new EventEmitter();
     * myEE.on('foo', () => console.log('a'));
     * myEE.prependListener('foo', () => console.log('b'));
     * myEE.emit('foo');
     * // Prints:
     * //   b
     * //   a
     * ```
     * @param {EventConfig} config
     * @returns {this}
     */
    on(config) {
        const events = ['close', 'drain', 'error', 'finish', 'pipe', 'unpipe'];
        if (events.includes(config?.event)) {
            throw `${config.event} is not a valid response event`;
        }
        if (typeof config?.listener !== 'function') {
            throw 'The event listener must be a function';
        }
        this.#_res.on(config.event, config.listener);
        return this;
    }
    /**
     * Adds a **one-time** ```listener``` function for the event named ```eventName```.
     * The next time ```eventName``` is triggered, this ```listener``` is removed and then invoked.
     *
     * ```js
     * server.once({event: 'connection', listener: (stream) => {
     *      console.log('Ah, we have our first user!');
     * }});
     * ```
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     * @param {EventConfig} config
     * @returns {this}
     */
    once(config) {
        const events = ['close', 'drain', 'error', 'finish', 'pipe', 'unpipe'];
        if (events.includes(config?.event)) {
            throw `${config.event} is not a valid response event`;
        }
        if (typeof config?.listener !== 'function') {
            throw 'The event listener must be a function';
        }
        this.#_res.once(config.event, config.listener);
        return this;
    }
    /**
     *
     * @param {stream.Writable} destination
     * @param {object} [options]
     * @param {boolean} [options.end]
     * @returns {stream.Writable}
     */
    pipe(destination, options) {
        return this.#_res.pipe(destination, { end: options?.end });
    }
    /**
     * Removes all listeners, or those of the specified ```eventName```.
     *
     * It is bad practice to remove listeners added elsewhere in the code,
     * particularly when the ```EventEmitter``` instance was created by some other
     * component or module (e.g. sockets or file streams).
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     * @param {EventType} [event] The event to remove all of its listeners, or nothing to remove all listeners from all events
     * @returns {this}
     */
    removeAllListeners(event) {
        if (typeof event === 'string') {
            const events = ['close', 'drain', 'error', 'finish', 'pipe', 'unpipe'];
            if (events.includes(event)) {
                throw `${event} is not a valid response event`;
            }
        }
        this.#_res.removeAllListeners(event);
        return this;
    }
    /**
     * Removes the specified ```listener``` from the listener array for the event named ```eventName```.
     *
     * ```js
     * const callback = (stream) => {
     *      console.log('someone connected!');
     * };
     * server.on('connection', callback);
     * // ...
     * server.removeListener('connection', callback);
     * ```
     *
     * ```removeListener()``` will remove, at most, one instance of a listener from
     * the listener array. If any single listener has been added multiple times to
     * the listener array for the specified ```eventName```, then ```removeListener()``` must be
     * called multiple times to remove each instance.
     *
     * Once an event is emitted, all listeners attached to it at the time of emitting
     * are called in order. This implies that any ```removeListener()``` or ```removeAllListeners()```
     * calls after emitting and before the last listener finishes execution will not
     * remove them from ```emit()``` in progress. Subsequent events behave as expected.
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * class MyEmitter extends EventEmitter {}
     * const myEmitter = new MyEmitter();

     * const callbackA = () => {
     *      console.log('A');
     *      myEmitter.removeListener('event', callbackB);
     * };
     *
     * const callbackB = () => {
     *      console.log('B');
     * };
     *
     * myEmitter.on('event', callbackA);
     * myEmitter.on('event', callbackB);
     *
     * // callbackA removes listener callbackB but it will still be called.
     * // Internal listener array at time of emit [callbackA, callbackB]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * //   B
     *
     * // callbackB is now removed.
     * // Internal listener array [callbackA]
     * myEmitter.emit('event');
     * // Prints:
     * //   A
     * ```
     *
     * Because listeners are managed using an internal array, calling this will
     * change the position indices of any listener registered after the listener
     * being removed. This will not impact the order in which listeners are called,
     * but it means that any copies of the listener array as returned by the
     * ```emitter.listeners()``` method will need to be recreated.
     *
     * When a single function has been added as a handler multiple times for a single
     * event (as in the example below), ```removeListener()``` will remove the most
     * recently added instance. In the example the ```once('ping')``` listener is removed:
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * const ee = new EventEmitter();
     *
     * function pong() {
     *      console.log('pong');
     * }
     *
     * ee.on('ping', pong);
     * ee.once('ping', pong);
     * ee.removeListener('ping', pong);
     *
     * ee.emit('ping');
     * ee.emit('ping');
     * ```
     *
     * Returns a reference to the ```EventEmitter```, so that calls can be chained.
     * @param {EventConfig} config
     * @returns {this}
     */
    removeListener(config) {
        const events = ['close', 'drain', 'error', 'finish', 'pipe', 'unpipe'];
        if (events.includes(config?.event)) {
            throw `${config.event} is not a valid response event`;
        }
        if (typeof config?.listener !== 'function') {
            throw 'The event listener must be a function';
        }
        this.#_res.removeListener(config.event, config.listener);
        return this;
    }
    /**
     * Removes a header that has been queued for implicit sending.
     *
     * ```js
     * response.removeHeader('Content-Encoding');
     * ```
     * @param {string} name The name of the header to be removed
     * @returns {void}
     */
    removeHeader(name) {
        this.#_res.removeHeader(name);
    }
    /**
     * The ```writable.setDefaultEncoding()``` method sets the default ```encoding``` for a ```Writable``` stream.
     * @param {BufferEncoding} encoding The new default encoding
     * @returns {this}
     */
    setDefaultEncoding(encoding) {
        if (!this.#_encodings.includes(encoding)) {
            throw `${encoding} is not a valid buffer encoding`;
        }
        this.#_res.setDefaultEncoding(encoding);
        return this;
    }
    /**
     * Sets a single header value for implicit headers. If this
     * header already exists in the to-be-sent headers, its value
     * will be replaced. Use an array of strings here to send
     * multiple headers with the same name.
     *
     * ```js
     * response.setHeader('Content-Type', 'text/html; charset=utf-8');
     * ```
     * or
     * ```js
     * response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
     * ```
     *
     * Attempting to set a header field name or value that contains invalid characters will result in a ```TypeError``` being thrown.
     *
     * When headers have been set with ```response.setHeader()```, they will
     * be merged with any headers passed to ```response.writeHead()```, with
     * the headers passed to ```response.writeHead()``` given precedence.
     *
     * ```js
     * const hypercloud = require('nasriya-hypercloud');
     * // Returns content-type = text/plain
     * const server = hypercloud.Server();
     *
     * server.on('request)
     *
     * ((req, res) => {
     *      res.setHeader('Content-Type', 'text/html; charset=utf-8');
     *      res.setHeader('X-Foo', 'bar');
     *      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
     *      res.end('ok');
     * });
     * ```
     * @param {string} name The header name
     * @param {string | number | readonly string[]} value The header value
     * @returns {this}
     */
    setHeader(name, value) {
        if (typeof name === 'string') {
            if (name.length === 0) {
                throw `${name} is not a valid header name`;
            }
        }
        if (!(typeof value === 'string' || typeof value === 'number' || Array.isArray(value))) {
            throw `The setHeader method expected either a string, number, or an array of strings, but instead got ${typeof value}`;
        }
        if (Array.isArray(value)) {
            const validItems = value.filter(i => typeof i === 'string');
            if (validItems.length < value.length) {
                throw `${value.toString()}`;
            }
        }
        if (name?.toLowerCase() === 'X-Server'.toLowerCase()) {
            return this;
        }
        this.#_res.setHeader(name, value);
        return this;
    }
    /**
     * By default `EventEmitter`s will print a warning if more than `10` listeners are
     * added for a particular event. This is a useful default that helps finding
     * memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
     * modified for this specific `EventEmitter` instance. The value can be set to`Infinity` (or `0`) to indicate an unlimited number of listeners.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     * @param {number} n The maximum number of listeners
     * @returns {this}
     */
    setMaxListeners(n) {
        if (typeof n !== 'number') {
            throw `The setMaxListeners expects a number, but instead got ${typeof n}`;
        }
        this.#_res.setMaxListeners(n);
        return this;
    }
    /**
     * Sets the `Http2Stream`'s timeout value to `msecs`. If a callback is
     * provided, then it is added as a listener on the `'timeout'` event on
     * the response object.
     *
     * If no `'timeout'` listener is added to the request, the response, or
     * the server, then `Http2Stream` s are destroyed when they time out. If a
     * handler is assigned to the request, the response, or the server's `'timeout'`events, timed out sockets must be handled explicitly.
     * @param {number} msecs The number of milliseconds
     * @param {() => {}} [callback] An optional callback function to run when the time is over.
     * @returns {void}
     */
    setTimeout(msecs, callback) {
        if (typeof msecs !== 'number') {
            throw `The setTimeout method expects a number of milliseconds, but instead got ${typeof Number}`;
        }
        if (msecs < 0) {
            throw `The setTimeout method expects a number of milliseconds. You know, time cannot be negative, so ${msecs} is invalid`;
        }
        if (callback !== undefined) {
            if (typeof callback !== 'function') {
                throw `The setTimeout method's callback can only be a function`;
            }
        }
        this.#_res.setTimeout(msecs, typeof callback === 'function' ? callback : undefined);
    }
    /**
     * The `writable.cork()` method forces all written data to be buffered in memory.
     * The buffered data will be flushed when either the {@link uncork} or {@link end} methods are called.
     *
     * The primary intent of `writable.cork()` is to accommodate a situation in which
     * several small chunks are written to the stream in rapid succession. Instead of
     * immediately forwarding them to the underlying destination, `writable.cork()`buffers all the chunks until `writable.uncork()` is called, which will pass them
     * all to `writable._writev()`, if present. This prevents a head-of-line blocking
     * situation where data is being buffered while waiting for the first small chunk
     * to be processed. However, use of `writable.cork()` without implementing`writable._writev()` may have an adverse effect on throughput.
     *
     * See also: `writable.uncork()`, `writable._writev()`.
     * @returns {void}
     */
    cork() { this.#_res.cork(); }
    /**
     * The `writable.uncork()` method flushes all data buffered since {@link cork} was called.
     *
     * When using `writable.cork()` and `writable.uncork()` to manage the buffering
     * of writes to a stream, defer calls to `writable.uncork()` using`process.nextTick()`. Doing so allows batching of all`writable.write()` calls that occur within a given Node.js event
     * loop phase.
     *
     * ```js
     * stream.cork();
     * stream.write('some ');
     * stream.write('data ');
     * process.nextTick(() => stream.uncork());
     * ```
     *
     * If the `writable.cork()` method is called multiple times on a stream, the
     * same number of calls to `writable.uncork()` must be called to flush the buffered
     * data.
     *
     * ```js
     * stream.cork();
     * stream.write('some ');
     * stream.cork();
     * stream.write('data ');
     * process.nextTick(() => {
     *   stream.uncork();
     *   // The data will not be flushed until uncork() is called a second time.
     *   stream.uncork();
     * });
     * ```
     *
     * See also: `writable.cork()`.
     * @returns {void}
     */
    uncork() { this.#_res.uncork(); }
    /**
     * If this method is called and `response.writeHead()` has not been called,
     * it will switch to implicit header mode and flush the implicit headers.
     *
     * This sends a chunk of the response body. This method may
     * be called multiple times to provide successive parts of the body.
     *
     * In the `node:http` module, the response body is omitted when the
     * request is a HEAD request. Similarly, the `204` and `304` responses _must not_ include a message body.
     *
     * `chunk` can be a string or a buffer. If `chunk` is a string,
     * the second parameter specifies how to encode it into a byte stream.
     * By default the `encoding` is `'utf8'`. `callback` will be called when this chunk
     * of data is flushed.
     *
     * This is the raw HTTP body and has nothing to do with higher-level multi-part
     * body encodings that may be used.
     *
     * The first time `response.write()` is called, it will send the buffered
     * header information and the first chunk of the body to the client. The second
     * time `response.write()` is called, Node.js assumes data will be streamed,
     * and sends the new data separately. That is, the response is buffered up to the
     * first chunk of the body.
     *
     * Returns `true` if the entire data was flushed successfully to the kernel
     * buffer. Returns `false` if all or part of the data was queued in user memory.`'drain'` will be emitted when the buffer is free again.
     * @param {WriteOptions} options The `write` options
     * @returns {boolean}
     */
    write(options) {
        const params = {
            chunk: null,
            callback: null,
            encoding: null
        };
        // Validating and assigning valid argument
        if (!options || typeof options !== 'object') {
            throw new TypeError('The "write" method expects an "options" object.');
        }
        if ('chunk' in options && (typeof options.chunk === 'string' || options.chunk instanceof Uint8Array)) {
            params.chunk = options.chunk;
            if ('encoding' in options) {
                if (typeof options.encoding === 'string' && this.#_encodings.includes(options.encoding)) {
                    params.encoding = options.encoding;
                }
                else {
                    throw new TypeError(`${options.encoding} is not a supported buffer encoding.`);
                }
            }
            if ('callback' in options) {
                if (typeof options.callback === 'function') {
                    params.callback = options.callback;
                }
                else {
                    throw new TypeError('The "write" callback should be a function.');
                }
            }
        }
        else {
            throw new TypeError('The "write" method expected a "chunk" value of type string or Unit8Array.');
        }
        if (params.encoding && params.callback) {
            return this.#_res.write(params.chunk, params.encoding, params.callback);
        }
        else if (params.callback) {
            return this.#_res.write(params.chunk, params.callback);
        }
        else {
            return this.#_res.write(params.chunk);
        }
    }
    /**
     * Sends a status `100 Continue` to the client, indicating that
     * the request body should be sent. See the `'checkContinue'`
     * event on `Http2Server` and `Http2SecureServer`.
     * @returns {void}
     */
    writeContinue() { this.#_res.writeContinue(); }
    /**
     * Sends a status `103 Early` Hints to the client with a Link header,
     * indicating that the user agent can preload/preconnect the linked
     * resources. The `hints` is an object containing the values of
     * headers to be sent with early hints message.
     * @example
     * **Example**
     * ```js
     * const earlyHintsLink = '</styles.css>; rel=preload; as=style';
     * response.writeEarlyHints({
     *   'link': earlyHintsLink,
     * });
     *
     * const earlyHintsLinks = [
     *   '</styles.css>; rel=preload; as=style',
     *   '</scripts.js>; rel=preload; as=script',
     * ];
     * response.writeEarlyHints({
     *   'link': earlyHintsLinks,
     * });
     * ```
     * @param {Record<string, string | string[]>} hints
     * @returns {void}
     */
    writeEarlyHints(hints) { this.#_res.writeEarlyHints(hints); }
    /**
     * Sends a response header to the request. The status code is a 3-digit HTTP
     * status code, like `404`. The last argument, `headers`, are the response headers.
     *
     * Returns a reference to the `Http2ServerResponse`, so that calls can be chained.
     *
     * For compatibility with `HTTP/1`, a human-readable `statusMessage` may be
     * passed as the second argument. However, because the `statusMessage` has no
     * meaning within HTTP/2, the argument will have no effect and a process warning
     * will be emitted.
     *
     * ```js
     * const body = 'hello world';
     * response.writeHead(200, {
     *   'Content-Length': Buffer.byteLength(body),
     *   'Content-Type': 'text/plain; charset=utf-8',
     * });
     * ```
     *
     * `Content-Length` is given in bytes not characters. The`Buffer.byteLength()` API may be used to determine the number of bytes in a
     * given encoding. On outbound messages, Node.js does not check if Content-Length
     * and the length of the body being transmitted are equal or not. However, when
     * receiving messages, Node.js will automatically reject messages when the`Content-Length` does not match the actual payload size.
     *
     * This method may be called at most one time on a message before `response.end()` is called.
     *
     * If `response.write()` or `response.end()` are called before calling
     * this, the implicit/mutable headers will be calculated and call this function.
     *
     * When headers have been set with `response.setHeader()`, they will be merged
     * with any headers passed to `response.writeHead()`, with the headers passed
     * to `response.writeHead()` given precedence.
     *
     * ```js
     * // Returns content-type = text/plain
     * const server = http2.createServer((req, res) => {
     *   res.setHeader('Content-Type', 'text/html; charset=utf-8');
     *   res.setHeader('X-Foo', 'bar');
     *   res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
     *   res.end('ok');
     * });
     * ```
     *
     * Attempting to set a header field name or value that contains invalid characters
     * will result in a `TypeError` being thrown.
     * @param {number} statusCode The response status code. Example `200` for `ok`
     * @param {http2.OutgoingHttpHeaders} [headers] The headers you want to send;
     * @returns {this}
     */
    writeHead(statusCode, headers) {
        try {
            if (typeof statusCode !== 'number') {
                throw new TypeError('The "writeHead" method expects status code number');
            }
            if (statusCode < 100 || statusCode > 511) {
                throw `${statusCode} is not a valid status code. The range is 100-511`;
            }
            let headersNum = 0;
            if (headers) {
                if (typeof headers !== 'object') {
                    throw new TypeError(`The headers argument should be an object of headers, but instead got ${typeof headers}`);
                }
                for (const prop in headers) {
                    if (prop.toLowerCase() === 'X-Server'.toLowerCase()) {
                        delete headers[prop];
                    }
                    headersNum++;
                }
            }
            this.#_res.writeHead(statusCode, headersNum > 0 ? headers : undefined);
            return this;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Getters
    // ============================================================================
    // ============================================================================
    /**
     * True if headers were sent, false otherwise (read-only).
     * @returns {boolean}
     */
    get headersSent() { return this.#_res.headersSent; }
    /**
     * A reference to the original HyperCloud server object.
     * @returns {HyperCloudServer}
     */
    get server() { return this.#_server; }
    /**
     * A reference to the original HyperCloud request object.
     * @returns {HyperCloudRequest}
     */
    get req() { return this.#_req; }
    /**
     * Returns a `Proxy` object that acts as a `net.Socket` (or `tls.TLSSocket`) but
     * applies getters, setters, and methods based on HTTP/2 logic.
     *
     * `destroyed`, `readable`, and `writable` properties will be retrieved from and
     * set on `response.stream`.
     *
     * `destroy`, `emit`, `end`, `on` and `once` methods will be called on`response.stream`.
     *
     * `setTimeout` method will be called on `response.stream.session`.
     *
     * `pause`, `read`, `resume`, and `write` will throw an error with code`ERR_HTTP2_NO_SOCKET_MANIPULATION`. See `Http2Session and Sockets` for
     * more information.
     *
     * All other interactions will be routed directly to the socket.
     *
     * ```js
     * const http2 = require('node:http2');
     * const server = http2.createServer((req, res) => {
     *      const ip = req.socket.remoteAddress;
     *      const port = req.socket.remotePort;
     *      res.end(`Your IP address is ${ip} and your source port is ${port}.`);
     * }).listen(3000);
     * ```
     * @returns {net.Socket|tls.TLSSocket}
     */
    get socket() { return this.#_res.socket; }
    /**
     * The Http2Stream object backing the response.
     * @returns {http2.Http2Stream}
     */
    get stream() { return this.#_res.stream; }
    /**
     * Is ```true``` if it is safe to call ```writable.write()```, which means the stream has not been destroyed, errored, or ended.
     * @returns {boolean}
     */
    get writable() { return this.#_res.writable; }
    /**
     * Number of times ```writable.uncork()``` needs to be called in order to fully uncork the stream.
     * @returns {number}
     */
    get writableCorked() { return this.#_res.writableCorked; }
    /**
     * Is `true` after `writable.end()` has been called. This property
     * does not indicate whether the data has been flushed, for this
     * use `writable.writableFinished` instead.
     * @returns {boolean}
     */
    get writableEnded() { return this.#_res.writableEnded; }
    /**
     * Is set to `true` immediately before the `'finish'` event is emitted.
     * @returns {boolean}
     */
    get writableFinished() { return this.#_res.writableFinished; }
    /**
     * Return the value of `highWaterMark` passed when creating this `Writable`.
     * @returns {number}
     */
    get writableHighWaterMark() { return this.#_res.writableHighWaterMark; }
    /**
     * This property contains the number of bytes (or objects)
     * in the queue ready to be written. The value provides
     * introspection data regarding the status of the `highWaterMark`.
     * @returns {number}
     */
    get writableLength() { return this.#_res.writableLength; }
    /**
     * Is `true` if the stream's buffer has been full and stream will emit `'drain'`.
     * @returns {boolean}
     */
    get writableNeedDrain() { return this.#_res.writableNeedDrain; }
    /**
     * Getter for the property `objectMode` of a given `Writable` stream.
     * @returns {boolean}
     */
    get writableObjectMode() { return this.#_res.writableObjectMode; }
    // Setters
    // ============================================================================
    // ============================================================================
    /**
     * When using implicit headers (not calling `response.writeHead()` explicitly),
     * this property controls the status code that will be sent to the client when
     * the headers get flushed.
     *
     * ```js
     * response.statusCode = 404;
     * ```
     *
     * After response header was sent to the client, this property indicates the
     * status code which was sent out.
     * @param {number} status The status code of the request
     */
    set statusCode(status) {
        if (typeof status === 'number' && status >= 100) {
            this.#_res.statusCode = status;
        }
        else {
            throw `${status} is not a valid status code`;
        }
    }
    /**
     * Status message is not supported by HTTP/2 (RFC 7540 8.1.2.4). It returns an empty string.
     *
     * Setting this property will throw an `Error`.
     * @param {string} message The status message
     * @deprecated @since RFC 7540 8.1.2.4
     */
    set statusMessage(message) {
        if (typeof message !== 'string') {
            throw new Error(`The response's status message must be of type string, but instead got ${typeof message}`);
        }
        throw new Error('statusMessage is deprecated and is not supported by HTTP/2 (RFC 7540 8.1.2.4). It returns an empty string.');
    }
    /**
     * A module that allows you to create or get a list of cookies
     */
    get cookies() { return this.#_cookies; }
    /**Check whether the `response` has been closed or not */
    get closed() { return this.#_status.closed; }
    /**
     * Change the response's `closed` value
     * @param {true} value
     */
    set _closed(value) {
        if (value === true) {
            this.#_status.closed = true;
        }
        else {
            throw `The response's "_sent" value can only be set to true`;
        }
    }
}
exports.default = HyperCloudResponse;
