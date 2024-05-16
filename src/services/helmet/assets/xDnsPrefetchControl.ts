import { DNSPrefetchControlOptions } from "../../../docs/docs";
import helpers from "../../../utils/helpers";

class DNSPrefetchControl {
    static validate(options?: DNSPrefetchControlOptions | false) {
        if (options === false) { return null }
        if (!options || !helpers.is.realObject(options) || !('enabled' in options)) {
            return 'off';
        }

        const { enabled } = options;
        return enabled ? "on" : "off";
    }
}

export default DNSPrefetchControl;