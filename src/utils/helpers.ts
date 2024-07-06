import fs from 'fs';
import crypto from 'crypto';
import currencies from '../data/currencies.json';
import { DeepReadonly, MimeType, RandomOptions } from '../docs/docs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

class Helpers {
    getDirname(metaUrl?: string): string {
        if (typeof metaUrl === 'string') {
            return typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(metaUrl));
        } else {
            throw new Error(`Unable to get "direname". metaUrl should be string but instead got ${metaUrl}`)
        }
    }

    /**
     * Deep freeze an object or an array
     * @param obj The object or array you want to freeze
    */
    deepFreeze<T>(obj: T): DeepReadonly<T> {
        if (!this.is.freezable(obj)) { throw new Error(`${typeof obj} is not freezable`) }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.deepFreeze(item);
            }

            return Object.freeze(obj);
        }

        if (this.is.realObject(obj)) {
            for (const key in obj) {
                if (this.is.freezable(obj[key])) {
                    // @ts-ignore
                    obj[key] = this.deepFreeze(obj[key]);
                }
            }

            return Object.freeze(obj);
        }

        return obj;
    }
    /**Get the name if this package (project) from the `package.json` file */
    getProjectName(): string {
        // Read package.json file
        const packageJson = fs.readFileSync('package.json', 'utf8');
        // Parse package.json as JSON
        const packageData = JSON.parse(packageJson);
        // Extract project name
        return packageData.name;
    }
    /**
     * Calculate the hash value if a file
     * @param {string} filePath The file path
     * @returns {Promise<string>} The hashed value
     */
    calculateHash(filePath: string): Promise<string> {
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
    printConsole(message: string | any): void {
        if (process.env.HYPERCLOUD_SERVER_VERBOSE === 'TRUE') {
            console.debug(message);
        }
    }

    public readonly validate = {
        /**
         * Valdiate a currency (regardless of letter case)
         * @param {string} currency A currency to validate
         * @returns {boolean}
         */
        currency: (currency: string): boolean => {
            if (typeof currency === 'string') {
                currency = currency.toUpperCase();
                return currencies.includes(currency);
            } else {
                return false;
            }
        },
        /**
         * Validate a locale
         * @param {string} locale A locale to validate
         * @returns {boolean}
         */
        locale: (locale: string): boolean => {
            const languageTagPattern = /^[a-zA-Z]{2,3}(?:-[a-zA-Z]{3})?(?:-[a-zA-Z]{4})?(?:-[a-zA-Z]{2})?(?:-[a-zA-Z]{2})?$/;
            return languageTagPattern.test(locale);
        },
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
        ipAddress: (ip: string): boolean => {
            const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|:^:$/;
            return ipPattern.test(ip);
        },
        /**
         * Pass domain(s) to check whether they're valid to be used for the SSL certificate
         * @param {string|string[]} toCheck The domain(s) to check
         * @returns {boolean}
        */
        domains: (toCheck: string | string[]): boolean => {
            const regex = /^(\*\.)?([\w-]+\.)+[\w-]+$/;

            if (typeof toCheck === 'string') {
                return regex.test(toCheck);
            } else if (Array.isArray(toCheck)) {
                /**@type {string[]} */
                const invalidDomains: string[] = [];

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
        email: (email: string): boolean => {
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
        certbotPath: (certbotPath: string): boolean => {
            const validity = this.checkPathAccessibility(certbotPath);
            if (validity.valid) { return true }

            if (validity.errors.isString !== true) {
                this.printConsole(`The certbot path should've been a string, but instead got ${typeof certbotPath}`)
                throw new Error(`The certbot path that was provided is invalid`)
            }

            if (validity.errors.exist !== true) {
                this.printConsole(`The cerbot path you provided (${certbotPath}) does not exist`);
            }

            if (validity.errors.accessible !== true) {
                this.printConsole(`Certbot path error: You do not have permissions to read path: ${certbotPath}`)
            }

            return false;
        },
        /**
         * Validate the project path
         * @param {string} projectPath 
         * @returns {boolean}
         */
        projectPath: (projectPath: string): boolean => {
            const validity = this.checkPathAccessibility(projectPath);

            if (validity.valid) {
                const dirs = fs.readdirSync(projectPath);
                return dirs.includes('package.json');
            } else {
                if (validity.errors.isString !== true) {
                    this.printConsole(`The project path should've been a string, but instead got ${typeof projectPath}`)
                    throw new Error(`The project path that was provided is invalid`)
                }

                if (validity.errors.exist !== true) {
                    this.printConsole(`The project path you provided (${projectPath}) does not exist`);
                }

                if (validity.errors.accessible !== true) {
                    this.printConsole(`Project path path error: You do not have permissions to read path: ${projectPath}`)
                }

                return false;
            }
        }
    }

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
    checkPathAccessibility(path: fs.PathLike): {
        valid: false;
        errors: {
            isString: boolean;
            exist: boolean;
            accessible: boolean;
        };
    } | { valid: true; } {
        const checks = Object.seal({
            isString: typeof path === 'string',
            exist: false,
            accessible: false
        })

        if (!checks.isString) { return { valid: false, errors: checks } }

        checks.exist = fs.existsSync(path);
        if (!checks.exist) { return { valid: false, errors: checks } }

        try {
            fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
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
    addBatMessage(batStr: string, msg: string): string {
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
    parseCookies(cookiesHeader: string) {
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
     * Verify whether your Node.js process is running in CommonJS `cjs` or ECMAScript modules `esm`
     * @returns {'commonjs'|'module'}
     */
    getNodeEnv(): 'commonjs' | 'module' {
        return typeof module !== 'undefined' && module.exports ? 'commonjs' : 'module';
    }

    async loadModule(name: string) {
        return new Promise<any>((resolve, reject) => {
            try {
                if (this.getNodeEnv() === 'commonjs') {
                    resolve(require(name));
                } else {
                    // @ts-ignore
                    import(name).then(mod => resolve('default' in mod ? mod.default : mod));
                }
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to load module (${name}): ${error.message}` }
                reject(error);
            }
        })
    }

    /**
     * Get the local IP address of the server
     * @returns {string[]} An array of local IPs
     */
    async getLocalIPs(): Promise<string[]> {
        const os = await this.loadModule('os');
        const nets = os.networkInterfaces();
        const interfaces = {} as Record<string, Array<any>>

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!interfaces[name]) {
                        interfaces[name] = [];
                    }
                    interfaces[name].push(net.address);
                }
            }
        }

        const interfacesArr = Object.entries(interfaces).map(entry => {
            return { name: entry[0], ips: entry[1] }
        })

        interfacesArr.sort((int1, int2) => {
            if (int1.name === 'Ethernet' && int2.name === 'Ethernet') { return 0; }
            if (int1.name === 'Ethernet') { return -1; }
            if (int2.name === 'Ethernet') { return 1; }

            if (int1.name === 'vEthernet' && int2.name === 'vEthernet') { return 0; }
            if (int1.name === 'vEthernet') { return -1; }
            if (int2.name === 'vEthernet') { return 1; }

            return 0;
        })

        const local_ips = interfacesArr.map(i => i.ips).flat(3);
        return [...new Set(local_ips)] as string[];
    }

    /**
     * Generate a random text
     * @param length The length of the text. Minimum of `4`
     * @param [options] Options for generating the text
     * @returns 
     */
    generateRandom(length: number, options: RandomOptions = {}): string {
        const {
            includeNumbers = true,
            includeLetters = true,
            includeSymbols = true,
            includeLowerCaseChars = true,
            includeUpperCaseChars = true,
            beginWithLetter = true,
            noSimilarChars = true,
            noDuplicateChars = false,
            noSequentialChars = true
        } = options;

        let chars = '';
        let text = '';

        if (includeNumbers) chars += '0123456789';
        if (includeLetters) {
            if (includeLowerCaseChars) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (includeUpperCaseChars) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }

        if (includeSymbols) chars += '!";#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

        if (beginWithLetter && (includeLetters || includeNumbers || includeSymbols)) {
            const validChars = includeLetters && includeNumbers && includeSymbols ? chars : chars.slice(10);
            text += validChars.charAt(Math.floor(Math.random() * validChars.length));
        }

        while (text.length < length) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            const char = chars[randomIndex];

            if (
                (noSimilarChars && /[il1LoO]/.test(char)) ||
                (noDuplicateChars && text.includes(char)) ||
                (noSequentialChars && text.length > 0 && text[text.length - 1].charCodeAt(0) + 1 === char.charCodeAt(0))
            ) {
                continue;
            }

            text += char;
        }

        return text;
    }

    public readonly is = {
        validMime: (mime: any): mime is MimeType => {
            if (typeof mime !== 'string') { return false }
            const mimes = ["audio/aac", "application/x-abiword", "application/x-freearc", "image/avif"
                , "video/x-msvideo", "application/vnd.amazon.ebook", "application/octet-stream"
                , "image/bmp", "application/x-bzip", "application/x-bzip2", "application/x-cdf"
                , "application/x-csh", "text/calendar", "text/css", "text/plain", "text/csv", "application/msword"
                , "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                , "application/vnd.ms-fontobject", "application/epub+zip", "application/gzip"
                , "image/gif", "text/html", "image/vnd.microsoft.icon", "text/calendar", "application/java-archive"
                , "image/jpeg", "text/javascript", "application/json", "application/ld+json", "audio/midi"
                , "audio/x-midi", "audio/mpeg", "video/mp4", "video/mpeg", "application/vnd.apple.installer+xml"
                , "application/vnd.oasis.opendocument.presentation", "application/vnd.oasis.opendocument.spreadsheet"
                , "application/vnd.oasis.opendocument.text", "audio/ogg", "video/ogg", "application/ogg"
                , "audio/opus", "font/otf", "image/png", "application/pdf", "application/x-httpd-php"
                , "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                , "application/vnd.rar", "application/rtf", "application/x-sh", "image/svg+xml"
                , "application/x-tar", "image/tiff"]

            return mimes.includes(mime);
        },
        validURL: (str: any) => {
            try {
                new URL(str);
                return true;
            } catch (_) {
                return false;
            }
        },
        esmMode: () => {
            // @ts-ignore
            return typeof import.meta !== 'undefined';
        },
        /**
         * Check if a given value is `PathLike` or not.
         * @param value The value you wanna check if it's path like or not
         */
        pathLike(value: any): value is fs.PathLike {
            if (typeof value === 'string' || value instanceof Buffer) { return true }
            try {
                new URL(value);
                return true;
            } catch (error) {
                return false;
            }
        },
        /**
         * Freeze a value to prevent it from being overwritten
         * @param value The value you wanna check if it can be freezed or not
         */
        freezable(value: any) {
            return this.realObject(value) || Array.isArray(Object);
        },
        /**
        * Check if a particular string is a valid HTML code
        * @param {string} string The string to check
        * @returns {boolean}
        */
        html(string: string): boolean {
            const regex = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
            return regex.test(string);
        },
        /**
         * Pass anything to check if it's an object or not
         * @param {*} obj 
         * @returns {boolean}
        */
        realObject(obj: any): boolean {
            return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
        },
        /**
         * Check whether the argument is a valid string or not
         * @param {*} str 
         * @returns {boolean}
         */
        validString(str: any): boolean {
            return typeof str === 'string' && str.trim().length > 0;
        },
        /**
         * Check if the value is undefined
         * @param {any} arg 
         * @returns {boolean}
         */
        undefined(arg: any): arg is undefined {
            return typeof arg === 'undefined'
        },
        integer(value: any): boolean {
            return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
        }
    }

    /**
    * Check if a particular string is a valid HTML code
    * @param {string} string The string to check
    * @returns {boolean}
    * @deprecated Use `helpers.is.html(string)` instead. This will be removed in `v2`.
    */
    isHTML(string: string): boolean {
        const regex = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
        return regex.test(string)
    }

    /**
     * Pass anything to check if it's an object or not
     * @param {*} obj 
     * @returns {boolean}
     * @deprecated Use `helpers.is.realObject(string)` instead. This will be removed in `v2`.
    */
    isRealObject(obj: any): boolean {
        return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    }
}

export default new Helpers;