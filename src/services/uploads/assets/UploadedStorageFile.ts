import fs from 'fs';
import path from 'path';
import { MimeType } from '../../../docs/docs';

interface UploadedFileConstructorOptions {
    fieldName: string;
    fileName: string;
    mime: MimeType;
    tempPath: string;
}

class UploadedStorageFile {
    #_closed = false;
    readonly #_stream: fs.WriteStream;
    readonly #_data = {
        fieldName: '',
        fileName: '',
        mime: '' as MimeType,
        path: '',
        size: 0
    }

    constructor(options: UploadedFileConstructorOptions) {
        this.#_data.fieldName = options.fieldName;
        this.#_data.fileName = options.fileName;
        this.#_data.mime = options.mime;
        this.#_data.path = path.join(options.tempPath, `${Date.now()}_temp_${options.fileName}`)

        this.#_stream = fs.createWriteStream(this.path, { encoding: 'binary' });
    }

    get fieldName() { return this.#_data.fieldName }
    get fileName() { return this.#_data.fileName }
    get mime() { return this.#_data.mime }
    get path() { return this.#_data.path }
    get size() { return this.#_data.size }

    get closed() { return this.#_closed }

    write(chunk: any) {
        return new Promise<void>((resolve, reject) => {
            this.#_stream.write(chunk, (err) => {
                if (err) { reject(err) } else { resolve() }
            })
        })
    }

    finish() {
        return new Promise<void>((resolve, reject) => {
            if (this.#_closed) { return resolve() }

            this.#_stream.end(() => {
                this.#_closed = true;
                this.#_data.size = fs.statSync(this.path).size;
                resolve();
            })
        })
    }
}

export default UploadedStorageFile;