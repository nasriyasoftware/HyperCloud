import http2 from 'http2';
import { bodyParser, getClientIP, cookieParser } from './assets/handlerHelpers';
import HyperCloudServer from '../../server';
import HyperCloudRequest from './assets/request';
import HyperCloudResponse from './assets/response';
import tldts from 'tldts';
import { InitializedRequest, RequestBodyType } from '../../docs/docs';
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
    async createRequest(server: HyperCloudServer, req: http2.Http2ServerRequest, options: { trusted_proxies?: string[]; }): Promise<HyperCloudRequest> {
        /**@type {InitializedRequest} */
        const request: InitializedRequest = Object.seal({
            server,
            id: null as unknown as string,
            ip: await getClientIP(req, options?.trusted_proxies || []),
            protocol: null as unknown as 'http' | 'https',
            host: null as unknown as string,
            subDomain: null as unknown as string,
            domain: null as unknown as string,
            baseUrl: null as unknown as string,
            path: [] as string[],
            query: {} as Record<string, string>,
            href: null as unknown as string,
            bodyType: null as unknown as RequestBodyType,
            body: null as unknown as string | Record<string, any> | Buffer,
            cookies: cookieParser(req.headers['cookie']),
            params: {} as Record<string, string>
        })

        // @ts-ignore
        request.id = req.id;
        request.protocol = (() => {
            if (req.socket instanceof TLSSocket) {
                return req.socket.encrypted ? 'https' : 'http'
            } else { return 'http' }
        })();

        request.host = (() => {
            const authority = req.headers[':authority'];
            if (helpers.is.validString(authority)) { return authority }
            if (helpers.is.validString(req.headers.host)) { return req.headers.host }
            return 'UnknownHost'
        })() as string;

        request.baseUrl = `${request.protocol}://${request.host}`;
        request.href = `${request.baseUrl}${req.url}`;

        const parsed = new URL(request.href)
        request.query = Object.fromEntries(parsed.searchParams)
        request.path = parsed.pathname.split('/').filter(i => i.length > 0);

        const parsedTldts = tldts.parse(request.href);
        if (typeof parsedTldts.domain === 'string') {
            request.domain = parsedTldts.domain;
        } else if (parsedTldts.isIp && parsedTldts.hostname) {
            request.domain = parsedTldts.hostname;
        } else {
            request.domain = 'UnknownDomain';
        }
        
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

        const bodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT']
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
                    contentType.includes('application/graphql')
                ) {
                    req.setEncoding('utf8'); // Set encoding to interpret buffer as a string
                } else {
                    req.setEncoding('binary'); // Other types of data
                }

                if (!contentType.includes('multipart/form-data')) {
                    // Read and accumulate the request body
                    let tempBody = '';
                    req.on('data', (chunk) => {
                        tempBody += chunk;
                    });

                    const requestEnd = new Promise((resolve, reject) => {
                        try {
                            // When the entire request body has been received
                            req.on('end', () => {
                                const { body, bodyType } = bodyParser(tempBody, contentType);
                                request.bodyType = bodyType;
                                if (body) { request.body = body }
                                resolve(undefined);
                            });
                        } catch (error) {
                            reject(error);
                        }
                    })

                    await requestEnd;
                }
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
    createResponse(server: HyperCloudServer, req: HyperCloudRequest, res: http2.Http2ServerResponse): HyperCloudResponse {
        return new HyperCloudResponse(server, req, res);
    }
}

export default new Initializer();