const HyperCloudServer = require('./src/server');
const { ProtocolsOptions, SSLCredentials, SSLOptions } = require('./src/utils/classes');
const Docs = require('./src/utils/docs');
const helpers = require('./src/utils/helpers');
const dnsManager = require('./src/services/dns/manager');
const nasriyaCron = require('nasriya-cron');

const fs = require('fs');
const path = require('path');
const process = require('process');

global.HyperCloud_ServerVerbose = false;


class HyperCloud {
    /**@type {HyperCloudServer[]} */
    #servers = []
    /**
     * Create a new server
     * @returns {HyperCloudServer}
     */
    Server() {
        const server = new HyperCloudServer();
        this.#servers.push(server);
        return server;
    }

    get cronManager() { return nasriyaCron }
    get dnsManager() { return dnsManager }

    /**
     * Create `Protocols` instance for the server
     * @param {Protocols} protocols 
     * @returns {ProtocolsOptions}
     */
    Protocols(protocols) { return new ProtocolsOptions(protocols) }

    /**
     * Create `SSLCredentials` for the `ssl` option in `InitOptions`.
     * @param {SSLCredentials} credentials 
     * @returns {SSLCredentials}
     */
    SSLCredentials(credentials) { return new SSLCredentials(credentials) }

    /**
     * Create `SSLOptions` for the `ssl` option in `InitOptions`.
     * @param {SSLOptions} options 
     * @returns {SSLOptions}
     */
    SSLOptions(options) { return new SSLOptions(options) }

    get verbose() { return typeof global.HyperCloud_ServerVerbose === 'boolean' ? global.HyperCloud_ServerVerbose : false }
    /**
     * Display extra debugging details in the console. Default is ```false```.
     * 
     * **Note:** This affects all created `HyperCloudServer`s.
     * @param {boolean} value
     */
    set verbose(value) {
        if (typeof global.HyperCloud_ServerVerbose === 'boolean') {
            global.HyperCloud_ServerVerbose = value;
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
     * @param {string} root 
     * @returns {Promise<void>}
     */
    async generateETags(root) {
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
                    if (file.name === 'eTags.json') { return resolve() }
                    helpers.calculateHash(path.join(root, file.name)).then(hashedValue => {
                        hashes[file.name] = hashedValue;
                        resolve();
                    }).catch(err => reject(err))
                })
            })

            await Promise.allSettled(filesPromises);
            fs.writeFileSync(path.join(root, 'eTags.json'), JSON.stringify(hashes, null, 4), { encoding: 'utf-8' });

            const folderPromises = dirs.map(dir => {
                return new Promise((resolve, reject) => {
                    processFolder(path.join(root, dir.name)).then(() => resolve()).catch(err => reject(err));
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

/**@typedef {HyperCloudServer} Server */
/**@typedef {Docs.HyperCloudInitOptions} InitOptions */
/**@typedef {Docs.Protocols} Protocols */
/**@typedef {SSLCredentials} SSLCredentials */
/**@typedef {SSLOptions} SSLOptions */