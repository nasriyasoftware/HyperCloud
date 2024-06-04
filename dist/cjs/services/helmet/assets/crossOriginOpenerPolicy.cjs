"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class CrossOriginOpenerPolicy {
    static #_utils = {
        isValidPolicy: (policy) => {
            const validPolicies = new Set(["same-origin", "same-origin-allow-popups", "unsafe-none"]);
            return validPolicies.has(policy);
        }
    };
    static validate(options) {
        if (options === false) {
            return null;
        }
        ;
        if (!options || !helpers_1.default.is.realObject(options) || !options.policy) {
            return 'same-origin';
        }
        const { policy } = options;
        if (typeof policy !== "string" || !CrossOriginOpenerPolicy.#_utils.isValidPolicy(policy)) {
            throw new Error(`Invalid Cross-Origin-Opener-Policy value: ${policy}`);
        }
        return policy;
    }
}
exports.default = CrossOriginOpenerPolicy;
