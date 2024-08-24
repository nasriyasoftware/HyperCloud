import { StorageSize, UploadLimitsController } from "../../../docs/docs";
import MimeLimits from "./mimeLimits";
import uploadHelpers from "./utils";

class UploadLimits {
    readonly #_controller: UploadLimitsController;
    readonly #_mimeLimits: MimeLimits;

    constructor(controller: UploadLimitsController) {
        this.#_controller = controller;
        this.#_mimeLimits = new MimeLimits(controller);
    }

    /**
    * Gets the current file stream limit for uploads.
    * This limit defines the maximum size at which file uploads will be stored in a stream
    * rather than in memory.
    *
    * @returns {number} The file stream limit in bytes.
    */
    get fileStream(): number { return this.#_controller.fileStream.get() }

    /**
     * Sets a new file stream limit for uploads.
     * If the provided limit is a `StorageSize`, it will be converted to bytes.
     * This limit determines when uploads are stored in a stream rather than in memory.
     *
     * @param {number | StorageSize} limit - The new file stream limit, either as a number in bytes or a `StorageSize` object.
     */
    set fileStream(limit: number | StorageSize) {
        const limitValue = uploadHelpers.getLimit(limit);
        this.#_controller.fileStream.set(limitValue);
    }

    /**
     * Get the maximum allowed size for images.
     * @returns {number} - The maximum file size limit for images in bytes.
     */
    get images(): number { return this.#_controller.images.get() }

    /**
     * Set the maximum allowed size for images, or set it
     * to `0` to remove the limit.
     * @param {number|StorageSize} limit - The maximum allowed file size of images in bytes.
     * @throws {TypeError} - Throws if limit is not a number.
     * @throws {RangeError} - Throws if limit is negative.
     */
    set images(limit: number | StorageSize) {
        const limitValue = uploadHelpers.getLimit(limit);
        this.#_controller.images.set(limitValue);
    }

    /**
     * Get the maximum allowed size for videos.
     * @returns {number} - The maximum file size limit for videos in bytes.
     */
    get videos(): number { return this.#_controller.videos.get() }

    /**
     * Set the maximum allowed size for videos, or set it
     * to `0` to remove the limit.
     * @param {number|StorageSize} limit - The maximum allowed file size of videos in bytes.
     * @throws {TypeError} - Throws if limit is not a number.
     * @throws {RangeError} - Throws if limit is negative.
     */
    set videos(limit: number | StorageSize) {
        const limitValue = uploadHelpers.getLimit(limit);
        this.#_controller.videos.set(limitValue);
    }

    /**
     * Set or get the maximum allowed file size for specific MIME types.
     * This allows for finer-grained control over upload limits based on MIME type.
     * The MIME type-specific limit takes precedence over the general image or video limits.
     * Use `0` to remove the limit for a specific MIME type.
     */
    get mime() { return this.#_mimeLimits }
}

export default UploadLimits;