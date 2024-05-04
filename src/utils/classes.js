const { Protocol } = require('../docs/docs');
const helpers = require('./helpers');

class SSLCredentials {
    /**@type {string} Pass over your certificate value */
    #_cert;
    /**@type {string} Pass over your private value */
    #_key;

    /**
     * @param {object} credentials 
     * @param {string} credentials.cert
     * @param {string} credentials.key
     */
    constructor(credentials) {
        if (credentials?.cert?.startsWith('---- BEGIN CERTIFICATE----') && credentials?.cert?.endsWith('----END CERTIFICATE----')) {
            this.#_cert = credentials?.cert;
        }

        if (credentials?.key.startsWith('-----BEGIN RSA PRIVATE KEY-----') && credentials?.key.endsWith('-----END RSA PRIVATE KEY-----')) {
            this.#_key = credentials?.key;
        }

        try {
            if (!this.#_cert) { throw `Invalid or missing SSL certificate` }
            if (!this.#_key) { throw `Invalid or missing SSL private key` }
        } catch (error) {
            helpers.printConsole(error);
            throw 'Unable to build SSLCredentials';
        }
    }

    /**The certificate to be used */
    get cert() { return this.#_cert }
    /**The private key to be used */
    get key() { return this.#_key }
}

class SSLOptions {
    /**@type {string} */
    #email;
    /**@type {string[]} */
    #domains = [];
    #self_signed = false;
    #staging = false;
    /**@type {string} */
    #certName;
    /**@type {string} */
    #storePath;

    /**
     * @param {object} options 
     * @param {string} options.email
     * @param {string[]} options.domains
     * @param {boolean} [options.self_signed] Default: ```false```.
     * @param {boolean} [options.staging] Default: ```true```.
     * @param {string} options.certName Default: ```nasriyasoftware```.
     * @param {string} [options.storePath] You can pass a path where you want to store the ```cert.pem``` and ```key.pem``` after generating the SSL certificate
     */
    constructor(options = {
        email: '',
        domains: [],
        self_signed: false,
        staging: false,
        certName: 'nasriyasoftware'
    }) {
        if (options.storePath) {
            const validity = helpers.checkPathAccessibility(options.storePath);
            if (validity.valid) {
                this.#storePath = options.storePath;
            } else {
                if (!validity.errors.isString) { throw `Invalid "storePath" was provided. Expected a string but instead got ${typeof options.storePath}` }
                if (!validity.errors.exist) { throw `The "storePath" that you've provided (${options.storePath}) doesn't exist` }
                if (!validity.errors.accessible) { throw `You don't have enough read permissions to access ${options.storePath}` }
            }
        }

        if (options.self_signed === true) {
            this.#self_signed = options.self_signed;
        } else {
            this.#staging = typeof options?.staging === 'boolean' ? options.staging : false;

            try {
                if (helpers.validate.email(options?.email)) { this.#email = options.email } else { throw 'Invalid email address' }
                if (helpers.validate.domains(options?.domains)) { this.#domains = options.domains } else { throw 'Invalid domain names' }
                if (typeof options?.certName === 'string' && options.certName.length > 0) { this.#certName = options.certName } else { throw 'Invalid certificate name' }
            } catch (error) {
                helpers.printConsole(`SSLOptions Error: ${error}`);
                throw 'Unable to build SSLOptions';
            }
        }
    }

    /**The maintainer email address. This must be consistent */
    get email() { return this.#email }
    /**The domain(s) you want to add. At least one */
    get domains() { return this.#domains }
    /**Whether you want to use a self-signed certificate or not. You can use this option if you're using a self-hosted proxy manager (on the same server) that handles SSL for you. */
    get self_signed() { return this.#self_signed }
    /**If ```self_signed``` is set to ```false```, this option has no effect. Enable this option to request a valid testing SSL certificate from Let's Encrypt */
    get staging() { return this.#staging }
    /**Bind the issued certificate to this name - used the ```name``` in the ```package.json``` of the project */
    get certName() { return this.#certName }
    /**The path you choose to store the SSL certificate and private key */
    get storePath() { return this.#storePath }
}

class ProtocolsOptions {
    /**@type {Protocol} */
    #http = { port: 0, callback: undefined }
    /**@type {Protocol} */
    #https = { port: 0, callback: undefined }

    /**
     * 
     * @param {object} protocols 
     * @param {Protocol} [protocols.https] Define the https protocol
     * @param {Protocol} [protocols.http] Define the http protocol
     */
    constructor(protocols) {
        if (typeof protocols?.http?.port === 'number' || typeof protocols?.https?.port === 'number') {

            if (typeof protocols?.http?.port === 'number') {
                this.#http.port = protocols.http.port;
                if (typeof protocols.http?.callback === 'function') { this.#http.callback = protocols.http.callback }
            }

            if (typeof protocols?.https?.port === 'number') {
                this.#https.port = protocols.https.port;
                if (typeof protocols.https?.callback === 'function') { this.#https.callback = protocols.https.callback }
            }
        } else {
            throw 'Initialization ports are missing, please specify which protocol(s) you want to use and their ports';
        }
    }

    get http() {
        return {
            ...this.#http,
            enabled: this.#http.port ? true : false
        }
    }

    get https() {
        return {
            ...this.#https,
            enabled: this.#https.port ? true : false
        }
    }
}

module.exports = { SSLCredentials, SSLOptions, ProtocolsOptions }