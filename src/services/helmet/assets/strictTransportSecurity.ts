import { StrictTransportSecurityOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class StrictTransportSecurity {
    static readonly defaultMaxAge: number = 15552000;
    static readonly defaultIncludeSubDomains: boolean = true;
    static readonly defaultPreload: boolean = false;

    static validate(options?: StrictTransportSecurityOptions | false) {
        if (options === false) { return null };

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