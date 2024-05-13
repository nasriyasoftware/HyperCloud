/// <reference types="node" />
/// <reference types="node" />
import http2 from 'http2';
import { InitializedRequest, ColorScheme, HyperCloudUserOptions, HttpMethod, RequestBodyType } from '../../../docs/docs';
import HyperCloudUser from './user';
/**This class is used internallly, not by the user */
declare class HyperCloudRequest {
    #private;
    constructor(request: InitializedRequest, req: http2.Http2ServerRequest);
    /**The ID of the HTTP request */
    get id(): string;
    /**The IP of the remote client */
    get ip(): string;
    /**The request protocol */
    get protocol(): 'http' | 'https';
    /**The request host */
    get host(): string;
    /**The request domain */
    get domain(): string;
    /**The request subdomain */
    get subDomain(): string | undefined;
    /**The request base URL */
    get baseUrl(): string;
    /**The request path, in other words, the part of the URL after the first `/`. */
    get path(): string[];
    /**The request query, in other words, the part of the URL after the `?`. */
    get query(): Record<string, string>;
    /**
     * The entire URL of the request. This includes: {@link protocol}, {@link host}, {@link path}, and any potential {@link query}.
     *
     * Example: `https://auth.nasriya.net/tfa?token=randomID`.
    */
    get href(): string;
    /**The type of the recieved body. Note that the body is converted to `json` format whenever possible */
    get bodyType(): RequestBodyType | undefined;
    /**The body of the request */
    get body(): string | Record<string, any> | Buffer | undefined;
    /**The request cookies object */
    get cookies(): Record<string, string>;
    /**The request headers */
    get headers(): http2.IncomingHttpHeaders;
    /**The `request.aborted` property will be `true` if the request has been aborted. */
    get aborted(): boolean;
    /**The request authority pseudo header field. Because HTTP/2 allows requests to set either `:authority` or `host`, this value is derived from `req.headers[':authority']` if present. Otherwise, it is derived from `req.headers['host']`. */
    get authority(): string;
    /**Is `true` after `'close'` has been emitted. */
    get closed(): boolean;
    /**The `request.complete` property will be `true` if the request has been completed, aborted, or destroyed. */
    get complete(): boolean;
    /**
     * In case of server request, the HTTP version sent by the client. In the case of client response, the HTTP version of the connected-to server. Returns`'2.0'`.
     *
     * Also `message.httpVersionMajor` is the first integer and `message.httpVersionMinor` is the second.
     */
    get httpVersion(): string;
    get httpVersionMajor(): number;
    get httpVersionMinor(): number;
    /**The request method as a string. Read-only. Examples: `'GET'`, `'DELETE'`. */
    get method(): HttpMethod;
    get server(): import("../../../server").default;
    /**@private */
    _toString(): string;
    /**@private */
    _toJSON(): {
        id: string;
        ip: string;
        protocol: "http" | "https";
        host: string;
        domain: string;
        subDomain: string | undefined;
        baseUrl: string;
        path: string[];
        query: Record<string, string>;
        href: string;
        bodyType: RequestBodyType | undefined;
        params: Record<string, string>;
        cookies: Record<string, string>;
        locale: string;
        language: string | null;
        user: {
            id: string;
            loggedIn: boolean;
            role: import("../../../docs/docs").UserRole;
            preferences: {
                language: string | null;
                colorScheme: ColorScheme;
                locale: string | null;
                currency: import("../../../docs/docs").Currency | null;
            };
        };
    };
    /**
     * The parameters of that matches the current route.
     *
     * Note: Each route will have its own `params` if available
    */
    get params(): Record<string, string>;
    set params(value: Record<string, string>);
    /**The locale of the client. Example: `en-PS`; */
    get locale(): string;
    /**
     * Set the request locale
     * @param {string} value
     * @private
     */
    set _locale(value: string);
    /**Get request language */
    get language(): string;
    /**
     * Set the request language
     * @param {string} lang The new language
     * @private
     */
    set _language(lang: string);
    /**@returns {HyperCloudUser} */
    get user(): HyperCloudUser;
    /**
     * Setup the user details of this request.
     *
     * **Note:** Once set, you cannot change the user details
     * @param {HyperCloudUserOptions} options
     */
    set user(options: HyperCloudUserOptions);
    /**Get the site's `colorScheme` */
    get colorScheme(): ColorScheme;
    /**
     * Set the `colorScheme` of the request
     * @param {ColorScheme} scheme The request's `colorScheme`
     * @private
     */
    set _colorScheme(scheme: ColorScheme);
}
export default HyperCloudRequest;
