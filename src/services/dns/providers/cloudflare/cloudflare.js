const DNSTypes = require('../../types');
const helpers = require('../../../../utils/helpers');
// const dnsManager = require('../../manager');

class CloudFlareDNSManager {
    #_apiUrl = `https://api.cloudflare.com/client/v4`;
    /**@type {CloudflareCredentials} */
    #credentials = Object.seal({
        apiToken: null,
    })

    /**
     * 
     * @param {string} apiToken An API token with ```Edit``` permission.
     * @returns {this}
     */
    constructor(apiToken) {
        try {
            if (typeof apiToken === 'string' && apiToken.length > 10) {
                this.#credentials.apiToken = apiToken;
            } else {
                throw new Error('Invalid api token');
            }
        } catch (error) {
            if (typeof error === 'string') { error = `Cloudflare credentials error: ${error}` }
            if (typeof error?.message === 'string') { error.message = `Cloudflare credentials error: ${error.message}` }
            throw error;
        }
    }

    get zone() {
        const baseUrl = `${this.#_apiUrl}/zones`;
        return Object.freeze({
            /**
             * Get a list of the available DNS zones on your account
             * @param {object} [options] List options
             * @param {boolean} [options.just_ids] Only return the IDs
             * @param {string} [options.name] The account name. E.g: ```domain.com```.
             * @returns {Promise<string[]>} The available DNS zone IDs
             */
            list: async (options) => {
                try {
                    let validAN;

                    if (options && 'accountName' in options) {
                        validAN = helpers.validate.domains(options?.name);
                        if (!validAN) { throw new Error(`The provided account name (${options.name}) is not a valid domain`) }
                        options.name = encodeURIComponent(options.name)
                    }

                    const url = `${baseUrl}${validAN ? `?name=${options.name}` : ''}`;
                    console.log(url)
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.#credentials.apiToken}`,
                        }
                    })

                    const data = await response.json();
                    if (!data.success) {
                        const error = data.errors;
                        helpers.printConsole('Cloudflare DNS zone list inquiry has failed with the following error');
                        helpers.printConsole(error);

                        throw new Error('Cloudflare DNS zone list inquiry has failed');
                    }

                    if (data.result.length > 0) {
                        if (options?.just_ids === true) {
                            return data.result.map(i => i.id)
                        }
                        return data.result;
                    } else {
                        return [];
                    }
                } catch (error) {
                    helpers.printConsole(error);
                    if (typeof error === 'string') {
                        return Promise.reject(`Error retrieving Zone list: ${error}`);
                    }

                    if (typeof error?.message === 'string') {
                        return Promise.reject(`Error retrieving Zone list: ${error.message}`);
                    }

                    return Promise.reject('Error retrieving Zone list');
                }
            },
            /**
             * Display the details of a zone
             * @param {string} zone_id The zone ID you want to show the details for
             * @returns {Promise<object>}
             */
            details: async (zone_id) => {
                try {
                    if (typeof zone_id !== 'string' || zone_id.length === 0 || zone_id.length > 32) {
                        throw new Error(`${zone_id} is an invalid zone ID`)
                    }

                    const response = await fetch(`${baseUrl}/${zone_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.#credentials.apiToken}`,
                        }
                    })

                    const data = await response.json();
                    if (!data.success) {
                        const error = data.errors;
                        helpers.printConsole('Cloudflare DNS zone details inquiry has failed with the following error');
                        helpers.printConsole(error);

                        throw new Error('Cloudflare DNS zone details inquiry has failed');
                    }

                    if (data && 'id' in data.result && 'account' in data.result) {
                        return data.result;
                    } else {
                        return null;
                    }
                } catch (error) {
                    helpers.printConsole(error);
                    if (typeof error === 'string') {
                        return Promise.reject(`Error retrieving Zone details: ${error}`);
                    }

                    if (typeof error?.message === 'string') {
                        return Promise.reject(`Error retrieving Zone details: ${error.message}`);
                    }

                    return Promise.reject('Error retrieving Zone details');
                }
            },

        })
    }

    get records() {
        const baseUrl = `${this.#_apiUrl}/zones`;
        return Object.freeze({
            /**
             * Get a list of records on a specific zone
             * @param {string} zone_id The zone ID of your domain
             * @param {object} [options]
             * @param {boolean} [options.simplified] Returns minimal footprint
             * @param {DNSTypes.DNSRecordType} [options.type]
             */
            list: async (zone_id, options) => {
                try {
                    if (typeof zone_id !== 'string' || zone_id.length === 0 || zone_id.length > 32) {
                        throw new Error(`${zone_id} is an invalid zone ID`)
                    }

                    let query = ''
                    if (options && 'type' in options) {
                        if (DNSTypes.dnsRecordTypes.includes(options.type)) {
                            query = `?type=${options.type}`
                        } else {
                            throw `${options.type} is not a valid type of DNS records.`
                        }
                    }

                    const url = `${baseUrl}/${zone_id}/dns_records${query}`;
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.#credentials.apiToken}`,
                        }
                    })

                    const data = await response.json();
                    if (!data.success) {
                        const error = data.errors;
                        helpers.printConsole('Cloudflare DNS records inquiry has failed with the following error');
                        helpers.printConsole(error);

                        throw new Error('Cloudflare DNS records inquiry has failed');
                    }

                    if (options?.simplified === true) {
                        const fields = ['id', 'type', 'name', 'content', 'proxied']

                        return data.result.map(i => {
                            const item = {}
                            fields.forEach(field => {
                                item[field] = i[field];
                            })

                            return item;
                        })
                    } else {
                        return data.result;
                    }
                } catch (error) {
                    helpers.printConsole(error);
                    if (typeof error === 'string') {
                        return Promise.reject(`Error retrieving DNS records: ${error}`);
                    }

                    if (typeof error?.message === 'string') {
                        return Promise.reject(`Error retrieving DNS records: ${error.message}`);
                    }

                    return Promise.reject('Error retrieving DNS records');
                }
            },
            /**
             * Update the 
             * @param {DNSRecordUpdateOptions} options
             * @returns {Promise<DNSRecordResult>}
             * @example
             * // Update Cloudflare DNS records to the new public IP
             * const hypercloud = require('nasriya-hypercloud);
             * const cloudflare = hypercloud.dnsManager.cloudflare('your_api_token');
             * 
             * // Get the current public IP:
             * const publicIp = await hypercloud.dnsManager.helpers.getPublicIP();
             * 
             * // Prepare your records:
             * const records = [
             *      { id: '<wildcard_record_id>', name: '*', content: publicIp, type: 'A' }, // Wildcard (subdomains)
             *      { id: '<root_record_id>', name: '@', content: publicIp, type: 'A' }  // The root
             * ]
             * 
             * // Setup promises
             * const updateResult = await Promise.allSettled(promises).then(res => {
             *      const fulfilled = res.filter(i => i.status === 'fulfilled').map(i => i.value);
             *      const fulfilled = res.filter(i => i.status === 'fulfilled').map(i => i.value);
             * 
             *      if (fulfilled.length === records.length) {
             *          return Promise.resolve({ status: 'success', result: fulfilled });
             *      } else {
             *          return Promise.resolve({ status: 'failed', result: rejected });
             *      }
             * 
             *      if (updateResult.status === 'failed') {
             *          console.error(updateResult.result)    
             *      }
             * })
             */
            update: async (options) => {
                helpers.printConsole('Updating DNS record..')
                try {
                    if (!options) { throw new Error('Cloudflare update DNS options are missing') }
                    if (!('zone_id' in options)) { throw 'The zone_id is missing' }
                    if (!('record_id' in options)) { throw 'The record_id is missing' }
                    if (!('record' in options)) { throw 'The record is missing' }

                    if (typeof options.zone_id !== 'string' || options.zone_id.length === 0 || options.zone_id.length > 32) {
                        throw new Error(`${options.zone_id} is an invalid zone ID`);
                    }

                    if (typeof options.record_id !== 'string' || options.record_id.length === 0) {
                        throw new Error(`${options.record_id} is not a valid record ID`);
                    }

                    if (options.record.type !== 'A') {
                        return Promise.resolve({ success: false, code: 100008, message: `${record.type} is not yet supported.` });
                    }

                    const url = `${baseUrl}/${options.zone_id}/dns_records/${options.record_id}`;
                    const response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.#credentials.apiToken}`,
                        },
                        body: JSON.stringify(options.record)
                    })

                    const data = await response.json();
                    if (!data.success) {
                        const error = data.errors;
                        helpers.printConsole('Cloudflare DNS record update has failed with the following error');
                        helpers.printConsole(error);

                        throw new Error('Cloudflare DNS record update has failed');
                    }

                    return Promise.resolve({ success: true, code: 2, message: 'The record content has been updated' });
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

/**
 * @typedef {object} DNSRecordUpdateOptions
 * @prop {string} zone_id
 * @prop {string} record_id The ID of the record you want to update
 * @prop {DNSTypes.A_Record_Cloudflare} record The record you want to update
 */

/**
 * @typedef {object} DNSRecordUpdateResult
 * @prop {boolean} success Whether the update is successful or not
 * @prop {number} code The result code
 * @prop {string} message The result message
 */

/**
 * @typedef {object} CloudflareCredentials
 * @prop {string} apiToken An API key with ```Edit``` permission.
*/

module.exports = CloudFlareDNSManager;