import { XPermittedCrossDomainPoliciesOption, XPermittedCrossDomainPoliciesOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class XPermittedCrossDomainPolicies {
    static validate(options?: XPermittedCrossDomainPoliciesOptions | false) {
        if (options === false) { return null }

        if (helpers.is.undefined(options) || helpers.isNot.realObject(options) || !('permittedPolicies' in options)) {
            return 'none';

        }
        const { permittedPolicies } = options;
        switch (permittedPolicies) {
            case XPermittedCrossDomainPoliciesOption.NONE:
            case XPermittedCrossDomainPoliciesOption.MASTERONLY:
            case XPermittedCrossDomainPoliciesOption.BYCONTENTTYPE:
            case XPermittedCrossDomainPoliciesOption.ALL:
                return permittedPolicies;
            default:
                throw new Error("Invalid X-Permitted-Cross-Domain-Policies value.");
        }
    }
}

export default XPermittedCrossDomainPolicies;