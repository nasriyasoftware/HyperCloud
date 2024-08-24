import http2 from 'http2';
import { InitializedRequest, ColorScheme, HyperCloudUserOptions, HttpMethod, RequestBodyType, FormDataBody } from '../../../docs/docs';
import helpers from '../../../utils/helpers';
import HyperCloudUser from './user';
import HyperCloudResponse from './response';
import path from 'path';
import UploadHandler from '../../uploads/assets/handler';

/**This class is used internallly, not by the user */
export class HyperCloudRequest {
    readonly #_request: InitializedRequest;
    readonly #_req: http2.Http2ServerRequest;
    #_params = {} as Record<string, string>;
    /**The locale of the client. Example: `en-PS`; */
    #_locale: string;
    #_lang: string;

    #_user = Object.seal({
        instance: null as unknown as HyperCloudUser,
        initialized: false
    });

    #_colorScheme: ColorScheme = 'Default';

    constructor(request: InitializedRequest, req: http2.Http2ServerRequest) {
        this.#_request = request;
        this.#_req = req;
        this.#_lang = this.#_request.server.languages.default;
        this.#_locale = `${this.#_lang}-PS`;
        /**@type {HyperCloudUserOptions} */
        this.#_user.instance = new HyperCloudUser(this)
    }

    /**The ID of the HTTP request */
    get id(): string { return this.#_request.id }
    /**The IP of the remote client */
    get ip(): string { return this.#_request.ip }
    /**The request protocol */
    get protocol(): 'http' | 'https' { return this.#_request.protocol }
    /**The request host */
    get host(): string { return this.#_request.host }
    /**The request domain */
    get domain(): string { return this.#_request.domain }
    /**The request subdomain */
    get subDomain(): string | undefined { return this.#_request.subDomain }
    /**The request base URL */
    get baseUrl(): string { return this.#_request.baseUrl }
    /**The request path, in other words, the part of the URL after the first `/`. */
    get path(): string[] { return this.#_request.path }
    /**The request query, in other words, the part of the URL after the `?`. */
    get query(): Record<string, string> { return this.#_request.query }
    /**
     * The entire URL of the request. This includes: {@link protocol}, {@link host}, {@link path}, and any potential {@link query}.
     * 
     * Example: `https://auth.nasriya.net/tfa?token=randomID`.
    */
    get href(): string { return this.#_request.href }
    /**The type of the recieved body. Note that the body is converted to `json` format whenever possible */
    get bodyType(): RequestBodyType | undefined { return this.#_request.bodyType }
    /**The body of the request */
    get body(): string | Record<string, any> | Buffer | FormDataBody | undefined { return this.#_request.body }
    /**The request cookies object */
    get cookies(): Record<string, string> { return this.#_request.cookies }
    /**The request headers */
    get headers() { return this.#_req.headers }
    /**The `request.aborted` property will be `true` if the request has been aborted. */
    get aborted() { return this.#_req.aborted }
    /**The request authority pseudo header field. Because HTTP/2 allows requests to set either `:authority` or `host`, this value is derived from `req.headers[':authority']` if present. Otherwise, it is derived from `req.headers['host']`. */
    get authority() { return this.#_req.authority }
    /**Is `true` after `'close'` has been emitted. */
    get closed() { return this.#_req.closed }
    /**The `request.complete` property will be `true` if the request has been completed, aborted, or destroyed. */
    get complete() { return this.#_req.complete }
    /**
     * In case of server request, the HTTP version sent by the client. In the case of client response, the HTTP version of the connected-to server. Returns`'2.0'`.
     * 
     * Also `message.httpVersionMajor` is the first integer and `message.httpVersionMinor` is the second.
     */
    get httpVersion() { return this.#_req.httpVersion }
    get httpVersionMajor() { return this.#_req.httpVersionMajor }
    get httpVersionMinor() { return this.#_req.httpVersionMinor }
    /**The request method as a string. Read-only. Examples: `'GET'`, `'DELETE'`. */
    get method(): HttpMethod { return this.#_req.method as HttpMethod }
    get server() { return this.#_request.server }

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
            body: this.body,
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
    get params() { return this.#_params }
    set params(value) {
        if (helpers.is.realObject(value)) {
            this.#_params = value;
        } else {
            throw `The request.params has been set with an invalid value. Expected an object but got ${typeof value}`
        }
    }

    /**The locale of the client. Example: `en-PS`; */
    get locale() { return this.#_locale }
    /**
     * Set the request locale
     * @param {string} value
     * @private
     */
    set _locale(value: string) {
        if (typeof value === 'string') {
            if (helpers.validate.locale(value)) {
                this.#_locale = value;
            } else {
                throw `(${value}) is not a valid locale`;
            }
        } else {
            throw new TypeError(`The request's locale that has been used is not a valid string, but a type of ${typeof value}`)
        }
    }

    /**Get request language */
    get language() { return this.#_lang }

    /**
     * Set the request language
     * @param {string} lang The new language
     * @private
     */
    set _language(lang: string) {
        if (typeof lang === 'string') {
            lang = lang.toLowerCase();
            if (!this.server.languages.supported.includes(lang)) { throw `The language you provided (${lang}) is not a supported language. Supported languages are: ${this.server.languages.supported.join(', ')}.` }
            this.#_lang = lang;
        } else {
            throw new TypeError(`The request's language that has been used is not a valid string, but a type of ${typeof lang}`)
        }
    }

    /**@returns {HyperCloudUser} */
    get user(): HyperCloudUser { return this.#_user.instance }
    /**
     * Setup the user details of this request.
     * 
     * **Note:** Once set, you cannot change the user details
     * @param {HyperCloudUserOptions} options
     */
    set user(options: HyperCloudUserOptions) {
        if (this.#_user.initialized) { throw `Unable to set HyperCloud user: User is already defined` }
        this.#_user.initialized = true;
        this.#_user.instance = new HyperCloudUser(this, options);
    }

    /**Get the site's `colorScheme` */
    get colorScheme() { return this.#_colorScheme }

    /**
     * Set the `colorScheme` of the request
     * @param {ColorScheme} scheme The request's `colorScheme`
     * @private
     */
    set _colorScheme(scheme: ColorScheme) {
        if (['Default', 'Light', 'Dark'].includes(scheme)) {
            this.#_colorScheme = scheme;
        } else {
            throw `The provided request's "scheme" (${scheme}) is not a valid color scheme`
        }
    }

    handleFormData(response: HyperCloudResponse) {
        const handler = new UploadHandler(this, this.#_request, response);
        try {
            return handler.handle();
        } catch (error) {
            response.status(500).json({ type: 'server_error', error });
            throw error;
        }
    }

    /**The original HTTP request */
    get httpRequest() { return this.#_req }
}

export default HyperCloudRequest;