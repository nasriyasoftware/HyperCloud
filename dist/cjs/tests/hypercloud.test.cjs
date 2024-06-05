"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hypercloud_1 = __importDefault(require("../hypercloud"));
describe('Checking the main HyperCloud module', () => {
    describe('Check the module properties', () => {
        test('All properties are included', () => {
            expect(hypercloud_1.default).toHaveProperty('Server');
            expect(hypercloud_1.default).toHaveProperty('generateETags');
            expect(hypercloud_1.default).toHaveProperty('verbose');
            expect(hypercloud_1.default).toHaveProperty('dnsManager');
            expect(hypercloud_1.default).toHaveProperty('cronManager');
        });
        test('Cron Manager dependency', () => expect(hypercloud_1.default.cronManager.getTask('')).toBeNull());
        test('DNS Manager dependency', () => expect(hypercloud_1.default.dnsManager).toHaveProperty('helpers'));
        test('"verbose" returns a boolean value', () => expect(typeof hypercloud_1.default.verbose).toBe('boolean'));
        test('"verbose" only accepts boolean values', () => {
            expect(typeof (() => hypercloud_1.default.verbose = true)).toBe('function');
            expect(typeof (() => hypercloud_1.default.verbose = false)).toBe('function');
            // @ts-expect-error
            expect(() => hypercloud_1.default.verbose = 5).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof 5}`);
            // @ts-expect-error
            expect(() => hypercloud_1.default.verbose = -5).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof 5}`);
            // @ts-expect-error
            expect(() => hypercloud_1.default.verbose = {}).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof {}}`);
            // @ts-expect-error
            expect(() => hypercloud_1.default.verbose = []).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof []}`);
        });
        describe('Testing the generation of tags', () => {
            test('The generateETags is a method', () => expect(typeof hypercloud_1.default.generateETags).toBe('function'));
            test('only string values are accepted', () => {
                // @ts-expect-error
                expect(hypercloud_1.default.generateETags(5)).rejects.toMatch(`The root directory should be a string value, instead got ${typeof 5}`);
                // @ts-expect-error
                expect(hypercloud_1.default.generateETags(true)).rejects.toMatch(`The root directory should be a string value, instead got ${typeof true}`);
                // @ts-expect-error
                expect(hypercloud_1.default.generateETags({})).rejects.toMatch(`The root directory should be a string value, instead got ${typeof {}}`);
                // @ts-expect-error
                expect(hypercloud_1.default.generateETags([5])).rejects.toMatch(`The root directory should be a string value, instead got ${typeof [5]}`);
                // @ts-expect-error
                expect(hypercloud_1.default.generateETags(5)).rejects.toMatch(`The root directory should be a string value, instead got ${typeof 5}`);
            });
        });
    });
});
