"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../../utils/helpers"));
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
        if (!options || !helpers_1.default.is.realObject(options) || !options.policy) {
            return 'no-referrer';
        }
        const { policy } = options;
        if (typeof policy !== "string" || !ReferrerPolicy.#_utils.isValidPolicy(policy)) {
            throw new Error(`Invalid Referrer-Policy value: ${policy}`);
        }
        return policy;
    }
}
exports.default = ReferrerPolicy;
