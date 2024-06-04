import helpers from '../../../utils/helpers';
class HyperCloudUser {
    #_preferences;
    #_request;
    #_data = {
        id: null,
        loggedIn: false,
        role: 'Visitor'
    };
    constructor(request, options) {
        this.#_request = request;
        if (!helpers.is.undefined(options) && helpers.is.realObject(options)) {
            try {
                if ('loggedIn' in options && options.loggedIn !== undefined) {
                    if (typeof options.loggedIn === 'boolean') {
                        this.#_data.loggedIn = options.loggedIn;
                    }
                    else {
                        throw new TypeError(`The loggedIn value must be a boolean, got ${typeof options.loggedIn}`);
                    }
                }
                if (this.#_data.loggedIn) {
                    if ('id' in options && options.id !== undefined) {
                        if (typeof options.id !== 'string') {
                            throw new TypeError(`The user ID must be a string value, instead got ${typeof options.id}`);
                        }
                        if (options.id.length === 0) {
                            throw new RangeError(`The user ID cannot be an empty string`);
                        }
                        this.#_data.id = options.id;
                    }
                    else {
                        throw `The user loggedIn status has been set to "true" but no user ID has been set`;
                    }
                    if ('role' in options && options.role !== undefined) {
                        if (typeof options.role === 'string') {
                            if (options.role === 'Visitor') {
                                throw `The role cannot be set to "Visitor" when the "loggedIn" value is set to "true".`;
                            }
                            if (options.role === 'Admin' || options.role === 'Member') {
                                this.#_data.role = options.role;
                            }
                            else {
                                throw `The provided user role (${options.role}) is not a valid one`;
                            }
                        }
                        else {
                            throw new TypeError(`The role value must be a string, got ${typeof options.role}`);
                        }
                    }
                    else {
                        throw `The user loggedIn status has been set to "true" but no user role has been set`;
                    }
                }
            }
            catch (error) {
                if (typeof error === 'string') {
                    error = `HyperCloud User Error: ${error}`;
                }
                if (error instanceof Error) {
                    error.message = `HyperCloud User Error: ${error.message}`;
                }
                helpers.printConsole('Unable to set the HyperCloud user on server request:');
                helpers.printConsole(error);
                throw error;
            }
            this.#_preferences = new UserPreferences(request, options.preferences);
        }
        else {
            this.#_preferences = new UserPreferences(request);
        }
        return this;
    }
    /**
     * Get user ID
     * @returns {string}
    */
    get id() { return this.#_data.id; }
    /**
     * Get whether the user is loggedIn or not
     * @returns {boolean}
     */
    get loggedIn() { return this.#_data.loggedIn; }
    /**
     * The user role on this site
     * @returns {UserRole}
    */
    get role() { return this.#_data.role; }
    /**@returns {UserPreferences} */
    get preferences() { return this.#_preferences; }
    /**@private */
    _toString = () => {
        return JSON.stringify(this._toJSON(), null, 4);
    };
    /**@private */
    _toJSON = () => {
        return {
            id: this.id,
            loggedIn: this.loggedIn,
            role: this.role,
            preferences: this.preferences._toJSON()
        };
    };
}
class UserPreferences {
    #_data = {
        language: null,
        locale: null,
        currency: null,
        colorScheme: 'Default'
    };
    constructor(request, options) {
        try {
            if (!helpers.is.undefined(options) && helpers.is.realObject(options)) {
                if ('language' in options && options.language !== undefined) {
                    if (typeof options.language !== 'string') {
                        throw new TypeError(`The user's preferred language has been set to a value of type ${typeof options.language} while only string values are accepted`);
                    }
                    options.language = options.language.toLowerCase();
                    if (!request.server.supportedLanguages.includes(options.language)) {
                        throw `The user's preferred language has been set to ${options.language}, which is not a supported language.`;
                    }
                    this.#_data.language = options.language;
                }
                if ('locale' in options && options.locale !== undefined) {
                    if (helpers.validate.locale(options.locale)) {
                        this.#_data.locale = options.locale;
                    }
                    else {
                        throw `The user's preferred locale (${options.locale}) is not a valid one`;
                    }
                }
                if ('currency' in options && options.currency !== undefined) {
                    if (helpers.validate.currency(options.currency)) {
                        this.#_data.currency = options.currency.toUpperCase();
                    }
                    else {
                        throw `The user's preferred currency (${options.currency}) is not a valid one`;
                    }
                }
                if ('colorScheme' in options && options.colorScheme !== undefined) {
                    if (typeof options.colorScheme !== 'string') {
                        throw new TypeError(`The user's preferred colorScheme has been set to a value of type ${typeof options.colorScheme} while only string values are accepted`);
                    }
                    switch (options.colorScheme?.toLowerCase()) {
                        case 'default':
                            this.#_data.colorScheme = 'Default';
                            break;
                        case 'dark':
                            this.#_data.colorScheme = 'Dark';
                            break;
                        case 'light':
                            this.#_data.colorScheme = 'Light';
                            break;
                        default:
                            throw `The user's preferred colorScheme (${options.colorScheme}) is not a valid one`;
                    }
                }
            }
        }
        catch (error) {
            if (typeof error === 'string') {
                error = `User Preferences Error: ${error}`;
            }
            if (error instanceof Error) {
                error.message = `User Preferences Error: ${error.message}`;
            }
            helpers.printConsole('Unable to set user preferences on server request:');
            helpers.printConsole(error);
            throw error;
        }
    }
    /**
     * The user's preferred language
     * @returns {string|null} The user preferred language or `null` if they don't have one
    */
    get language() { return this.#_data.language; }
    /**
     * The user's preferred locale or `null` if they don't have one
     * @returns {string|null}
     */
    get locale() { return this.#_data.locale; }
    /**
     * The user's preferred currency or `null` if they don't have one
     * @returns {Currency|null}
     */
    get currency() { return this.#_data.currency; }
    /**
     * The user's preferred color scheme
     * @returns {ColorScheme}
     */
    get colorScheme() { return this.#_data.colorScheme; }
    /**@private */
    _toString = () => {
        return JSON.stringify(this._toJSON(), null, 4);
    };
    /**@private */
    _toJSON = () => {
        return {
            language: this.language,
            colorScheme: this.colorScheme,
            locale: this.locale,
            currency: this.currency
        };
    };
}
// const preferences = new UserPreferences({} as HyperCloudRequest, {})
export default HyperCloudUser;
