import { XFrameOptionsOption, XFrameOptionsOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class XFrameOptions {
    static validate(options?: XFrameOptionsOptions | false) {
        if (options === false) { return null }

        if (!options || helpers.isNot.realObject(options) || !options.action) {
            return 'DENY';
        }

        const { action, uri } = options;
        switch (action) {
            case XFrameOptionsOption.DENY:
            case XFrameOptionsOption.SAMEORIGIN:
                return action;
            case XFrameOptionsOption.ALLOWFROM:
                if (uri) {
                    return `${action} ${uri}`;
                } else {
                    throw new Error("URI must be provided for ALLOW-FROM value.");
                }
            default:
                throw new Error("Invalid X-Frame-Options value.");
        }
    }
}

export default XFrameOptions;