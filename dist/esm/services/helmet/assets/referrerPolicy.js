import helpers from "../../../utils/helpers";
class ReferrerPolicy {
    static #_utils = {
        isValidPolicy: (policy) => {
            const validPolicies = new Set([
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
    static validate(options) {
        if (options === false) {
            return null;
        }
        if (!options || !helpers.is.realObject(options) || !options.policy) {
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
