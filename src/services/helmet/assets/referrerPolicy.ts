import { ReferrerPolicyOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class ReferrerPolicy {
    static readonly #_utils = {
        isValidPolicy: (policy: string): boolean => {
            const validPolicies: Set<string> = new Set([
                "",
                "no-referrer",
                "no-referrer-when-downgrade",
                "same-origin",
                "origin",
                "strict-origin",
                "origin-when-cross-origin",
                "strict-origin-when-cross-origin",
                "unsafe-url"
            ]);
            return validPolicies.has(policy);
        }
    };

    static validate(options?: ReferrerPolicyOptions | false) {
        if (options === false) { return null }

        if (!options || helpers.isNot.realObject(options) || !options.policy) {
            return 'no-referrer';
        }

        const { policy } = options;
        if (typeof policy !== "string" || !ReferrerPolicy.#_utils.isValidPolicy(policy)) {
            throw new Error(`Invalid Referrer-Policy value: ${policy}`);
        }

        return policy;
    }
}

export default ReferrerPolicy;