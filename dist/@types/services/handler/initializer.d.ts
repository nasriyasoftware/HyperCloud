/// <reference types="node" />
import http2 from 'http2';
import HyperCloudServer from '../../server';
import HyperCloudRequest from './assets/request';
import HyperCloudResponse from './assets/response';
declare class Initializer {
    /**
     * A function to initialize the request, parse some data, and so on.
     * @param {HyperCloudServer} server
     * @param {http2.Http2ServerRequest} req
     * @param {object} options Initialization options
     * @param {string[]} [options.trusted_proxies] The IP address of the trusted proxy. This is needed in order to get the correct IP address of the client
     * @returns {Promise<HyperCloudRequest>}
     */
    createRequest(server: HyperCloudServer, req: http2.Http2ServerRequest, options: {
        trusted_proxies?: string[];
    }): Promise<HyperCloudRequest>;
    /**
     * A function to create a response from the ```HyperCloudRequest``` and the ```Http2ServerResponse```.
     * @param {HyperCloudServer} server
     * @param {HyperCloudRequest} req
     * @param {http2.Http2ServerResponse} res
     * @returns {HyperCloudResponse}
     */
    createResponse(server: HyperCloudServer, req: HyperCloudRequest, res: http2.Http2ServerResponse): HyperCloudResponse;
}
declare const _default: Initializer;
export default _default;
