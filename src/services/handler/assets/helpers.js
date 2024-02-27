const Docs = require('../../../utils/docs.js');

function cookieParser(rawCookieHeader) {
    // Parse the raw cookie header into an object
    const cookies = {};
    if (rawCookieHeader && typeof rawCookieHeader === 'string') {
        rawCookieHeader.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            const name = parts.shift().trim();
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
function bodyParser(body, contentType) {
    /**@type {BodyParserResult} */
    const request = { body, bodyType: null }
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
            request.body = jsonData;
            request.bodyType = 'json';
            return request;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return reject('Error parsing JSON:', error)
        }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
        // Parse the form data
        const sections = request.body.split('&').filter(i => i.length > 0);
        request.body = {}
        for (const section of sections) {
            const [key, value] = section.split('=');
            request.body[key] = value;
        }

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
        const body = {}; // The new body
        const newLine = '%0D%0A';
        let all = encodeURIComponent(request.body);
        const lines = all.split(newLine);
        let processingIndex = 0;
        let lastKey; // Used to track multi-line files

        while (processingIndex < lines.length - 2) {
            let processed = 0;
            const item = { type: '', key: '', value: '', filename: undefined }

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

                const assign = { type: item.type, value: item.value.trim() }
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

        request.body = body;
        request.bodyType = 'formData';
        return request;
    }

    console.log('Raw data:\n', request.body);
    // Handle other types of raw data
    request.bodyType = 'buffer';
    return request;
}

/**
 * Extract the IP address from the request. If priority of chosing the IP is: 1) ```X-Real-IP```, 2) ```x-forwarded-for```, and 3) The actual remote address
 * @param {http2.Http2ServerRequest} req The HTTP2 request
 * @param {string[]} [trusted_proxies] The trusted proxy IPs
*/
function getClientIP(req, trusted_proxies) {
    if (req.headers['X-Real-IP']) {
        const real = req.headers['X-Real-IP'];
        if (helpers.validate.ipAddress(real)) {
            return real === '::1' ? helpers.getLocalIP() : real;
        } else {
            helpers.printConsole(`The value of the 'X-Real-IP' header is invalid. Expected a valid IP address but got ${real}`);
        }
    }

    const remoteAddress = req.socket.remoteAddress === '::1' ? helpers.getLocalIP() : req.socket.remoteAddress.includes('::ffff:') ? req.socket.remoteAddress.replace('::ffff:', '') : req.socket.remoteAddress;

    if (trusted_proxies && Array.isArray(trusted_proxies) && trusted_proxies.includes(remoteAddress)) {
        // Check if the request has the X-Forwarded-For header
        const forwardedFor = req.headers['x-forwarded-for'];
        if (forwardedFor) {
            //console.log("forwardedFor", forwardedFor)
            // The header may contain multiple IP addresses separated by commas
            // The client's IP address is usually the first one in the list
            const ipAddresses = forwardedFor.split(',');
            return ipAddresses[0].trim();
        }
    }


    // If the X-Forwarded-For header is not present, fallback to the remote address
    return req.socket.remoteAddress === '::1' ? helpers.getLocalIP() : req.socket.remoteAddress.includes('::ffff:') ? req.socket.remoteAddress.replace('::ffff:', '') : req.socket.remoteAddress;
}

/**
 * @typedef {object} BodyParserResult
 * @prop {*} body
 * @prop {Docs.RequestBodyType} bodyType
 */

module.exports = { bodyParser, getClientIP, cookieParser }