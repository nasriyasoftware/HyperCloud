import { HyperCloudRequestHandler, RateLimitAuthOptions, RateLimitRule, RateLimitRuleOptions } from "../../docs/docs";
import HyperCloudServer from "../../server";
declare class RateLimitingManager {
    #private;
    constructor(server: HyperCloudServer);
    /**
     * Defines a rate limit rule.
     * @param {RateLimitRuleOptions} rule - The rule object containing details of the rate limit.
     * @returns {RateLimitRule} - The defined or updated rate limit rule.
     * @throws {TypeError} If the rule is not a valid object.
     * @throws {SyntaxError} If required properties are missing from the rule object.
     */
    defineRule(rule: RateLimitRuleOptions): RateLimitRule;
    /**
     * Authorizes a request based on defined rate limit rules.
     * @param {RateLimitAuthOptions} options - The authorization options.
     * @returns {{ authorized: true } | { authorized: false, retryAt: number }} - Returns true if the request is authorized, false otherwise.
     * @throws {TypeError} If the options object is not valid.
     */
    authorize(options: RateLimitAuthOptions): {
        authorized: true;
    } | {
        authorized: false;
        retryAfter: number;
    };
    /**Create basic rate limiting handlers */
    readonly limitBy: {
        /**
         * Create a rate limiting handler based on IP address.
         *
         * This will return a handler that you can pass to a router.
         *
         * **Example:**
         * ```js
         * // Create a simple handler
         * const ipLimiter = server.rateLimiter.limitBy.ipAddress(100);
         *
         * // Mount the handler on a router
         * router.use('*', ipLimiter);
         * ```
         * @param reqPerMin The number of requests per minute per IP address. Default: `100`/m
         * @param responeType The type of response to return. Default: `JSON`
         * @returns {HyperCloudRequestHandler}
         */
        readonly ipAddress: (reqPerMin?: number, responeType?: 'JSON' | 'Page') => HyperCloudRequestHandler;
    };
}
export default RateLimitingManager;
