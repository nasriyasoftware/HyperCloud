import { bodyParser, getClientIP, cookieParser } from './assets/handlerHelpers';
import HyperCloudRequest from './assets/request';
import HyperCloudResponse from './assets/response';
import tldts from 'tldts';
import { TLSSocket } from 'tls';
import helpers from '../../utils/helpers';
class Initializer {
    /**
     * A function to initialize the request, parse some data, and so on.
     * @param {HyperCloudServer} server
     * @param {http2.Http2ServerRequest} req
     * @param {object} options Initialization options
     * @param {string[]} [options.trusted_proxies] The IP address of the trusted proxy. This is needed in order to get the correct IP address of the client
     * @returns {Promise<HyperCloudRequest>}
     */
    async createRequest(server, req, options) {
        /**@type {InitializedRequest} */
        const request = Object.seal({
            server,
            id: null,
            ip: getClientIP(req, options?.trusted_proxies || []),
            protocol: null,
            host: null,
            subDomain: null,
            domain: null,
            baseUrl: null,
            path: [],
            query: {},
            href: null,
            bodyType: null,
            body: null,
            cookies: cookieParser(req.headers['cookie']),
            params: {}
        });
        // @ts-ignore
        request.id = req.id;
        request.protocol = (() => {
            if (req.socket instanceof TLSSocket) {
                return req.socket.encrypted ? 'https' : 'http';
            }
            else {
                return 'http';
            }
        })();
        request.host = (() => {
            const authority = req.headers[':authority'];
            if (helpers.is.validString(authority)) {
                return authority;
            }
            if (helpers.is.validString(req.headers.host)) {
                return req.headers.host;
            }
            return 'UnknownHost';
        })();
        request.baseUrl = `${request.protocol}://${request.host}`;
        request.href = `${request.baseUrl}${req.url}`;
        const parsed = new URL(request.href);
        request.query = Object.fromEntries(parsed.searchParams);
        request.path = parsed.pathname.split('/').filter(i => i.length > 0);
        const parsedTldts = tldts.parse(request.href);
        request.domain = typeof parsedTldts.domain === 'string' ? parsedTldts.domain : request.ip;
        // console.log(parsedTldts.domain, request.domain)
        request.subDomain = parsedTldts.subdomain || undefined;
        const contentLength = (() => {
            const contentLengthHeader = req.headers['content-length'] || '';
            if (helpers.is.validString(contentLengthHeader)) {
                const contentLength = parseInt(contentLengthHeader, 10);
                if (!isNaN(contentLength)) {
                    return contentLength;
                }
            }
            return 0;
        })();
        const bodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'];
        if (bodyMethods.includes(req.method) && contentLength > 0) {
            // Get the Content-Type header from the request
            const contentType = req.headers['content-type'];
            if (contentType) {
                // Check if the Content-Type header is present
                if (contentType.includes('text/plain') ||
                    contentType.includes('application/json') ||
                    contentType.includes('application/javascript') ||
                    contentType.includes('text/html') ||
                    contentType.includes('application/xml') ||
                    contentType.includes('application/graphql')) {
                    req.setEncoding('utf8'); // Set encoding to interpret buffer as a string
                }
                else {
                    req.setEncoding('binary'); // Other types of data
                }
                // Read and accumulate the request body
                req.on('data', (chunk) => {
                    request.body = request.body ? request.body : '' + chunk;
                });
                const requestEnd = new Promise((resolve, reject) => {
                    try {
                        // When the entire request body has been received
                        req.on('end', () => {
                            const { body, bodyType } = bodyParser(request.body, contentType);
                            request.bodyType = bodyType;
                            if (body) {
                                request.body = body;
                            }
                            resolve(undefined);
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
                await requestEnd.then();
            }
        }
        return Promise.resolve(new HyperCloudRequest(request, req));
    }
    /**
     * A function to create a response from the ```HyperCloudRequest``` and the ```Http2ServerResponse```.
     * @param {HyperCloudServer} server
     * @param {HyperCloudRequest} req
     * @param {http2.Http2ServerResponse} res
     * @returns {HyperCloudResponse}
     */
    createResponse(server, req, res) {
        return new HyperCloudResponse(server, req, res);
    }
}
export default new Initializer();
