import hypercloud from '../src/hypercloud';

describe('Checking the main HyperCloud module', () => {

    describe('Check the module properties', () => {
        test('All properties are included', () => {
            expect(hypercloud).toHaveProperty('Server');
            expect(hypercloud).toHaveProperty('generateETags');
            expect(hypercloud).toHaveProperty('verbose');
            expect(hypercloud).toHaveProperty('dnsManager');
            expect(hypercloud).toHaveProperty('cronManager');
        })

        test('Cron Manager dependency', () => expect(hypercloud.cronManager.getTask('')).toBeNull())
        test('DNS Manager dependency', () => expect(hypercloud.dnsManager).toHaveProperty('helpers'))
        test('"verbose" returns a boolean value', () => expect(typeof hypercloud.verbose).toBe('boolean'))
        test('"verbose" only accepts boolean values', () => {
            expect(typeof (() => hypercloud.verbose = true)).toBe('function');
            expect(typeof (() => hypercloud.verbose = false)).toBe('function');
            // @ts-expect-error
            expect(() => hypercloud.verbose = 5).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof 5}`);
            // @ts-expect-error
            expect(() => hypercloud.verbose = -5).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof 5}`);
            // @ts-expect-error
            expect(() => hypercloud.verbose = {}).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof {}}`);
            // @ts-expect-error
            expect(() => hypercloud.verbose = []).toThrow(`HyperCloud verbose property can only accept boolean value, but instead got ${typeof []}`);
        })

        describe('Testing the generation of tags', () => {
            test('The generateETags is a method', () => expect(typeof hypercloud.generateETags).toBe('function'))
            test('only string values are accepted', () => {
                // @ts-expect-error
                expect(hypercloud.generateETags(5)).rejects.toMatch(`The root directory should be a string value, instead got ${typeof 5}`)
                // @ts-expect-error
                expect(hypercloud.generateETags(true)).rejects.toMatch(`The root directory should be a string value, instead got ${typeof true}`)
                // @ts-expect-error
                expect(hypercloud.generateETags({})).rejects.toMatch(`The root directory should be a string value, instead got ${typeof {}}`)
                // @ts-expect-error
                expect(hypercloud.generateETags([5])).rejects.toMatch(`The root directory should be a string value, instead got ${typeof [5]}`)
                // @ts-expect-error
                expect(hypercloud.generateETags(5)).rejects.toMatch(`The root directory should be a string value, instead got ${typeof 5}`)
                
            })
        })
    })
})