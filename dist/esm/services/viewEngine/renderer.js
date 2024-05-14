import helpers from '../../utils/helpers';
class Renderer {
    #_response;
    #_data = {
        locals: {},
        filePath: null
    };
    constructor(res) {
        this.#_response = res;
    }
    set locals(value) {
        if (helpers.is.realObject(value)) {
            this.#_data.locals = value;
        }
        else {
            throw new TypeError(`The ViewEngine.locals expected an object of key:value pairs but instead got ${typeof value}`);
        }
    }
    get locals() { return this.#_data.locals; }
    get viewEngine() { return this.#_response.server.rendering.viewEngine; }
    /**
     *
     * @param {string} fileName The view name in the views object
     * @param {object} locals A `key:value` pairs object for variables
     * @returns {string} The rendered `HTML` page
     */
    render(fileName, locals) {
        try {
            // Make sure the view name exist
            if (!(fileName in this.#_response.server.rendering.views)) {
                throw `${fileName} view is not defined in the views object`;
            }
            // If provided, make sure the locals is a real object
            if (!helpers.is.realObject(locals)) {
                throw `The locals should be an object of key:value pairs, but instead got ${typeof locals}`;
            }
            // Determine the engine
            const viewEngine = this.viewEngine;
            let engine;
            try {
                switch (viewEngine) {
                    case 'ejs':
                        engine = eval('require')('ejs');
                        break;
                }
            }
            catch (error) {
                helpers.printConsole(error);
                throw `${viewEngine} engine is chosen but is not installed.`;
            }
            const lang = locals?.lang ? locals.lang : 'en';
            locals.lang = lang;
            locals.dir = locals.lang === 'ar' || locals.lang === 'he' ? ' dir=rtl' : '';
            // Attempt to render            
            return engine.render(this.#_response.server.rendering.views[fileName], { ...this.#_response.server.locals, ...locals });
        }
        catch (error) {
            if (typeof error === 'string') {
                error = `Failed to render ${fileName}: ${error}`;
            }
            if (error instanceof Error) {
                error.message = `Failed to render ${fileName}: ${error.message}`;
            }
            throw error;
        }
    }
}
export default Renderer;
