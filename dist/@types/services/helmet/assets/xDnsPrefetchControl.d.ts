import { DNSPrefetchControlOptions } from "../../../docs/docs";
declare class DNSPrefetchControl {
    static validate(options?: DNSPrefetchControlOptions | false): "off" | "on" | null;
}
export default DNSPrefetchControl;
