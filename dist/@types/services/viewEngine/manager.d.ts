import { ViewEngine } from '../../docs/docs';
import HyperCloudServer from '../../server';
/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer["rendering"]}`
 */
declare class RenderingManager {
    #private;
    constructor(server: HyperCloudServer);
    /**
     * Add `views` folder(s) to the server
     * @param {string|string[]} paths A path to a views directory or an array of views' paths.
     */
    addViews(paths: string | string[]): void;
    /**
     * Get an object of the registered templates
     * @returns {Record<string, string>}
     */
    get views(): Record<string, string>;
    /**
     * Get or set the view engine of the server
     * @returns {ViewEngine}
     */
    get viewEngine(): ViewEngine;
    /**@param {ViewEngine} engine The view engine you want to choose */
    set viewEngine(engine: ViewEngine);
}
export default RenderingManager;
