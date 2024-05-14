/// <reference types="node" />
import { RequestBodyType } from '../../../docs/docs';
import http2 from 'http2';
/**
 * Convert the query back to string
 * @param {string} q The query object
 */
export declare function buildQuery(q: string): string;
export declare function cookieParser(rawCookieHeader: any): Record<string, any>;
/**
 * Parse the request body
 * @param {any} body
 * @param {string} contentType
 * @returns {BodyParserResult}
 */
export declare function bodyParser(body: any, contentType: string): BodyParserResult;
/**
 * Extract the IP address from the request. If priority of chosing the IP is: 1) `X-Real-IP`, 2) `x-forwarded-for`, and 3) The actual remote address
 * @param {http2.Http2ServerRequest} req The HTTP2 request
 * @param {string[]} [trusted_proxies] The trusted proxy IPs
 * @returns {string}
*/
export declare function getClientIP(req: http2.Http2ServerRequest, trusted_proxies: string[]): string;
interface BodyParserResult {
    body: any;
    bodyType: RequestBodyType;
}
export {};
