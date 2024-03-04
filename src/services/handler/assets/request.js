const http2 = require('http2');
const Docs = require('../../../utils/docs');
const helpers = require('../../../utils/helpers');
const HyperCloudUser = require('./user');

/**This class is used internallly, not by the user */
class HyperCloudRequest {
    /**@type {Docs.InitializedRequest} */
    #request;
    /**@type {http2.Http2ServerRequest} */
    #req;
    #params = {};
    /**
     * The locale of the client. Example: `en-PS`;
     * @type {string}
     */
    #locale;
    /**@type {string} */
    #lang;

    #user = Object.seal({
        /**@type {HyperCloudUser} */
        instance: null,
        initialized: false
    });

    /**@type {Docs.ColorScheme} */
    #colorScheme = 'Default';

    /**
     * @param {Docs.InitializedRequest} request 
     * @param {http2.Http2ServerRequest} req 
     */
    constructor(request, req) {
        this.#request = request;
        this.#req = req;
        /**@type {Docs.HyperCloudUserOptions} */
        this.#user.instance = new HyperCloudUser(this)
    }

    get id() { return this.#request.id }
    get ip() { return this.#request.ip }
    get protocol() { return this.#request.protocol }
    get host() { return this.#request.host }
    get domain() { return this.#request.domain }
    get subDomain() { return this.#request.subDomain }
    get baseUrl() { return this.#request.baseUrl }
    get path() { return this.#request.path }
    get query() { return this.#request.query }
    get href() { return this.#request.href }
    get bodyType() { return this.#request.bodyType }
    get body() { return this.#request.body }
    get cookies() { return this.#request.cookies }
    get headers() { return this.#req.headers }
    /**The ```request.aborted``` property will be ```true``` if the request has been aborted. */
    get aborted() { return this.#req.aborted }
    /**The request authority pseudo header field. Because HTTP/2 allows requests to set either ```:authority``` or ```host```, this value is derived from ```req.headers[':authority']``` if present. Otherwise, it is derived from ```req.headers['host']```. */
    get authority() { return this.#req.authority }
    /**Is ```true``` after ```'close'``` has been emitted. */
    get closed() { return this.#req.closed }
    /**The ```request.complete``` property will be ```true``` if the request has been completed, aborted, or destroyed. */
    get complete() { return this.#req.complete }
    /**In case of server request, the HTTP version sent by the client. In the case of client response, the HTTP version of the connected-to server. Returns```'2.0'```.
     * 
     * Also ```message.httpVersionMajor``` is the first integer and ```message.httpVersionMinor``` is the second.
     */
    get httpVersion() { return this.#req.httpVersion }
    get httpVersionMajor() { return this.#req.httpVersionMajor }
    get httpVersionMinor() { return this.#req.httpVersionMinor }
    /**
     * The request method as a string. Read-only. Examples: ```'GET'```, ```'DELETE'```.
     * @returns {HttpMethod}
     */
    get method() { return this.#req.method }
    get server() { return this.#request.server }

    /**@private */
    _toString() {
        return JSON.stringify(this._toJSON(), null, 4)
    }

    /**@private */
    _toJSON() {
        return {
            id: this.id,
            ip: this.ip,
            protocol: this.protocol,
            host: this.host,
            domain: this.domain,
            subDomain: this.subDomain,
            baseUrl: this.baseUrl,
            path: this.path,
            query: this.query,
            href: this.href,
            bodyType: this.bodyType,
            params: this.params,
            cookies: this.cookies,
            locale: this.locale,
            language: this.language || null,
            user: this.user._toJSON(),
        }
    }

    /**
     * The parameters of that matches the current route.
     * 
     * Note: Each route will have its own `params` if available
    */
    get params() { return this.#params }
    set params(value) {
        if (helpers.isRealObject(value)) {
            this.#params = value;
        } else {
            throw `The request.params has been set with an invalid value. Expected an object but got ${typeof value}`
        }
    }

    /**The locale of the client. Example: `en-PS`; */
    get locale() { return this.#locale }
    /**
     * Set the request locale
     * @param {string} value
     * @private
     */
    set _locale(value) {
        if (typeof value === 'string') {
            if (helpers.validate.locale(value)) {
                this.#locale = value;
            } else {
                throw `(${value}) is not a valid locale`;
            }
        } else {
            throw new TypeError(`The request's locale that has been used is not a valid string, but a type of ${typeof value}`)
        }
    }

    /**Get request language */
    get language() { return this.#lang }

    /**
     * Set the request language
     * @param {string} lang The new language
     * @private
     */
    set _language(lang) {
        if (typeof lang === 'string') {
            lang = lang.toLowerCase();
            if (!this.server.supportedLanguages.includes(lang)) { throw `The language you provided (${lang}) is not a supported language. Supported languages are: ${this.server.supportedLanguages.split(', ')}.` }
            this.#lang = lang;
        } else {
            throw new TypeError(`The request's language that has been used is not a valid string, but a type of ${typeof lang}`)
        }
    }

    /**@returns {HyperCloudUser} */
    get user() { return this.#user.instance }
    /**
     * Setup the user details of this request.
     * 
     * **Note:** Once set, you cannot change the user details
     * @param {Docs.HyperCloudUserOptions} options
     */
    set user(options) {
        if (this.#user.initialized) { throw `Unable to set HyperCloud user: User is already defined` }
        this.#user.initialized = true;
        this.#user.instance = new HyperCloudUser(this, options);
    }

    /**Get the site's `colorScheme` */
    get colorScheme() { return this.#colorScheme }

    /**
     * Set the `colorScheme` of the request
     * @param {Docs.ColorScheme} scheme The request's `colorScheme`
     * @private
     */
    set _colorScheme(scheme) {
        if (['Default', 'Light', 'Dark'].includes(scheme)) {
            this.#colorScheme = scheme;
        } else {
            throw `The provided request's "scheme" (${scheme}) is not a valid color scheme`
        }
    }
}

module.exports = HyperCloudRequest