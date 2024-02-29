const HyperCloudResponse = require('./response');

class HTTPResponse {
    /**@type {HyperCloudResponse} */
    #response;

    /**@param {HyperCloudResponse} */
    constructor(res) { this.#response = res }

    get '20x'() {
        return Object.freeze({
            /**
             * **200 - OK**
             * 
             * Standard response for successful HTTP requests. The actual response will
             * depend on the request method used. In a GET request, the response will
             * contain an entity corresponding to the requested resource. In a POST request,
             * the response will contain an entity describing or containing the result
             * of the action.
             */
            ok: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **201 - Created**
             * 
             * The request has been fulfilled, resulting in the creation of a new resource.
             */
            created: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(201).render(name, options);
                }
            },
            /**
             * **202 - Accepted**
             * 
             * The request has been accepted for processing, but the processing has not
             * been completed. The request might or might not eventually be acted upon,
             * as it might be disallowed when processing actually takes place.
             */
            accepted: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(202).render(name, options);
                }
            },
            /**
             * **203 - Non-Authoritative Information**
             * 
             * The server is a transforming proxy (e.g. a Web accelerator) that received
             * a 200 OK from its origin, but is returning a modified version of the origin's
             * response.
             */
            nonAuthoritativeInformation: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(203).render(name, options);
                }
            },
            /**
             * **204 - No Content**
             * 
             * The server successfully processed the request and is not returning any content.
             */
            noContent: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(204).render(name, options);
                }
            },
            /**
             * **205 - Reset Content**
             * 
             * The server successfully processed the request, but is not returning any
             * content. Unlike a 204 response, this response requires that the requester
             * reset the document view.
             */
            resetContent: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(205).render(name, options);
                }
            },
            /**
             * **206 - Partial Content**
             * 
             * The server is delivering only part of the resource (byte serving) due to
             * a range header sent by the client. The range header is used by HTTP clients
             * to enable resuming of interrupted downloads, or split a download into multiple
             * simultaneous streams.
             */
            partialContent: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(206).render(name, options);
                }
            },
            /**
             * **207 - Multi-Status**
             * 
             * The message body that follows is by default an XML message and can contain
             * a number of separate response codes, depending on how many sub-requests
             * were made.
             */
            multiStatus: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(207).render(name, options);
                }
            },
            /**
             * **208 - Already Reported**
             * 
             * The members of a DAV binding have already been enumerated in a preceding
             * part of the (multistatus) response, and are not being included again.
             */
            alreadyReported: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(208).render(name, options);
                }
            },
            /**
             * **226 - IM Used**
             * 
             * The server has fulfilled a request for the resource, and the response is
             * a representation of the result of one or more instance-manipulations applied
             * to the current instance.
             */
            imUsed: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(226).render(name, options);
                }
            },
        })
    }

    get '30x'() {
        return Object.freeze({
            /**
             * **300 - Multiple Choices**
             * 
             * Indicates multiple options for the resource from which the client may choose
             * (via agent-driven content negotiation). For example, this code could be used
             * to present multiple video format options, to list files with different filename
             * extensions, or to suggest word-sense disambiguation.
             */
            multipleChoices: (url) => {

            },
            /**
             * **301 - Moved Permanently**
             * 
             * This and all future requests should be directed to the given URI.
             */
            movedPermanently: (url) => {

            },
            /**
             * **302 - Found (Previously "Moved temporarily")**
             * 
             * Tells the client to look at (browse to) another URL. 302 has been superseded
             * by 303 and 307. This is an example of industry practice contradicting the
             * standard. The HTTP/1.0 specification (RFC 1945) required the client to
             * perform a temporary redirect (the original describing phrase was "Moved
             * Temporarily"), but popular browsers implemented 302 with the functionality
             * of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307 to
             * distinguish between the two behaviours. However, some Web applications and
             * frameworks use the 302 status code as if it were the 303.
             */
            found: (url) => {

            },
            /**
             * **303 - See Other**
             * 
             * The response to the request can be found under another URI using the GET method.
             * When received in response to a POST (or PUT/DELETE), the client should presume
             * that the server has received the data and should issue a redirect with a separate GET message.
             */
            seeOther: (url) => {

            },
            /**
             * **304 - Not Modified**
             * 
             * Indicates that the resource has not been modified since the version specified
             * by the request headers If-Modified-Since or If-None-Match. In such case,
             * there is no need to retransmit the resource since the client still has a
             * previously-downloaded copy.
             */
            notModified: (url) => {

            },
            /**
             * **305 - Use Proxy**
             * 
             * The requested resource is available only through a proxy, the address for
             * which is provided in the response. For security reasons, many HTTP clients
             * (such as Mozilla Firefox and Internet Explorer) do not obey this status code.
             */
            useProxy: (url) => {

            },
            /**
             * **306 - Switch Proxy**
             * 
             * No longer used. Originally meant "Subsequent requests should use the specified
             * proxy."
             */
            switchProxy: (url) => {

            },
            /**
             * **307 - Temporary Redirect**
             * 
             * In this case, the request should be repeated with another URI; however, future
             * requests should still use the original URI. In contrast to 303, the request
             * method should not be changed when reissuing the original request. For instance,
             * a POST request must be repeated using another POST request.
             */
            temporaryRedirect: (url) => {

            },
            /**
             * **308 - Permanent Redirect**
             * 
             * The request and all future requests should be repeated using another URI. 307
             * and 308 parallel the behaviours of 302 and 301, but do not allow the HTTP
             * method to change. So, for example, submitting a form to a permanently redirected
             * resource may continue smoothly.
             */
            permanentRedirect: (url) => {

            },
            // Add more 30x responses as needed
        })
    }

    get '40x'() {
        return Object.freeze({
            /**
             * **400 - Bad Request**
             * 
             * The server cannot or will not process the request due to an apparent client
             * error (e.g., malformed request syntax, size too large, invalid request
             * message framing, or deceptive request routing).
             */
            badRequest: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **401 - Unauthorized**
             * 
             * Similar to 403 Forbidden, but specifically for use when authentication is
             * required and has failed or has not yet been provided. The response must include
             * a WWW-Authenticate header field containing a challenge applicable to the requested
             * resource. See Basic access authentication and Digest access authentication.
             * 401 semantically means "unauthorised", the user does not have valid authentication
             * credentials for the target resource.
             * 
             * Some sites incorrectly issue HTTP 401 when an IP address is banned from the website
             * (usually the website domain) and that specific address is refused permission to access a website.
             */
            unauthorized: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **403 Forbidden**
             * 
             * The request contained valid data and was understood by the server, but the
             * server is refusing action. This may be due to the user not having the
             * necessary permissions for a resource or needing an account of some sort,
             * or attempting a prohibited action (e.g. creating a duplicate record where
             * only one is allowed). This code is also typically used if the request
             * provided authentication by answering the WWW-Authenticate header field
             * challenge, but the server did not accept that authentication. The request
             * should not be repeated.
             */
            forbidden: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **404 Not Found**
             * 
             * The requested resource could not be found but may be available in the future.
             * Subsequent requests by the client are permissible.
             */
            notFound: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **405 Method Not Allowed**
             * 
             * A request method is not supported for the requested resource; for example,
             * a GET request on a form that requires data to be presented via POST, or
             * a PUT request on a read-only resource.
             */
            methodNotAllowed: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **406 Not Acceptable**
             * 
             * The requested resource is capable of generating only content not acceptable
             * according to the Accept headers sent in the request.
             */
            notAcceptable: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **407 Proxy Authentication Required**
             * 
             * The client must first authenticate itself with the proxy.
             */
            proxyAuthenticationRequired: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **408 Request Timeout**
             * 
             * The server timed out waiting for the request. According to HTTP specifications:
             * "The client did not produce a request within the time that the server was
             * prepared to wait. The client MAY repeat the request without modifications
             * at any later time."
             */
            requestTimeout: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **409 Conflict**
             * 
             * Indicates that the request could not be processed because of conflict in
             * the request, such as an edit conflict between multiple simultaneous updates.
             */
            conflict: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **410 Gone**
             * 
             * Indicates that the resource requested is no longer available and will not
             * be available again. This should be used when a resource has been intentionally
             * removed and the resource should be purged. Upon receiving a 410 status code,
             * the client should not request the resource in the future. Clients such as
             * search engines should remove the resource from their indices.
             */
            gone: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **411 Length Required**
             * 
             * The request did not specify the length of its content, which is required
             * by the requested resource.
             */
            lengthRequired: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **412 Precondition Failed**
             * 
             * The server does not meet one of the preconditions that the requester put
             * on the request header fields.
             */
            preconditionFailed: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **413 Payload Too Large**
             * 
             * The request is larger than the server is willing or able to process. Previously
             * called "Request Entity Too Large".
             */
            payloadTooLarge: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **414 URI Too Long**
             * 
             * The URI provided was too long for the server to process. Often the result
             * of too much data being encoded as a query-string of a GET request, in which
             * case it should be converted to a POST request.
             */
            uriTooLong: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **415 Unsupported Media Type**
             * 
             * The request entity has a media type which the server or resource does not
             * support. For example, the client uploads an image as image/svg+xml, but
             * the server requires that images use a different format.
             */
            unsupportedMediaType: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **416 Range Not Satisfiable**
             * 
             * The client has asked for a portion of the file (byte serving), but the
             * server cannot supply that portion. For example, if the client asked for
             * a part of the file that lies beyond the end of the file. Called "Requested
             * Range Not Satisfiable" previously.
             */
            rangeNotSatisfiable: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **417 Expectation Failed**
             * 
             * The server cannot meet the requirements of the Expect request-header field.
             */
            expectationFailed: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **418 I'm a teapot**
             * 
             * This code was defined in 1998 as one of the traditional IETF April Fools'
             * jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected
             * to be implemented by actual HTTP servers. The RFC specifies this code should
             * be returned by teapots requested to brew coffee. This HTTP status is used
             * as an Easter egg in some websites, including Google.com.
             */
            imATeapot: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **421 Misdirected Request**
             * 
             * The request was directed at a server that is not able to produce a response
             * (for example, because a connection reuse).
             */
            misdirectedRequest: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **422 Unprocessable Entity**
             * 
             * The request was well-formed but was unable to be followed due to semantic
             * errors.
             */
            unprocessableEntity: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **423 Locked**
             * 
             * The resource that is being accessed is locked.
             */
            locked: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **424 Failed Dependency**
             * 
             * The request failed due to failure of a previous request.
             */
            failedDependency: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **426 Upgrade Required**
             * 
             * The client should switch to a different protocol such as TLS/1.0, given
             * in the Upgrade header field.
             */
            upgradeRequired: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **428 Precondition Required**
             * 
             * The origin server requires the request to be conditional. Intended to prevent
             * the 'lost update' problem, where a client GETs a resource's state, modifies
             * it, and PUTs it back to the server, when meanwhile a third party has modified
             * the state on the server, leading to a conflict.
             */
            preconditionRequired: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **429 Too Many Requests**
             * 
             * The user has sent too many requests in a given amount of time ("rate limiting").
             */
            tooManyRequests: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **431 Request Header Fields Too Large**
             * 
             * The server is unwilling to process the request because either an individual
             * header field, or all the header fields collectively, are too large.
             */
            requestHeaderFieldsTooLarge: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **451 Unavailable For Legal Reasons**
             * 
             * A server operator has received a legal demand to deny access to a resource
             * or to a set of resources that includes the requested resource. The code
             * 451 was chosen as a reference to the novel Fahrenheit 451.
             */
            unavailableForLegalReasons: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
        })
    }

    get '50x'() {
        return Object.freeze({
            /**
             * **500 - Internal Server Error**
             * 
             * A generic error message, given when an unexpected condition was encountered
             * and no more specific message is suitable.
             */
            internalServerError: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **501 - Not Implemented**
             * 
             * The server either does not recognize the request method, or it lacks the
             * ability to fulfil the request. Usually this implies future availability
             * (e.g., a new feature of a web-service API).
             */
            notImplemented: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **502 - Bad Gateway**
             * 
             * The server was acting as a gateway or proxy and received an invalid response
             * from the upstream server.
             */
            badGateway: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **503 - Service Unavailable**
             * 
             * The server cannot handle the request (because it is overloaded or down for
             * maintenance). Generally, this is a temporary state.
             */
            serviceUnavailable: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **504 - Gateway Timeout**
             * 
             * The server was acting as a gateway or proxy and did not receive a timely
             * response from the upstream server.
             */
            gatewayTimeout: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **505 - HTTP Version Not Supported**
             * 
             * The server does not support the HTTP protocol version used in the request.
             */
            httpVersionNotSupported: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **506 - Variant Also Negotiates**
             * 
             * Transparent content negotiation for the request results in a circular reference.
             */
            variantAlsoNegotiates: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **507 - Insufficient Storage**
             * 
             * The server is unable to store the representation needed to complete the request.
             */
            insufficientStorage: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **508 - Loop Detected**
             * 
             * The server detected an infinite loop while processing the request.
             */
            loopDetected: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **510 - Not Extended**
             * 
             * Further extensions to the request are required for the server to fulfil it.
             */
            notExtended: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
            /**
             * **511 - Network Authentication Required**
             * 
             * The client needs to authenticate to gain network access. Intended for use
             * by intercepting proxies used to control access to the network.
             */
            networkAuthenticationRequired: {
                json: () => { },
                /**
                * Render an `ejs` template with the provided options.
                * @param {string} name A view name (without a file extension) or an absolute path. If only a name is provided, the 
                * @param {Docs.RenderingOptions} options 
                * @returns {HyperCloudResponse}
                */
                render: (name, options) => {
                    this.#response.status(200).render(name, options);
                }
            },
        })
    }
}

module.exports = HTTPResponse;