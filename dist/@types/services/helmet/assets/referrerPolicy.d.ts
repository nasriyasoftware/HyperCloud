import { ReferrerPolicyOptions } from "../../../docs/docs";
declare class ReferrerPolicy {
    #private;
    static validate(options?: ReferrerPolicyOptions | false): string | null;
}
export default ReferrerPolicy;
