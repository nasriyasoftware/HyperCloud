const HyperCloudServer = require('./src/server');
const { ProtocolsOptions, SSLCredentials, SSLOptions } = require('./src/utils/classes');
const Docs = require('./src/utils/docs');
const helpers = require('./src/utils/helpers');
const dnsManager = require('./src/services/dns/manager');
const nasriyaCron = require('nasriya-cron');

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
}

module.exports = new HyperCloud();

/**@typedef {HyperCloudServer} Server */
/**@typedef {Docs.HyperCloudInitOptions} InitOptions */
/**@typedef {Docs.Protocols} Protocols */
/**@typedef {SSLCredentials} SSLCredentials */
/**@typedef {SSLOptions} SSLOptions */