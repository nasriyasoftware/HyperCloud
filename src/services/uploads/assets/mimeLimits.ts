import { UploadLimitsController, MimeType } from "../../../docs/docs";

class MimeLimits {
    readonly #_controller: UploadLimitsController;

    constructor(controller: UploadLimitsController) {
        this.#_controller = controller
    }

    /**
     * Set the maximum allowed size for files of a specific MIME type, or set it
     * to `0` to remove the limit.
     * @param {MimeType} mime - The MIME type of the files.
     * @param {number} limit - The maximum allowed file size of the specified MIME type in bytes.
     * @throws {TypeError} - Throws if `mime` is not a string or `limit` is not a number.
     * @throws {RangeError} - Throws if `limit` is negative.
     */
    set(mime: MimeType, limit: number) {
        this.#_controller.mime.set(mime, limit)
    }

    /**
     * Get the maximum allowed size for files of a specific MIME type.
     * @param {MimeType} mime - The MIME type of the files.
     * @returns {number | undefined} - The maximum file size limit for the specified MIME type in bytes, or `undefined` if not set.
     * @throws {TypeError} - Throws if `mime` is not a string.
     */
    get(mime: MimeType): number | undefined {
        return this.#_controller.mime.get(mime);
    }
}

export default MimeLimits;