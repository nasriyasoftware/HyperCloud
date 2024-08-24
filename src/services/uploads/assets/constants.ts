import { StorageUnitAbbreviation, StorageUnitName } from "../../../docs/docs";

const constants = {
    storageUnitNames: ['Bit', 'Byte', 'Kilobyte', 'Kibibyte', 'Megabyte', 'Mebibyte', 'Gigabyte', 'Gibibyte', 'Terabyte', 'Tebibyte', 'Petabyte', 'Pebibyte', 'Exabyte', 'Exbibyte', 'Zettabyte', 'Zebibyte', 'Yottabyte', 'Yobibyte', 'Brontobyte', 'Geopbyte', 'Nibble', 'Word'] as StorageUnitName[],
    storageUnitAbbreviations: ['b', 'B', 'KB', 'KiB', 'MB', 'MiB', 'GB', 'GiB', 'TB', 'TiB', 'PB', 'PiB', 'EB', 'EiB', 'ZB', 'ZiB', 'YB', 'YiB', 'BB', 'GPB'] as StorageUnitAbbreviation[],
    storageUnitsToBytes: {
        'Bit': 1 / 8,
        'b': 1 / 8, // Bit
        'Byte': 1,
        'B': 1, // Byte
        'Kilobyte': 1024,
        'KB': 1024, // Kilobyte
        'Kibibyte': 1024,
        'KiB': 1024, // Kibibyte
        'Megabyte': 1024 * 1024,
        'MB': 1024 * 1024, // Megabyte
        'Mebibyte': 1024 * 1024,
        'MiB': 1024 * 1024, // Mebibyte
        'Gigabyte': 1024 * 1024 * 1024,
        'GB': 1024 * 1024 * 1024, // Gigabyte
        'Gibibyte': 1024 * 1024 * 1024,
        'GiB': 1024 * 1024 * 1024, // Gibibyte
        'Terabyte': 1024 * 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024, // Terabyte
        'Tebibyte': 1024 * 1024 * 1024 * 1024,
        'TiB': 1024 * 1024 * 1024 * 1024, // Tebibyte
        'Petabyte': 1024 * 1024 * 1024 * 1024 * 1024,
        'PB': 1024 * 1024 * 1024 * 1024 * 1024, // Petabyte
        'Pebibyte': 1024 * 1024 * 1024 * 1024 * 1024,
        'PiB': 1024 * 1024 * 1024 * 1024 * 1024, // Pebibyte
        'Exabyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'EB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Exabyte
        'Exbibyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'EiB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Exbibyte
        'Zettabyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'ZB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Zettabyte
        'Zebibyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'ZiB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Zebibyte
        'Yottabyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'YB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Yottabyte
        'Yobibyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'YiB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Yobibyte
        'Brontobyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'BB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Brontobyte
        'Geopbyte': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'GPB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024, // Geopbyte
    } as Record<string, number>
}

export default constants;