import { StorageSize, StorageUnitAbbreviation, StorageUnitName } from "../../../docs/docs"
import helpers from "../../../utils/helpers";
import constants from "./constants";

const uploadHelpers = {
    isStorageSize: (value: any): value is StorageSize => {
        if (helpers.is.realObject(value)) {
            if ('value' in value) {
                if (typeof value.value !== 'number') { throw new TypeError(`The limit value must be a number, instead got ${typeof value.value}`) }
                if (value.value < 0) { throw new RangeError(`The limit value must be a non-negative number`) }
            }

            if ('unit' in value) {
                if (helpers.isNot.validString(value.unit)) { throw new TypeError(`The limit unit must be a string, instead got ${typeof value.unit}`) }
                const units = [...constants.storageUnitNames, ...constants.storageUnitAbbreviations]
                if (!units.includes(value.unit)) { throw new Error(`The limit unit you entered (${value.unit}) is not a valid storage unit`) }
            }

            return true;
        }

        return false;
    },
    isStorageUnitAbbreviation: (value: any): value is StorageUnitAbbreviation => {
        return constants.storageUnitAbbreviations.includes(value);
    },
    isStorageUnitName: (value: any): value is StorageUnitName => {
        return constants.storageUnitNames.includes(value);
    },
    convertToBytes: (value: number, unit: string) => {
        const unitLower = unit.toLowerCase();
        const key = Object.keys(constants.storageUnitsToBytes).find(u => u.toLowerCase() === unitLower);
        if (!key) {
            throw new Error(`Unsupported unit: ${unit}`);
        }
        return value * constants.storageUnitsToBytes[key];
    },
    getLimit(value: number | StorageSize) {
        if (this.isStorageSize(value)) {
            return this.convertToBytes(value.value, value.unit);
        } else {
            if (typeof value !== 'number') { throw new TypeError(`The limit value must be a number, instead got ${value}`) }
            if (value < 0) { throw new RangeError(`The limit value must be a non-negative number`) }
            return value;
        }
    }
}

export default uploadHelpers;