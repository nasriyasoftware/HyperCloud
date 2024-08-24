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
     * Manages and configures file uploads, including setting size limits, directories, and MIME type restrictions.
     *
     * The `uploads` instance provides a comprehensive interface for handling file uploads on the server. It allows you to define maximum file sizes for different types of uploads, configure the upload directory, and set specific limits based on MIME types. This utility ensures that your server handles file uploads efficiently and securely, with customizable parameters to suit your needs.
     *
     * **Example Usage:**
     * 
     * ```js
     * // Set the directory where uploads will be stored
     * server.uploads.directory = '/path/to/uploads';
     * 
     * // Set the maximum file size for uploads to 50 MB
     * server.uploads.maxFileSize = { value: 50, unit: 'MB' };
     * 
     * // Set the maximum file size for images to 10 MB
     * server.uploads.limits.images = { value: 10, unit: 'MB' };
     * 
     * // Retrieve the current maximum file size for images
     * const maxImageSize = server.uploads.limits.images;
     * 
     * // Set a specific limit for PDF files
     * server.uploads.limits.mime.set('application/pdf', { value: 5, unit: 'MB' });
     * ```
     * 
     * **Properties:**
     * 
     * - **directory**: Gets or sets the directory where uploads are stored. If the directory does not exist, it will be created automatically.
     * - **maxFileSize**: Gets or sets the maximum file size allowed for uploads, either as a number in bytes or as a `StorageSize` object.
     * - **limits**: Provides access to upload size limits for file streams, images, videos, and specific MIME types.
     */
    get limits() { return this.#_limits }
}

export default Uploads

