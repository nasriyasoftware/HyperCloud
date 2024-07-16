import helpers from "../../utils/helpers";

class LanguagesManager {
    #_supported: string[] = ['en'];
    #_default = 'en';

    get default() { return this.#_default }
    /**
     * Set or get the default language of the server
     * @param {string} lang The default language
     */
    set default(lang: string) {
        if (this.#_supported.includes(lang)) {
            this.#_default = lang;
        } else {
            throw new Error(`Cannot set default language: ${lang} is not supported`);
        }
    }

    get supported(): string[] { return this.#_supported }
    set supported(langs: string | string[]) {
        if (!(typeof langs === 'string' || Array.isArray(langs))) {
            throw new TypeError(`The server's supported languages accepts a string or a list of strings, but instead got ${typeof langs}`)
        }

        if (typeof langs === 'string') {
            if (langs.length === 0) { throw `The server's supported languages cannot be an empty string` }
            this.#_supported = [langs.toLowerCase()];
            this.default = langs.toLowerCase();
        } else {
            langs = [...new Set(langs)];

            if (langs.length === 0) {
                throw `The server's supported languages recieved an empty array`;
            }

            const supported: string[] = [];
            for (const lang of langs) {
                if (typeof lang === 'string' && lang.length > 0) {
                    supported.push(lang.toLowerCase());
                } else {
                    throw new TypeError(`The server's supported languages accepts a list of strings, but one or more of its items are invalid`);
                }
            }

            this.#_supported = supported;
        }

        if (!this.#_supported.includes(this.#_default)) {
            helpers.printConsole(`The server recieved a new list of supported languages, but the default language (${this.default}) is not part of the new list.`);
            helpers.printConsole(`Setting the new default language to: ${this.supported[0] || 'en'}`);
            this.default = this.supported[0] || 'en';
        }
    }
}

export default LanguagesManager;