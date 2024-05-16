import { ContentSecurityPolicyDirectives, ContentSecurityPolicyOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class ContentSecurityPolicy {
    static readonly #_utils = {
        validateDirectives: (directives: ContentSecurityPolicyDirectives): boolean => {
            // Validate each directive
            const isValidDirective = (directive: string, values: string[]): boolean => {
                // Define valid values for each directive
                const validValues: { [key: string]: Set<string> } = {
                    "default-src": new Set(["'self'", "'unsafe-inline'", "'unsafe-eval'", "'none'", 'data:', 'blob:', 'mediastream:', 'filesystem:', 'https:', 'http:', 'ws:', 'wss:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'webviewprogressproxy:', 'android-webview-video-poster:', 'blob:filesystem:', 'intent:', 'webviewprogressproxy:', 'steam:', 'blob:chrome-extension:', 'resource:']),
                    "base-uri": new Set(["'self'", 'data:', 'blob:', 'filesystem:', 'https:', 'http:']),
                    "font-src": new Set(["'self'", "'unsafe-inline'", 'data:', 'blob:', 'https:', 'http:', 'filesystem:', 'intent:', 'webviewprogressproxy:', 'safari-extension:', 'moz-extension:', 'chrome-extension:', 'android-webview-video-poster:', 'android-webview-video-poster:', 'blob:chrome-extension:', 'resource:']),
                    "form-action": new Set(["'self'", 'data:', 'blob:', 'https:', 'http:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:']),
                    "frame-ancestors": new Set(["'self'", 'data:', 'blob:', 'https:', 'http:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:']),
                    "img-src": new Set(["'self'", 'data:', 'blob:', 'https:', 'http:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:', 'intent:', 'webviewprogressproxy:', 'android-webview-video-poster:']),
                    "object-src": new Set(["'none'", "'self'", 'data:', 'blob:', 'filesystem:', 'https:', 'http:']),
                    "script-src": new Set(["'self'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'blob:', 'https:', 'http:', 'ws:', 'wss:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:']),
                    "script-src-attr": new Set(["'none'"]),
                    "style-src": new Set(["'self'", "'unsafe-inline'", 'data:', 'blob:', 'https:', 'http:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:']),
                    "upgrade-insecure-requests": new Set([]), // No values allowed
                    "worker-src": new Set(["'self'", 'data:', 'blob:', 'https:', 'http:', 'ws:', 'wss:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:', 'intent:', 'webviewprogressproxy:', 'android-webview-video-poster:']),
                    "manifest-src": new Set(["'self'", 'data:', 'blob:', 'https:', 'http:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:']),
                    "navigate-to": new Set(["'self'", 'data:', 'blob:', 'https:', 'http:', 'ftp:', 'ftps:', 'chrome-extension:', 'moz-extension:', 'safari-extension:', 'blob:chrome-extension:', 'resource:']),
                    // Add more valid values for other directives as needed
                };

                // Check if each value in the directive is valid
                for (const value of values) {
                    if (!validValues[directive]?.has(value)) {
                        return false; // Invalid value found
                    }
                }
                return true; // All values are valid
            };

            // Validate each directive
            for (const directive in directives) {
                if (!isValidDirective(directive, directives[directive] || [])) {
                    return false; // Invalid directive found
                }
            }
            return true; // All directives are valid
        }
    }

    static readonly defaultDirectives = {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "font-src": ["'self'", "https:", "data:"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'self'"],
        "img-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "script-src": ["'self'"],
        "script-src-attr": ["'none'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "upgrade-insecure-requests": []
    };

    static readonly defaultOptions: ContentSecurityPolicyOptions = {
        useDefaults: false,
        directives: ContentSecurityPolicy.defaultDirectives
    }

    static validate(options?: ContentSecurityPolicyOptions | false): string {
        const directives = (() => {
            if (options === false) { return ContentSecurityPolicy.defaultDirectives }
            if (!helpers.is.undefined(options) && helpers.is.realObject(options) && options.useDefaults === false) {
                // Validate user-provided directives
                if (ContentSecurityPolicy.#_utils.validateDirectives(options.directives)) {
                    // Use provided options if they are valid and useDefaults is explicitly false
                    return options.directives;
                } else {
                    throw new Error(`The provided CSP directives are invalid`)
                }
            } else {
                // Use default directives
                return ContentSecurityPolicy.defaultDirectives;
            }
        })();


        return Object.entries(directives)
            .map(([key, values]) => `${key} ${(Array.isArray(values) ? values : [values]).join(' ')}`)
            .join('; ');
    }
}

export default ContentSecurityPolicy;