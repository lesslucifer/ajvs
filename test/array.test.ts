import { ajvs } from "../lib/ajvs";

describe("# Transpile number", () => {
    const ajv = ajvs()

    test('Simple array', async () => {
        expect(ajv.transpile({
            '@[]arr': 'number'
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 'type': 'array', 'items': { 'type': 'number' } }
            }
        })
    })

    test('Array with min and max items', async () => {
        expect(ajv.transpile({
            '@[1-2]arr': 'number'
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 
                    'type': 'array', 
                    'items': { 'type': 'number' },
                    'minItems': 1,
                    'maxItems': 2
                }
            }
        })
    })

    test('Array with min items only', async () => {
        expect(ajv.transpile({
            '@[10]arr': 'number'
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 
                    'type': 'array', 
                    'items': { 'type': 'number' },
                    'minItems': 10
                }
            }
        })
    })

    test('Array with max items only', async () => {
        expect(ajv.transpile({
            '@[-20]arr': 'number'
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 
                    'type': 'array', 
                    'items': { 'type': 'number' },
                    'maxItems': 20
                }
            }
        })
    })

    test('Array with raw config', async () => {
        expect(ajv.transpile({
            '[1-20]arr': { 'type': 'number' }
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 
                    'type': 'array', 
                    'items': { 'type': 'number' },
                    'minItems': 1,
                    'maxItems': 20
                }
            }
        })
    })

    test('Array with array', async () => {
        expect(ajv.transpile({
            '[1-20]arr': {
                'type': 'array',
                '@items': 'string'
            }
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 
                    'type': 'array', 
                    'items': {
                        'type': 'array',
                        'items': { 'type': 'string' }
                    },
                    'minItems': 1,
                    'maxItems': 20
                }
            }
        })
    })

    test('Array with desc', async () => {
        expect(ajv.transpile({
            '@[1-20]arr': 'string|desc=An example string'
        })).toEqual({
            type: 'object',
            properties: {
                'arr': { 
                    'type': 'array', 
                    'items': {
                        'type': 'string',
                        'description': 'An example string'
                    },
                    'minItems': 1,
                    'maxItems': 20
                }
            }
        })
    })
});