"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class StrictTransportSecurity {
    static defaultMaxAge = 15552000;
    static defaultIncludeSubDomains = true;
    static defaultPreload = false;
    static validate(options) {
        if (options === false) {
            return null;
        }
        ;
        const { maxAge = StrictTransportSecurity.defaultMaxAge, includeSubDomains = StrictTransportSecurity.defaultIncludeSubDomains, preload = StrictTransportSecurity.defaultPreload } = options || {};
        if (!helpers_1.default.is.integer(maxAge) || maxAge <= 0) {
            throw new Error(`Invalid maxAge value for Strict-Transport-Security: ${maxAge}`);
        }
        const maxAgeDirective = `max-age=${maxAge}`;
        const includeSubDomainsDirective = includeSubDomains ? "; includeSubDomains" : "";
        const preloadDirective = preload ? "; preload" : "";
        return `${maxAgeDirective}${includeSubDomainsDirective}${preloadDirective}`;
    }
}
exports.default = StrictTransportSecurity;
