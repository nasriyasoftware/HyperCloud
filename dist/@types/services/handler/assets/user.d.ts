import { HyperCloudUserOptions, UserPreferencesOptions, UserRole, Currency, ColorScheme } from '../../../docs/docs';
import HyperCloudRequest from './request';
declare class HyperCloudUser {
    #private;
    constructor(request: HyperCloudRequest, options?: HyperCloudUserOptions);
    /**
     * Get user ID
     * @returns {string}
    */
    get id(): string;
    /**
     * Get whether the user is loggedIn or not
     * @returns {boolean}
     */
    get loggedIn(): boolean;
    /**
     * The user role on this site
     * @returns {UserRole}
    */
    get role(): UserRole;
    /**@returns {UserPreferences} */
    get preferences(): UserPreferences;
    /**@private */
    _toString: () => string;
    /**@private */
    _toJSON: () => {
        id: string;
        loggedIn: boolean;
        role: UserRole;
        preferences: {
            language: string | null;
            colorScheme: ColorScheme;
            locale: string | null;
            currency: Currency | null;
        };
    };
}
declare class UserPreferences {
    #private;
    constructor(request: HyperCloudRequest, options?: UserPreferencesOptions);
    /**
     * The user's preferred language
     * @returns {string|null} The user preferred language or `null` if they don't have one
    */
    get language(): string | null;
    /**
     * The user's preferred locale or `null` if they don't have one
     * @returns {string|null}
     */
    get locale(): string | null;
    /**
     * The user's preferred currency or `null` if they don't have one
     * @returns {Currency|null}
     */
    get currency(): Currency | null;
    /**
     * The user's preferred color scheme
     * @returns {ColorScheme}
     */
    get colorScheme(): ColorScheme;
    /**@private */
    _toString: () => string;
    /**@private */
    _toJSON: () => {
        language: string | null;
        colorScheme: ColorScheme;
        locale: string | null;
        currency: Currency | null;
    };
}
export default HyperCloudUser;
