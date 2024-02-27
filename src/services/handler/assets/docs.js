/**
 * HyperCloud Initialized Request
 * @typedef {object} InitializedRequest
 * @prop {string} id A unique request ID
 * @prop {string} ip The IPv4 address of the client making the request. Example: ```172.15.47.118```.
 * @prop {'http'|'https'} protocol The protocol this request is sent over.
 * @prop {string} host The full domain of a request. E.g.: ```nasriya.net``` or ```auth.nasriya.net```.
 * @prop {string} subDomain The subdomain of the `host`. Example URL: `https://auth.nasriya.net` => `subDomain = 'auth'`.
 * @prop {string} domain The `host`'s domain. Example: `https://auth.nasriya.net` => `domain = nasriya.net`
 * @prop {string} baseUrl The base URL of the host. It consists of the ```protocol``` and the ```protocol```. Example: ```https://nasriya.net```.
 * @prop {string[]} path The path of the URL, for example, a url of ```/support/faq``` corresponds to ```['support', 'faq']```.
 * @prop {object} query The query parameters of the URL. Example: ```/products/search?sku=random&lessThan=20``` produces ```{sku: 'random', lessThan: '20'}```.
 * @prop {string} href The full URL, including the ```protocol```, ```baseUrl```, ```path```, and ```query```. Example: ```https://nasriya.net/support?ticket=randomTicketID&lang=en```.
 * @prop {RequestBodyType} bodyType The type of the recieved data
 * @prop {string|object| Buffer} body The recieved data
 * @prop {object} cookies The request cookies
 */

module.exports = {}