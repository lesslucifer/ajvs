import { ajvs } from "../lib/ajvs";

describe("# Transpile number", () => {
    const ajv = ajvs()

    test('Simple number', async () => {
        expect(ajv.transpile({
            '@n': 'number'
        })).toEqual({
            type: 'object',
            properties: {
                'n': { 'type': 'number' }
            }
        })
    })

    test('Number with min', async () => {
        expect(ajv.transpile({
            '@n': 'number|>=0',
            '@m': 'number|>0',
        })).toEqual({
            type: 'object',
            properties: {
                'n': { 'type': 'number', 'minimum': 0 },
                'm': { 'type': 'number', 'exclusiveMinimum': 0 },
            }
        })
    })

    test('Number with max', async () => {
        expect(ajv.transpile({
            '@n': 'number|<=0',
            '@m': 'number|<0',
        })).toEqual({
            type: 'object',
            properties: {
                'n': { 'type': 'number', 'maximum': 0 },
                'm': { 'type': 'number', 'exclusiveMaximum': 0 },
            }
        })
    })

    test('Number with both min and max', async () => {
        expect(ajv.transpile({
            '@n': 'number|>0',
            '@m': 'number|<0',
        })).toEqual({
            type: 'object',
            properties: {
                'n': { 'type': 'number', 'exclusiveMinimum': 0 },
                'm': { 'type': 'number', 'exclusiveMaximum': 0 },
            }
        })
    })

    test('Number with multiple of', async () => {
        expect(ajv.transpile({
            '@n': 'number|%5'
        })).toEqual({
            type: 'object',
            properties: {
                'n': { 'type': 'number', 'multipleOf': 5 },
            }
        })
    })

    test('Number with desc', async () => {
        expect(ajv.transpile({
            '@n': 'number|desc=An example number'
        })).toEqual({
            type: 'object',
            properties: {
                'n': { 'type': 'number', 'description': 'An example number' },
            }
        })
    })
});