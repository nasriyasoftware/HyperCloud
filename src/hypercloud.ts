import HyperCloudServer from './server';
import { ProtocolsOptions, SSLCredentials, SSLOptions } from './utils/classes';
import { Protocols } from './docs/docs';
import helpers from './utils/helpers';
import dnsManager from 'nasriya-dns';
import nasriyaCron from 'nasriya-cron';

import fs from 'fs';
import path from 'path';
import process from 'process';

process.env.HYPERCLOUD_SERVER_VERBOSE = 'FALSE';


class HyperCloud {
    private readonly _servers: HyperCloudServer[] = []

    /**Create a new server */
    Server(): HyperCloudServer {
        const server = new HyperCloudServer();
        this._servers.push(server);
        return server;
    }

    get cronManager() { return nasriyaCron }
    get dnsManager() { return dnsManager }

    /**Create `Protocols` instance for the server */
    Protocols(protocols: Protocols): ProtocolsOptions { return new ProtocolsOptions(protocols) }
    /**Create `SSLCredentials` for the `ssl` option in `InitOptions`. */
    SSLCredentials(credentials: SSLCredentials): SSLCredentials { return new SSLCredentials(credentials) }
    /**Create `SSLOptions` for the `ssl` option in `InitOptions`. */
    SSLOptions(options: SSLOptions): SSLOptions { return new SSLOptions(options) }

    get verbose() { return process.env.HYPERCLOUD_SERVER_VERBOSE === 'TRUE' ? true : false }
    /**
     * Display extra debugging details in the console. Default is ```false```.
     * 
     * **Note:** This affects all created `HyperCloudServer`s.
     * @param {boolean} value
     */
    set verbose(value: boolean) {
        if (typeof process.env.HYPERCLOUD_SERVER_VERBOSE === 'boolean') {
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
        if (!validity.valid) {
            const errors = validity.errors;
            if (!errors.isString) { throw `The root directory should be a string value, instead got ${typeof root}` }
            if (!errors.exist) { throw `The provided root directory (${root}) doesn't exist.` }
            if (!errors.accessible) { throw `Unable to access (${root}): read permission denied.` }
        }

        const processFolder = async (root) => {
            const hashes = {}
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

module.exports = new HyperCloud();