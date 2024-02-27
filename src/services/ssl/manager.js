const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

const fs = require('fs');
const path = require('path');
const http = require('http');

const Docs = require('../../utils/docs.js');
const helpers = require('../../utils/helpers.js');


class SSLManager {
    #initialized = false;

    #_defaults = Object.freeze({
        certbotPath: 'C:\\Program Files\\Certbot',
        certName: 'nasriyasoftware'
    })

    #data = {
        certName: 'nasriyasoftware',
        /**@type {string[]} */
        domains: [],
        /**@type {string} */
        email: null,
        /**@type {string} */
        projectPath: null,
        staging: false,
        self_signed: false,
        storePath: null
    }

    #_cache = Object.seal({
        /**@type {string} */
        bat_str: '',
        staging: false,
        certInfo: {
            /**@type {Date} */
            issued_on: null,
            /**@type {Date} */
            expire_at: null
        },
        /**@type {http.Server} */
        server: null,
        port: 0,
        filesLocations: {
            certificatePath: path.resolve(path.join(__dirname, 'config')),
            reqBatFile: path.resolve(path.join(__dirname, 'config/req_cert.bat')),
            key: path.resolve(path.join(__dirname, 'config/privateKey.pem')),
            cert: path.resolve(path.join(__dirname, 'config/cert.crt'))
        }
    })

    /**
     * @param {Docs.SSLConfigs} config
     * @param {number} port The port for SSL challenge over HTTP
    */
    constructor(config, port) {
        //console.log(config)
        this.#_cache.port = port;
        this.#data.self_signed = config.self_signed;
        this.#data.staging = config.staging;
        this.#data.domains = config.domains

        if (config.email) { this.#data.email = config.email }
        if (config.certName) { this.#data.certName = config.certName }
        if (config.storePath) { this.#data.storePath = config.storePath }
    }

    #helpers = {
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
            }
        },
        getFileOpenCommand: (filePath) => {
            let openCommand;
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
        getProjectName: () => {
            const path = process.cwd();
            const pkg = JSON.parse(fs.readdirSync(path, { encoding: 'utf-8' }));
            return pkg.name;
        },
        removeFile: (filePath) => {
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath);
            }
        },
        certInfo: {
            addBatMessage: (msg) => {
                if (!this.#_cache.bat_str.includes('@echo off')) {
                    this.#_cache.bat_str = `@echo off\n${this.#_cache.bat_str}`;
                }

                this.#_cache.bat_str += `echo ${msg}\n`
            },
            authServer: {
                run: async () => {
                    let num = 0;
                    // Creating and running a server at your port or port 80
                    this.#_cache.server = http.createServer(async (req, res) => {
                        console.log(`Auth Request #${num++}`)
                        // Parse the URL to extract the challenge token
                        const urlParts = req.url.split('/');
                        const challengeToken = urlParts[urlParts.length - 1];

                        // Check if the request is for the challenge route
                        if (req.url.startsWith('/.well-known/acme-challenge/')) {
                            // Construct the file path for the challenge file
                            const challengeFilePath = path.join(this.#_cache.filesLocations.certificatePath, 'challenge', '.well-known\\acme-challenge', challengeToken);

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

                    this.#_cache.server.listen(this.#_cache.port);
                },
                stop: () => {
                    this.#_cache.server.close();
                    this.#_cache.server = null;
                }
            },
            /**Use this to request/renew certificate */
            request: async (force) => {
                const d = this.#data;
                const domainString = d.domains.map(i => `-d ${i}`).join(' ');
                const certificatePath = this.#_cache.filesLocations.certificatePath;
                const challengePath = `${certificatePath}\\challenge`;
                const command = `certbot certonly --webroot -w ${challengePath} --cert-name ${d.certName} --agree-tos --non-interactive${force === true ? ' --force-renewal' : ''} --email ${d.email} ${domainString} --work-dir ${certificatePath} --logs-dir ${certificatePath}\\logs -v${d.staging === true ? ' --test-cert' : ''}\nexit`

                this.#_cache.bat_str = command;
                const batFilePath = this.#_cache.filesLocations.reqBatFile;

                fs.writeFileSync(batFilePath, this.#_cache.bat_str.trim(), { encoding: 'utf8' });
                const openCom = this.#helpers.getFileOpenCommand(batFilePath);
                await execAsync(openCom);

                return {
                    cert: `C:\\Certbot\\live\\${d.certName}\\cert.pem`,
                    key: `C:\\Certbot\\live\\${d.certName}\\privkey.pem`
                }
            },
            generateSelfSigned: async () => {
                const selfSigned = require('openssl-self-signed-certificate');

                fs.writeFileSync(this.#_cache.filesLocations.cert, selfSigned.cert, { encoding: 'utf-8' });
                fs.writeFileSync(this.#_cache.filesLocations.key, selfSigned.key, { encoding: 'utf-8' });

                return { key: selfSigned.key.toString('utf-8'), cert: selfSigned.cert.toString('utf-8') }
            },
            cleanUp: () => {
                this.#_cache.bat_str = null;
                if (this.#_cache.server) {
                    this.#_cache.server.close();
                    this.#_cache.server = null;
                }

                this.#helpers.removeFile(this.#_cache.filesLocations.reqBatFile);
                this.#helpers.removeFile(this.#_cache.filesLocations.cert);
                this.#helpers.removeFile(this.#_cache.filesLocations.key);
            }
        }
    }

    /**
     * 
     * @param {object} buildOptions 
     * @returns {Promise<{ key: string, cert: string }>}
     */
    async generate(buildOptions = { force: false }) {
        helpers.printConsole('Running HyperFlow SSL Manager')
        if (buildOptions.verbos === true) { console.info() }

        try {
            if (this.#data.self_signed) {
                helpers.printConsole('HyperFlow SSL: Generating self-signed certificate...');
                const { key, cert } = await this.#helpers.certInfo.generateSelfSigned();

                if (this.#data.storePath) {
                    helpers.printConsole('HyperFlow SSL: Storing the generated SSL certificate & key...');
                    fs.writeFileSync(path.resolve(this.#data.storePath, 'privateKey.key'), key, { encoding: 'utf-8' })
                    fs.writeFileSync(path.resolve(this.#data.storePath, 'cert.crt'), cert, { encoding: 'utf-8' })
                }

                return { key, cert };
            } else {
                helpers.printConsole('HyperFlow SSL: Running a temp auth server...');
                await this.#helpers.certInfo.authServer.run();
                this.#helpers.certInfo.authServer.stop();

                helpers.printConsole('HyperFlow SSL: Requesting and authenticating...');
                const { key, cert } = await this.#helpers.certInfo.request(buildOptions.force);
                const creds = { key: fs.readFileSync(key, { encoding: 'utf-8' }), cert: fs.readFileSync(cert, { encoding: 'utf-8' }) }

                if (!creds.cert || !creds.key) {
                    throw 'Unable to obtain SSL certificate from Let\'s Encrypt.'
                }

                if (this.#data.storePath) {
                    helpers.printConsole('HyperFlow SSL: Storing the obtained SSL certificate & key...');
                    fs.writeFileSync(path.resolve(this.#data.storePath, 'privateKey.key'), creds.key, { encoding: 'utf-8' })
                    fs.writeFileSync(path.resolve(this.#data.storePath, 'cert.crt'), creds.cert, { encoding: 'utf-8' })
                }

                return creds;
            }
        } catch (error) {
            console.error(error);
        } finally {
            helpers.printConsole('HyperFlow SSL: Cleaning up after SSL manager...')
            this.#helpers.certInfo.cleanUp();
        }
    }
}

module.exports = SSLManager;