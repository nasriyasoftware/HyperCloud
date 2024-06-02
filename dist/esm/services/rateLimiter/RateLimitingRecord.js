class RateLimitingRecord {
    #_rule;
    #_value;
    #_timestamps = [];
    #_lastHitTimestamp = 0;
    #_totalHits = 0;
    constructor(rule, value) {
        this.#_rule = rule;
        this.#_value = value;
    }
    hit() {
        const currentTime = Date.now();
        this.#_timestamps = this.#_timestamps.filter(timestamp => currentTime - timestamp < this.#_rule.rate.windowMs);
        if (this.#_timestamps.length >= this.#_rule.rate.maxRequests) {
            return { authorized: false, retryAfter: this.#_lastHitTimestamp + this.#_rule.cooldown };
        }
        this.#_lastHitTimestamp = currentTime;
        this.#_timestamps.push(currentTime);
        this.#_totalHits++;
        return {
            authorized: true,
            hits: this.hits,
            hitsRemaining: this.hitsRemaining,
            lastHitTimestamp: this.lastHitTimestamp
        };
    }
    /**The number of hits in the time window */
    get hits() {
        const currentTime = Date.now();
        return this.#_timestamps.filter(timestamp => currentTime - timestamp < this.#_rule.rate.windowMs).length;
    }
    /**The remaining allowed hits */
    get hitsRemaining() { return this.#_rule.rate.maxRequests - this.hits; }
    /**The timestamp of the last allowed hit */
    get lastHitTimestamp() { return this.#_lastHitTimestamp; }
    /**The number of hits this record recieved since the start of the server */
    get totalHits() { return this.#_totalHits; }
    /**The value of which the record is being measured by */
    get value() { return this.#_value; }
}
export default RateLimitingRecord;
