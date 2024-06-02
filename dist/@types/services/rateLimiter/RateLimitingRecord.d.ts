import { RateLimitRule, RateLimiterAuthorizedHit, RateLimiterUnauthorizedHit } from "../../docs/docs";
declare class RateLimitingRecord {
    #private;
    constructor(rule: RateLimitRule, value: string | number);
    hit(): RateLimiterAuthorizedHit | RateLimiterUnauthorizedHit;
    /**The number of hits in the time window */
    get hits(): number;
    /**The remaining allowed hits */
    get hitsRemaining(): number;
    /**The timestamp of the last allowed hit */
    get lastHitTimestamp(): number;
    /**The number of hits this record recieved since the start of the server */
    get totalHits(): number;
    /**The value of which the record is being measured by */
    get value(): string | number;
}
export default RateLimitingRecord;
