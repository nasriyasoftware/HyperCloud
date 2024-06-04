"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFrameOptionsOption = exports.XPermittedCrossDomainPoliciesOption = void 0;
/** Enum for X-Permitted-Cross-Domain-Policies options */
var XPermittedCrossDomainPoliciesOption;
(function (XPermittedCrossDomainPoliciesOption) {
    XPermittedCrossDomainPoliciesOption["NONE"] = "none";
    XPermittedCrossDomainPoliciesOption["MASTERONLY"] = "master-only";
    XPermittedCrossDomainPoliciesOption["BYCONTENTTYPE"] = "by-content-type";
    XPermittedCrossDomainPoliciesOption["ALL"] = "all";
})(XPermittedCrossDomainPoliciesOption || (exports.XPermittedCrossDomainPoliciesOption = XPermittedCrossDomainPoliciesOption = {}));
/** Enum for X-Frame-Options options */
var XFrameOptionsOption;
(function (XFrameOptionsOption) {
    XFrameOptionsOption["DENY"] = "DENY";
    XFrameOptionsOption["SAMEORIGIN"] = "SAMEORIGIN";
    XFrameOptionsOption["ALLOWFROM"] = "ALLOW-FROM";
})(XFrameOptionsOption || (exports.XFrameOptionsOption = XFrameOptionsOption = {}));
;
