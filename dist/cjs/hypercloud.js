"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyperCloudRequest = exports.HyperCloudResponse = exports.HyperCloudServer = void 0;
const server_1 = __importDefault(require("./server"));
exports.HyperCloudServer = server_1.default;
const helpers_1 = __importDefault(require("./utils/helpers"));
const nasriya_dns_1 = __importDefault(require("nasriya-dns"));
const nasriya_cron_1 = __importDefault(require("nasriya-cron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const response_1 = __importDefault(require("./services/handler/assets/response"));
exports.HyperCloudResponse = response_1.default;
const request_1 = __importDefault(require("./services/handler/assets/request"));
exports.HyperCloudRequest = request_1.default;
process_1.default.env.HYPERCLOUD_SERVER_VERBOSE = 'FALSE';
class HyperCloud {
    #_servers = [];
    /**
     * Create an HTTP2 HyperCloud server instance and customize it to suite your needs. [Examples](https://github.com/nasriyasoftware/HyperCloud/blob/main/examples/createServer.md)
     * @param userOptions Pass `SecureServerOptions` or `ServerOptions` to manually configure the server or load the configuration from a file
     * @param managementOptions Management options.
    */
    Server(userOptions, managementOptions) {
        const server = new server_1.default(userOptions, managementOptions);
        this.#_servers.push(server);
        return server;
    }
    get cronManager() { return nasriya_cron_1.default; }
    get dnsManager() { return nasriya_dns_1.default; }
    get verbose() { return process_1.default.env.HYPERCLOUD_SERVER_VERBOSE === 'TRUE' ? true : false; }
    /**
     * Display extra debugging details in the console. Default is ```false```.
     *
     * **Note:** This affects all created `HyperCloudServer`s.
     * @param {boolean} value
     */
    set verbose(value) {
        if (typeof value === 'boolean') {
            process_1.default.env.HYPERCLOUD_SERVER_VERBOSE = value === true ? 'TRUE' : 'FALSE';
        }
        else {
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
    async generateETags(root) {
        const startTime = process_1.default.hrtime();
        console.log(`${new Date().toUTCString()}: Generating eTags...`);
        const validity = helpers_1.default.checkPathAccessibility(root);
        if (validity.valid !== true) {
            const errors = validity.errors;
            if (errors.isString !== true) {
                throw `The root directory should be a string value, instead got ${typeof root}`;
            }
            if (errors.exist !== true) {
                throw `The provided root directory (${root}) doesn't exist.`;
            }
            if (errors.accessible !== true) {
                throw `Unable to access (${root}): read permission denied.`;
            }
        }
        const processFolder = async (root) => {
            const hashes = {};
            const content = fs_1.default.readdirSync(root, { withFileTypes: true });
            const files = content.filter(i => i.isFile());
            const dirs = content.filter(i => i.isDirectory());
            const filesPromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    if (file.name === 'eTags.json') {
                        return resolve(undefined);
                    }
                    helpers_1.default.calculateHash(path_1.default.join(root, file.name)).then(hashedValue => {
                        hashes[file.name] = hashedValue;
                        resolve(undefined);
                    }).catch(err => reject(err));
                });
            });
            await Promise.allSettled(filesPromises);
            fs_1.default.writeFileSync(path_1.default.join(root, 'eTags.json'), JSON.stringify(hashes, null, 4), { encoding: 'utf-8' });
            const folderPromises = dirs.map(dir => {
                return new Promise((resolve, reject) => {
                    processFolder(path_1.default.join(root, dir.name)).then(() => resolve(undefined)).catch(err => reject(err));
                });
            });
            if (folderPromises.length > 0) {
                await Promise.allSettled(folderPromises);
            }
        };
        await processFolder(root);
        const endTime = process_1.default.hrtime(startTime);
        const elapsedTimeInMilliseconds = (endTime[0] * 1000) + (endTime[1] / 1000000);
        console.log(`${new Date().toUTCString()}: Process took ${elapsedTimeInMilliseconds} milliseconds`);
    }
}
exports.default = new HyperCloud();
