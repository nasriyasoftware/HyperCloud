const http2 = require('http2');
const { InitializedRequest } = require('./docs');
const helpers = require('../../../utils/helpers');

/**This class is used internallly, not by the user */
class HyperCloudRequest {
    /**@type {InitializedRequest} */
    #request;
    /**@type {http2.Http2ServerRequest} */
    #req;
    #params = {}

    /**
     * @param {InitializedRequest} request 
     * @param {http2.Http2ServerRequest} req 
     */
    constructor(request, req) {
        this.#request = request;
        this.#req = req;
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

    toString() {
        return JSON.stringify({
            id: this.id,
            ip: this.ip,
            protocol: this.protocol,
            host: this.host,
            domain: this.domain,
            subDomain: this.subDomain,
            baseUrl: this.baseUrl,
            path: `/${this.path.join('/')}`,
            query: `${Object.keys(this.query).length > 0 ? '?' : ''}${Object.keys(this.query).map(prop => {
                return `${prop}=${this.query[prop]}`;
            }).join('&')}`,
            href: this.href
        }, null, 4)
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
}

module.exports = HyperCloudRequest