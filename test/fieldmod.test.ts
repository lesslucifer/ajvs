import { ajvs } from "../lib/ajvs";

describe("# Transpile field mod", () => {
    const ajv = ajvs()

    test('+', async () => {
        expect(ajv.transpile({
            '+f': { 'type': 'string' },
            'e': { 'type': 'string' },
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'string' },
                'e': { 'type': 'string' },
            },
            required: ['f']
        })
    })

    test('@', async () => {
        expect(ajv.transpile({
            '@f': 'string',
            'e': { 'type': 'string' }
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'string' },
                'e': { 'type': 'string' },
            }
        })
    })

    test('@', async () => {
        expect(ajv.transpile({
            '@f': 'string',
            'e': { 'type': 'string' }
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'string' },
                'e': { 'type': 'string' },
            }
        })
    })

    test('+@', async () => {
        expect(ajv.transpile({
            '+@f': 'string',
            '@+e': 'string'
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'string' },
                'e': { 'type': 'string' },
            },
            required: ['f', 'e']
        })
    })

    test('@@', async () => {
        expect(ajv.transpile({
            '@@f': 'string',
            '@@e': 'string'
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'string' },
                'e': { 'type': 'string' },
            }
        })
    })

    test('++', async () => {
        expect(ajv.transpile({
            '++f': { 'type': 'string' },
            '++e': { 'type': 'string' },
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'string' },
                'e': { 'type': 'string' },
            },
            required: ['f', 'e']
        })
    })

    test('+[]', async () => {
        expect(ajv.transpile({
            '+[]f': { 'type': 'string' },
            '[]+e': { 'type': 'string' },
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } },
                'e': { 'type': 'array', 'items': { 'type': 'string' } },
            },
            required: ['f', 'e']
        })
    })

    test('[]@', async () => {
        expect(ajv.transpile({
            '[]@f': 'string',
            '@[]e': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } },
                'e': { 'type': 'array', 'items': { 'type': 'string' } },
            }
        })
    })

    test('+[]@', async () => {
        expect(ajv.transpile({
            '+[]@f': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } }
            },
            required: ['f']
        })

        expect(ajv.transpile({
            '+@[]f': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '[]+@f': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '[]@+f': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '@+[]f': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '@[]+f': 'string',
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'type': 'array', 'items': { 'type': 'string' } }
            },
            required: ['f']
        })
    })

    test('+^@', async () => {
        expect(ajv.transpile({
            '+^@f': [1, 2]
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'enum': [1,2] }
            },
            required: ['f']
        })

        expect(ajv.transpile({
            '+@^f': [1, 2]
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'enum': [1,2] }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '@+^f': [1, 2]
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'enum': [1,2] }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '@^+f': [1, 2]
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'enum': [1,2] }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '^+@f': [1, 2]
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'enum': [1,2] }
            },
            required: ['f']
        })
        
        expect(ajv.transpile({
            '^@+f': [1, 2]
        })).toEqual({
            type: 'object',
            properties: {
                'f': { 'enum': [1,2] }
            },
            required: ['f']
        })
    })
});