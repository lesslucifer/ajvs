import { ajvs } from "../lib/ajvs";

describe("# Transpile array", () => {
    const ajv = ajvs()

    test('Simple string', async () => {
        expect(ajv.transpile({
            '@s': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string' }
            }
        })
    })

    test('String with minLen', async () => {
        expect(ajv.transpile({
            '@s': 'string|len>=62',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', 'minLength': 62 }
            }
        })
    })

    test('String with maxLen', async () => {
        expect(ajv.transpile({
            '@s': 'string|len<=62',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', 'maxLength': 62 }
            }
        })
    })

    test('String with minLen & maxLen', async () => {
        expect(ajv.transpile({
            '@s': 'string|len<=62|len>=10',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', 'minLength': 10, 'maxLength': 62 }
            }
        })
    })

    test('String with pattern', async () => {
        expect(ajv.transpile({
            '@s': 'string|p=abc',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', 'pattern': 'abc' }
            }
        })
    })

    test('String with pattern with special charater', async () => {
        expect(ajv.transpile({
            '@s': 'string|p=abc*.^^1',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', 'pattern': 'abc*.^^1' }
            }
        })
    })

    test('String with pattern with terminator charater', async () => {
        expect(ajv.transpile({
            '@s': 'string|p=abc*.^^1|12|1||12==1||1=',
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', 'pattern': 'abc*.^^1|12|1||12==1||1=' }
            }
        })
    })
});