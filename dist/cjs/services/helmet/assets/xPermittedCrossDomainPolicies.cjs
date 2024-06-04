"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const docs_1 = require("../../../docs/docs");
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class XPermittedCrossDomainPolicies {
    static validate(options) {
        if (options === false) {
            return null;
        }
        if (helpers_1.default.is.undefined(options) || !helpers_1.default.is.realObject(options) || !('permittedPolicies' in options)) {
            return 'none';
        }
        const { permittedPolicies } = options;
        switch (permittedPolicies) {
            case docs_1.XPermittedCrossDomainPoliciesOption.NONE:
            case docs_1.XPermittedCrossDomainPoliciesOption.MASTERONLY:
            case docs_1.XPermittedCrossDomainPoliciesOption.BYCONTENTTYPE:
            case docs_1.XPermittedCrossDomainPoliciesOption.ALL:
                return permittedPolicies;
            default:
                throw new Error("Invalid X-Permitted-Cross-Domain-Policies value.");
        }
    }
}
exports.default = XPermittedCrossDomainPolicies;
