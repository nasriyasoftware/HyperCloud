import HyperCloudResponse from './response';
import { CookieOptions } from '../../../docs/docs';
import ms from 'ms';

class Cookies {
    private readonly _response: HyperCloudResponse;

    constructor(res: HyperCloudResponse) {
        this._response = res;
    }

    /**
     * Create a cookie on the browser
     * 
     * **Examples**
     * 
     * ```js
     * server.use('*', (request, response) => {
     *      // Create a session until the tab is closed
     *      response.cookies.create('session_id', 'session_jwt', {
     *          httpOnly: true,
     *          secure: true,
     *          priority: 'High'
     *      })
     * })
     * ```
     * @param {string} name The name of the cookie
     * @param {string} value The value of the cookie
     * @param {CookieOptions} [options] Customize the cookie with options
     * @returns {HyperCloudResponse}
     */
    create(name: string, value: string, options?: CookieOptions): HyperCloudResponse {
        const cookie: string[] = [];
        const ONEYEAR = 31_536_000_000; // in ms

        try {
            if (typeof name !== 'string') { throw new TypeError(`The cookie name should be a string. Instead got ${typeof name}`) }
            if (name.length === 0) { throw `The cookie name cannot be empty` }
            if (typeof value !== 'string') { throw new TypeError(`The cookie value should be a string. Instead got ${typeof value}`) }
            if (value.length === 0) { throw `The cookie value cannot be empty` }

            cookie.push(`${name}=${value}`)

            if (options && 'secure' in options) {
                if (typeof options.secure !== 'boolean') { throw new TypeError(`The "secure" option expects a boolean value. Instead got ${typeof options.secure}`) }
                if (options.secure === true) { cookie.push('Secure') }
            }

            if (options && 'httpOnly' in options) {
                if (typeof options.httpOnly !== 'boolean') { throw new TypeError(`The "httpOnly" option expects a boolean value. Instead got ${typeof options.httpOnly}`) }
                if (options.httpOnly === true) { cookie.push('HttpOnly') }
            }

            if (options && 'maxAge' in options) {
                if (!(typeof options.maxAge === 'number' || typeof options.maxAge === 'string')) { throw new TypeError(`The "maxAge" value should either be a number of milliseconds or a string.`) }

                if (typeof options.maxAge === 'string') {
                    if ((options.maxAge as string).length === 0) { throw new SyntaxError(`The maxAge string value cannot be empty`) }
                    const value = ms(options.maxAge);
                    if (typeof value !== 'number') { throw new SyntaxError(`${options.maxAge} is not a valid maxAge value`) }
                    options.maxAge = value;
                }

                if (options.maxAge < 0) { throw new RangeError(`The maxAge cannot be a negative value`) }
                if (options.maxAge > ONEYEAR) { throw new RangeError(`The maxAge value should not be more than one year`) }

                cookie.push(`Max-Age=${options.maxAge}`);
            }

            if (options && 'domain' in options) {
                if (typeof options.domain !== 'string') { throw new TypeError(`The "domain" value should be a string. Instead got ${typeof options.domain}`) }
                cookie.push(`Domain=${options.domain}`)
            }

            if (options && 'path' in options) {
                if (typeof options.path !== 'string') { throw new TypeError(`The "path" option is expecting a string value, but instead got ${typeof options.path}`) }
                cookie.push(`Path=${options.path}`);
            }

            if (options && 'expires' in options) {
                if (!(options.expires instanceof Date)) { throw new TypeError(`The "expires" option is expecting a Date instance, but instead got ${typeof options.expires}`) }
                const now = new Date();
                if (now > options.expires) { throw `The "Expires" value cannot be in the past` }
                cookie.push(`Expires=${options.expires.toUTCString()}`);
            }

            if (options && 'sameSite' in options) {
                if (typeof options.sameSite !== 'string') { throw new TypeError(`The "sameSite" option is expecting a string value, but instead got ${typeof options.sameSite}`) }
                const x = ['Strict', 'Lax', 'None'];
                if (!x.includes(options.sameSite)) { throw new RangeError(`The ${options.sameSite} is not a valid "sameSite". Valid options are: ${x.join(', ')}.`) }
                if (options.sameSite === 'None') {
                    if (options?.secure !== true) { throw new SyntaxError(`The "sameSite" value cannot be set to "None" unless you also set the "secure" option to true`) }
                }

                cookie.push(`SameSite=${options.sameSite}`);
            }

            if (options && 'priority' in options) {
                if (typeof options.priority !== 'string') { throw new TypeError(`The "priority" option can only be a string, instead got ${typeof options.priority}`) }
                const x = ['High', 'Medium', 'Low'];
                if (!x.includes(options.priority)) { throw new RangeError(`The provided "priority" value (${options.priority}) is not a valid priority option. Valid options are: ${x.join(', ')}.`) }
                cookie.push(`Priority=${options.priority}`)
            }

            this._response.setHeader('Set-Cookie', cookie.join('; '));
            return this._response;
        } catch (error) {
            if (typeof error === 'string') { error = `Unable to create cookie: ${error}` }
            if (typeof error?.messasge === 'string') { error.message = `Unable to create cookie: ${error.message}` }
            throw error;
        }
    }

    /**
     * Instruct the browser to delete a cookie
     * @param {string} name The name of the cookie to delete
     * @returns {HyperCloudResponse}
     */
    delete(name: string): HyperCloudResponse {
        if (typeof name !== 'string' || name?.length === 0) { throw `(${name}) is not a valid cookie name` }
        this._response.setHeader('Set-Cookie', `${name}=deleted; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`);
        return this._response;
    }

    /**
     * Get a list of all the created cookies
     */
    get list() { return this._response.getHeaders()['set-cookie'] }
}

export default Cookies;