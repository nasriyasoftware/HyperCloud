import { RandomOptions } from '../docs/docs';
declare class Helpers {
    /**Get the name if this package (project) from the `package.json` file */
    getProjectName(): string;
    /**
     * Calculate the hash value if a file
     * @param {string} filePath The file path
     * @returns {Promise<string>} The hashed value
     */
    calculateHash(filePath: string): Promise<string>;
    /**
     * Print something on the debug level
     * @param {string|any} message
     * @returns {void}
    */
    printConsole(message: string | any): void;
    readonly validate: {
        /**
         * Valdiate a currency (regardless of letter case)
         * @param {string} currency A currency to validate
         * @returns {boolean}
         */
        currency: (currency: string) => boolean;
        /**
         * Validate a locale
         * @param {string} locale A locale to validate
         * @returns {boolean}
         */
        locale: (locale: string) => boolean;
        /**
         * Validate an IPv4 or IPv6 address
         * @example
         * // Example usage:
         * console.log(validate.ipAddress('192.168.0.1')); // true
         * console.log(validate.ipAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')); // true
         * console.log(validate.ipAddress('invalid')); // false
         * @param {string} ip The IP address to validate
         * @returns {boolean}
         */
        ipAddress: (ip: string) => boolean;
        /**
         * Pass domain(s) to check whether they're valid to be used for the SSL certificate
         * @param {string|string[]} toCheck The domain(s) to check
         * @returns {boolean}
        */
        domains: (toCheck: string | string[]) => boolean;
        /**
         * Check the syntax validity of an email address
         * @param {string} email The email address to check
         * @returns {boolean}
        */
        email: (email: string) => boolean;
        /**
         * @param {string} certbotPath
         * @returns {boolean}
        */
        certbotPath: (certbotPath: string) => boolean;
        /**
         * Validate the project path
         * @param {string} projectPath
         * @returns {boolean}
         */
        projectPath: (projectPath: string) => boolean;
    };
    /**
     * Check the accessibility of a directory. This also checks whether the directory exists or not.
     * @param {string} path The path to check
     * @returns {{
     *      valid: false,
     *      errors: {
     *          isString: boolean,
     *          exist: boolean,
     *          accessible: boolean
     *      }
     * }|{ valid: true }}
     */
    checkPathAccessibility(path: string): {
        valid: false;
        errors: {
            isString: boolean;
            exist: boolean;
            accessible: boolean;
        };
    } | {
        valid: true;
    };
    /**
     * Add a message/comment to a bat file
     * @param {string} batStr The original BAT string
     * @param {string} msg The message you want to add to the BAT string
     * @returns {string} The updated BAT string
     */
    addBatMessage(batStr: string, msg: string): string;
    /**
     * Parse the request's cookies header
     * @param {string} cookiesHeader The cookies header from a request
     * @returns The cookies as an object
     */
    parseCookies(cookiesHeader: string): {};
    /**
     * Get the local IP address of the server
     * @returns {string[]} An array of local IPs
     */
    getLocalIPs(): string[];
    /**
     * Generate a random text
     * @param length The length of the text. Minimum of `4`
     * @param [options] Options for generating the text
     * @returns
     */
    generateRandom(length: number, options?: RandomOptions): string;
    readonly is: {
        /**
        * Check if a particular string is a valid HTML code
        * @param {string} string The string to check
        * @returns {boolean}
        */
        html(string: string): boolean;
        /**
         * Pass anything to check if it's an object or not
         * @param {*} obj
         * @returns {boolean}
        */
        realObject(obj: any): boolean;
        /**
         * Check whether the argument is a valid string or not
         * @param {*} str
         * @returns {boolean}
         */
        validString(str: any): boolean;
        /**
         * Check if the value is undefined
         * @param {any} arg
         * @returns {boolean}
         */
        undefined(arg: any): arg is undefined;
        integer(value: any): boolean;
    };
    /**
    * Check if a particular string is a valid HTML code
    * @param {string} string The string to check
    * @returns {boolean}
    * @deprecated Use `helpers.is.html(string)` instead. This will be removed in `v2`.
    */
    isHTML(string: string): boolean;
    /**
     * Pass anything to check if it's an object or not
     * @param {*} obj
     * @returns {boolean}
     * @deprecated Use `helpers.is.realObject(string)` instead. This will be removed in `v2`.
    */
    isRealObject(obj: any): boolean;
}
declare const _default: Helpers;
export default _default;
