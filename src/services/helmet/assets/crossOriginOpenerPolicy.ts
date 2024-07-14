import { CrossOriginOpenerPolicyOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class CrossOriginOpenerPolicy {
    static readonly #_utils = {
        isValidPolicy: (policy: string): boolean => {
            const validPolicies: Set<string> = new Set(["same-origin", "same-origin-allow-popups", "unsafe-none"]);
            return validPolicies.has(policy);
        }
    };

    static validate(options?: CrossOriginOpenerPolicyOptions | false) {
        if (options === false) { return null };

        if (!options || helpers.isNot.realObject(options) || !options.policy) {
            return 'same-origin';
        }

        const { policy } = options;
        if (typeof policy !== "string" || !CrossOriginOpenerPolicy.#_utils.isValidPolicy(policy)) {
            throw new Error(`Invalid Cross-Origin-Opener-Policy value: ${policy}`);
        }

        return policy;
    }
}

export default CrossOriginOpenerPolicy;