import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);

import fs from 'fs';
import path from 'path';
import http from 'http';

import { SSLOptions } from '../../docs/docs';
import helpers from '../../utils/helpers';

class SSLManager {
    private readonly _type: 'SelfSigned' | 'LetsEncrypt';

    private readonly _defaults = Object.freeze({
        certbotPath: 'C:\\Program Files\\Certbot',
        certName: 'nasriyasoftware',
        filesLocations: {
            certificatePath: path.resolve(path.join(__dirname, 'config')),
            reqBatFile: path.resolve(path.join(__dirname, 'config/req_cert.bat')),
            key: path.resolve(path.join(__dirname, 'config/privateKey.pem')),
            cert: path.resolve(path.join(__dirname, 'config/cert.crt'))
        }
    })

    private _data: SSLOptions = {
        type: 'selfSigned',
        letsEncrypt: {
            certName: undefined,
            domains: [],
            email: undefined as unknown as string,
            staging: false,
            challengePort: 80
        },
        storePath: '',
    }

    private readonly _cache = {
        bat_str: '',
        staging: false,
        certInfo: {
            issued_on: null as unknown as Date,
            expire_at: null as unknown as Date
        },
        server: null as http.Server | null,
        port: 0,
        filesLocations: {
            certificatePath: path.resolve(path.join(__dirname, 'config')),
            reqBatFile: path.resolve(path.join(__dirname, 'config/req_cert.bat')),
            key: path.resolve(path.join(__dirname, 'config/privateKey.pem')),
            cert: path.resolve(path.join(__dirname, 'config/cert.crt'))
        }
    }

    private readonly _utils = {
        /**
         * Function to execute win-acme command
         * @param {string} command 
        */
        async executeCertbot(command: string): Promise<string | undefined> {
            const { stdout, stderr } = await execAsync(`"${this._defaults.certbotPath}\\run.bat" ${command}`);
            if (stdout) {
                return stdout;
            }

            if (stderr) {
                console.error(stderr);
            }
        },
        getFileOpenCommand(filePath: string): string {
            let openCommand: string;
            if (process.platform === 'win32') {
                openCommand = `start ${filePath}`;
            } else if (process.platform === 'darwin') {
                openCommand = `open "${filePath}"`;
            } else {
                // Assuming Linux or other Unix-like systems
                openCommand = `xdg-open "${filePath}"`;
            }
            return openCommand;
        },
        /**Uses the project's name from the `package.json` file */
        getProjectName(): string {
            const dir = path.join(process.cwd(), 'package.json');
            const pkg = JSON.parse(fs.readFileSync(dir, { encoding: 'utf-8' }));
            return pkg.name;
        },
        removeFile(filePath: fs.PathLike) {
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath);
            }
        },
        certInfo: {
            addBatMessage: (msg: string) => {
                if (!this._cache.bat_str.includes('@echo off')) {
                    this._cache.bat_str = `@echo off\n${this._cache.bat_str}`;
                }

                this._cache.bat_str += `echo ${msg}\n`
            },
            authServer: {
                run: async () => {
                    let num = 0;
                    // Creating and running a server at your port or port 80
                    this._cache.server = http.createServer(async (req, res) => {
                        console.log(`Auth Request #${num++}`)
                        // Parse the URL to extract the challenge token
                        const urlParts = (req.url as string).split('/');
                        const challengeToken = urlParts[urlParts.length - 1];

                        // Check if the request is for the challenge route
                        if ((req.url as string).startsWith('/.well-known/acme-challenge/')) {
                            // Construct the file path for the challenge file
                            const challengeFilePath = path.join(this._cache.filesLocations.certificatePath, 'challenge', '.well-known\\acme-challenge', challengeToken);

                            // Read the challenge file and respond with its content
                            fs.readFile(challengeFilePath, 'utf8', (err, data) => {
                                if (err) {
                                    res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
                                    res.end('Challenge file not found');
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
                                    res.end(data);
                                }
                            });
                        }
                    });

                    this._cache.server.listen(this._cache.port);
                },
                stop: () => {
                    this._cache.server?.close();
                    this._cache.server = null;
                }
            },
            /**Use this to request/renew certificate */
            request: async (force: boolean = false) => {
                const d = this._data.letsEncrypt;
                if (helpers.is.undefined(d)) { throw `Let's Encrypt data are undefined` }
                const domainString = d.domains.map(i => `-d ${i}`).join(' ');
                const certificatePath = this._cache.filesLocations.certificatePath;
                const challengePath = `${certificatePath}\\challenge`;
                const command = `certbot certonly --webroot -w ${challengePath} --cert-name ${d.certName} --agree-tos --non-interactive${force === true ? ' --force-renewal' : ''} --email ${d.email} ${domainString} --work-dir ${certificatePath} --logs-dir ${certificatePath}\\logs -v${d.staging === true ? ' --test-cert' : ''}\nexit`

                this._cache.bat_str = command;
                const batFilePath = this._cache.filesLocations.reqBatFile;

                fs.writeFileSync(batFilePath, this._cache.bat_str.trim(), { encoding: 'utf8' });
                const openCom = this._utils.getFileOpenCommand(batFilePath);
                await execAsync(openCom);

                return {
                    cert: fs.readFileSync(`C:\\Certbot\\live\\${d.certName}\\cert.pem`, { encoding: 'utf-8' }),
                    key: fs.readFileSync(`C:\\Certbot\\live\\${d.certName}\\privkey.pem`, { encoding: 'utf-8' })
                }
            },
            generateSelfSigned: async () => {
                const selfSigned = require('openssl-self-signed-certificate');
                return { key: selfSigned.key.toString('utf-8'), cert: selfSigned.cert.toString('utf-8') }
            },
            cleanUp: () => {
                this._cache.bat_str = '';;
                if (this._cache.server) {
                    this._cache.server.close();
                    this._cache.server = null;
                }

                this._utils.removeFile(this._cache.filesLocations.reqBatFile);
                this._utils.removeFile(this._cache.filesLocations.cert);
                this._utils.removeFile(this._cache.filesLocations.key);
            }
        }
    }

    /**
     * @param {object} options
     * @returns {Promise<{key: string;cert: string;}>}
     */
    async generate(options: SSLOptions): Promise<{ key: string; cert: string; }> {
        helpers.printConsole('Running HyperCloud SSL Manager');

        try {
            const response = { key: '', cert: '' }            
            if (options.type === 'selfSigned') {
                helpers.printConsole('HyperCloud SSL: Generating self-signed certificate...');
                const res = await this._utils.certInfo.generateSelfSigned();;
                response.cert = res.cert;
                response.key = res.key;
            } else {
                if ('letsEncrypt' in options) {
                    if (helpers.is.undefined(options.letsEncrypt)) { throw '' }
                    helpers.printConsole('HyperCloud SSL: Running a temp auth server...');
                    this._data.letsEncrypt = options.letsEncrypt;
                    await this._utils.certInfo.authServer.run();
                    this._utils.certInfo.authServer.stop();

                    helpers.printConsole('HyperCloud SSL: Requesting and authenticating...');
                    const { key, cert } = await this._utils.certInfo.request();
                    response.key = fs.readFileSync(key, { encoding: 'utf-8' });
                    response.cert = fs.readFileSync(cert, { encoding: 'utf-8' })

                    if (!response.cert || !response.key) {
                        throw 'Unable to obtain SSL certificate from Let\'s Encrypt.'
                    }
                }
            }

            this._data.storePath = options.storePath ? options.storePath : this._defaults.filesLocations.certificatePath
           
            helpers.printConsole('HyperCloud SSL: Storing the obtained SSL certificate & key...');
            fs.writeFileSync(path.resolve(this._data.storePath, 'privateKey.key'), response.key, { encoding: 'utf-8' })
            fs.writeFileSync(path.resolve(this._data.storePath, 'cert.crt'), response.cert, { encoding: 'utf-8' })

            return response;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            helpers.printConsole('HyperCloud SSL: Cleaning up after SSL manager...')
            this._utils.certInfo.cleanUp();
        }
    }
}

export default SSLManager;