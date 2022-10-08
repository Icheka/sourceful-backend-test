/**
 * Returns the number of occurrences of each element in arr. Currently, `countArrayElements` doesn't flatten multi-dimension arrays.
 * @param arr an Array of T elements
 * @returns a Record<string, number> representing the number of occurrences of each elements in `arr`
 */
export const countArrayElements = <T>(arr: Array<T>) => {
    const counts: Record<string, number> = {};
    for (const element of arr) {
        const key = String(element);
        const count = counts[key] || 0;
        counts[key] = count + 1;
    }
    return counts;
}