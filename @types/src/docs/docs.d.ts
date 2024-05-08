import http2 from 'http2';
import http from 'http';
import SSLManager from '../services/ssl/manager';
import HyperCloudRequest from '../../src/services/handler/assets/request';
import HyperCloudResponse from '../../src/services/handler/assets/response';
import HyperCloudServer from '../server';
import HTTPError from '../utils/errors/HTTPError';

/**The website's possible color schemes */
export type ColorScheme = 'Dark' | 'Light' | 'Default';
export type UserRole = 'Admin' | 'Member' | 'Visitor';
export type RedirectCode = 300 | 301 | 302 | 303 | 304 | 307 | 308;
/** View engine type */
export type ViewEngine = 'ejs' | 'nhc';
/** Handler for HyperCloud requests */
export type HyperCloudRequestHandler = (request: HyperCloudRequest, response: HyperCloudResponse, next: NextFunction, error: Error | HTTPError) => void;
/**HyperCloud's `next()` function */
export type NextFunction = () => void;
/**Represents various HTTP request methods. */
export type HttpMethod = | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
/**Represents the type of the request body. */
export type RequestBodyType = 'text' | 'javascript' | 'json' | 'formData' | 'buffer' | 'graphql';
export type HyperCloudServerHandlers = 'notFound' | 'serverError' | 'unauthorized' | 'forbidden' | 'userSessions' | 'logger' | 'onHTTPError';



/**A currency code */
export type Currency =
    | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN'
    | 'BAM' | 'BBD' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL'
    | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHF' | 'CLP' | 'CNY'
    | 'COP' | 'CRC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP'
    | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'FOK' | 'GBP' | 'GEL' | 'GGP' | 'GHS'
    | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF'
    | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD'
    | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KID' | 'KMF' | 'KRW' | 'KWD' | 'KYD' | 'KZT'
    | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD'
    | 'MMK' | 'MNT' | 'MOP' | 'MRU' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN'
    | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK'
    | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR'
    | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SLL' | 'SOS' | 'SPL' | 'SRD'
    | 'STN' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD'
    | 'TVD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' | 'UYU' | 'UZS' | 'VES' | 'VND'
    | 'VUV' | 'WST' | 'XAF' | 'XCD' | 'XOF' | 'XPF' | 'YER' | 'ZAR' | 'ZMW' | 'ZWD';

/**These mime types are used when sending/receiving files */
export type MimeType =
    | "audio/aac" | "application/x-abiword" | "application/x-freearc" | "image/avif"
    | "video/x-msvideo" | "application/vnd.amazon.ebook" | "application/octet-stream"
    | "image/bmp" | "application/x-bzip" | "application/x-bzip2" | "application/x-cdf"
    | "application/x-csh" | "text/calendar" | "text/css" | "text/plain" | "text/csv" | "application/msword"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "application/vnd.ms-fontobject" | "application/epub+zip" | "application/gzip"
    | "image/gif" | "text/html" | "image/vnd.microsoft.icon" | "text/calendar" | "application/java-archive"
    | "image/jpeg" | "text/javascript" | "application/json" | "application/ld+json" | "audio/midi"
    | "audio/x-midi" | "audio/mpeg" | "video/mp4" | "video/mpeg" | "application/vnd.apple.installer+xml"
    | "application/vnd.oasis.opendocument.presentation" | "application/vnd.oasis.opendocument.spreadsheet"
    | "application/vnd.oasis.opendocument.text" | "audio/ogg" | "video/ogg" | "application/ogg"
    | "audio/opus" | "font/otf" | "image/png" | "application/pdf" | "application/x-httpd-php"
    | "application/vnd.ms-powerpoint" | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    | "application/vnd.rar" | "application/rtf" | "application/x-sh" | "image/svg+xml"
    | "application/x-tar" | "image/tiff";

export interface ExtensionData {
    /**The actual extension. e.g. (.png, .mp4) */
    extension: string;
    description: string;
    /**The mime type */
    mime: string;
}

/**Options for the `500` server error page */
export interface ServerErrorOptions {
    lang?: string;
    locals?: {
        title?: string;
        subtitle?: string; // The subtitle can be an HTML string
        message?: string; // The message can be an HTML string
    };
    error?: Error | Record<string, any>;
    /**Do **NOT** use this property */
    bypassHandler?: boolean;
}

/**User preferences is an object on the HyperCloud request. */
export interface UserPreferencesOptions {
    language?: string;
    locale?: string;
    currency?: Currency;
    colorScheme?: ColorScheme;
}

/**The `user` object on the HyperCloud request. */
export interface HyperCloudUserOptions {
    loggedIn?: boolean;
    role?: UserRole;
    id?: string;
    preferences?: UserPreferencesOptions;
}

/**Options for the `401` and `403` error pages */
export interface ForbiddenAndUnauthorizedOptions {
    lang: string;
    locals: {
        title?: string;
        commands?: {
            code?: string;
            description?: string;
            cause?: string;
            allowed?: string;
            regards?: string;
        };
        content?: {
            code?: string;
            description?: string;
            cause?: string;
            allowed?: { label: string; link: string }[];
        };
    };
}

/**Options for the default `404` error page */
export interface NotFoundResponseOptions {
    locals?: {
        title?: string;
        subtitle?: string;
        home?: string;
    };
    lang?: string;
}
export interface StaticRouteOptions {
    /** The route path URL. */
    path: string;
    /** Option for serving dotfiles. Possible values are `allow`, `deny`, `ignore`. Default: `ignore`. */
    dotfiles?: 'allow' | 'ignore' | 'deny';
    /** The host's `subDomain` from HyperCloudRequest.subDomain. Default: `null`. */
    subDomain?: string;
    /** This will match only if the `path` exactly matches the HyperCloudRequest.path */
    caseSensitive?: boolean;
}

export interface CookieOptions {
    /** Indicates that the cookie should only be sent over HTTPS connections */
    secure?: boolean;
    /** Prevents client-side JavaScript from accessing the cookie */
    httpOnly?: boolean;
    /** Specifies the maximum age of the cookie in seconds. For example: `3600` (for one hour). If left empty, the cookie will only be valid until the browser session ends. */
    maxAge?: number;
    /** Specifies the domain for which the cookie is valid. For example: `example.com`. */
    domain?: string;
    /** Specifies the URL path for which the cookie is valid. For example: `/`. */
    path?: string;
    /** Specifies the date and time when the cookie will expire. For example: `Sat, 25 Feb 2023 12:00:00 GMT`. */
    expires?: Date;
    /** Controls whether the cookie should be sent with cross-site requests. */
    sameSite?: 'Strict' | 'Lax' | 'None';
    /** Specifies the priority of the cookie. */
    priority?: 'High' | 'Medium' | 'Low';
}

export interface RouteOptions {
    /** The route path URL. */
    path: string;
    /** The handler of this route */
    handler: HyperCloudRequestHandler;
    /** The request method */
    method: 'USE' | HttpMethod;
    /** The host's `subDomain` from HyperCloudRequest.subDomain. Default: `null`. */
    subDomain?: string;
    /** This will match only if the `path` exactly matches the HyperCloudRequest.path */
    caseSensitive?: boolean;
}

export interface RenderingOptions {
    /** Local variables to be used */
    locals?: object;
    /** A status code to send */
    statusCode?: number;
    /** Enable or disable setting `Cache-Control` response header. Default: `true`. */
    cacheControl?: boolean;
    /** Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`. */
    maxAge?: number | string;
    /** Enable or disable the `immutable` directive in the `Cache-Control` response header. If enabled, the `maxAge` option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the `maxAge` option to check if the file has changed. */
    immutable?: boolean;
    /** Set an eTag on the page to let others know when the value changes */
    eTag?: string;
}

export interface DownloadFileOptions {
    /** Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`. */
    maxAge?: number | string;
    /** Root directory for relative filenames. You can also use the this path to prevent using files outside of this directory. By default, it uses the project root from `process.cwd()`. */
    root?: string;
    /** Sets the Last-Modified header to the last modified date of the file on the OS. Set `false` to disable it. */
    lastModified?: boolean;
    /** Object containing HTTP headers to serve with the file. */
    headers?: http2.OutgoingHttpHeaders;
    /** Option for serving dotfiles. Possible values are `allow`, `deny`, `ignore`. Default: `ignore`. */
    dotfiles?: 'allow' | 'ignore' | 'deny';
    /** Enable or disable accepting ranged requests. Default: `true`. */
    acceptRanges?: boolean;
    /** Enable or disable setting `Cache-Control` response header. Default: `true`. */
    cacheControl?: boolean;
    /** Enable or disable the `immutable` directive in the `Cache-Control` response header. If enabled, the `maxAge` option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the `maxAge` option to check if the file has changed. */
    immutable?: boolean;
    /** Provide a path for a custom `404` page to be displayed for ignored `dotFiles`. */
    notFoundFile?: string;
    /** Provide a path for a custom `401` page to be displayed for ignored `dotFiles`. */
    unauthorizedFile?: string;
    /** Provide a `500` server error page to be displayed instead of throwing an `Error`. */
    serverErrorFile?: string;
    /**eTags ae useful for caching */
    eTag?: string
}

export interface SendFileOptions extends DownloadFileOptions {
    /** Set this to `true` if you want to download the file */
    download?: boolean;
}


/**Represents various HTTP request methods. */
export interface HttpMethods {
    /** Represents the HTTP GET method. */
    GET: string;
    /** Represents the HTTP POST method. */
    POST: string;
    /** Represents the HTTP PUT method. */
    PUT: string;
    /** Represents the HTTP DELETE method. */
    DELETE: string;
    /** Represents the HTTP PATCH method. */
    PATCH: string;
    /** Represents the HTTP HEAD method. */
    HEAD: string;
    /** Represents the HTTP OPTIONS method. */
    OPTIONS: string;
    /** Represents the HTTP TRACE method. */
    TRACE: string;
    /** Represents the HTTP CONNECT method. */
    CONNECT: string;
}

/**Represents an initialized request in HyperCloud. */
export interface InitializedRequest {
    /** A unique request ID */
    id: string;
    /** The IPv4 address of the client making the request. Example: `172.15.47.118`. */
    ip: string;
    /** The protocol this request is sent over. */
    protocol: 'http' | 'https';
    /** The full domain of a request. E.g.: `nasriya.net` or `auth.nasriya.net`. */
    host: string;
    /** The subdomain of the `host`. Example URL: `https://auth.nasriya.net` => `subDomain = 'auth'`. */
    subDomain?: string;
    /** The `host`'s domain. Example: `https://auth.nasriya.net` => `domain = nasriya.net` */
    domain: string;
    /** The base URL of the host. It consists of the `protocol` and the `protocol`. Example: `https://nasriya.net`. */
    baseUrl: string;
    /** The path of the URL, for example, a URL of `/support/faq` corresponds to `['support', 'faq']`. */
    path: string[];
    /** The query parameters of the URL. Example: `/products/search?sku=random&lessThan=20` produces `{sku: 'random', lessThan: '20'}`. */
    query: Record<string, string>;
    /** The full URL, including the `protocol`, `baseUrl`, `path`, and `query`. Example: `https://nasriya.net/support?ticket=randomTicketID&lang=en`. */
    href: string;
    /** The type of the received data */
    bodyType: RequestBodyType | undefined;
    /** The received data */
    body: string | Record<string, any> | Buffer | undefined;
    /** The request cookies */
    cookies: Record<string, string>;
    /** The parameters of dynamic requests */
    params: Record<string, string>;
    /** A reference to the original server */
    server: HyperCloudServer;
}

/**Options for configuring protocols (HTTP and HTTPS). */
export interface ProtocolsOptions {
    http: {
        /** The port for HTTP. */
        port: number;
        /** Optional callback function for HTTP. */
        callback?: () => void;
    };
    https: {
        /** The port for HTTPS. */
        port: number;
        /** Optional callback function for HTTPS. */
        callback?: () => void;
    };
}

/**Options for configuring SSL. */
export interface SSLOptions {
    /** The maintainer email address. This must be consistent. */
    email: string;
    /** The domain(s) you want to add. At least one. */
    domains: string[];
    /** Whether you want to use a self-signed certificate or not. */
    self_signed?: boolean;
    /** Enable to request a valid testing SSL certificate from Let's Encrypt. Default: `false` */
    staging?: boolean;
    /** Bind the issued certificate to this name. Default: Uses the `name` in the `package.json` of the project. */
    certName?: string;
    /** The path you choose to store the SSL certificate and private key. (if you wish to) */
    storePath?: string;
    /**A port number to be used for achm challenges. Default: `80` */
    challengePort?: number
}

/**SSL credentials consisting of a certificate and a private key. */
export interface SSLCredentials {
    /** The certificate to be used. */
    cert: string;
    /** The private key to be used. */
    key: string;
}

/**SSL configurations. */
export interface SSLConfigs {
    /** The certificate to be used. */
    cert: string;
    /** The private key to be used. */
    key: string;
    /** Whether a self-signed certificate is used. */
    self_signed: boolean;
    /** Whether staging mode is enabled. */
    staging: boolean;
    /** The maintainer email address. */
    email: string;
    /** The domain(s) you want to add. At least one. */
    domains: string[];
    /** Bind the issued certificate to this name - used the `name` in the `package.json` of the project. */
    certName: string;
    /** The path to store the SSL certificate and private key. */
    storePath: string;
}

/**HyperCloud configurations. */
export interface HyperCloudConfigs {
    /** The protocols you want your server to run on. */
    protocols: Protocols;
    /** The SSL configurations. */
    ssl: SSLOptions | SSLCredentials;
    /** A property determined by whether the server was configured on HTTPS or not. */
    secure: boolean;
    /** Set to true if you want to generate staging certificates from Let's Encrypt to avoid being banned. */
    staging: boolean;
    /** Determine whether you want to add extra error details to the console. */
    verbose: boolean;
    /** Whether the server has been initialized. */
    initialized: boolean;
}

/** Define the HTTP and HTTPS protocols. */
export interface Protocols {
    /** Define the HTTP protocol. */
    http?: Protocol;
    /** Define the HTTPS protocol. */
    https?: Protocol;
}

/** Define a protocol configuration. */
export interface Protocol {
    /** Specify the port number of the protocol. */
    port: number;
    /** Pass a callback function to run when the server starts listening. */
    callback?: () => void;
}

/** Represents the HyperCloud system components. */
export interface HyperCloudSystem {
    /** The HTTPS server instance. */
    httpsServer: http2.Http2SecureServer;
    /** The HTTP server instance. */
    httpServer: http.Server;
    /** The SSL manager. */
    SSL: SSLManager;
}

/** Initialize this server with a configuration file */
export interface HyperCloudInitFile {
    /** A JSON configuration file to initialize the server */
    path: string;
}

/** If your server is running behind a reverse proxy, add its IP address to get the true IP address of the client. */
export interface ProxyOptions {
    /** Set the IP address of your reverse proxy(ies) */
    trusted_proxies?: string[];
    /** Set this to true if your proxy is running in a docker container. */
    isDockerContainer?: boolean;
    /** Set this to true if the proxy is running on your machine. */
    isLocal?: boolean;
}

export interface ServerOptions {
    /** Specify the port number of the protocol for the server. Default: `443` for secure servers and `80` for plain HTTP ones */
    port?: number;
    /** Pass a callback function to run when the server starts listening. */
    callback?: () => void;
    /** If your server is running behind a reverse proxy, add its IP address to get the true IP address of the client. */
    proxy?: ProxyOptions
}

export interface SecureServerOptions extends ServerOptions {
    /**Set to `true` to use `https`. Default: `false`, which means `http`. */
    secure: true;
    /** Configure the SSL certificate. If not options were provided, a self signed certificate will be used */
    ssl?: SSLOptions | SSLCredentials;    
}

export interface ServerPlusSecureOptions extends ServerOptions, SecureServerOptions {}

/** Options for managing HyperCloud */
export interface HyperCloudManagementOptions {
    /** Turn this on if you want to save your configurations. */
    saveConfig?: boolean;
    /** An absolute path to the folder where you want to save the configurations. */
    configPath?: string;
}

/** Options for configuring routers in HyperCloud */
export interface HyperCloudRouterOptions {
    /** Specify the subdomain this router works on. Default: '*' */
    subdomains?: '*' | string;
    /** When enabled, '/auth' is treated the same as '/Auth'. Default: false */
    caseSensitive?: boolean;
}

export interface RandomOptions {
    /** Include numbers. Default: `true` */
    includeNumbers?: boolean;
    /** Include letters. Default: `true` */
    includeLetters?: boolean;
    /** Include symbols: ``!";#$%&'()*+,-./:;<=>?@[]^_`{|}~``. Default: `true` */
    includeSymbols?: boolean;
    /** Include lowercase characters. Default: `true` */
    includeLowerCaseChars?: boolean;
    /** Include uppercase characters. Default: `true` */
    includeUpperCaseChars?: boolean;
    /** Don't begin with a number or symbol. Default: `true` */
    beginWithLetter?: boolean;
    /** Don't use characters like i, l, 1, L, o, 0, O, etc. Default: `true` */
    noSimilarChars?: boolean;
    /** Don't use the same character more than once. Default: `false` */
    noDuplicateChars?: boolean;
    /** Don't use sequential characters, e.g. `abc`, `789`. Default: `true` */
    noSequentialChars?: boolean;
}