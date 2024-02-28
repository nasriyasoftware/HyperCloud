const fs = require('fs');
const crypto = require('crypto');

class Helpers {
    /**
     * Calculate the hash value if a file
     * @param {string} filePath The file path
     * @returns {Promise<string>} The hashed value
     */
    calculateHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256'); // You can use other hash algorithms like 'md5', 'sha1', etc.

            const stream = fs.createReadStream(filePath);

            stream.on('data', data => {
                hash.update(data);
            });

            stream.on('end', () => {
                const fileHash = hash.digest('hex');
                resolve(fileHash);
            });

            stream.on('error', err => {
                reject(err);
            });
        });
    }

    /**
     * Print something on the debug level
     * @param {string|any} message
     * @returns {void}
    */
    printConsole(message) {
        if (global.HyperCloud_ServerVerbose === true) {
            console.debug(message)
        }
    }

    validate = Object.freeze({
        /**
         * Validate an IPv4 or IPv6 address
         * @example
         * // Example usage:
         * console.log(validate.ipAddress('192.168.0.1')); // true
         * console.log(validate.ipAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')); // true
         * console.log(validate.ipAddress('invalid')); // false
         * @param {string} ip The IP address to validate
         * @returns {boolean}
         */
        ipAddress: (ip) => {
            const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|:^:$/;
            return ipPattern.test(ip);
        },
        /**
         * Pass domain(s) to check whether they're valid to be used for the SSL certificate
         * @param {string|string[]} toCheck The domain(s) to check
         * @returns {boolean}
        */
        domains: (toCheck) => {
            const regex = /^(\*\.)?([\w-]+\.)+[\w-]+$/;

            if (typeof toCheck === 'string') {
                return regex.test(toCheck);
            } else if (Array.isArray(toCheck)) {
                /**@type {string[]} */
                const invalidDomains = [];

                for (const domain of toCheck) {
                    if (!regex.test(domain)) {
                        invalidDomains.push(domain)
                    }
                }

                if (invalidDomains.length === 0) {
                    return true;
                } else {
                    this.printConsole(`You have used invalid domains for the SSL certificate, the domains are: ${invalidDomains.toString()}.`)
                    return false;
                }
            } else {
                throw new Error(`The value that was passed on the "validate.domains()" method is invalid. Expected a string or an array of strings but instead got ${typeof toCheck}`)
            }
        },
        /**
         * Check the syntax validity of an email address
         * @param {string} email The email address to check
         * @returns {boolean}
        */
        email: (email) => {
            const regex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
            if (regex.test(email)) {
                return true;
            }

            return false;
        },
        /**
         * @param {string} certbotPath
         * @returns {boolean}
        */
        certbotPath: (certbotPath) => {
            const validity = this.checkPathAccessibility(certbotPath);
            if (validity.valid) { return true }

            if (!validity.errors.isString) {
                this.printConsole(`The certbot path should've been a string, but instead got ${typeof certbotPath}`)
                throw new Error(`The certbot path that was provided is invalid`)
            }

            if (!validity.errors.exist) {
                this.printConsole(`The cerbot path you provided (${certbotPath}) does not exist`);
            }

            if (!validity.errors.accessible) {
                this.printConsole(`Certbot path error: You do not have permissions to read path: ${certbotPath}`)
            }

            return false;
        },
        /**
         * Validate the project path
         * @param {string} projectPath 
         * @returns {boolean}
         */
        projectPath: (projectPath) => {
            const validity = this.checkPathAccessibility(projectPath);

            if (validity.valid) {
                const dirs = fs.readdirSync(projectPath);
                return dirs.includes('package.json');
            } else {
                if (!validity.errors.isString) {
                    this.printConsole(`The project path should've been a string, but instead got ${typeof projectPath}`)
                    throw new Error(`The project path that was provided is invalid`)
                }

                if (!validity.errors.exist) {
                    this.printConsole(`The project path you provided (${projectPath}) does not exist`);
                }

                if (!validity.errors.accessible) {
                    this.printConsole(`Project path path error: You do not have permissions to read path: ${projectPath}`)
                }

                return false;
            }
        }
    })

    /**
     * Check the accessibility of a directory. This also checks whether the directory exists or not.
     * @param {string} path The path to check
     * @returns {{
     *      valid: false,
     *      errors: {
     *          isString: boolean,
     *          exist: boolean,
     *          accessible: boolean
     *      }
     * }|{ valid: true }}
     */
    checkPathAccessibility(path) {
        const checks = Object.seal({
            isString: typeof path === 'string',
            exist: false,
            accessible: false
        })

        if (!checks.isString) { return { valid: false, errors: checks } }

        checks.exist = fs.existsSync(path);
        if (!checks.exist) { return { valid: false, errors: checks } }

        try {
            fs.accessSync(path);
            checks.accessible = true;
        } catch (error) {
            { return { valid: false, errors: checks } }
        }

        return { valid: true }
    }

    /**
     * Add a message/comment to a bat file
     * @param {string} batStr The original BAT string
     * @param {string} msg The message you want to add to the BAT string
     * @returns {string} The updated BAT string
     */
    addBatMessage(batStr, msg) {
        if (!batStr.includes('@echo off')) {
            batStr = `@echo off\n${batStr}`;
        }

        batStr += `echo ${msg}\n`;
        return batStr;
    }

    /**
     * Parse the request's cookies header
     * @param {string} cookiesHeader The cookies header from a request
     * @returns The cookies as an object
     */
    parseCookies(cookiesHeader) {
        const cookies = {};
        if (typeof cookiesHeader === 'string') {
            cookiesHeader.split(';').forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                //@ts-ignore
                cookies[key] = value;
            });
        }
        return cookies;
    }

    /**
     * Get the local IP address of the server
     * @returns {string|'Unknown'}
     */
    getLocalIP() {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        for (const interfaceName in interfaces) {
            const interfaceInfo = interfaces[interfaceName];
            for (const iface of interfaceInfo) {
                // Filter only non-internal (non-loopback) IPv4 addresses
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address.includes('::ffff:') ? iface.address.replace('::ffff:', '') : iface.address;
                }
            }
        }
        return 'Unknown';
    }

    /**
    * Check if a particular string is a valid HTML code
    * @param {string} str The string to check
    * @returns {boolean}
    */
    isHTML(string) {
        const regex = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
        return regex.test(string)
    }

    /**
     * Pass anything to check if it's an object or not
     * @param {*} obj 
     * @returns {boolean}
    */
    isRealObject(obj) {
        return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    }
}

module.exports = new Helpers;