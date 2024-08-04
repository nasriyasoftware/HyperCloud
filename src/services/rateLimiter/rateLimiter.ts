import RateLimitingRecord from "./RateLimitingRecord";
import { HyperCloudRequestHandler, NextFunction, RateLimitAuthOptions, RateLimitRule, RateLimitRuleOptions, RateLimiterAuthorizedHit, RateLimiterUnauthorizedHit, UserRole } from "../../docs/docs";
import HyperCloudServer from "../../server";
import HyperCloudRequest from "../handler/assets/request";
import HyperCloudResponse from "../handler/assets/response";
import helpers from "../../utils/helpers";

export class RateLimitingManager {
    readonly #_server: HyperCloudServer | undefined;
    readonly #_rules: Map<string, RateLimitRule> = new Map();
    readonly #_records: Map<string, RateLimitingRecord> = new Map();

    constructor(server?: HyperCloudServer) {
        this.#_server = server;
    }

    /**
     * Defines a rate limit rule.
     * @param {RateLimitRuleOptions} rule - The rule object containing details of the rate limit.
     * @returns {RateLimitRule} - The defined or updated rate limit rule.
     * @throws {TypeError} If the rule is not a valid object.
     * @throws {SyntaxError} If required properties are missing from the rule object.
     */
    defineRule(rule: RateLimitRuleOptions): RateLimitRule {
        if (helpers.is.undefined(rule)) { throw new SyntaxError(`The rule object of the 'defineRule()' method is missing`) }
        if (helpers.isNot.realObject(rule)) { throw new TypeError(`The 'defineRule()' method expects a rule object, but instead got ${typeof rule}`) }

        if ('name' in rule) {
            if (!helpers.is.validString(rule.name)) { throw new TypeError(`The rule expected a string 'name', instead got ${typeof rule.name}`) }
        } else {
            throw new SyntaxError(`The rule must have a name`);
        }

        if ('scope' in rule) {
            if (typeof rule.scope !== 'string') { throw new TypeError(`The 'defineRule()' method expects the 'scope' to have a string value when provided`) }
        } else {
            rule.scope = 'global';
        }

        if ('cooldown' in rule) {
            if (!helpers.is.integer(rule.cooldown)) { throw new TypeError(`The 'defineRule()' method expects its 'cooldown' property to be an integer, instead got ${rule.cooldown}`) }
        } else {
            throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'cooldown' property`)
        }

        if ('rate' in rule) {
            if (helpers.is.realObject(rule.rate)) {
                const rate = rule.rate;

                if ('windowMs' in rate) {
                    if (!helpers.is.integer(rate.windowMs)) { throw new TypeError(`The rate windowMs is expected to be an integer, instead got ${typeof rate.windowMs}`) }
                } else {
                    throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'rate.windowMs'`)
                }

                if ('maxRequests' in rate) {
                    if (!helpers.is.integer(rate.maxRequests)) { throw new TypeError(`The rate maxRequests is expected to be an integer, instead got ${typeof rate.maxRequests}`) }
                } else {
                    throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'rate.maxRequests'`)
                }
            } else {
                throw new TypeError(`The 'defineRule()' method expects its 'rule.rate' option to be an object, instead got ${typeof rule.rate}`)
            }
        } else {
            throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'rate' property`)
        }

        const ruleKey = `${rule.scope}:${rule.name}`;
        const newRule: RateLimitRule = {
            name: rule.name,
            scope: rule.scope || 'global',
            cooldown: rule.cooldown,
            rate: rule.rate
        };

        this.#_rules.set(ruleKey, newRule);
        return newRule;
    }

    /**
     * Authorizes a request based on defined rate limit rules.
     * @param {RateLimitAuthOptions} options - The authorization options.
     * @throws {TypeError} If the options object is not valid.
     */
    authorize(options: RateLimitAuthOptions): RateLimiterAuthorizedHit | RateLimiterUnauthorizedHit {
        if (helpers.is.undefined(options)) { throw new SyntaxError(`The 'authorize()' method expects an 'options' argument`) }
        if (helpers.isNot.realObject(options)) { throw new TypeError(`The 'authorize()' method of the rate limiter expects an object, instead got ${typeof options}`) }

        if (!Array.isArray(options.rules)) { throw new TypeError(`The 'authorize()' method expects an array of 'rules' names and priority`) }
        const validRules = options.rules.filter(rule => helpers.is.realObject(rule) && 'name' in rule).map(rule => {
            return { name: rule.name, priority: typeof rule.priority === 'number' ? rule.priority : 0 };
        });

        validRules.sort((ruleA, ruleB) => ruleA.priority - ruleB.priority);

        const strict = typeof options?.strict === 'boolean' ? options.strict : false;
        const passedRules = [];
        const failedRules: { retryAfter: number, rule: RateLimitRule }[] = [];

        for (const rule of validRules) {
            const ruleKey = `${options.scope || 'global'}:${rule.name}`;
            const ruleDetails = this.#_rules.get(ruleKey);

            if (ruleDetails) {
                const recordKey = `${ruleDetails.scope}:${options.value}`;
                let record = this.#_records.get(recordKey);

                // Check if a record exists for this value
                if (!record) {
                    record = new RateLimitingRecord(ruleDetails, recordKey);
                    this.#_records.set(recordKey, record);
                }

                // Check if the request violates the rate limit rule
                const hitResult = record.hit();
                if (hitResult.authorized) {
                    passedRules.push({ rule: ruleDetails, hitResult, priority: rule.priority })
                } else {
                    failedRules.push({ rule: ruleDetails, retryAfter: hitResult.retryAfter })
                    if (strict) { break }
                }
            }
        }

        passedRules.sort((ruleA, ruleB) => ruleA.priority - ruleB.priority)
        if (!strict && passedRules.length > 0) {
            return passedRules[0].hitResult;
        }

        if (failedRules.length > 0) {
            const latestRetryAfter = Math.max(...failedRules.map(f => f.retryAfter));
            return { authorized: false, retryAfter: latestRetryAfter };
        }

        // Request does not violate any rate limit rules
        return passedRules[0].hitResult;
    }

    /**Create basic rate limiting handlers */
    readonly limitBy = {
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
        ipAddress: (reqPerMin: number = 100, responseType: 'JSON' | 'Page' = 'JSON'): HyperCloudRequestHandler => {
            const rule = this.defineRule({
                name: `basic-limiter_ipAddress_${Math.floor(Math.random() * 100000)}`,
                cooldown: 5 * 60 * 1000,
                rate: {
                    windowMs: 60 * 1000,
                    maxRequests: reqPerMin
                }
            })

            const handler: HyperCloudRequestHandler = (request, response, next) => {
                const authRes = this.authorize({
                    value: request.ip,
                    rules: [{ name: rule.name, priority: 1 }]
                })

                if (authRes.authorized) {
                    next();
                } else {
                    response.setHeader('Retry-After', authRes.retryAfter).status(429);
                    if (responseType === 'JSON') {
                        response.json({ code: 429, ...authRes });
                    }

                    if (responseType === 'Page') {
                        response.end({
                            data: `
                                    <html>
                                    <head>
                                        <title>Too Many Requests - 429</title>
                                    </head>
                                    <body style="font-family:Arial;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                                        <h1 style="color:red;">Error: 429 - Too Many Requests</h1>
                                        <p>Slow down buddy, you're overloading the server</p>
                                    </body>
                                    </html>
                        
                            `
                        });
                    }
                }
            }

            return handler;
        }
    } as const

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
    mainLimiter(handler: HyperCloudRequestHandler) {
        if (typeof handler !== 'function') { throw new SyntaxError(`The main`) }
        if (this.#_server instanceof HyperCloudServer) {
            this.#_server._handlers['mainRateLimiter'] = handler;
        } else {
            throw new Error(`The rate limitter's main handler can only be used on an instance that was created by the server`)
        }
    }
}

export default RateLimitingManager;