import { RateLimitRule } from "../../docs/docs";
declare class RateLimitingRecord {
    #private;
    constructor(rule: RateLimitRule, value: string | number);
    hit(): {
        authorized: true;
    } | {
        authorized: false;
        retryAfter: number;
    };
    get hits(): number;
    get hitsRemaining(): number;
    get lastHitTimestamp(): number;
    get value(): string | number;
}
export default RateLimitingRecord;
