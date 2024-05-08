import { ViewEngine } from '../../docs/docs';
import HyperCloudServer from '../../server';

/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer.rendering}`
 */
declare class RenderingManager {
    /**
     * This class is used inside a {@link HyperCloudServer} as
     * `{@link HyperCloudServer.rendering}`
     */
    private readonly _server: HyperCloudServer;
    private readonly _constants: {
        viewEngines: ['nhc', 'ejs'];
    };
    private _viewEngine: ViewEngine;
    private _views: {};

    /**
     * Register a directory as views folder
     * @param directory 
     */
    private _registerTemplates(directory: string): void;

    /**
     * Add `views` folder(s) to the server
     * @param paths A path to a views directory or an array of views' paths.
     */
    addViews(paths: string | string[]): void;

    /**
     * Get an object of the registered templates
     * @returns Record<string, string>
     */
    get views(): Record<string, string>;

    /**
     * Get or set the view engine of the server
     * @returns ViewEngine
     * @param engine The view engine you want to choose
     */
    set viewEngine(engine: ViewEngine);
}

export default RenderingManager;
