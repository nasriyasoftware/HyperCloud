import HyperCloudResponse from '../handler/assets/response';
declare class Renderer {
    #private;
    constructor(res: HyperCloudResponse);
    set locals(value: {});
    get locals(): {};
    get viewEngine(): import("../../docs/docs").ViewEngine;
    /**
     *
     * @param {string} fileName The view name in the views object
     * @param {object} locals A `key:value` pairs object for variables
     * @returns {string} The rendered `HTML` page
     */
    render(fileName: string, locals: Record<string, any>): string;
}
export default Renderer;
