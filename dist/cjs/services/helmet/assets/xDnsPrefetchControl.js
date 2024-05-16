"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class DNSPrefetchControl {
    static validate(options) {
        if (options === false) {
            return null;
        }
        if (!options || !helpers_1.default.is.realObject(options) || !('enabled' in options)) {
            return 'off';
        }
        const { enabled } = options;
        return enabled ? "on" : "off";
    }
}
exports.default = DNSPrefetchControl;
