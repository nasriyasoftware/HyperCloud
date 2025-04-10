import http2 from 'http2';
import http from 'http';
import SSLManager from '../services/ssl/manager';
import HyperCloudRequest from '../services/handler/assets/request';
import HyperCloudResponse from '../services/handler/assets/response';
import HyperCloudServer from '../server';
import HTTPError from '../utils/errors/HTTPError';
import ms from 'ms';

/**The website's possible color schemes */
export type ColorScheme = 'Dark' | 'Light';
export type UserRole = 'Admin' | 'Member' | 'Visitor';
export type RedirectCode = 300 | 301 | 302 | 303 | 304 | 307 | 308;
/** View engine type */
export type ViewEngine = 'ejs' | 'nhc';
/**A `request` object for handlers */
export type Request = InstanceType<typeof HyperCloudRequest>;
/**A `response` object for handlers */
export type Response = InstanceType<typeof HyperCloudResponse>;
/** Handler for HyperCloud requests */
export type HyperCloudRequestHandler = (request: Request, response: Response, next: NextFunction) => void;
/** Handler for handling HyperCloud requests' errors */
export type HyperCloudRequestErrorHandler = (request: Request, response: Response, next: NextFunction, error: Error | HTTPError) => void;
/**HyperCloud's `next()` function */
export type NextFunction = () => void;
/**Represents various HTTP request methods. */
export type HttpMethod = | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
/**Represents the type of the request body. */
export type RequestBodyType = 'text' | 'javascript' | 'json' | 'formData' | 'buffer' | 'graphql';
export type HyperCloudServerHandlers = 'notFound' | 'serverError' | 'unauthorized' | 'forbidden' | 'userSessions' | 'logger' | 'onHTTPError';
export type HttpEquivType = 'content-security-policy' | 'content-type' | 'default-style' | 'x-ua-compatible' | 'refresh';
export type HTMLMetaName = 'application-name' | 'author' | 'description' | 'generator' | 'keywords' | 'referrer' | 'theme-color' | 'color-scheme' | 'viewport' | 'creator' | 'googlebot' | 'publisher' | 'robots' | (string & {});
export type PageRenderingCacheAsset = Exclude<RenderingCacheAsset, "json">;

/**`DeepReadonly` means that the object or array is completely frozen */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
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

export type OnRenderHandler = (locals: Record<string, any> | any, include: (name: string, locals: Record<string, any>) => Promise<string>, lang: string) => string | Promise<string>;

export type StorageUnitName =
    | 'Bit'
    | 'Byte'
    | 'Kilobyte'
    | 'Kibibyte'
    | 'Megabyte'
    | 'Mebibyte'
    | 'Gigabyte'
    | 'Gibibyte'
    | 'Terabyte'
    | 'Tebibyte'
    | 'Petabyte'
    | 'Pebibyte'
    | 'Exabyte'
    | 'Exbibyte'
    | 'Zettabyte'
    | 'Zebibyte'
    | 'Yottabyte'
    | 'Yobibyte'
    | 'Brontobyte'
    | 'Geopbyte'
    | 'Nibble'
    | 'Word';

export type StorageUnitAbbreviation =
    | 'b'  // Bit
    | 'B'  // Byte
    | 'KB' // Kilobyte
    | 'KiB'// Kibibyte
    | 'MB' // Megabyte
    | 'MiB'// Mebibyte
    | 'GB' // Gigabyte
    | 'GiB'// Gibibyte
    | 'TB' // Terabyte
    | 'TiB'// Tebibyte
    | 'PB' // Petabyte
    | 'PiB'// Pebibyte
    | 'EB' // Exabyte
    | 'EiB'// Exbibyte
    | 'ZB' // Zettabyte
    | 'ZiB'// Zebibyte
    | 'YB' // Yottabyte
    | 'YiB'// Yobibyte
    | 'BB' // Brontobyte
    | 'GPB'; // Geopbyte

export type StorageUnit = StorageUnitName | StorageUnitAbbreviation;
export type UploadCleanUpFunction = () => Promise<void>;

export interface UploadLimitsController {
    fileStream: {
        get: () => number;
        set: (limit: number) => void;
    };
    images: {
        get: () => number;
        set: (limit: number) => void;
    };
    videos: {
        get: () => number;
        set: (limit: number) => void;
    };
    mime: {
        get: (mime: MimeType) => number | undefined;
        set: (mime: MimeType, limit: number) => void;
    };
}

export interface StorageSize {
    /**A positive value */
    value: number;
    /**The storage unit */
    unit: StorageUnit
}

/**
 * Represents the body of a form data request after parsing.
 * This interface includes metadata about the fields and files from the form data,
 * as well as a cleanup function for managing temporary files.
 */
export interface FormDataBody {
    /**
     * A record of form fields, where the keys are field names and the values are the field data.
     * This includes all non-file fields submitted in the form.
     * 
     * @type {Record<string, any>}
     * @example
     * {
     *   "username": "john_doe",
     *   "age": 30
     * }
     */
    fields: Record<string, any>;

    /**
     * An array of file objects representing the uploaded files.
     * Each file object can either be a `FormDataMemoryFile` or `FormDataStorageFile`,
     * depending on whether the file was stored in memory or on disk.
     * 
     * @type {(FormDataMemoryFile | FormDataStorageFile)[]}
     * @example
     * [
     *   {
     *     fieldName: "profile_picture",
     *     fileName: "john.jpg",
     *     mime: "image/jpeg",
     *     size: 123456,
     *     content: <Buffer 89 50 4e ...> // For FormDataMemoryFile
     *   },
     *   {
     *     fieldName: "large_file",
     *     fileName: "document.pdf",
     *     mime: "application/pdf",
     *     size: 98765432,
     *     path: "/temp/uploads/document.pdf" // For FormDataStorageFile
     *   }
     * ]
     */
    files: (FormDataMemoryFile | FormDataStorageFile)[];

    /**
     * A function that cleans up temporary files created during the file upload process.
     * This function should be called to remove any temporary files after processing is complete,
     * such as after copying files to their final location or storing their metadata in a database.
     * 
     * @type {UploadCleanUpFunction}
     * @example
     * // Call this function to clean up temporary files
     * formDataBody.cleanup();
     */
    cleanup: UploadCleanUpFunction;
}


/**Represents a file in form data. */
export interface FormDataFile {
    /**
     * The name of the form field associated with the file.
     * @example 'profilePicture'
     */
    fieldName: string;
    /**
     * The name of the uploaded file.
     * @example 'profile.jpg'
     */
    fileName: string;
    /**
     * The MIME type of the file.
     * @example 'image/jpeg'
     */
    mime: MimeType;
    /**
     * The size of the file in bytes.
     * @example 204800
     */
    size: number;
}

/**
 * Represents a small file stored in memory.
 * Inherits from {@link FormDataFile}.
 */
export interface FormDataMemoryFile extends FormDataFile {
    /**
     * The binary data of the file.
     * This property is used for small-sized files that are stored entirely in memory.
     * @example <Buffer 89 50 4e ...>
     */
    content: Buffer;
}

/**
 * Represents a large file stored in temporary storage.
 * Inherits from {@link FormDataFile}.
 */
export interface FormDataStorageFile extends FormDataFile {
    /**
     * The path to the temporary file on disk.
     * This property is used for large files that are stored in temporary storage.
     * @example '/tmp/uploads/largefile.tmp'
     */
    path?: string;
}

export interface HTMLScriptTag {
    /**
     * Specifies that the script is downloaded in parallel to
     * parsing the page, and executed as soon as it is
     * available (before parsing completes) (only for 
     * external scripts)
    */
    async?: boolean;
    /**Sets the mode of the request to an HTTP CORS Request */
    crossorigin?: 'anonymous' | 'use-credentials';
    /**
     * Specifies that the script is downloaded in parallel to
     * parsing the page, and executed after the page has
     * finished parsing (only for external scripts)
     */
    defer?: boolean;
    /**
     * Allows a browser to check the fetched script to ensure
     * that the code is never loaded if the source has been
     * manipulated
     */
    integrity?: string;
    /**
     * Specifies that the script should not be executed in
     * browsers supporting ES2015 modules
     */
    nomodule?: boolean;
    /**
     * Specifies which referrer information to send when fetching a script
     */
    referrerpolicy?: ReferrerPolicyOption;
    /**Specifies the URL of an external script file */
    src: string;
    /**Specifies the media type of the script */
    type?: 'text/javascript' | 'application/ecmascript' | 'text/babel' | 'application/ld+json' | 'module';
}

export interface InternalScriptOptions extends Omit<InternalScriptRecord, 'scope' | 'fileName'> { }
export interface InternalScriptRecord extends Omit<HTMLScriptTag, 'src' | 'integrity'>, FileAsset {
    scope: 'Internal';
    /**The path to the script file */
    filePath: string;
    fileName: string;
}

export interface ExternalScriptOptions extends Omit<ExternalScriptRecord, 'scope'> { }
export interface ExternalScriptRecord extends HTMLScriptTag {
    scope: 'External';
}

export interface OnPageScriptOptions extends Omit<OnPageScriptRecord, 'scope'> { }
export interface OnPageScriptRecord extends Pick<HTMLScriptTag, 'nomodule'> {
    scope: 'OnPage';
    /**The JavaScript code for in-place scripts (no imports). */
    content?: string;
}

export type MetaTag = { name: string, content: string }

export interface FileAsset {
    /**The cached content of the file */
    content?: string;
    /**The absolute path to the path involved */
    filePath: string;
    eTag?: string;
}

export type ViewRenderingAsset = Required<Omit<FileAsset, 'eTag'>>;

export interface RenderingAsset {
    name: string;
    view: ViewRenderingAsset;
    css?: FileAsset;
    js?: FileAsset;
    locals: Record<string, FileAsset>
}

export type RenderingCacheAsset = 'css' | 'js' | 'json';

export interface PageConstructorOpts extends RenderingAsset {

}

export interface InternalStylesheetRecord extends FileAsset {
    scope: 'Internal';
    fileName: string;
    /**The content of the CSS file */
    content?: string;
}

export interface ExternalStylesheetRecord {
    scope: 'External',
    /**The URL of the external CSS file */
    url: URL;
}

export interface ComponentConstructorOpts extends RenderingAsset { }

export interface RateLimitAuthOptions {
    /**The value to check against the rules. */
    value: string | number;
    /**An array of rule names and their priorities. */
    rules: ({ priority?: number, name: string })[];
    /**When set to `true`, all rules must pass; otherwise, at least one must pass. Default: `false` */
    strict?: boolean;
    /**The rule scope. Default: `global` */
    scope?: 'global' | string;
}

export interface RateLimitRule {
    /**A scope where the record will be searched for. Default: `global` */
    scope: 'global' | string;
    /**The name of the rule. E.g. `ipAddress`, `premiumSubscribers`. */
    name: string;
    /**The time (in nilleseconds) to wait before allowing requests again */
    cooldown: number;
    rate: {
        /**The period in milliseconds */
        windowMs: number;
        /**The number of allowed requests in the specified `period` */
        maxRequests: number;
    };
}

export interface RateLimitRuleOptions {
    /**A scope where the record will be searched for. Default: `global` */
    scope?: 'global' | string;
    /**The name this rule will be based on. E.g. `ipAddress`, `premiumSubscribers`. */
    name: string;
    /**The time (in nilleseconds) to wait before allowing requests again */
    cooldown: number;
    rate: {
        /**The period in milliseconds */
        windowMs: number;
        /**The number of allowed requests in the specified `period` */
        maxRequests: number;
    };
}

export interface RateLimiterAuthorizedHit {
    authorized: true;
    /**The number of hits in the the  */
    hits: number;
    hitsRemaining: number,
    lastHitTimestamp: number
}

export interface RateLimiterUnauthorizedHit {
    authorized: false;
    /**A timestamp after which the requests may be accepted  */
    retryAfter: number;
}

/** Main Helmet handler's options */
export interface HelmetConfigOptions {
    /** Content-Security-Policy options */
    contentSecurityPolicy?: ContentSecurityPolicyOptions | false;
    /** Cross-Origin-Embedder-Policy options */
    crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicyOptions | false;
    /** Cross-Origin-Opener-Policy options */
    crossOriginOpenerPolicy?: CrossOriginOpenerPolicyOptions | false;
    /** Cross-Origin-Resource-Policy options */
    crossOriginResourcePolicy?: CrossOriginResourcePolicyOptions | false;
    /** Origin-Agent-Cluster options */
    originAgentCluster?: '?1' | false;
    /** Referrer-Policy options */
    referrerPolicy?: ReferrerPolicyOptions | false;
    /** Strict-Transport-Security options */
    strictTransportSecurity?: StrictTransportSecurityOptions | false;
    /** X-Content-Type-Options options */
    xContentTypeOptions?: 'nosniff' | false;
    /** X-DNS-Prefetch-Control options */
    xDnsPrefetchControl?: DNSPrefetchControlOptions | false;
    /** X-Download-Options options */
    xDownloadOptions?: boolean;
    /** X-Frame-Options options */
    xFrameOptions?: XFrameOptionsOptions | false;
    /** X-Permitted-Cross-Domain-Policies options */
    xPermittedCrossDomainPolicies?: XPermittedCrossDomainPoliciesOptions | false;
    /** X-Powered-By options */
    xPoweredBy?: false;
    /** X-XSS-Protection options */
    xXssProtection?: false;
}

/** Enum for X-Permitted-Cross-Domain-Policies options */
export enum XPermittedCrossDomainPoliciesOption {
    NONE = "none",
    MASTERONLY = "master-only",
    BYCONTENTTYPE = "by-content-type",
    ALL = "all",
}

/** Options for X-Permitted-Cross-Domain-Policies */
export interface XPermittedCrossDomainPoliciesOptions {
    /** The permitted policy value */
    permittedPolicies: XPermittedCrossDomainPoliciesOption;
}

/** Enum for X-Frame-Options options */
export enum XFrameOptionsOption {
    DENY = "DENY",
    SAMEORIGIN = "SAMEORIGIN",
    ALLOWFROM = "ALLOW-FROM",
}

/** Options for X-Frame-Options */
export interface XFrameOptionsOptions {
    /** The action to be taken */
    action: XFrameOptionsOption;
    /** Optional URI for ALLOW-FROM action */
    uri?: string;
}

/** Options for DNS Prefetch Control */
export interface DNSPrefetchControlOptions {
    /** Whether DNS prefetching is enabled */
    enabled: boolean;
}

/** Options for Strict Transport Security */
export interface StrictTransportSecurityOptions {
    /** Max age value in seconds */
    maxAge?: number;
    /** Whether to include subdomains */
    includeSubDomains?: boolean;
    /** Whether to preload HSTS */
    preload?: boolean;
}

/** Type for Referrer Policy options */
export type ReferrerPolicyOption =
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "same-origin"
    | "origin"
    | "strict-origin"
    | "origin-when-cross-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"
    | (string & {});

/** Options for Referrer Policy */
export interface ReferrerPolicyOptions {
    /** The referrer policy value */
    policy: ReferrerPolicyOption;
}

/** Type for Cross-Origin Resource Policy options */
export type CrossOriginResourcePolicyOption = "same-origin" | "same-site" | "cross-origin" | string; // Allow any other custom values

/** Options for Cross-Origin Resource Policy */
export interface CrossOriginResourcePolicyOptions {
    /** The policy value */
    policy: CrossOriginResourcePolicyOption;
}

/** Type for Cross-Origin Opener Policy options */
export type CrossOriginOpenerPolicyOption = "same-origin" | "same-origin-allow-popups" | "unsafe-none" | string; // Allow any other custom values

/** Options for Cross-Origin Opener Policy */
export interface CrossOriginOpenerPolicyOptions {
    /** The policy value */
    policy: CrossOriginOpenerPolicyOption;
}

/** Possible values for most Content Security Policy directives */
export type ContentSecurityPolicyDirectiveValue = | "'self'" | "'unsafe-inline'" | "'unsafe-eval'" | "'none'" | 'data:' | 'blob:' | 'mediastream:' | 'filesystem:' | 'https:' | 'http:' | string; // for any other specific URIs or sources
export interface ContentSecurityPolicyDirectives {
    [directive: string]: string[] | boolean | undefined | any;
    /** Fallback for other directives. Usually set to 'self' to restrict to the same origin. */
    defaultSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for JavaScript. */
    scriptSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for CSS. */
    styleSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for images. */
    imgSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for fetch(), XMLHttpRequest, WebSocket, and EventSource connections. */
    connectSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for fonts loaded using @font-face. */
    fontSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for the <object>, <embed>, and <applet> elements. */
    objectSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for loading media using the <audio> and <video> elements. */
    mediaSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for nested browsing contexts loading using elements such as <frame> and <iframe>. */
    frameSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Enables a sandbox for the requested resource, blocking certain actions like form submission, script execution, etc. */
    sandbox?: ('allow-forms' | 'allow-modals' | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-popups' | 'allow-popups-to-escape-sandbox' | 'allow-presentation' | 'allow-same-origin' | 'allow-scripts' | 'allow-top-navigation' | 'allow-top-navigation-by-user-activation')[];
    /** Specifies a URI to which reports about policy violations should be sent. */
    reportUri?: string[];
    /** Specifies valid sources for web workers and nested browsing contexts loaded using elements such as <iframe> and <frame>. */
    childSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid endpoints for submitting forms. */
    formAction?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid parents that may embed a page using <frame>, <iframe>, <object>, <embed>, or <applet>. */
    frameAncestors?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid MIME types for plugins invoked by elements such as <object> and <embed>. */
    pluginTypes?: string[];
    /** Specifies valid sources for the <base> element. */
    baseUri?: ContentSecurityPolicyDirectiveValue[];
    /** Blocks all mixed content, preventing HTTP content from being loaded on HTTPS sites. */
    blockAllMixedContent?: boolean;
    /** Requires that all requests be sent over HTTPS. */
    upgradeInsecureRequests?: boolean;
    /** Specifies valid sources for web workers and shared workers. */
    workerSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for the manifest. */
    manifestSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources to be prefetched or prerendered. */
    prefetchSrc?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies valid sources for navigation. */
    navigateTo?: ContentSecurityPolicyDirectiveValue[];
    /** Specifies a reporting endpoint where the browser will send reports of CSP violations. */
    reportTo?: string[];
    /** Requires Trusted Types for specified script sources. */
    requireTrustedTypesFor?: ('script')[];
    /** Defines a policy for Trusted Types. */
    trustedTypes?: {
        /** The name of the Trusted Types policy. */
        policyName: string;
        /** Allows duplicate policy definitions. Default: `false` */
        allowDuplicates?: boolean;
    };
}

// Define the possible values for Cross-Origin-Embedder-Policy
export type CrossOriginEmbedderPolicyOption = 'none' | 'require-corp' | 'unsafe-none' | "credentialless" | string;

// Define the options for Cross-Origin-Embedder-Policy
export interface CrossOriginEmbedderPolicyOptions {
    policy?: CrossOriginEmbedderPolicyOption;
}

export interface ContentSecurityPolicyOptions {
    /** Whether to use default directives or not. Default: `false` */
    useDefaults?: boolean;
    directives: ContentSecurityPolicyDirectives;
}


export interface ExtensionData {
    /**The actual extension. e.g. (.png, .mp4) */
    extension: string;
    description: string;
    /**The mime type */
    mime: string;
}

/**Options for the `500` server error page */
export interface ServerErrorOptions {
    locals?: {
        title?: string;
        subtitle?: string; // The subtitle can be an HTML string
        message?: string; // The message can be an HTML string
    };
    error?: Error | Record<string, any>;
    /**
     * Do **NOT** use this property
     * @private
    */
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
    locals?: {
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
        homeBtnLabel?: string;
    };
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

export interface PageRenderingOptions {
    title?: string;
    description?: string;
    keywords?: string | string[];
    favicon?: string;
    thumbnail?: string;
    /** Local variables to be used */
    locals?: Record<string, any>,
    httpOptions?: RenderingOptions;
}

export interface RenderingOptions {
    /** A status code to send */
    statusCode?: number;
    /** Enable or disable setting `Cache-Control` response header. Default: `true`. */
    cacheControl?: boolean;
    /** Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`. */
    maxAge?: number | ms.StringValue;
    /** Enable or disable the `immutable` directive in the `Cache-Control` response header. If enabled, the `maxAge` option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the `maxAge` option to check if the file has changed. */
    immutable?: boolean;
    /** Set an eTag on the page to let others know when the value changes */
    eTag?: string;
}

export interface DownloadFileOptions {
    /** Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`. */
    maxAge?: number | ms.StringValue;
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
    /**A filename to send as the name of the downloaded filename */
    fileName?: string;
}

export interface SendFileOptions extends DownloadFileOptions {
    /** Set this to `true` if you want to download the file */
    download?: boolean;
    /**A filename to send as the name of the downloaded filename. */
    fileName?: string;
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

export interface LetsEncryptOptions {
    /** The maintainer email address. This must be consistent. */
    email: string;
    /** The domain(s) you want to add. At least one. */
    domains: string[];
    /** Enable to request a valid testing SSL certificate from Let's Encrypt. Default: `false` */
    staging?: boolean;
    /** Bind the issued certificate to this name. Default: Uses the `name` in the `package.json` of the project. */
    certName?: string;
    /**A port number to be used for achm challenges. Default: `80` */
    challengePort?: number
}

/**Options for configuring SSL. */
export interface SSLOptions {
    /**The type of SSL configurations. Default: `selfSigned` */
    type?: 'selfSigned' | 'letsEncrypt' | 'credentials';
    letsEncrypt?: LetsEncryptOptions;
    /**SSL credentials consisting of a certificate and a private key. */
    credentials?: SSLCredentials;
    /** The path you choose to store the SSL certificate and private key. (if you wish to) */
    storePath?: string;
}

/**SSL credentials consisting of a certificate and a private key. */
export interface SSLCredentials {
    /** The certificate to be used. */
    cert: string;
    /** The private key to be used. */
    key: string;
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

/** Define a protocol configuration. */
export interface OptionalProtocol {
    /** Specify the port number of the protocol. Default: `443` for secure servers and `80` for plain HTTP ones */
    port?: number;
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
    /** If your server is running behind a reverse proxy, add its IP address to get the true IP address of the client. */
    proxy?: ProxyOptions;
    /**Configure your server's default and supported languages */
    languages?: {
        /**Set your server's default language. Default: `en` */
        default?: string;
        /**Set your server's supported languages. Default: `['en']` */
        supported?: string[]
    },
    /**
     * The `server.locals` object has properties that are local
     * variables within the application, and will be available
     * in templates rendered with `{@link HyperCloudResponse.render}`.
     */
    locals?: Record<string, string>,
    /**Define handlers for various scenarios */
    handlers?: Record<HyperCloudServerHandlers, HyperCloudRequestHandler>
}

export interface SecureServerOptions extends ServerOptions {
    /**Set to `true` to use `https`. Default: `false`, which means `http`. */
    secure: true;
    /** Configure the SSL certificate. If not options were provided, a self signed certificate will be used */
    ssl?: SSLOptions;
}

export interface ServerPlusSecureOptions extends ServerOptions, SecureServerOptions { };

// /** Manually configure the server */
// export interface HyperCloudInitOptions {
//     /** Specify the protocols you want your server to run on */
//     protocols: ProtocolsOptions;
//     /** Configure the SSL certificate. These configurations are required if you want to use a secure connection */
//     ssl?: SSLOptions | SSLCredentials;
//     /** If your server is running behind a reverse proxy, add its IP address to get the true IP address of the client. */
//     proxy?: {
//         /** Set the IP address of your reverse proxy(ies) */
//         trusted_proxies?: string[];
//         /** Set this to true if your proxy is running in a docker container. */
//         isDockerContainer?: boolean;
//         /** Set this to true if the proxy is running on your machine. */
//         isLocal?: boolean;
//     };
// }

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

export interface ServerListeningConfigs {
    /**
     * The port your server is listening on.
     * Default: `443` for secure servers and `80` for non-secure servers
     */
    port?: number;

    /**
     * The host your server is listening on.
     * 
     * Default: `0.0.0.0`, which means listen on all possible interfaces.
     */
    host?: string;

    /**
     * The maximum length of the queue of pending connections.
     * Default: the system's default value, usually 511.
     */
    backlog?: number;
    
    /**
     * If true, the port will be exclusive, and no other process can use it.
     */
    exclusive?: boolean;
    
    /**
     * If true, only IPv6 addresses will be allowed to connect.
     */
    ipv6Only?: boolean;
    
    /**
     * The callback function that will be called when the server is listening
     * on the specified port and host.
     * @example
     * server.listen({
     *     onListen(host, port) => {
     *         console.log(`Listening on ${host}:${port}`);
     *     }
     * });
     */
    onListen?: (host: string, port: number) => void
}