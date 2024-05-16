import { HelmetConfigOptions } from "../../docs/docs";
import HyperCloudServer from "../../server";
declare class HelmetManager {
    #private;
    constructor(server: HyperCloudServer);
    /**
     * Setup a protection helmet for your server. You can customize each section
     * according to your needs.
     * @param options Helmet configuration options
     */
    config(options?: HelmetConfigOptions): void;
}
export default HelmetManager;
