import { ContentSecurityPolicyOptions } from "../../../docs/docs";
declare class ContentSecurityPolicy {
    #private;
    static readonly defaultDirectives: {
        "default-src": string[];
        "base-uri": string[];
        "font-src": string[];
        "form-action": string[];
        "frame-ancestors": string[];
        "img-src": string[];
        "object-src": string[];
        "script-src": string[];
        "script-src-attr": string[];
        "style-src": string[];
        "upgrade-insecure-requests": never[];
    };
    static readonly defaultOptions: ContentSecurityPolicyOptions;
    static validate(options?: ContentSecurityPolicyOptions | false): string;
}
export default ContentSecurityPolicy;
