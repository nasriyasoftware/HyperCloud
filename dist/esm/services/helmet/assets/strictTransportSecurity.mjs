import helpers from "../../../utils/helpers";
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
        if (!helpers.is.integer(maxAge) || maxAge <= 0) {
            throw new Error(`Invalid maxAge value for Strict-Transport-Security: ${maxAge}`);
        }
        const maxAgeDirective = `max-age=${maxAge}`;
        const includeSubDomainsDirective = includeSubDomains ? "; includeSubDomains" : "";
        const preloadDirective = preload ? "; preload" : "";
        return `${maxAgeDirective}${includeSubDomainsDirective}${preloadDirective}`;
    }
}
export default StrictTransportSecurity;
