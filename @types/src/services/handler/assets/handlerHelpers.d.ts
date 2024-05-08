import { RequestBodyType } from '../../../docs/docs';
import http2 from 'http2';

/**
 * Convert the query back to string
 * @param q The query object
 */
export declare function buildQuery(q: string): string;

/**
 * Parse the request body
 * @param body 
 * @param contentType
 * @returns BodyParserResult
 */
export declare function bodyParser(body: any, contentType: string): BodyParserResult;

/**
 * Extract the IP address from the request. If priority of chosing the IP is: 1) `X-Real-IP`, 2) `x-forwarded-for`, and 3) The actual remote address
 * @param req The HTTP2 request
 * @param trusted_proxies The trusted proxy IPs
 * @returns string
 */
export declare function getClientIP(req: http2.Http2ServerRequest, trusted_proxies: string[]): string;

export interface BodyParserResult {
    body: any;
    bodyType: RequestBodyType;
}

export declare function cookieParser(rawCookieHeader: any): Record<string, any>;