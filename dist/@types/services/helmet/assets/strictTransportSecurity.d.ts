import { StrictTransportSecurityOptions } from "../../../docs/docs";
declare class StrictTransportSecurity {
    static readonly defaultMaxAge: number;
    static readonly defaultIncludeSubDomains: boolean;
    static readonly defaultPreload: boolean;
    static validate(options?: StrictTransportSecurityOptions | false): string | null;
}
export default StrictTransportSecurity;
