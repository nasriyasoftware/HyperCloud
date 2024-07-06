import { RequestBodyType } from '../../../docs/docs';
import helpers from '../../../utils/helpers';
import http2 from 'http2';
import RequestBody from './requestBody';

/**
 * Convert the query back to string
 * @param {string} q The query object
 */
export function buildQuery(q: string) {
    let query = '';
    for (const [key, value] of Object.entries(q)) {
        if (query.length > 0) { query = `${query}&` }
        query = `${query}${key}=${value}`
    }

    return Object.keys(query).length > 0 ? `?${query}` : '';
}

export function cookieParser(rawCookieHeader: any): Record<string, any> {
    // Parse the raw cookie header into an object
    const cookies = {} as Record<string, string>;
    if (rawCookieHeader && typeof rawCookieHeader === 'string') {
        rawCookieHeader.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            const name = (parts.shift() as string).trim();
            const value = decodeURIComponent(parts.join('=')).trim();
            cookies[name] = value;
        });
    }

    return cookies;
}

/**
 * Parse the request body
 * @param {any} body 
 * @param {string} contentType
 * @returns {BodyParserResult}
 */
export function bodyParser(body: any, contentType: string): BodyParserResult {
    /**@type {BodyParserResult} */
    const request: BodyParserResult = { body, bodyType: null as unknown as RequestBodyType }
    // Handle different types of bodies
    if (contentType.includes('text/plain') || contentType.includes('text/html') || contentType.includes('application/xml')) {
        request.bodyType = 'text';
        return request;
    }

    if (contentType.includes('application/javascript')) {
        request.bodyType = 'javascript';
        return request;
    }

    if (contentType.includes('application/json')) {
        try {
            const jsonData = JSON.parse(request.body);
            request.body = new RequestBody().from(jsonData)         
            request.bodyType = 'json';
            return request;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            throw error;
        }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
        // Parse the form data
        const sections = (request.body.split('&') as string[]).filter(i => i.length > 0);
        const body = new RequestBody();
        for (const section of sections) {
            const [key, value] = section.split('=');
            body.set(key, value)
        }

        request.body = body._toJSON();
        request.bodyType = 'json'
        return request;
    }

    if (contentType.includes('application/octet-stream')) {
        request.bodyType = 'buffer';
        console.log('Binary data:', request.body);
        // Handle binary data
        return request;

    }

    if (contentType.includes('application/graphql')) {
        request.bodyType = 'graphql';
        return request;
    }

    if (request.body.includes('Content-Disposition: form-data; name=')) {
        // Handle 'form-data'
        const body = {} as Record<string, any>; // The new body
        const newLine = '%0D%0A';
        let all = encodeURIComponent(request.body);
        const lines = all.split(newLine);
        let processingIndex = 0;
        let lastKey; // Used to track multi-line files

        while (processingIndex < lines.length - 2) {
            let processed = 0;
            const item = { type: '', key: '', value: '', filename: undefined as unknown as string }

            if (lines[processingIndex].startsWith('----------------------------')) {
                // Ignore the dashes line: lines[processingIndex] and increase the number of processed lines
                processingIndex++;
                continue;
            }

            const dispositionLine = lines[processingIndex];
            const disposition = decodeURIComponent(dispositionLine).split(';').map(i => i.trim());

            if (disposition.length === 1) {
                const value = disposition[0];
                if (lastKey) { body[lastKey].value += value.length === 0 ? '\n' : `\n${value}` }
                processed++;
            } else {
                if (lastKey) {
                    body[lastKey].value = body[lastKey].value.trim();
                    lastKey = null;
                }

                item.key = disposition[1].replace('name=', '').replace(/"/g, '').trim();
                if (disposition.length > 2) {
                    item.filename = disposition[2].replace('filename=', '').replace(/"/g, '').trim();
                    processed++;

                    item.type = decodeURIComponent(lines[processingIndex + processed]).replace('Content-Type:', '').replace(/"/g, '').trim();
                    processed++;

                    lastKey = item.key; // This key will be used to append the next lines of the file
                } else {
                    item.type = 'text/plain';
                    processed++;

                    let next
                    do {
                        next = lines[processingIndex + processed];
                        processed++;
                    } while (next.length === 0)

                    item.value = next;
                }

                const assign = { type: item.type, value: item.value.trim(), name: undefined as string | undefined }
                if (item.filename) { assign.name = item.filename }
                body[item.key] = assign;
                processed++;
            }

            processingIndex += processed;
        }

        if (lastKey) {
            body[lastKey].value = body[lastKey].value.trim();
            lastKey = null;
        }

        request.body = new RequestBody().from(body);
        request.bodyType = 'formData';
        return request;
    }

    console.log('Raw data:\n', request.body);
    // Handle other types of raw data
    request.bodyType = 'buffer';
    return request;
}

/**
 * Extract the IP address from the request. If priority of chosing the IP is: 1) `X-Real-IP`, 2) `x-forwarded-for`, and 3) The actual remote address
 * @param {http2.Http2ServerRequest} req The HTTP2 request
 * @param {string[]} [trusted_proxies] The trusted proxy IPs
 * @returns {string}
*/
export function getClientIP(req: http2.Http2ServerRequest, trusted_proxies: string[]): string {
    const local_ips = helpers.getLocalIPs();
    trusted_proxies = [...new Set([...trusted_proxies, ...local_ips])];
    trusted_proxies.sort();

    /**The `X-Real-IP` (if present) */
    const realIP = (() => {
        if (req.headers['X-Real-IP']) {
            const xReal = req.headers['X-Real-IP'];
            const real = Array.isArray(xReal) ? xReal[0] : xReal;
            if (helpers.validate.ipAddress(real)) {
                return real === '::1' ? local_ips[0] : real;
            } else {
                helpers.printConsole(`The value of the 'X-Real-IP' header is invalid. Expected a valid IP address but got ${real}`);
            }
        }

        return null;
    })();

    // If real IP found, return it.
    if (realIP) { return realIP }

    /**The `remoteAddress` IP */
    const remoteAddress = (() => {
        if (req.socket.remoteAddress === '::1') { return local_ips[0] }
        if (req.socket.remoteAddress?.includes('::ffff:')) { return req.socket.remoteAddress.replace('::ffff:', '') }
        return req.socket.remoteAddress || 'UnknownIP';
    })()

    if (Array.isArray(trusted_proxies) && trusted_proxies.includes(remoteAddress)) {
        // Check if the request has the X-Forwarded-For header
        const forwardedFor = req.headers['x-forwarded-for'];
        if (typeof forwardedFor === 'string' && helpers.is.validString(forwardedFor)) {
            // The header may contain multiple IP addresses separated by commas
            // The client's IP address is usually the first one in the list
            const ipAddresses = forwardedFor.split(',');
            return ipAddresses[0].trim();
        } else if (Array.isArray(forwardedFor)) {
            return forwardedFor[0];
        }
    }

    // If the X-Forwarded-For header is not present, fallback to the remote address
    return remoteAddress;
}

interface BodyParserResult {
    body: any;
    bodyType: RequestBodyType
}
