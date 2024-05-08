import HyperCloudResponse from '../handler/assets/response';

/** Represents a renderer class */
declare class Renderer {
    /**
     * Creates an instance of Renderer.
     * @param {HyperCloudResponse} res The HyperCloudResponse object.
     */
    constructor(res: HyperCloudResponse);

    /** Sets the locals value */
    set locals(value: Record<string, any>);
    /** Gets the locals value */
    get locals(): Record<string, any>;
    /** Gets the view engine value */
    get viewEngine(): string;

    /**
     * Renders the HTML page.
     * @param {string} fileName The view name in the views object.
     * @param {Record<string, any>} locals A `key:value` pairs object for variables.
     * @returns {string} The rendered `HTML` page.
     */
    render(fileName: string, locals: Record<string, any>): string;
}

export default Renderer;