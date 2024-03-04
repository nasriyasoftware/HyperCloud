const http2 = require('http2');
const { bodyParser, getClientIP, cookieParser, buildQuery } = require('./assets/helpers.js');
const HyperCloudServer = require('../../server.js');
const HyperCloudRequest = require('./assets/request.js');
const HyperCloudResponse = require('./assets/response.js');
const Docs = require('../../utils/docs.js')
const tldts = require('tldts');
const url = require('url');

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
        /**@type {Docs.InitializedRequest} */
        const request = Object.seal({
            server,
            id: null,
            ip: getClientIP(req, options?.trusted_proxies),
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
        })

        request.id = req.id;        
        request.protocol = req.socket.encrypted ? 'https' : 'http'
        request.host = req.headers[':authority'] || req.headers.host;
        request.baseUrl = `${request.protocol}://${request.host}`;
        request.href = `${request.baseUrl}${req.url}`;

        const parsed = new URL(request.href)
        request.query = Object.fromEntries(parsed.searchParams)
        request.path = parsed.pathname.split('/').filter(i => i.length > 0);
        const parsedTldts = tldts.parse(request.href);
        request.domain = typeof parsedTldts.domain === 'string' ? parsedTldts.domain : request.ip; 
        // console.log(parsedTldts.domain, request.domain)
        request.subDomain = parsedTldts.subdomain

        const bodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT']
        if (bodyMethods.includes(req.method) && req.headers['content-length'] > 0) {
            // Get the Content-Type header from the request
            const contentType = req.headers['content-type'];

            if (contentType) {
                // Check if the Content-Type header is present
                if (contentType.includes('text/plain') ||
                    contentType.includes('application/json') ||
                    contentType.includes('application/javascript') ||
                    contentType.includes('text/html') ||
                    contentType.includes('application/xml') ||
                    contentType.includes('application/graphql')
                ) {
                    req.setEncoding('utf8'); // Set encoding to interpret buffer as a string
                } else {
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
                            if (body) { request.body = body }
                            resolve();
                        });
                    } catch (error) {
                        reject(error);
                    }
                })

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

module.exports = new Initializer();