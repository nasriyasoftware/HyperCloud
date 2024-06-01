class RateLimitingRecord {
    #_rule;
    #_value;
    #_timestamps = [];
    #_lastHitTimestamp = 0;
    #_hits = this.#_timestamps.length;
    constructor(rule, value) {
        this.#_rule = rule;
        this.#_value = value;
    }
    hit() {
        const currentTime = Date.now();
        this.#_timestamps = this.#_timestamps.filter(timestamp => currentTime - timestamp < this.#_rule.rate.windowMs);
        this.#_hits = this.#_timestamps.length;
        if (this.#_timestamps.length >= this.#_rule.rate.maxRequests) {
            return { authorized: false, retryAfter: this.#_lastHitTimestamp + this.#_rule.cooldown - Date.now() };
        }
        this.#_lastHitTimestamp = currentTime;
        this.#_timestamps.push(currentTime);
        return { authorized: true };
    }
    get hits() { return this.#_timestamps.length; }
    get hitsRemaining() { return this.#_rule.rate.maxRequests - this.#_hits; }
    get lastHitTimestamp() { return this.#_lastHitTimestamp; }
    get value() { return this.#_value; }
}
export default RateLimitingRecord;
