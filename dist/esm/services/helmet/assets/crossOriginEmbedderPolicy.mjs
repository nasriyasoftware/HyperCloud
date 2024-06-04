import helpers from "../../../utils/helpers";
class CrossOriginEmbedderPolicy {
    static #_possiblePolicies = ["unsafe-none", "require-corp", "credentialless"];
    static validate(options) {
        if (options === false) {
            return null;
        }
        if (!helpers.is.undefined(options) && helpers.is.realObject(options)) {
            const { policy } = options;
            if (typeof policy === "string") {
                // Validate the policy value
                if (CrossOriginEmbedderPolicy.#_possiblePolicies.includes(policy)) {
                    return policy;
                }
                else {
                    throw new Error(`Invalid Cross-Origin-Embedder-Policy value: ${policy}`);
                }
            }
            else {
                throw new Error(`Invalid Cross-Origin-Embedder-Policy options: Expected string policy but isntead got ${typeof policy}`);
            }
        }
        return 'require-corp';
    }
}
export default CrossOriginEmbedderPolicy;
