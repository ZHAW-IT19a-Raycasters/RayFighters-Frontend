import { StringHelper } from "../src/common/stringhelper";

describe('String helper unit testing', () =>{
    it('should truncate strings properly', () => {
        // Setup
        const testString = 'This string is way too long!';
        const expectedString = 'This strin...';
        const stringLength = 10;

        // Test & Verification
        expect(StringHelper.truncateString(testString, stringLength)).toBe(expectedString);
    });

    it('should not truncate strings that fit the correct length', () => {
        // Setup
        const testString = 'This length is ok!';
        const stringLength = 20;

        // Test & Verification
        expect(StringHelper.truncateString(testString, stringLength)).toBe(testString);
    })

    it('should pad leading zeroes correctly', () => {
        // Test & Verification
        expect(StringHelper.padLeadingZeros(3, 2)).toBe("03");
    })
});