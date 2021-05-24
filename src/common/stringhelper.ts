/**
 * String helper class.
 */
export class StringHelper {
    private static readonly KILL_VERBS = [ 'killed', 'destroyed', 'rekt',
        'owned', 'curbstomped', 'shot', 'popped a cap in', 'eradicated',
        'eliminated', 'pulverized', 'sniped'];

    /**
     * Truncates a string to a given length, adding '...' on its tail, but only if the length exceeds the maximum value.
     * @param input Input string
     * @param maxLength Maximum string length
     * @returns Truncated string if too long, or original string if length checks out.
     */
    public static truncateString(input: string, maxLength: number): string {
        let truncated = input;

        if(!input) {
            return "";
        }

        if (input.length > maxLength) {
            truncated = input.substring(0, maxLength);
            truncated += "...";
        }

        return truncated;
    }

    /**
     * 
     */
    public static randomKillVerb(): string {
        const randInt = Math.floor(Math.random() * StringHelper.KILL_VERBS.length);
        return StringHelper.KILL_VERBS[randInt];
    }

    /**
     * 
     * @param num The number to pad
     * @param len The final length the padded string (number) should have
     */
    public static padLeadingZeros(num: number, len: number): string {
        let str = '' + num;
        while (str.length < len) {
            str = '0' + str;
        }
        return str;
    }
}