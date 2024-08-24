import path from 'path';
import fs from 'fs';
import { MimeType, StorageSize } from '../../docs/docs';
import helpers from '../../utils/helpers';
import UploadLimits from './assets/limits';
import uploadHelpers from './assets/utils';

class Uploads {
    readonly #_limits: UploadLimits;
    readonly #_config = {
        maxFileSize: 100 * 1024 * 1024,
        uploadDir: path.resolve('temp/uploads'),
        limits: {
            fileStream: 20 * 1024 * 1024,
            images: 10 * 1024 * 1024, // 10 MB,
            videos: 100 * 1024 * 1024, // 100 MB,
            mimes: {} as Record<MimeType, number>
        }
    }

    constructor() {
        const controller = {
            fileStream: {
                get: () => { return this.#_config.limits.fileStream },
                set: (limit: number) => {
                    if (typeof limit !== 'number') { throw new TypeError('Limit must be a number.'); }
                    if (limit < 0) { throw new RangeError('Limit must be a non-negative number.'); }

                    this.#_config.limits.fileStream = limit;
                }
            },
            images: {
                get: () => { return this.#_config.limits.images },
                set: (limit: number) => {
                    if (typeof limit !== 'number') { throw new TypeError('Limit must be a number.'); }
                    if (limit < 0) { throw new RangeError('Limit must be a non-negative number.'); }

                    this.#_config.limits.images = limit;
                }
            },
            videos: {
                get: () => { return this.#_config.limits.videos },
                set: (limit: number) => {
                    if (typeof limit !== 'number') { throw new TypeError('Limit must be a number.'); }
                    if (limit < 0) { throw new RangeError('Limit must be a non-negative number.'); }

                    this.#_config.limits.videos = limit;
                }
            },
            mime: {
                get: (mime: MimeType) => {
                    if (typeof mime !== 'string') { throw new TypeError('MIME type must be a string.'); }
                    if (helpers.isNot.validMime(mime)) { throw new TypeError(`${mime} is not a valid mime`) }
                    return this.#_config.limits.mimes[mime];
                },
                set: (mime: MimeType, limit: number) => {
                    if (helpers.isNot.validString(mime)) { throw new TypeError('MIME type must be a string.') }
                    if (helpers.isNot.validMime(mime)) { throw new TypeError(`${mime} is not a valid mime`) }
                    if (typeof limit !== 'number') { throw new TypeError('Limit must be a number.') }
                    if (limit < 0) { throw new RangeError('Limit must be a non-negative number.') }

                    this.#_config.limits.mimes[mime] = limit;
                }
            }
        }

        this.#_limits = new UploadLimits(controller)
    }

    /**
     * Gets the directory where uploads are stored.
     * If the directory does not exist, it will be created.
     * @returns {string} The directory path.
     */
    get directory(): string {
        const dir = this.#_config.uploadDir;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        return dir;
    }

    /**
     * Sets the directory where uploads are stored.
     * Validates if the directory exists and creates it if necessary.
     * @param {string} dir - The directory path to set.
     */
    set directory(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.#_config.uploadDir = dir;
    }

    /**
     * Gets the maximum file size allowed for uploads.
     * @returns {number} The maximum file size in bytes.
     */
    get maxFileSize(): number { return this.#_config.maxFileSize }

    /**
     * Sets the maximum file size allowed for uploads.
     * Converts the provided value to a numerical limit if necessary.
     * @param {number | StorageSize} value - The maximum file size to set.
     */
    set maxFileSize(value: number | StorageSize) {
        const limit = uploadHelpers.getLimit(value);
        this.#_config.maxFileSize = limit;
    }

    /**
     * Manages and configures file upload size limits.
     * 
     * This utility allows setting and retrieving the maximum allowed file sizes for different types
     * of uploads, including images and videos. It also supports configuring upload size limits for specific
     * MIME types, with MIME type-specific limits taking precedence over general image or video limits.
     * 
     * **Usage Example:**
     * 
     * ```js
     * // Set the maximum file size for images to 10 MB
     * server.uploads.limits.images = { value: 10, unit: 'MB' };
     * 
     * // Set the maximum file size for videos to 10485760 bytes (10 MB)
     * server.uploads.limits.videos = 10485760;
     * 
     * // Retrieve the current maximum file size for videos
     * const maxVideoSize = server.uploads.limits.videos;
     * 
     * // Set a specific limit for a MIME type
     * server.uploads.limits.mime.set('application/pdf', { value: 5, unit: 'MB' });
     * 
     * // Retrieve the maximum file size limit for a specific MIME type
     * const pdfLimit = server.uploads.limits.mime.get('application/pdf');
     * ```
     * 
     * **Methods:**
     * 
     * - **images**: Get or set the maximum allowed file size for images. Accepts a `number` (bytes) or 
     *   an object `{ value: number, unit: StorageUnit }`.
     * - **videos**: Get or set the maximum allowed file size for videos. Accepts a `number` (bytes) or 
     *   an object `{ value: number, unit: StorageUnit }`.
     * - **mime**: Set or get the maximum allowed file size for specific MIME types. Uses 
     *   `mime.set(mimeType, limit)` to set, where `limit` is a `number` (bytes) or an object 
     *   `{ value: number, unit: StorageUnit }`, and `mime.get(mimeType)` to retrieve the limit.
     * 
     * **Parameters:**
     * - **limit**: Can be a `number` representing bytes or an object `{ value: number, unit: StorageUnit }`.
     * - **mimeType**: The MIME type to set or retrieve specific file size limits (e.g., 'application/pdf').
     * 
     * **Notes:**
     * - Setting the limit to `0` will remove the restriction for the corresponding type or MIME type.
     * - MIME type-specific limits take precedence over general limits for images or videos.
     */
    get limits() { return this.#_limits }
}

export default Uploads

