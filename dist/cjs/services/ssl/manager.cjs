"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const child_process_1 = require("child_process");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const helpers_1 = __importDefault(require("../../utils/helpers"));
class SSLManager {
    #_defaults = Object.freeze({
        certbotPath: 'C:\\Program Files\\Certbot',
        certName: 'nasriyasoftware',
        filesLocations: {
            certificatePath: path_1.default.resolve(path_1.default.join(__dirname, 'config')),
            reqBatFile: path_1.default.resolve(path_1.default.join(__dirname, 'config/req_cert.bat')),
            key: path_1.default.resolve(path_1.default.join(__dirname, 'config/privateKey.pem')),
            cert: path_1.default.resolve(path_1.default.join(__dirname, 'config/cert.crt'))
        }
    });
    #_data = {
        type: 'selfSigned',
        letsEncrypt: {
            certName: undefined,
            domains: [],
            email: undefined,
            staging: false,
            challengePort: 80
        },
        storePath: '',
    };
    #_cache = {
        bat_str: '',
        staging: false,
        certInfo: {
            issued_on: null,
            expire_at: null
        },
        server: null,
        port: 0,
        filesLocations: {
            certificatePath: path_1.default.resolve(path_1.default.join(__dirname, 'config')),
            reqBatFile: path_1.default.resolve(path_1.default.join(__dirname, 'config/req_cert.bat')),
            key: path_1.default.resolve(path_1.default.join(__dirname, 'config/privateKey.pem')),
            cert: path_1.default.resolve(path_1.default.join(__dirname, 'config/cert.crt'))
        }
    };
    #_utils = {
        /**
         * Function to execute win-acme command
         * @param {string} command
        */
        executeCertbot: async (command) => {
            const { stdout, stderr } = await execAsync(`"${this.#_defaults.certbotPath}\\run.bat" ${command}`);
            if (stdout) {
                return stdout;
            }
            if (stderr) {
                console.error(stderr);
                throw stderr;
            }
        },
        getFileOpenCommand(filePath) {
            let openCommand;
            if (process.platform === 'win32') {
                openCommand = `start ${filePath}`;
            }
            else if (process.platform === 'darwin') {
                openCommand = `open "${filePath}"`;
            }
            else {
                // Assuming Linux or other Unix-like systems
                openCommand = `xdg-open "${filePath}"`;
            }
            return openCommand;
        },
        /**Uses the project's name from the `package.json` file */
        getProjectName() {
            const dir = path_1.default.join(process.cwd(), 'package.json');
            const pkg = JSON.parse(fs_1.default.readFileSync(dir, { encoding: 'utf-8' }));
            return pkg.name;
        },
        removeFile(filePath) {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.rmSync(filePath);
            }
        },
        certInfo: {
            addBatMessage: (msg) => {
                if (!this.#_cache.bat_str.includes('@echo off')) {
                    this.#_cache.bat_str = `@echo off\n${this.#_cache.bat_str}`;
                }
                this.#_cache.bat_str += `echo ${msg}\n`;
            },
            authServer: {
                run: async () => {
                    let num = 0;
                    // Creating and running a server at your port or port 80
                    this.#_cache.server = http_1.default.createServer(async (req, res) => {
                        console.log(`Auth Request #${num++}`);
                        // Parse the URL to extract the challenge token
                        const urlParts = req.url.split('/');
                        const challengeToken = urlParts[urlParts.length - 1];
                        // Check if the request is for the challenge route
                        if (req.url.startsWith('/.well-known/acme-challenge/')) {
                            // Construct the file path for the challenge file
                            const challengeFilePath = path_1.default.join(this.#_cache.filesLocations.certificatePath, 'challenge', '.well-known\\acme-challenge', challengeToken);
                            // Read the challenge file and respond with its content
                            fs_1.default.readFile(challengeFilePath, 'utf8', (err, data) => {
                                if (err) {
                                    res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
                                    res.end('Challenge file not found');
                                }
                                else {
                                    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
                                    res.end(data);
                                }
                            });
                        }
                    });
                    this.#_cache.server.listen(this.#_cache.port);
                },
                stop: () => {
                    this.#_cache.server?.close();
                    this.#_cache.server = null;
                }
            },
            /**Use this to request/renew certificate */
            request: async (force = false) => {
                const d = this.#_data.letsEncrypt;
                if (helpers_1.default.is.undefined(d)) {
                    throw `Let's Encrypt data are undefined`;
                }
                const domainString = d.domains.map(i => `-d ${i}`).join(' ');
                const certificatePath = this.#_cache.filesLocations.certificatePath;
                const challengePath = `${certificatePath}\\challenge`;
                const command = `certbot certonly --webroot -w ${challengePath} --cert-name ${d.certName} --agree-tos --non-interactive${force === true ? ' --force-renewal' : ''} --email ${d.email} ${domainString} --work-dir ${certificatePath} --logs-dir ${certificatePath}\\logs -v${d.staging === true ? ' --test-cert' : ''}\nexit`;
                this.#_cache.bat_str = command;
                const batFilePath = this.#_cache.filesLocations.reqBatFile;
                fs_1.default.writeFileSync(batFilePath, this.#_cache.bat_str.trim(), { encoding: 'utf8', flag: 'w' });
                const openCom = this.#_utils.getFileOpenCommand(batFilePath);
                await execAsync(openCom);
                return {
                    cert: fs_1.default.readFileSync(`C:\\Certbot\\live\\${d.certName}\\cert.pem`, { encoding: 'utf-8' }),
                    key: fs_1.default.readFileSync(`C:\\Certbot\\live\\${d.certName}\\privkey.pem`, { encoding: 'utf-8' })
                };
            },
            generateSelfSigned: async () => {
                const selfSigned = require('openssl-self-signed-certificate');
                return { key: selfSigned.key.toString('utf-8'), cert: selfSigned.cert.toString('utf-8') };
            },
            cleanUp: () => {
                this.#_cache.bat_str = '';
                ;
                if (this.#_cache.server) {
                    this.#_cache.server.close();
                    this.#_cache.server = null;
                }
                this.#_utils.removeFile(this.#_cache.filesLocations.reqBatFile);
                this.#_utils.removeFile(this.#_cache.filesLocations.cert);
                this.#_utils.removeFile(this.#_cache.filesLocations.key);
            }
        }
    };
    /**
     * @param {object} options
     * @returns {Promise<{key: string;cert: string;}>}
     */
    async generate(options) {
        helpers_1.default.printConsole('Running HyperCloud SSL Manager');
        try {
            const response = { key: '', cert: '' };
            if (options.type === 'selfSigned') {
                helpers_1.default.printConsole('HyperCloud SSL: Generating self-signed certificate...');
                const res = await this.#_utils.certInfo.generateSelfSigned();
                ;
                response.cert = res.cert;
                response.key = res.key;
            }
            else {
                if ('letsEncrypt' in options) {
                    if (helpers_1.default.is.undefined(options.letsEncrypt)) {
                        throw '';
                    }
                    helpers_1.default.printConsole('HyperCloud SSL: Running a temp auth server...');
                    this.#_data.letsEncrypt = options.letsEncrypt;
                    await this.#_utils.certInfo.authServer.run();
                    this.#_utils.certInfo.authServer.stop();
                    helpers_1.default.printConsole('HyperCloud SSL: Requesting and authenticating...');
                    const { key, cert } = await this.#_utils.certInfo.request();
                    response.key = fs_1.default.readFileSync(key, { encoding: 'utf-8' });
                    response.cert = fs_1.default.readFileSync(cert, { encoding: 'utf-8' });
                    if (!response.cert || !response.key) {
                        throw 'Unable to obtain SSL certificate from Let\'s Encrypt.';
                    }
                }
            }
            this.#_data.storePath = options.storePath ? options.storePath : this.#_defaults.filesLocations.certificatePath;
            if (!fs_1.default.existsSync(this.#_data.storePath)) {
                fs_1.default.mkdirSync(this.#_data.storePath, { recursive: true });
            }
            helpers_1.default.printConsole('HyperCloud SSL: Storing the obtained SSL certificate & key...');
            fs_1.default.writeFileSync(path_1.default.join(this.#_data.storePath, 'privateKey.key'), response.key, { encoding: 'utf-8', flag: 'w' });
            fs_1.default.writeFileSync(path_1.default.join(this.#_data.storePath, 'cert.crt'), response.cert, { encoding: 'utf-8', flag: 'w' });
            return response;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
        finally {
            helpers_1.default.printConsole('HyperCloud SSL: Cleaning up after SSL manager...');
            this.#_utils.certInfo.cleanUp();
        }
    }
}
exports.default = SSLManager;
