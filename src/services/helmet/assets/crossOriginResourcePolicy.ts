import { CrossOriginResourcePolicyOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class CrossOriginResourcePolicy {
    static readonly #_utils = {
        isValidPolicy: (policy: string): boolean => {
            const validPolicies: Set<string> = new Set(["same-origin", "same-site", "cross-origin"]);
            return validPolicies.has(policy);
        }
    };

    static validate(options?: CrossOriginResourcePolicyOptions | false) {
        if (options === false) { return null };

        if (!options || helpers.isNot.realObject(options) || !options.policy) {
            return 'same-origin'
        }

        const { policy } = options;
        if (typeof policy !== "string" || !CrossOriginResourcePolicy.#_utils.isValidPolicy(policy)) {
            throw new Error(`Invalid Cross-Origin-Resource-Policy value: ${policy}`);
        }

        return policy;
    }
}

export default CrossOriginResourcePolicy;