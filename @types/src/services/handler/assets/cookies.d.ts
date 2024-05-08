import HyperCloudResponse from './response';
import { CookieOptions } from '../../../docs/docs';

declare class Cookies {
    constructor(res: HyperCloudResponse);

    /**
     * Create a cookie on the browser
     * @param name The name of the cookie
     * @param value The value of the cookie
     * @param options Customize the cookie with options
     * @returns {HyperCloudResponse}
     */
    create(name: string, value: string, options?: CookieOptions): HyperCloudResponse;

    /**
     * Instruct the browser to delete a cookie
     * @param name The name of the cookie to delete
     * @returns {HyperCloudResponse}
     */
    delete(name: string): HyperCloudResponse;

    /**
     * Get a list of all the created cookies
     */
    readonly list: string[];
}

export default Cookies;
