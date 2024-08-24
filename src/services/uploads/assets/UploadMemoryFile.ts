import { MimeType } from '../../../docs/docs';

interface UploadedFileConstructorOptions {
    fieldName: string;
    fileName: string;
    mime: MimeType;
    tempPath: string;
}

class UploadedMemoryFile {
    readonly #_data = {
        fieldName: '',
        fileName: '',
        mime: '' as MimeType,
        content: [] as Buffer[],
        size: 0
    }

    constructor(options: UploadedFileConstructorOptions) {
        this.#_data.fieldName = options.fieldName;
        this.#_data.fileName = options.fileName;
        this.#_data.mime = options.mime;

    }

    get fieldName() { return this.#_data.fieldName }
    get fileName() { return this.#_data.fileName }
    get mime() { return this.#_data.mime }
    get size() { return Buffer.from(this.#_data.content.join()).byteLength }
    get content() { return Buffer.concat(this.#_data.content) }

    push(chunk: any) {
        this.#_data.content.push(Buffer.from(chunk, 'binary'));
    }
}

export default UploadedMemoryFile;