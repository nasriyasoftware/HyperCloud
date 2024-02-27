/**
 * @typedef {object} CloudflareDNSUpdate
 * @prop {string} email The email address of your cloudflare account
 * @prop {string} apiKey An API key with ```Edit``` permission.
 * @prop {string} zone_id The zone ID
 * @prop {string} record_id The record ID
 */

/**
 * @typedef {'A'|'AAAA'|'CAA'|'CERT'|'CNAME'|'DINSKEY'|'DS'|'HTTPS'|'LOC'|'MX'|'NAPTR'|'NS'|'PTR'|'SMIMEA'|'SVR'|'SSHFP'|'SVCB'|'TLSA'|'TXT'|'URI'} DNSRecordType
 */

/**@type {DNSRecordType[]} */
const dnsRecordTypes = ['A', 'AAAA', 'CAA', 'CERT', 'CNAME', 'DINSKEY', 'DS', 'HTTPS', 'LOC', 'MX', 'NAPTR', 'NS', 'PTR', 'SMIMEA', 'SVR', 'SSHFP', 'SVCB', 'TLSA', 'TXT', 'URI'];

/**
 * @typedef {object} A_Record_Cloudflare
 * @prop {string} content A valid IPv4 address. Example: ```198.51.100.4```.
 * @prop {string} name DNS record name (or @ for the zone apex) in Punycode. ```<= 255 characters```. Example: ```example.com```.
 * @prop {'A'} type Record type.
 * @prop {number} [ttl] Time To Live (TTL) of the DNS record in seconds. Setting to 1 means 'automatic'. Value must be between 60 and 86400, with the minimum reduced to 30 for Enterprise zones.
 * @prop {boolean} [proxied] Whether the record is receiving the performance and security benefits of Cloudflare.
 * @prop {string} [comment] Comments or notes about the DNS record. This field has no effect on DNS responses.
 * @prop {string[]} [tags] Custom tags for the DNS record. This field has no effect on DNS responses.
 */

module.exports = { dnsRecordTypes }