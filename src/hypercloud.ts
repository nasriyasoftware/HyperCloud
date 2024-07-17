import HyperCloudServer from './server';
import { HyperCloudInitFile, HyperCloudManagementOptions, SecureServerOptions, ServerOptions } from './docs/docs';
import helpers from './utils/helpers';

import fs from 'fs';
import path from 'path';
import process from 'process';
export { Page } from './services/renderer/assets/Page';
export { Component } from './services/renderer/assets/Component';
export { HyperCloudServer } from './server';
export { HyperCloudRequest } from './services/handler/assets/request';
export { HyperCloudResponse } from './services/handler/assets/response';

process.env.HYPERCLOUD_SERVER_VERBOSE = 'FALSE';

class HyperCloud {
    readonly #_servers: HyperCloudServer[] = [];

    /**
     * Create an HTTP2 HyperCloud server instance and customize it to suite your needs. [Examples](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/createServer.md)
     * @param userOptions Pass `SecureServerOptions` or `ServerOptions` to manually configure the server or load the configuration from a file
     * @param managementOptions Management options.
    */
    Server(userOptions?: SecureServerOptions | ServerOptions | HyperCloudInitFile, managementOptions?: HyperCloudManagementOptions): HyperCloudServer {
        const server = new HyperCloudServer(userOptions, managementOptions);
        this.#_servers.push(server);
        return server;
    }

    get verbose() { return process.env.HYPERCLOUD_SERVER_VERBOSE === 'TRUE' ? true : false }
    /**
     * Display extra debugging details in the console. Default is ```false```.
     * 
     * **Note:** This affects all created `HyperCloudServer`s.
     * @param {boolean} value
     */
    set verbose(value: boolean) {
        if (typeof value === 'boolean') {
            process.env.HYPERCLOUD_SERVER_VERBOSE = value === true ? 'TRUE' : 'FALSE';
        } else {
            throw `HyperCloud verbose property can only accept boolean value, but instead got ${typeof value}`;
        }
    }

    /**
     * This method generates eTags for all files in a directory.
     * 
     * **Notes:**
     * - This process is computationally intensive and may take a lot of time
     * dependnig on the number and size of files in this directory.
     * - The process will generate an `eTags.json` file in each directory and sub-directory.
     */
    async generateETags(root: string): Promise<void> {
        const startTime = process.hrtime();
        console.log(`${new Date().toUTCString()}: Generating eTags...`);
        const validity = helpers.checkPathAccessibility(root);
        if (validity.valid !== true) {
            const errors = validity.errors;
            if (errors.notString) { throw new Error(`The root directory should be a string value, instead got ${typeof root}`) }
            if (errors.doesntExist) { throw new Error(`The provided root directory (${root}) doesn't exist.`) }
            if (errors.notAccessible) { throw new Error(`Unable to access (${root}): read permission denied.`) }
        }

        const processFolder = async (root: string) => {
            const hashes = {} as Record<string, any>
            const content = fs.readdirSync(root, { withFileTypes: true });

            const files = content.filter(i => i.isFile());
            const dirs = content.filter(i => i.isDirectory());

            const filesPromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    if (file.name === 'eTags.json') { return resolve(undefined) }
                    helpers.calculateHash(path.join(root, file.name)).then(hashedValue => {
                        hashes[file.name] = hashedValue;
                        resolve(undefined);
                    }).catch(err => reject(err))
                })
            })

            await Promise.allSettled(filesPromises);
            fs.writeFileSync(path.join(root, 'eTags.json'), JSON.stringify(hashes, null, 4), { encoding: 'utf-8' });

            const folderPromises = dirs.map(dir => {
                return new Promise((resolve, reject) => {
                    processFolder(path.join(root, dir.name)).then(() => resolve(undefined)).catch(err => reject(err));
                })
            })

            if (folderPromises.length > 0) {
                await Promise.allSettled(folderPromises);
            }
        }

        await processFolder(root);
        const endTime = process.hrtime(startTime);
        const elapsedTimeInMilliseconds = (endTime[0] * 1000) + (endTime[1] / 1000000);
        console.log(`${new Date().toUTCString()}: Process took ${elapsedTimeInMilliseconds} milliseconds`)
    }
}

export default new HyperCloud();