"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class CrossOriginEmbedderPolicy {
    static #_possiblePolicies = ["unsafe-none", "require-corp", "credentialless"];
    static validate(options) {
        if (options === false) {
            return null;
        }
        if (!helpers_1.default.is.undefined(options) && helpers_1.default.is.realObject(options)) {
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
exports.default = CrossOriginEmbedderPolicy;
