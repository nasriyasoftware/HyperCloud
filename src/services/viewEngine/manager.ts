import helpers from '../../utils/helpers';
import { ViewEngine } from '../../docs/docs';

import path from 'path';
import fs from 'fs';
import HyperCloudServer from '../../server';

/**
 * This class is used inside a {@link HyperCloudServer} as
 * `{@link HyperCloudServer["rendering"]}`
 */
class RenderingManager {
    readonly #_server: HyperCloudServer;
    readonly #_constants = Object.freeze({
        viewEngines: ['nhc', 'ejs']
    })

    #_viewEngine: ViewEngine = 'ejs';
    readonly #_views = {}

    constructor(server: HyperCloudServer) {
        this.#_server = server;
    }

    /**
     * Register a directory as views folder
     * @param {string} directory 
     */
    #_registerTemplates(directory: string): void {
        try {
            const files = fs.readdirSync(directory);
            files.forEach(file => {
                const parsed = path.parse(file);
                if (parsed.ext === `.${this.#_viewEngine}`) {
                    const filePath = path.join(directory, file);
                    const viewName = parsed.name;
                    const template = fs.readFileSync(filePath, 'utf8');
                    this.views[viewName] = template;
                }
            });
        } catch (error) {
            helpers.printConsole(error);
            throw `Unable to register template: ${directory}`;
        }
    }

    /**
     * Add `views` folder(s) to the server
     * @param {string|string[]} paths A path to a views directory or an array of views' paths.
     */
    addViews(paths: string | string[]): void {
        if (!(Array.isArray(path) || typeof paths === 'string')) { throw new TypeError(`The server.renderer.addViews method accepts a string or an array of of valid views folders, but instead got ${typeof paths}`) }
        const errors: any[] = [];

        // If the argument is a single path, put it inside an array
        if (typeof paths === 'string') { paths = [paths] }

        // Validating input
        for (const viewsPath of paths) {
            const validity = helpers.checkPathAccessibility(viewsPath);
            if (validity.valid) {
                this.#_registerTemplates(viewsPath);
                continue;
            }

            const error = { path: viewsPath, type: 'invalid_path', errors: [] as string[] }
            if (validity.errors.isString !== true) { error.errors.push('Not a string') }
            if (validity.errors.exist !== true) { error.errors.push('Path doesn\'t exist') }
            if (validity.errors.accessible !== true) { error.errors.push('access denied: no read permissions') }
            errors.push(error);
        }

        if (errors.length > 0) { throw errors }
    }

    /**
     * Get an object of the registered templates
     * @returns {Record<string, string>}
     */
    get views(): Record<string, string> { return this.#_views }

    /**
     * Get or set the view engine of the server
     * @returns {ViewEngine}
     */
    get viewEngine(): ViewEngine { return this.#_viewEngine }
    /**@param {ViewEngine} engine The view engine you want to choose */
    set viewEngine(engine: ViewEngine) {
        if (this.#_constants.viewEngines.includes(engine)) {
            this.#_viewEngine = engine;
        } else {
            throw new RangeError(`${engine} is not a supportd view engine. You can only use ${this.#_constants.viewEngines.join(', ')}`)
        }
    }
}

export default RenderingManager;