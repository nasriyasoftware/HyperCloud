const http2 = require('http2');
const http = require('http');
const SSLManager = require('../services/ssl/manager.js');
const HyperCloudRequest = require('../../src/services/handler/assets/request');
const HyperCloudResponse = require('../../src/services/handler/assets/response');
const HyperCloudServer = require('../server.js');

/**@typedef {{ loggedIn?: boolean, role:? UserRole, id?: string, preferences?: UserPreferencesOptions }} HyperCloudUserOptions */
/**@typedef {{ language?: string, locale?: string, currency?: Currency, colorScheme?: ColorScheme }} UserPreferencesOptions */
/**@typedef {'Dark'|'Light'|'Default'} ColorScheme */
/**@typedef {'Admin'|'Member'|'Visitor'} UserRole*/

/**
 * Currency code.
 * @typedef {'AED'|'AFN'|'ALL'|'AMD'|'ANG'|'AOA'|'ARS'|'AUD'|'AWG'|'AZN'|'BAM'|'BBD'|'BDT'|'BGN'|'BHD'|'BIF'|'BMD'
 * |'BND'|'BOB'|'BRL'|'BSD'|'BTN'|'BWP'|'BYN'|'BZD'|'CAD'|'CDF'|'CHF'|'CLP'|'CNY'|'COP'|'CRC'|'CUP'|'CVE'|'CZK'
 * |'DJF'|'DKK'|'DOP'|'DZD'|'EGP'|'ERN'|'ETB'|'EUR'|'FJD'|'FKP'|'FOK'|'GBP'|'GEL'|'GGP'|'GHS'|'GIP'|'GMD'|'GNF'
 * |'GTQ'|'GYD'|'HKD'|'HNL'|'HRK'|'HTG'|'HUF'|'IDR'|'ILS'|'IMP'|'INR'|'IQD'|'IRR'|'ISK'|'JEP'|'JMD'|'JOD'|'JPY'
 * |'KES'|'KGS'|'KHR'|'KID'|'KMF'|'KRW'|'KWD'|'KYD'|'KZT'|'LAK'|'LBP'|'LKR'|'LRD'|'LSL'|'LYD'|'MAD'|'MDL'|'MGA'
 * |'MKD'|'MMK'|'MNT'|'MOP'|'MRU'|'MUR'|'MVR'|'MWK'|'MXN'|'MYR'|'MZN'|'NAD'|'NGN'|'NIO'|'NOK'|'NPR'|'NZD'|'OMR'
 * |'PAB'|'PEN'|'PGK'|'PHP'|'PKR'|'PLN'|'PYG'|'QAR'|'RON'|'RSD'|'RUB'|'RWF'|'SAR'|'SBD'|'SCR'|'SDG'|'SEK'|'SGD'
 * |'SHP'|'SLL'|'SOS'|'SPL'|'SRD'|'STN'|'SYP'|'SZL'|'THB'|'TJS'|'TMT'|'TND'|'TOP'|'TRY'|'TTD'|'TVD'|'TWD'|'TZS'
 * |'UAH'|'UGX'|'USD'|'UYU'|'UZS'|'VES'|'VND'|'VUV'|'WST'|'XAF'|'XCD'|'XOF'|'XPF'|'YER'|'ZAR'|'ZMW'|'ZWD'} Currency
 */


/**
 * @typedef {object} ServerErrorOptions
 * @prop {string} lang
 * @prop {object} locals
 * @prop {string} [locals.title]
 * @prop {string} [locals.subtitle] The subtitle can be an HTML string
 * @prop {string} [locals.message] The message can be an HTML string
 */

/**
 * @typedef {object} ForbiddenAndUnauthorizedOptions
 * @prop {string} lang
 * @prop {object} locals
 * @prop {object} [locals.commands]
 * @prop {string} [locals.commands.code]
 * @prop {string} [locals.commands.description]
 * @prop {string} [locals.commands.cause]
 * @prop {string} [locals.commands.allowed]
 * @prop {string} [locals.commands.regards]
 * @prop {object} [locals.content]
 * @prop {string} [locals.content.code]
 * @prop {string} [locals.content.description]
 * @prop {string} [locals.content.cause]
 * @prop {({label: string, link: string})[]} [locals.content.allowed]
 */

/**
 * @typedef {object} NotFoundResponseOptions
 * @prop {Object} [locals] Locals to be used for the page renderer
 * @prop {string} [locals.title] The page title
 * @prop {string} [locals.subtitle] The page subtitle
 * @prop {string} [locals.home] The label of the home button
 * @prop {string} [lang] The page language
 */

/**
 * @typedef {object} StaticRouteOptions
 * @prop {string} path The route path URL.
 * @prop {'allow'|'ignore'|'deny'} [dotfiles] Option for serving dotfiles. Possible values are `allow`, `deny`, `ignore`. Default: `ignore`.
 * @prop {string} [subDomain] The host's `subDomain` from {@link HyperCloudRequest.subDomain}. Default: `null`.
 * @prop {boolean} [caseSensitive] This will match only of the `path` exactly match the {@link HyperCloudRequest.path}
 */
/**
 * @typedef {object} CookieOptions
 * @prop {boolean} secure Indicates that the cookie should only be sent over HTTPS connections
 * @prop {boolean} httpOnly Prevents client-side JavaScript from accessing the cookie
 * @prop {number} maxAge Specifies the maximum age of the cookie in seconds. For example: `3600` (for one hour). If left empty, the cookie will only be valid until the browser session ends.
 * @prop {string} domain Specifies the domain for which the cookie is valid. For example: `example.com`.
 * @prop {string} path Specifies the URL path for which the cookie is valid. For example: `/`.
 * @prop {Date} expires Specifies the date and time when the cookie will expire. For example: `Sat, 25 Feb 2023 12:00:00 GMT`.
 * @prop {'Strict'|'Lax'|'None'} sameSite Controls whether the cookie should be sent with cross-site requests.
 * @prop {'High'|'Medium'|'Low'} priority Specifies the priority of the cookie.
 */

/**@type {300|301|302|303|304|307|308} RedirectCode */

/**
 * @typedef {object} RouteOptions
 * @prop {string} path The route path URL.
 * @prop {HyperCloudRequestHandler} handler The handler of this route
 * @prop {'USE'|Docs.HttpMethod} method The request method
 * @prop {string} [subDomain] The host's `subDomain` from {@link HyperCloudRequest.subDomain}. Default: `null`.
 * @prop {boolean} [caseSensitive] This will match only of the `path` exactly match the {@link HyperCloudRequest.path}
 */

/**@typedef {(request: HyperCloudRequest, response: HyperCloudResponse, next: NextFunction) => void} HyperCloudRequestHandler */

/**
 * @typedef {'ejs'|'nhc'} ViewEngine
 */

/**
 * @typedef {object} RenderingOptions
 * @prop {object} [locals] Local variables to be used
 * @prop {number} [statusCode] A status code to send
 * @prop {boolean} [cacheControl] Enable or disable setting `Cache-Control` response header. Default: `true`.
 * @prop {number|string} [maxAge] Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`.
 * @prop {boolean} [immutable] Enable or disable the `immutable` directive in the `Cache-Control` response header. If enabled, the `maxAge` option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the `maxAge` option to check if the file has changed.
 * @prop {string} [eTag] Set an eTag on the page to let others know when the value changes
 */

/**
 * @typedef {object} DownloadFileOptions
 * @prop {number|string} [maxAge] Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`.
 * @prop {string} [root] Root directory for relative filenames. You can also use the this path to prevent using files outside of this directory. By default, it uses the project root from `process.cwd()`.
 * @prop {boolean} [lastModified] Sets the Last-Modified header to the last modified date of the file on the OS. Set `false` to disable it.
 * @prop {http2.OutgoingHttpHeaders} [headers] Object containing HTTP headers to serve with the file.
 * @prop {'allow'|'ignore'|'deny'} [dotfiles] Option for serving dotfiles. Possible values are `allow`, `deny`, `ignore`. Default: `ignore`.
 * @prop {boolean} [acceptRanges] Enable or disable accepting ranged requests. Default: `true`.
 * @prop {boolean} [cacheControl] Enable or disable setting `Cache-Control` response header. Default: `true`.
 * @prop {boolean} [immutable] Enable or disable the `immutable` directive in the `Cache-Control` response header. If enabled, the `maxAge` option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the `maxAge` option to check if the file has changed.
 * @prop {string} [notFoundFile] Provide a path for a custom `404` page to be displayed for ignored `dotFiles`.
 * @prop {string} [unauthorizedFile] Provide a path for a custom `401` page to be displayed for ignored `dotFiles`.
 * @prop {string} [serverErrorFile] Provide a `500` server error page to be displayed instead of throwing an `Error`.
 */

/**
 * @typedef {object} SendFileOptions
 * @prop {number|string} [maxAge] Sets the max-age property of the Cache-Control header in milliseconds or a string in [ms format](https://www.npmjs.com/package/ms). Default: `0`.
 * @prop {string} [root] Root directory for relative filenames. You can also use the this path to prevent using files outside of this directory. By default, it uses the project root from `process.cwd()`.
 * @prop {boolean} [lastModified] Sets the Last-Modified header to the last modified date of the file on the OS. Set `false` to disable it.
 * @prop {http2.OutgoingHttpHeaders} [headers] Object containing HTTP headers to serve with the file.
 * @prop {'allow'|'ignore'|'deny'} [dotfiles] Option for serving dotfiles. Possible values are `allow`, `deny`, `ignore`. Default: `ignore`.
 * @prop {boolean} [acceptRanges] Enable or disable accepting ranged requests. Default: `true`.
 * @prop {boolean} [cacheControl] Enable or disable setting `Cache-Control` response header. Default: `true`.
 * @prop {boolean} [immutable] Enable or disable the `immutable` directive in the `Cache-Control` response header. If enabled, the `maxAge` option should also be specified to enable caching. The immutable directive will prevent supported clients from making conditional requests during the life of the `maxAge` option to check if the file has changed.
 * @prop {string} [notFoundFile] Provide a path for a custom `404` page to be displayed for ignored `dotFiles`.
 * @prop {string} [unauthorizedFile] Provide a path for a custom `401` page to be displayed for ignored `dotFiles`.
 * @prop {string} [serverErrorFile] Provide a `500` server error page to be displayed instead of throwing an `Error`.

 * @prop {boolean} [download] Set this to `true` if you want to download the file
 */

/**
 * @typedef {("audio/aac"|"application/x-abiword"|"application/x-freearc"|"image/avif"
 * |"video/x-msvideo"|"application/vnd.amazon.ebook"|"application/octet-stream"
 * |"image/bmp"|"application/x-bzip"|"application/x-bzip2"|"application/x-cdf"
 * |"application/x-csh"|"text/calendar"|"text/css"|"text/plain"|"text/csv"|"application/msword"
 * |"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
 * |"application/vnd.ms-fontobject"|"application/epub+zip"|"application/gzip"
 * |"image/gif"|"text/html"|"image/vnd.microsoft.icon"|"text/calendar"|"application/java-archive"
 * |"image/jpeg"|"text/javascript"|"application/json"|"application/ld+json"|"audio/midi"
 * |"audio/x-midi"|"audio/mpeg"|"video/mp4"|"video/mpeg"|"application/vnd.apple.installer+xml"
 * |"application/vnd.oasis.opendocument.presentation"|"application/vnd.oasis.opendocument.spreadsheet"
 * |"application/vnd.oasis.opendocument.text"|"audio/ogg"|"video/ogg"|"application/ogg"
 * |"audio/opus"|"font/otf"|"image/png"|"application/pdf"|"application/x-httpd-php"
 * |"application/vnd.ms-powerpoint"|"application/vnd.openxmlformats-officedocument.presentationml.presentation"
 * |"application/vnd.rar"|"application/rtf"|"application/x-sh"|"image/svg+xml"
 * |"application/x-tar"|"image/tiff")} MimeType
 * @description These mime types are used when sending/recieving files 
 */


/**
 * @typedef {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'|'HEAD'|'OPTIONS'|'TRACE'|'CONNECT'} HttpMethod
 */

/**
 * @typedef {Object} HttpMethods
 * @property {string} GET - Represents the HTTP GET method.
 * @property {string} POST - Represents the HTTP POST method.
 * @property {string} PUT - Represents the HTTP PUT method.
 * @property {string} DELETE - Represents the HTTP DELETE method.
 * @property {string} PATCH - Represents the HTTP PATCH method.
 * @property {string} HEAD - Represents the HTTP HEAD method.
 * @property {string} OPTIONS - Represents the HTTP OPTIONS method.
 * @property {string} TRACE - Represents the HTTP TRACE method.
 * @property {string} CONNECT - Represents the HTTP CONNECT method.
 */

/**
 * @typedef {'text'|'javascript'|'json'|'formData'|'buffer'|'graphql'} RequestBodyType
 */

/**
 * HyperCloud Initialized Request
 * @typedef {object} InitializedRequest
 * @prop {string} id A unique request ID
 * @prop {string} ip The IPv4 address of the client making the request. Example: ```172.15.47.118```.
 * @prop {'http'|'https'} protocol The protocol this request is sent over.
 * @prop {string} host The full domain of a request. E.g.: ```nasriya.net``` or ```auth.nasriya.net```.
 * @prop {string} subDomain The subdomain of the `host`. Example URL: `https://auth.nasriya.net` => `subDomain = 'auth'`.
 * @prop {string} domain The `host`'s domain. Example: `https://auth.nasriya.net` => `domain = nasriya.net`
 * @prop {string} baseUrl The base URL of the host. It consists of the ```protocol``` and the ```protocol```. Example: ```https://nasriya.net```.
 * @prop {string[]} path The path of the URL, for example, a url of ```/support/faq``` corresponds to ```['support', 'faq']```.
 * @prop {object} query The query parameters of the URL. Example: ```/products/search?sku=random&lessThan=20``` produces ```{sku: 'random', lessThan: '20'}```.
 * @prop {string} href The full URL, including the ```protocol```, ```baseUrl```, ```path```, and ```query```. Example: ```https://nasriya.net/support?ticket=randomTicketID&lang=en```.
 * @prop {RequestBodyType} bodyType The type of the recieved data
 * @prop {string|object| Buffer} body The recieved data
 * @prop {object} cookies The request cookies
 * @prop {object} params The parameters of dynamic requests
 * @prop {HyperCloudServer} server A reference to the original server
 */

/**
 * @typedef {object} ProtocolsOptions
 * @prop {object} http
 * @prop {number} http.port
 * @prop {function} [http.callback]
 * @prop {boolean} http.enabled
 * @prop {object} https
 * @prop {number} https.port
 * @prop {function} [https.callback]
 * @prop {boolean} https.enabled
 */

/**
 * @typedef {object} SSLOptions
 * @prop {string} email The maintainer email address. This must be consistent.
 * @prop {string[]} domains The domain(s) you want to add. At least one.
 * @prop {boolean} self_signed Whether you want to use a self-signed certificate or not. You can use this option if you're using a self-hosted proxy manager (on the same server) that handles SSL for you.
 * @prop {boolean} staging If ```self_signed``` is set to ```false```, this option has no effect. Enable this option to request a valid testing SSL certificate from Let's Encrypt.
 * @prop {string} certName Bind the issued certificate to this name - used the ```name``` in the ```package.json``` of the project.
 * @prop {string} storePath The path you choose to store the SSL certificate and private key
 */

/**
 * @typedef {object} SSLCredentials
 * @prop {string} cert The certificate to be used
 * @prop {string} key The private key to be used
 */

/**
 * @typedef {object} SSLConfigs
 * @prop {string} cert
 * @prop {string} key
 * @prop {boolean} self_signed
 * @prop {boolean} staging
 * @prop {string} email
 * @prop {string[]} domains
 * @prop {string} certName Bind the issued certificate to this name - used the ```name``` in the ```package.json``` of the project
 * @prop {string} storePath The path to store the SSL certificate and private key
 */

/**
 * @typedef {object} HyperCloudConfigs
 * @prop {Protocols} protocols The protocols you want your server to run on
 * @prop {SSLOptions | SSLCredentials} ssl The SSL configurations
 * @prop {boolean} secure A property determined by whether the server was configured on HTTPS or not
 * @prop {boolean} staging Set ```staging``` to true if you want to to generate staging certificates from Let's Encrypt to avoid being banned
 * @prop {boolean} verbose Determain whether you want to add extra error details to the console
 * @prop {boolean} initialized
 */

/**
 * @typedef {object} Protocols
 * @prop {Protocol} http Define the http protocol
 * @prop {Protocol} https Define the https protocol
 */
/**
 * @typedef {object} Protocol
 * @prop {number} port Specify the port number of the protocol
 * @prop {function} [callback] Pass a callback function to run when the server starts listening
 */
/**
 * @typedef {object} HyperCloudSystem
 * @prop {http2.Http2SecureServer} httpsServer
 * @prop {http.Server} httpServer
 * @prop {SSLManager} SSL
 */

/**
 * Initialize this server with a configuration file
 * @typedef {object} HyperCloudInitFile
 * @prop {string} path A ```JSON``` configuration file to initialize the server
 */

/**
 * Manually configure the server
 * @typedef {object} HyperCloudInitOptions
 * @prop {ProtocolsOptions} protocols Specify the protocols you want your server to run on
 * @prop {SSLOptions | SSLCredentials} [ssl] Configure the SSL certificate. These configurations are required if you want to use a secure connection
 * @prop {object} [proxy] If your server is running behind a reverse proxy, add it's IP address to get the true IP address of the client. When provided, the server will use the ```X-Forward-For``` header to get the IP address.
 * @prop {string[]} [proxy.trusted_proxies] Set the IP address of your reverse proxy(ies)
 * @prop {boolean} [proxy.isDockerContainer] Set this to ```true``` if your proxy is running in a docker container.
 * @prop {boolean} [proxy.isLocal] Set this to ```true``` if the proxy is running on your machine. This usually means that you can access it via ```localhost``` and a port in the browser.
 */

/**
 * @typedef {object} HyperCloudManagementOptions
 * @prop {boolean} [saveConfig] Turn this on if you want to save your configurations. You need to pass ```HyperCloudInitOptions``` for this field to be checked. If you want to specify the directory where you want to store the configurations, you can pass it to the ```configPath``` property.
 * @prop {string} [configPath] An absolute path to the folder where you want to save the configurations
 */

/**
 * @typedef {object} HyperCloudRouterOptions
 * @prop {'*'|string} [subdomains] Specify the subdomain this router works on. Default: ```'*'```.
 * @prop {boolean} [caseSensitive] When enabled, ```/auth``` is treated the same as ```/Auth```. Default: ```false```.
 */

module.exports = {}