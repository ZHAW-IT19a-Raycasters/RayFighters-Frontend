/**
 * String helper class.
 */
export class StringHelper {
    /**
      * Verbs used in the killfeed. Example usage:
      * - Player1 killed Player2
      * - Player1 eradicated Player2
      * - Player2 sniped Player1
      */
    private static readonly KILL_VERBS = [ 'killed', 'destroyed', 'rekt',
        'owned', 'curbstomped', 'shot', 'popped a cap in', 'eradicated',
        'eliminated', 'pulverized', 'sniped'];

    /**
     * Truncates a string to a given length, adding '...' on its tail, but only
     * if the length exceeds the maximum value.
     *
     * @param {string} input Input string
     * @param {number} maxLength Maximum string length
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
     * Random kill verb
     * @returns Random string from KILL_VERB
     */
    public static randomKillVerb(): string {
        const randInt = Math.floor(Math.random() * StringHelper.KILL_VERBS.length);
        return StringHelper.KILL_VERBS[randInt];
    }

    /**
     * Pad a number with zeros. 
     * 
     * @param {number} num The number to pad
     * @param {number} len The final length the padded string (number) should have
     * @returns padded string
     */
    public static padLeadingZeros(num: number, len: number): string {
        const padChar = '0';
        let str = '' + num;
        while (str.length < len) {
            str = padChar + str;
        }
        return str;
    }
}
