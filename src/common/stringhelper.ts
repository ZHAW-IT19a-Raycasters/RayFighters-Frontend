/**
 * String helper class.
 */
export class StringHelper {
    /**
     * Truncates a string to a given length, adding '...' on its tail, but only if the length exceeds the maximum value.
     * @param input Input string
     * @param maxLength Maximum string length
     * @returns Truncated string if too long, or original string if length checks out.
     */
    public static truncateString(input: string, maxLength: number){
        let truncated = input;
        if (input.length > maxLength) {
            truncated = input.substring(0, maxLength);
            truncated += "...";
        }
        return truncated;
    }
}