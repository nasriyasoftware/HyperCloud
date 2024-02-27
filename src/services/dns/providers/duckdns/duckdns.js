const tldts = require('tldts');

class DuckDNSManager {
    #_apiUrl = `https://www.duckdns.org/update`;
    /**@type {DuckDNSCredentials} */
    #credentials = Object.seal({
        apiToken: null,
    })

    /**
     * Create a new `DuckDNSManager` instance
     * @param {string} apiToken An API token
     * @returns {this}
     */
    constructor(apiToken) {
        this.#credentials.apiToken = apiToken;
    }

    get records() {
        return Object.freeze({
            /**
             * Update your `duckdns` domain's IP address
             * @param {string} domain The domain you want to update. Example: use `nasriya` if your domain is `nasriya.duckdns.org`.
             * @param {string} ipAddress The new IP address
             */
            update: async (domain, ipAddress) => {
                try {
                    if (typeof domain !== 'string') { throw new TypeError(`Duckdns update method expected a string type for the domain parameter, but instead got ${typeof domain}`) }
                    if (domain.length === 0) { throw new RangeError(`Duckdns domain is too short`) }

                    if (typeof ipAddress !== 'string') { throw new TypeError(`Duckdns update method expected a string type for the ipAddress parameter, but instead got ${typeof ipAddress}`) }
                    if (!tldts.parse(ipAddress).isIp) { throw `The provided ipAddress value (${ipAddress}) is not a valid IP address` }

                    const url = `${this.#_apiUrl}?domains=${domain}&token=${this.#credentials.apiToken}&verbose=true`;

                    const response = await fetch(url).then(res => res.text());
                    if (response?.startsWith('OK')) {
                        const finalResponse = { success: true, code: 0, message: `` }
                        if (response.includes('NOCHANGE')) {
                            finalResponse.message = 'IP address is up to date'
                        } else {
                            finalResponse.message = `IP address has been updated`;
                        }

                        return Promise.resolve(finalResponse);
                    } else {
                        throw response;
                    }
                } catch (error) {
                    helpers.printConsole(error);
                    if (typeof error === 'string') {
                        return Promise.reject(`Error updating DNS record: ${error}`);
                    }

                    if (typeof error?.message === 'string') {
                        return Promise.reject(`Error updating DNS record: ${error.message}`);
                    }

                    return Promise.reject('Error updating DNS record');
                }
            }
        })
    }

}

module.exports = DuckDNSManager;

/**
 * @typedef {object} DuckDNSCredentials
 * @prop {string} apiToken An API token
 */