import path from 'path';
import helpers from './helpers';
import { Protocol } from '../docs/docs';

export class SSLCredentials {
    /**The certificate to be used */
    public readonly cert: string;
    /**The private key to be used */
    public key: string;

    /**
     * Provide a certificate and a key to validate
     * @param {object} credentials 
     * @param {string} credentials.cert
     * @param {string} credentials.key
     */
    constructor(credentials: { cert: string; key: string; }) {
        try {
            if (helpers.is.undefined(credentials) || !helpers.is.realObject(credentials)) { throw 'Unable to build SSLCredentials: The SSLCredentials validator was used without a valid credentials object' }

            if (helpers.is.validString(credentials.cert)) {
                if (credentials.cert.startsWith('---- BEGIN CERTIFICATE----') && credentials.cert.endsWith('----END CERTIFICATE----')) {
                    this.cert = credentials.cert;
                } else {
                    throw new SyntaxError(`Unable to build SSLCredentials: The certtificate must starts with: ---- BEGIN CERTIFICATE----`);
                }
            } else {
                throw new TypeError(`Unable to build SSLCredentials: The cert property should be a string, instead got ${typeof credentials.cert}`);
            }

            if (helpers.is.validString(credentials.key)) {
                if (credentials.key.startsWith('-----BEGIN RSA PRIVATE KEY-----') && credentials.key.endsWith('-----END RSA PRIVATE KEY-----')) {
                    this.key = credentials.key
                } else {
                    throw new SyntaxError(`Unable to build SSLCredentials: The private key must starts with: -----BEGIN RSA PRIVATE KEY-----`);
                }
            } else {
                throw new TypeError(`Unable to build SSLCredentials: The key property should be a string, instead got ${typeof credentials.key}`);
            }
        } catch (error) {
            helpers.printConsole(error);
            throw 'Unable to build SSLCredentials';
        }
    }
}

export class SSLOptions {
    /**The maintainer email address. This must be consistent */
    public readonly email: string;
    /**The domain(s) you want to add. At least one */
    public readonly domains: string[] = [];
    /**Bind the issued certificate to this name - used the `name` in the `package.json` of the project */
    public readonly certName: string;
    /**The path you choose to store the SSL certificate and private key */
    public readonly storePath: string;
    /**If `self_signed` is set to `false`, this option has no effect. Enable this option to request a valid testing SSL certificate from Let's Encrypt */
    public readonly staging: boolean;
    /**
     * Whether you want to use a self-signed certificate or not.
     * You can use this option if you're using a self-hosted proxy manager
     * (on the same server) that handles SSL for you.
     */
    public readonly self_signed: boolean;

    /**
     * @param {object} options 
     * @param {string} options.email
     * @param {string[]} options.domains
     * @param {boolean} [options.self_signed] Default: ```false```.
     * @param {boolean} [options.staging] Default: ```true```.
     * @param {string} options.certName Default: ```nasriyasoftware```.
     * @param {string} [options.storePath] You can pass a path where you want to store the ```cert.pem``` and ```key.pem``` after generating the SSL certificate
     */
    constructor(
        options: {
            /**Your Let's Encrypt email */
            email: string;
            /**An array of domains to generate SSL certificate for */
            domains: string[];
            /**Default: `false` */
            self_signed?: boolean;
            /**Default: `false` */
            staging?: boolean;
            /**Default: `nasriyasoftware`. */
            certName: string;
            /**You can pass a path where you want to store the `cert.pem` and `key.pem` after generating the SSL certificate */
            storePath?: string;
        }
    ) {
        if (helpers.is.undefined(options) || !helpers.is.realObject(options)) {
            throw new Error(`The SSLOptions expected an options object but got ${typeof options}`)
        }

        if ('storePath' in options && !helpers.is.undefined(options.storePath)) {
            const validity = helpers.checkPathAccessibility(options.storePath);
            if (validity.valid) {
                this.storePath = options.storePath;
            } else {
                if (!validity.errors.isString) { throw new TypeError(`Invalid "storePath" was provided. Expected a string but instead got ${typeof options.storePath}`) }
                if (!validity.errors.exist) { throw new Error(`The "storePath" that you've provided (${options.storePath}) doesn't exist`) }
                if (!validity.errors.accessible) { throw Error(`You don't have enough read permissions to access ${options.storePath}`) }
            }
        } else {
            this.storePath = path.join(process.cwd(), 'SSL');
        }


        if ('self_signed' in options && !helpers.is.undefined(options.self_signed)) {
            if (typeof options.self_signed === 'boolean') {
                this.self_signed = options.self_signed;
            } else {
                throw new TypeError(`THe "self_signed" property expected a boolean value but instead got ${typeof options.self_signed}`)
            }
        } else {
            this.self_signed = false;
        }

        if (this.self_signed === false) {
            if ('staging' in options && !helpers.is.undefined(options.staging)) {
                if (typeof options.staging === 'boolean') {
                    this.staging = options.staging;
                } else {
                    throw new TypeError(`The "staging" property expected a boolean value but instead got ${typeof options.staging}`)
                }
            } else {
                this.staging = false;
            }

            if ('email' in options && !helpers.is.undefined(options.email)) {
                if (helpers.is.validString(options.email)) {
                    if (helpers.validate.email(options.email)) {
                        this.email = options.email;
                    } else {
                        throw new SyntaxError(`The provided email (${options.email}) is not a valid email address`)
                    }
                } else {
                    throw new TypeError(`The "email" property expected a string value but instead got ${typeof options.email}`)
                }
            } else {
                throw new SyntaxError(`The "email" property is missing.`)
            }

            if ('domains' in options && !helpers.is.undefined(options.domains)) {
                if (Array.isArray(options.domains)) {
                    if (helpers.validate.domains(options.domains)) {
                        this.domains = options.domains;
                    } else {
                        throw new SyntaxError(`The provided domains (${options.domains.join(', ')}) is not a valid domains array`)
                    }
                } else {
                    throw new TypeError(`The "domains" property expected an array as a value but instead got ${typeof options.domains}`)
                }
            } else {
                throw new SyntaxError(`The "domains" property is missing.`)
            }

            if ('certName' in options && !helpers.is.undefined(options.certName)) {
                if (helpers.is.validString(options.certName)) {
                    this.certName = options.certName;
                } else {
                    throw new TypeError(`The "certName" property expected a valid string value but instead got ${typeof options.certName}`)
                }
            } else {
                this.certName = 'nasriyasoftware';
            }
        }
    }
}

export class ProtocolsOptions {
    private readonly _http: Protocol = { port: 0, callback: undefined }
    private readonly _https: Protocol = { port: 0, callback: undefined }

    /**
     * 
     * @param {object} protocols 
     * @param {Protocol} [protocols.https] Define the https protocol
     * @param {Protocol} [protocols.http] Define the http protocol
     */
    constructor(protocols: { https?: Protocol; http?: Protocol; }) {
        if (helpers.is.undefined(protocols) || !helpers.is.realObject(protocols)) {
            throw new SyntaxError(`ProtocolsOptions was used without specifying the protocols`)
        }

        let protocolsFound = false;

        if ('http' in protocols) {
            const protocol = protocols.http;
            if (helpers.is.undefined(protocol) || !helpers.is.realObject(protocol)) {
                throw new TypeError(`The "http" protocol is expecting an abject value but instead got ${typeof protocol}`)
            }

            if ('port' in protocol) {
                if (typeof protocol.port === 'number') {
                    if (protocol.port > 0) {
                        protocolsFound = true;
                        this._http.port = protocol.port;

                        if ('callback' in protocol) {
                            if (typeof protocol.callback === 'function') {
                                this._http.callback = protocol.callback;
                            } else {
                                throw new TypeError(`The protocol callback is expecting a function but instead got ${typeof protocol.callback}`)
                            }
                        }
                    } else {
                        throw new RangeError(`The port value can only be a real number (positive).`)
                    }
                } else {
                    throw new TypeError(`The port is expecting a number, but instead got ${typeof protocol.port}`);
                }
            } else {
                throw new SyntaxError(`The protocol is missing the port number.`)
            }
        }

        if ('https' in protocols) {
            const protocol = protocols.https;
            if (helpers.is.undefined(protocol) || !helpers.is.realObject(protocol)) {
                throw new TypeError(`The "https" protocol is expecting an abject value but instead got ${typeof protocol}`)
            }

            if ('port' in protocol) {
                if (typeof protocol.port === 'number') {
                    if (protocol.port > 0) {
                        protocolsFound = true;
                        this._https.port = protocol.port;

                        if ('callback' in protocol) {
                            if (typeof protocol.callback === 'function') {
                                this._https.callback = protocol.callback;
                            } else {
                                throw new TypeError(`The protocol callback is expecting a function but instead got ${typeof protocol.callback}`)
                            }
                        }
                    } else {
                        throw new RangeError(`The port value can only be a real number (positive).`)
                    }
                } else {
                    throw new TypeError(`The port is expecting a number, but instead got ${typeof protocol.port}`);
                }
            } else {
                throw new SyntaxError(`The protocol is missing the port number.`)
            }
        }

        if (!protocolsFound) {
            throw new Error('Initialization ports are missing, please specify which protocol(s) you want to use and their ports');
        }
    }

    get http() {
        return {
            ...this._http,
            enabled: this._http.port ? true : false
        }
    }

    get https() {
        return {
            ...this._https,
            enabled: this._https.port ? true : false
        }
    }
}