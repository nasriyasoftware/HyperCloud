import RateLimitingRecord from "./RateLimitingRecord";
import helpers from "../../utils/helpers";
class RateLimitingManager {
    #_server;
    #_rules = new Map();
    #_records = new Map();
    constructor(server) {
        this.#_server = server;
    }
    /**
     * Defines a rate limit rule.
     * @param {RateLimitRuleOptions} rule - The rule object containing details of the rate limit.
     * @returns {RateLimitRule} - The defined or updated rate limit rule.
     * @throws {TypeError} If the rule is not a valid object.
     * @throws {SyntaxError} If required properties are missing from the rule object.
     */
    defineRule(rule) {
        if (helpers.is.undefined(rule)) {
            throw new SyntaxError(`The rule object of the 'defineRule()' method is missing`);
        }
        if (!helpers.is.realObject(rule)) {
            throw new TypeError(`The 'defineRule()' method expects a rule object, but instead got ${typeof rule}`);
        }
        if ('name' in rule) {
            if (!helpers.is.validString(rule.name)) {
                throw new TypeError(`The rule expected a string 'name', instead got ${typeof rule.name}`);
            }
        }
        else {
            throw new SyntaxError(`The rule must have a name`);
        }
        if ('scope' in rule) {
            if (typeof rule.scope !== 'string') {
                throw new TypeError(`The 'defineRule()' method expects the 'scope' to have a string value when provided`);
            }
        }
        else {
            rule.scope = 'global';
        }
        if ('cooldown' in rule) {
            if (!helpers.is.integer(rule.cooldown)) {
                throw new TypeError(`The 'defineRule()' method expects its 'cooldown' property to be an integer, instead got ${rule.cooldown}`);
            }
        }
        else {
            throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'cooldown' property`);
        }
        if ('rate' in rule) {
            if (helpers.is.realObject(rule.rate)) {
                const rate = rule.rate;
                if ('windowMs' in rate) {
                    if (!helpers.is.integer(rate.windowMs)) {
                        throw new TypeError(`The rate windowMs is expected to be an integer, instead got ${typeof rate.windowMs}`);
                    }
                }
                else {
                    throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'rate.windowMs'`);
                }
                if ('maxRequests' in rate) {
                    if (!helpers.is.integer(rate.maxRequests)) {
                        throw new TypeError(`The rate maxRequests is expected to be an integer, instead got ${typeof rate.maxRequests}`);
                    }
                }
                else {
                    throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'rate.maxRequests'`);
                }
            }
            else {
                throw new TypeError(`The 'defineRule()' method expects its 'rule.rate' option to be an object, instead got ${typeof rule.rate}`);
            }
        }
        else {
            throw new SyntaxError(`The rule argument passed to the 'defineRule()' method is missing the 'rate' property`);
        }
        const ruleKey = `${rule.scope}:${rule.name}`;
        const newRule = {
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
     * @returns {{ authorized: true } | { authorized: false, retryAt: number }} - Returns true if the request is authorized, false otherwise.
     * @throws {TypeError} If the options object is not valid.
     */
    authorize(options) {
        if (helpers.is.undefined(options)) {
            throw new SyntaxError(`The 'authorize()' method expects an 'options' argument`);
        }
        if (!helpers.is.realObject(options)) {
            throw new TypeError(`The 'authorize()' method of the rate limiter expects an object, instead got ${typeof options}`);
        }
        if (!Array.isArray(options.rules)) {
            throw new TypeError(`The 'authorize()' method expects an array of 'rules' names and priority`);
        }
        const validRules = options.rules.filter(rule => helpers.is.realObject(rule) && 'name' in rule).map(rule => {
            return { name: rule.name, priority: typeof rule.priority === 'number' ? rule.priority : 0 };
        });
        validRules.sort((ruleA, ruleB) => ruleA.priority - ruleB.priority);
        const strict = typeof options?.strict === 'boolean' ? options.strict : false;
        const failedRules = [];
        let atLeastOneRulePassed = false;
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
                    atLeastOneRulePassed = true;
                }
                else {
                    failedRules.push({ rule: ruleDetails, retryAfter: hitResult.retryAfter });
                    if (strict) {
                        break;
                    }
                }
            }
        }
        if (!strict && atLeastOneRulePassed) {
            return { authorized: true };
        }
        if (failedRules.length > 0) {
            const latestRetryAfter = Math.max(...failedRules.map(f => f.retryAfter));
            return { authorized: false, retryAfter: latestRetryAfter };
        }
        // Request does not violate any rate limit rules
        return { authorized: true };
    }
    /**Create basic rate limiting handlers */
    limitBy = {
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
        ipAddress: (reqPerMin = 100, responeType = 'JSON') => {
            const rule = this.defineRule({
                name: `basic-limiter_ipAddress_${Math.floor(Math.random() * 100000)}`,
                cooldown: 5 * 60 * 1000,
                rate: {
                    windowMs: 60 * 1000,
                    maxRequests: reqPerMin
                }
            });
            const handler = (request, response, next) => {
                const authRes = this.authorize({
                    value: request.ip,
                    rules: [{ name: rule.name, priority: 1 }]
                });
                if (authRes.authorized) {
                    return next();
                }
                response.setHeader('Retry-After', Date.now() - authRes.retryAfter);
                response.status(429).json({ code: 429, message: 'Too many requests' });
            };
            return handler;
        }
    };
}
export default RateLimitingManager;
