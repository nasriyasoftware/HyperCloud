import { HyperCloudRequest, HyperCloudResponse } from "../../../hypercloud";
import { InitializedRequest, MimeType, UploadCleanUpFunction } from "../../../docs/docs";
import MimeLimits from "./mimeLimits";
import UploadedMemoryFile from "./UploadMemoryFile";
import UploadedStorageFile from "./UploadedStorageFile";
import RequestBody from "../../handler/assets/requestBody";
import fs from "fs";
import helpers from "../../../utils/helpers";
import path from "path";

const mimes: MimeType[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/mimes.json'), { encoding: 'utf8' }));

class UploadHandler {
    #_currentFile: UploadedMemoryFile | UploadedStorageFile | undefined;
    readonly #_request: HyperCloudRequest;
    readonly #_initReq: InitializedRequest;
    readonly #_response: HyperCloudResponse;

    readonly #_configs = {
        /**The maximum file size allowed */
        maxFileSize: 0,
        // Initialize storage and limits
        limits: {
            /**The maximum size allowed to store files in memory while uploading */
            fileStream: 0,
            images: 0,
            videos: 0,
            mime: null as unknown as MimeLimits
        }
    }

    readonly #_files: (UploadedMemoryFile | UploadedStorageFile)[] = [];
    readonly #_fields: Record<string, string> = {};

    readonly #_data = {
        contentLength: 0,
        boundary: '',
        endBoundary: '',
        chunks: 0,
    }

    readonly #_flags = {
        useFileStream: false,
        finished: false
    }

    readonly #_promiseResponse = {
        resolve: undefined as unknown as (value: void) => void,
        reject: undefined as unknown as (reason?: any) => void,
    }

    constructor(req: HyperCloudRequest, initReq: InitializedRequest, res: HyperCloudResponse) {
        this.#_request = req;
        this.#_initReq = initReq;
        this.#_response = res;

        this.#_configs = {
            maxFileSize: this.#_request.server.uploads.maxFileSize,
            limits: {
                fileStream: this.#_request.server.uploads.limits.fileStream,
                images: this.#_request.server.uploads.limits.images,
                videos: this.#_request.server.uploads.limits.videos,
                mime: this.#_request.server.uploads.limits.mime
            }
        }
    }

    async #validate() {
        if (this.#_request.method !== 'POST') {
            throw { code: 500, message: 'Cannot handle form data for a non-POST request' }
        }

        this.#_data.contentLength = parseInt(this.#_request.headers['content-length'] || '0', 10);

        const contentType = this.#_request.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            this.#_response.status(400).json({ message: 'Content-Type must be multipart/form-data' });
            throw { code: 400, message: 'Content-Type must be multipart/form-data' }
        }

        const boundaryMatch = contentType.match(/boundary=(.*)$/);
        if (!boundaryMatch?.[1]) {
            this.#_response.status(400).json({ message: 'Boundary not found in multipart/form-data' });
            throw { code: 400, message: 'Boundary not found in multipart/form-data' };
        }

        this.#_data.boundary = boundaryMatch[1];
        this.#_data.endBoundary = `\r\n--${this.#_data.boundary}--`;
        this.#_flags.useFileStream = this.#_data.contentLength > this.#_configs.limits.fileStream;
    }

    readonly #_helpers = {
        analyze: async (data: string) => {
            try {
                // Regular expressions to match Content-Disposition and Content-Type headers
                const fieldRegex = /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="[^"]+")?\s*(?:\r?\n|\r?\n|\n)?(?:\r?\n|\r?)([^\r\n]*)/;
                const fileRegex = /Content-Disposition:\s*form-data;\s*name="([^"]+)";\s*filename="([^"]+)"\s*(?:\r?\n|\r?\n|\n)?Content-Type:\s*([^;\r\n]*)\s*(?:\r?\n|\r?\n|\n)?(?:\r?\n|\r?)(.*)/;
                const matchField = data.match(fieldRegex);
                const matchFile = data.match(fileRegex);

                if (matchFile) {
                    // Extract the field name, file name, and content type
                    const details = {
                        fieldName: matchFile[1],
                        fileName: matchFile[2],
                        mime: matchFile[3] as MimeType,
                        tempPath: this.#_request.server.uploads.directory
                    }

                    if (!details.fieldName || !details.fileName || !details.mime) {
                        throw new Error(`The header is invalid`)
                    }

                    if (!mimes.includes(details.mime)) {
                        throw new Error(`The request mime type is not supported: ${details.mime}`)
                    }

                    this.#_currentFile = (() => {
                        if (this.#_flags.useFileStream) {
                            return new UploadedStorageFile(details);
                        } else {
                            return new UploadedMemoryFile(details);
                        }
                    })();

                    this.#_files.push(this.#_currentFile);

                    // Remove the matched lines from the data
                    let cleanedData = data.replace(matchFile[0], '').replace(details.mime, '');

                    // Remove any leading or trailing newlines caused by the removal
                    cleanedData = cleanedData.trim();

                    await this.#_helpers.process(cleanedData);
                } else {
                    if (matchField) {
                        this.#_fields[matchField[1]] = matchField[2].trim();
                    }
                }
            } catch (error) {
                await this.#_helpers.handleError(error);
            }
        },
        process: async (chunk: string) => {
            if (this.#_flags.useFileStream) {
                try {
                    await (this.#_currentFile as UploadedStorageFile).write(chunk);
                } catch (error) {
                    await this.#_helpers.handleError(error);
                }
            } else {
                (this.#_currentFile as UploadedMemoryFile).push(chunk);
            }
        },
        processNew: async (chunk: string) => {
            await this.#_helpers.finalize()
            await this.#_helpers.analyze(chunk);

        },
        finalize: async () => {
            try {
                if (this.#_currentFile) {
                    if (this.#_currentFile instanceof UploadedStorageFile) { await this.#_currentFile.finish() }
                    this.#_currentFile = undefined;
                }
            } catch (error) {
                await this.#_helpers.handleError(error);
            }
        },
        cleanUp: async () => {
            const promises = this.#_files.filter(file => file instanceof UploadedStorageFile).map(file => {
                return new Promise<void>((resolve, reject) => {
                    fs.promises.unlink(file.path).then(() => {
                        helpers.printConsole(`Temporary Uploaded File "${file.fileName}" has been deleted from "${file.path}"`);
                        resolve();
                    }).catch(err => {
                        helpers.printConsole(`Unable to delete Temporary Uploaded File "${file.fileName}" from "${file.path}". Reason: ${err?.message || 'Unknown'}`)
                        helpers.printConsole(err);
                        reject();
                    })
                })
            })

            const result = await Promise.allSettled(promises);
            const rejected = result.filter(i => i.status === 'rejected');

            if (rejected.length > 0) {
                throw new Error(`Unable to clean uploaded files from "${this.#_request.server.uploads.directory}". Make sure to delete them manually.`)
            }
        },
        handleError: async (error: any) => {
            await this.#_helpers.cleanUp();
            this.#_promiseResponse.reject(error);
        }
    }

    readonly #_queue = {
        storage: [] as string[],
        processing: false,
        add: (chunk: string) => {
            this.#_data.chunks++;
            this.#_queue.storage.push(chunk);
            this.#_queue.process();
        },
        processChunk: async (chunk: string) => {
            try {
                const firstChunk = this.#_data.chunks === 1;
                const isLastChunk = chunk.includes(this.#_data.endBoundary);

                if (isLastChunk) { chunk = chunk.replace(this.#_data.endBoundary, '') }
                if (chunk.length === 0) { return }

                // Normalize the first boundary
                if (firstChunk) { chunk = chunk.replace(`--${this.#_data.boundary}`, this.#_data.boundary) }
                const hasBoundary = chunk.includes(this.#_data.boundary);

                if (hasBoundary) {
                    for (const part of chunk.split(`${this.#_data.boundary}\r\n`).filter(i => i.length > 0)) {
                        await this.#_helpers.processNew(part);
                    }
                } else {
                    await this.#_helpers.process(chunk);
                }

                if (isLastChunk && this.#_currentFile instanceof UploadedStorageFile && !this.#_currentFile.closed) {
                    await this.#_currentFile.finish();
                }
            } catch (error) {
                throw error;
            }
        },
        process: async () => {
            if (this.#_queue.processing) { return }
            this.#_queue.processing = true;

            try {
                while (this.#_queue.storage.length > 0) {
                    const chunk = this.#_queue.storage.shift();
                    if (chunk) { await this.#_queue.processChunk(chunk) }
                }
            } catch (error) {
                this.#_queue.processing = false;
                await this.#_helpers.handleError(error);
            }

            this.#_queue.processing = false;
            if (this.#_flags.finished) this.#_queue.onFinished();
        },
        onFinished: () => {
            const storageF = this.#_files.filter(i => i instanceof UploadedStorageFile).map(file => {
                return {
                    fieldName: file.fieldName,
                    fileName: file.fileName,
                    mime: file.mime,
                    size: file.size,
                    path: file.path
                }
            })

            const memoryF = this.#_files.filter(i => i instanceof UploadedMemoryFile).map(file => {
                return {
                    fieldName: file.fieldName,
                    fileName: file.fileName,
                    mime: file.mime,
                    size: file.size,
                    content: file.content
                }
            })

            this.#_initReq.body = new RequestBody().from({
                files: [...storageF, ...memoryF],
                fields: this.#_fields,
                cleanup: this.#_helpers.cleanUp
            });

            this.#_initReq.bodyType = 'formData';
            this.#_helpers.finalize().then(() => this.#_promiseResponse.resolve());
        }
    }

    async handle() {
        return new Promise<void>((resolve, reject) => {
            this.#_promiseResponse.resolve = resolve;
            this.#_promiseResponse.reject = reject;

            this.#validate().catch(async (error) => {
                await this.#_helpers.handleError(error);
            });

            this.#_request.httpRequest.on('data', async (chunk: string) => {
                this.#_queue.add(chunk);
            })

            this.#_request.httpRequest.on('end', async () => {
                this.#_flags.finished = true;
                if (!this.#_queue.processing) { this.#_queue.onFinished() }
            })

            this.#_request.httpRequest.on('error', async (error) => {
                await this.#_helpers.handleError(error);
            });
        })

    }

    get contentLength() { return this.#_data.contentLength }
}

export default UploadHandler