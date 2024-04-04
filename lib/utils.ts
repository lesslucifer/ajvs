export class AjvsUtils {
    static isPlainObject(value: any) {
        // it's truthy
        return !!value &&
            // it has a prototype that's also truthy
            !!(value = Object.getPrototypeOf(value)) &&
            // which has `null` as parent prototype
            !Object.getPrototypeOf(value);
    }

    static pushOrConvertToArray<T>(value: any, ...elems: any[]): T[] {
        if (Array.isArray(value)) {
            value.push(...elems)
            return value
        }
        
        return [value, ...elems]
    }

    static eqOrHas<T extends any, E extends T>(arr: T | T[], elem: E) {
        if (arr === elem) return true
        return Array.isArray(arr) && arr.includes(elem)
    }
}