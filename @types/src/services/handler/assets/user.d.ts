import { HyperCloudUserOptions, UserPreferencesOptions, UserRole, Currency, ColorScheme } from '../../../docs/docs';
import HyperCloudRequest from './request';

declare class HyperCloudUser {
    constructor(request: HyperCloudRequest, options?: HyperCloudUserOptions);

    get id(): string;
    get loggedIn(): boolean;
    get role(): UserRole;
    get preferences(): UserPreferences;
    __toString: () => string;
    __toJSON: () => {
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
    constructor(request: HyperCloudRequest, options?: UserPreferencesOptions);

    get language(): string | null;
    get locale(): string | null;
    get currency(): Currency | null;
    get colorScheme(): ColorScheme;
    __toString: () => string;
    __toJSON: () => {
        language: string | null;
        colorScheme: ColorScheme;
        locale: string | null;
        currency: Currency | null;
    };
}

export default HyperCloudUser;