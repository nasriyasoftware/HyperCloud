import { HyperCloudRequestHandler, RateLimitAuthOptions, RateLimitRule, RateLimitRuleOptions, RateLimiterAuthorizedHit, RateLimiterUnauthorizedHit } from "../../docs/docs";
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
     * @throws {TypeError} If the options object is not valid.
     */
    authorize(options: RateLimitAuthOptions): RateLimiterAuthorizedHit | RateLimiterUnauthorizedHit;
    /**Create basic rate limiting handlers */
    readonly limitBy: {
        /**
         * Create a rate limiting handler based on IP address.
         *
         * This will return a handler that you can pass to a router.
         *
         * **Example:**
         * ```js
         * // Limit by IP address, and show an error 'Page' when the limit is exceeded.
         * const ipLimiter = server.rateLimiter.limitBy.ipAddress(100, 'Page');
         *
         * // Mount the handler on a router
         * router.use('*', ipLimiter);
         * ```
         * @param reqPerMin The number of requests per minute per IP address. Default: `100`/m
         * @param responseType The type of response to return. Default: `JSON`
         * @returns {HyperCloudRequestHandler}
         */
        readonly ipAddress: (reqPerMin?: number, responseType?: 'JSON' | 'Page') => HyperCloudRequestHandler;
    };
    /**
     * Setup your server's main Limiter.
     *
     * Notes:
     * - You must define at least one rule using the {@link defineRule} method before creating your handler
     * - If you want to setup multiple rules, you can use the `priority` property.
     * - The main rate limiter workes *after* all the `static` routes.
     *
     * **Example:**
     * ```js
     * // Set different rate limits based on user role
     * rateLimiter.defineRule({ name: 'visitor_ipAddress', cooldown: 5000, rate: { windowMs: 1 * 60 * 1000, maxRequests: 5 } })
     * rateLimiter.defineRule({ name: 'member_ipAddress', cooldown: 5000, rate: { windowMs: 1 * 60 * 1000, maxRequests: 10 } })
     *
     * rateLimiter.mainLimiter((request, response, next) => {
     *     if (request.user.role === 'Visitor' || request.user.role === 'Member') {
     *         const authRes = rateLimiter.authorize({
     *             value: request.ip,
     *             rules: [{ name: `${request.user.role.toLowerCase()}_ipAddress`, priority: 1 }]
     *         })
     *
     *         if (authRes.authorized) {
     *             next();
     *         } else {
     *             response.status(429).setHeader('Retry-After', authRes.retryAfter);
     *             response.json({ code: 429, ...authRes });
     *         }
     *     } else {
     *         // If admin, do not limit at all
     *         next();
     *     }
     * })
     * ```
     * @param handler The rate limiting handler you want to use
     */
    mainLimiter(handler: HyperCloudRequestHandler): void;
}
export default RateLimitingManager;
