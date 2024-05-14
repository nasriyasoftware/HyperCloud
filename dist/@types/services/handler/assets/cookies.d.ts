import HyperCloudResponse from './response';
import { CookieOptions } from '../../../docs/docs';
declare class Cookies {
    #private;
    constructor(res: HyperCloudResponse);
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
    create(name: string, value: string, options?: CookieOptions): HyperCloudResponse;
    /**
     * Instruct the browser to delete a cookie
     * @param {string} name The name of the cookie to delete
     * @returns {HyperCloudResponse}
     */
    delete(name: string): HyperCloudResponse;
    /**
     * Get a list of all the created cookies
     */
    get list(): string | string[] | undefined;
}
export default Cookies;
