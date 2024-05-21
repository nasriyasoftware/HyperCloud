import helpers from "../../utils/helpers";
// Headers
import ContentSecurityPolicy from './assets/contentSecurityPolicy';
import CrossOriginEmbedderPolicy from "./assets/crossOriginEmbedderPolicy";
import CrossOriginOpenerPolicy from "./assets/crossOriginOpenerPolicy";
import CrossOriginResourcePolicy from "./assets/crossOriginResourcePolicy";
import ReferrerPolicy from "./assets/referrerPolicy";
import StrictTransportSecurity from "./assets/strictTransportSecurity";
import DNSPrefetchControl from "./assets/xDnsPrefetchControl";
import XFrameOptions from "./assets/xFrameOptions";
import XPermittedCrossDomainPolicies from "./assets/xPermittedCrossDomainPolicies";
class HelmetManager {
    #_server;
    #_defaults = {
        values: {
            contentSecurityPolicy: "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
            crossOriginEmbedderPolicy: 'require-corp',
            crossOriginOpenerPolicy: 'same-origin',
            crossOriginResourcePolicy: 'same-origin',
            originAgentCluster: '?1',
            referrerPolicy: 'no-referrer',
            strictTransportSecurity: 'max-age=123456; includeSubDomains',
            xContentTypeOptions: 'nosniff',
            xDnsPrefetchControl: 'off',
            xDownloadOptions: 'noopen',
            xFrameOptions: 'DENY',
            xPermittedCrossDomainPolicies: 'none',
            xPoweredBy: true,
            xXssProtection: true
        }
    };
    #_values = {
        contentSecurityPolicy: '',
        crossOriginEmbedderPolicy: '',
        crossOriginOpenerPolicy: '',
        crossOriginResourcePolicy: '',
        originAgentCluster: '',
        referrerPolicy: '',
        strictTransportSecurity: '',
        xContentTypeOptions: '',
        xDnsPrefetchControl: '',
        xDownloadOptions: '',
        xFrameOptions: '',
        xPermittedCrossDomainPolicies: '',
        xPoweredBy: true,
        xXssProtection: true
    };
    constructor(server) {
        this.#_server = server;
        this.#_values.contentSecurityPolicy = this.#_defaults.values.contentSecurityPolicy;
        this.#_values.crossOriginEmbedderPolicy = this.#_defaults.values.crossOriginEmbedderPolicy;
        this.#_values.crossOriginOpenerPolicy = this.#_defaults.values.crossOriginOpenerPolicy;
        this.#_values.crossOriginResourcePolicy = this.#_defaults.values.crossOriginResourcePolicy;
        this.#_values.originAgentCluster = this.#_defaults.values.originAgentCluster;
        this.#_values.referrerPolicy = this.#_defaults.values.referrerPolicy;
        this.#_values.strictTransportSecurity = this.#_defaults.values.strictTransportSecurity;
        this.#_values.xContentTypeOptions = this.#_defaults.values.xContentTypeOptions;
        this.#_values.xDnsPrefetchControl = this.#_defaults.values.xDnsPrefetchControl;
        this.#_values.xDownloadOptions = this.#_defaults.values.xDownloadOptions;
        this.#_values.xFrameOptions = this.#_defaults.values.xFrameOptions;
        this.#_values.xPermittedCrossDomainPolicies = this.#_defaults.values.xPermittedCrossDomainPolicies;
        this.#_values.xPoweredBy = this.#_defaults.values.xPoweredBy;
        this.#_values.xXssProtection = this.#_defaults.values.xXssProtection;
    }
    /**
     * Setup a protection helmet for your server. You can customize each section
     * according to your needs.
     * @param options Helmet configuration options
     */
    config(options) {
        const notUndefined = !helpers.is.undefined(options);
        const isRealObject = helpers.is.realObject(options);
        // #1: Content-Security-Policy
        if (notUndefined && isRealObject && 'contentSecurityPolicy' in options) {
            this.#_values.contentSecurityPolicy = ContentSecurityPolicy.validate(options.contentSecurityPolicy);
        }
        else {
            this.#_values.contentSecurityPolicy = this.#_defaults.values.contentSecurityPolicy;
        }
        // #2: Cross-Origin-Embedder-Policy
        if (notUndefined && isRealObject && 'crossOriginEmbedderPolicy' in options) {
            this.#_values.crossOriginEmbedderPolicy = CrossOriginEmbedderPolicy.validate(options.crossOriginEmbedderPolicy) || '';
        }
        else {
            this.#_values.crossOriginEmbedderPolicy = this.#_defaults.values.crossOriginEmbedderPolicy;
        }
        // #3: ross-Origin-Opener-Policy
        if (notUndefined && isRealObject && 'crossOriginOpenerPolicy' in options) {
            this.#_values.crossOriginOpenerPolicy = CrossOriginOpenerPolicy.validate(options.crossOriginOpenerPolicy) || '';
        }
        else {
            this.#_values.crossOriginOpenerPolicy = this.#_defaults.values.crossOriginOpenerPolicy;
        }
        // #4: Cross-Origin-Resource-Policy
        if (notUndefined && isRealObject && 'crossOriginResourcePolicy' in options) {
            this.#_values.crossOriginResourcePolicy = CrossOriginResourcePolicy.validate(options.crossOriginResourcePolicy) || '';
        }
        else {
            this.#_values.crossOriginResourcePolicy = this.#_defaults.values.crossOriginResourcePolicy;
        }
        // #5: Origin-Agent-Cluster
        if (notUndefined && isRealObject && 'originAgentCluster' in options) {
            if (options.originAgentCluster === false) {
                this.#_values.crossOriginResourcePolicy = '';
            }
            else {
                this.#_values.crossOriginResourcePolicy = options.originAgentCluster === '?1' ? options.originAgentCluster : this.#_defaults.values.crossOriginResourcePolicy;
            }
        }
        else {
            this.#_values.crossOriginResourcePolicy = this.#_defaults.values.crossOriginResourcePolicy;
        }
        // #6: Referrer-Policy
        if (notUndefined && isRealObject && 'referrerPolicy' in options) {
            this.#_values.referrerPolicy = ReferrerPolicy.validate(options.referrerPolicy) || '';
        }
        else {
            this.#_values.referrerPolicy = this.#_defaults.values.referrerPolicy;
        }
        // #7: Strict-Transport-Security
        if (notUndefined && isRealObject && 'strictTransportSecurity' in options) {
            this.#_values.strictTransportSecurity = StrictTransportSecurity.validate(options.strictTransportSecurity) || '';
        }
        else {
            this.#_values.strictTransportSecurity = this.#_defaults.values.strictTransportSecurity;
        }
        // #8: X-Content-Type-Options
        if (notUndefined && isRealObject && 'xContentTypeOptions' in options) {
            if (options.xContentTypeOptions === false) {
                this.#_values.strictTransportSecurity = '';
            }
            else {
                this.#_values.xContentTypeOptions = this.#_defaults.values.xContentTypeOptions;
            }
        }
        else {
            this.#_values.xContentTypeOptions = this.#_defaults.values.xContentTypeOptions;
        }
        // #9: X-DNS-Prefetch-Control
        if (notUndefined && isRealObject && 'xDnsPrefetchControl' in options) {
            this.#_values.xDnsPrefetchControl = DNSPrefetchControl.validate(options.xDnsPrefetchControl) || '';
        }
        else {
            this.#_values.xDnsPrefetchControl = this.#_defaults.values.xDnsPrefetchControl;
        }
        // #10: X-Download-Options
        if (notUndefined && isRealObject && 'xDownloadOptions' in options && options.xDownloadOptions !== true) {
            this.#_values.xDownloadOptions = '';
        }
        else {
            this.#_values.xDownloadOptions = this.#_defaults.values.xDownloadOptions;
        }
        // #11: X-Frame-Options
        if (notUndefined && isRealObject && 'xFrameOptions' in options) {
            this.#_values.xFrameOptions = XFrameOptions.validate(options.xFrameOptions) || '';
        }
        else {
            this.#_values.xFrameOptions = this.#_defaults.values.xFrameOptions;
        }
        // #12: X-Permitted-Cross-Domain-Policies
        if (notUndefined && isRealObject && 'xPermittedCrossDomainPolicies' in options) {
            this.#_values.xPermittedCrossDomainPolicies = XPermittedCrossDomainPolicies.validate(options.xPermittedCrossDomainPolicies) || '';
        }
        else {
            this.#_values.xPermittedCrossDomainPolicies = this.#_defaults.values.xPermittedCrossDomainPolicies;
        }
        // #13: X-Powered-By
        if (notUndefined && isRealObject && 'xPoweredBy' in options) {
            this.#_values.xPoweredBy = typeof options.xPoweredBy === 'boolean' ? options.xPoweredBy : true;
        }
        else {
            this.#_values.xPoweredBy = this.#_defaults.values.xPoweredBy;
        }
        // #14: X-XSS-Protection
        if (notUndefined && isRealObject && 'xXssProtection' in options) {
            this.#_values.xXssProtection = typeof options.xXssProtection === 'boolean' ? options.xXssProtection : true;
        }
        else {
            this.#_values.xXssProtection = this.#_defaults.values.xXssProtection;
        }
        this.#_updateHandler();
    }
    /**This method updates the handler that is used in every request */
    #_updateHandler() {
        const handler = (req, res, next) => {
            try {
                // #1: Content-Security-Policy
                res.setHeader('Content-Security-Policy', this.#_values.contentSecurityPolicy);
                // #2: Cross-Origin-Embedder-Policy
                if (this.#_values.crossOriginEmbedderPolicy) {
                    res.setHeader("Cross-Origin-Embedder-Policy", this.#_values.crossOriginEmbedderPolicy);
                }
                // #3: CrossOriginOpenerPolicy
                if (this.#_values.crossOriginOpenerPolicy) {
                    res.setHeader("Cross-Origin-Opener-Policy", this.#_values.crossOriginOpenerPolicy);
                }
                // #4: Cross-Origin-Resource-Policy
                if (this.#_values.crossOriginResourcePolicy) {
                    res.setHeader("Cross-Origin-Resource-Policy", this.#_values.crossOriginResourcePolicy);
                }
                // #5: Origin-Agent-Cluster
                if (this.#_values.crossOriginResourcePolicy) {
                    res.setHeader("Origin-Agent-Cluster", this.#_values.crossOriginResourcePolicy);
                }
                // #6: Referrer-Policy
                if (this.#_values.referrerPolicy) {
                    res.setHeader("Referrer-Policy", this.#_values.referrerPolicy);
                }
                // #7: Strict-Transport-Security
                if (this.#_values.strictTransportSecurity) {
                    res.setHeader("Strict-Transport-Security", this.#_values.strictTransportSecurity);
                }
                // #8: X-Content-Type-Options
                if (this.#_values.xContentTypeOptions) {
                    res.setHeader("X-Content-Type-Options", this.#_values.xContentTypeOptions);
                }
                // #9: X-DNS-Prefetch-Control
                if (this.#_values.xDnsPrefetchControl) {
                    res.setHeader("X-DNS-Prefetch-Control", this.#_values.xDnsPrefetchControl);
                }
                // #10: X-Download-Options
                if (this.#_values.xDownloadOptions) {
                    res.setHeader("X-Download-Options", this.#_values.xDownloadOptions);
                }
                // #11: X-Frame-Options
                if (this.#_values.xFrameOptions) {
                    res.setHeader("X-Frame-Options", this.#_values.xFrameOptions);
                }
                // #12: X-Permitted-Cross-Domain-Policies
                if (this.#_values.xPermittedCrossDomainPolicies) {
                    res.setHeader("X-Permitted-Cross-Domain-Policies", this.#_values.xPermittedCrossDomainPolicies);
                }
                // #13: X-Powered-By
                if (this.#_values.xPoweredBy) {
                    res.removeHeader("X-Powered-By");
                }
                // #14: X-XSS-Protection
                if (this.#_values.xXssProtection) {
                    res.setHeader("X-XSS-Protection", '0');
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                next();
            }
        };
        this.#_server._handlers.helmet = handler;
    }
}
export default HelmetManager;
