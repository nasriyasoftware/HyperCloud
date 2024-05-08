import { RandomOptions } from '../docs/docs';

declare class Helpers {
    /**
     * Calculate the hash value if a file
     * @param filePath The file path
     * @returns The hashed value
     */
    calculateHash(filePath: string): Promise<string>;

    /**
     * Print something on the debug level
     * @param message 
     * @returns 
     */
    printConsole(message: string | any): void;

    readonly validate: {
        /**
         * Valdiate a currency (regardless of letter case)
         * @param currency A currency to validate
         * @returns 
         */
        currency(currency: string): boolean;
        /**
         * Validate a locale
         * @param locale A locale to validate
         * @returns 
         */
        locale(locale: string): boolean;
        /**
         * Validate an IPv4 or IPv6 address
         * @param ip The IP address to validate
         * @returns 
         */
        ipAddress(ip: string): boolean;
        /**
         * Pass domain(s) to check whether they're valid to be used for the SSL certificate
         * @param toCheck The domain(s) to check
         * @returns 
         */
        domains(toCheck: string | string[]): boolean;
        /**
         * Check the syntax validity of an email address
         * @param email The email address to check
         * @returns 
         */
        email(email: string): boolean;
        /**
         * Validate email address
         * @param certbotPath 
         * @returns 
         */
        certbotPath(certbotPath: string): boolean;
        /**
         * Validate the project path
         * @param projectPath 
         * @returns 
         */
        projectPath(projectPath: string): boolean;
    };

    /**
     * Check the accessibility of a directory. This also checks whether the directory exists or not.
     * @param path The path to check
     * @returns 
     */
    checkPathAccessibility(path: string): { valid: false, errors: { isString: boolean; exist: boolean; accessible: boolean; }; } | { valid: true; };

    /**
     * Add a message/comment to a bat file
     * @param batStr The original BAT string
     * @param msg The message you want to add to the BAT string
     * @returns The updated BAT string
     */
    addBatMessage(batStr: string, msg: string): string;

    /**
     * Parse the request's cookies header
     * @param cookiesHeader The cookies header from a request
     * @returns The cookies as an object
     */
    parseCookies(cookiesHeader: string): Record<string, string>;

    /**
     * Get the local IP address of the server
     * @returns An array of local IPs
     */
    getLocalIPs(): string[];

    /**
     * Generate a random text
     * @param length The length of the text. Minimum of `4`
     * @param options Options for generating the text
     * @returns 
     */
    generateRandom(length: number, options?: RandomOptions): string;

    readonly is: {
        /**
         * Check if a particular string is a valid HTML code
         * @param string The string to check
         * @returns 
         */
        html(string: string): boolean;
        /**
         * Pass anything to check if it's an object or not
         * @param obj 
         * @returns 
         */
        realObject(obj: any): boolean;
        /**
         * Check whether the argument is a valid string or not
         * @param str 
         * @returns 
         */
        validString(str: any): boolean;
        /**
         * Check if the value is undefined
         * @param arg 
         * @returns 
         */
        undefined(arg: any): arg is undefined;
    };
}

export default Helpers;