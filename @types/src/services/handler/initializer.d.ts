import http2 from 'http2';
import HyperCloudServer from '../../server';
import HyperCloudRequest from './assets/request';
import HyperCloudResponse from './assets/response';

declare class Initializer {
    /**A function to initialize the request, parse some data, and so on.  */
    createRequest(server: HyperCloudServer, req: http2.Http2ServerRequest, options?: { trusted_proxies?: string[]; }): Promise<HyperCloudRequest>;
    /**A function to create a response from the `HyperCloudRequest` and the `Http2ServerResponse`. */
    createResponse(server: HyperCloudServer, req: HyperCloudRequest, res: http2.Http2ServerResponse): HyperCloudResponse;
}

export default Initializer;