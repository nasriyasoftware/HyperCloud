"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const docs_1 = require("../../../docs/docs");
const helpers_1 = __importDefault(require("../../../utils/helpers"));
class XFrameOptions {
    static validate(options) {
        if (options === false) {
            return null;
        }
        if (!options || !helpers_1.default.is.realObject(options) || !options.action) {
            return 'DENY';
        }
        const { action, uri } = options;
        switch (action) {
            case docs_1.XFrameOptionsOption.DENY:
            case docs_1.XFrameOptionsOption.SAMEORIGIN:
                return action;
            case docs_1.XFrameOptionsOption.ALLOWFROM:
                if (uri) {
                    return `${action} ${uri}`;
                }
                else {
                    throw new Error("URI must be provided for ALLOW-FROM value.");
                }
            default:
                throw new Error("Invalid X-Frame-Options value.");
        }
    }
}
exports.default = XFrameOptions;
