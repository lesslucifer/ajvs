import { ajvs } from "../lib/ajvs";

describe("# Transpile object", () => {
    const ajv = ajvs()

    beforeAll(() => {
    })

    test('Required properties', async () => {
        expect(ajv.transpile({
            '+@s': 'string',
            '+@n': 'number',
            '+@i': 'integer',
            '@i2': 'int',
            '+@b': 'boolean',
            '@b2': 'bool'
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string' },
                'n': { 'type': 'number' },
                'i': { 'type': 'integer' },
                'i2': { 'type': 'integer' },
                'b': { 'type': 'boolean' },
                'b2': { 'type': 'boolean' },
            },
            required: ['s', 'n', 'i', 'b']
        })
    })

    test('Additional properties', async () => {
        expect(ajv.transpile({
            '+@s': 'string',
            '+@n': 'number',
            '+@i': 'integer',
            '@i2': 'int',
            '+@b': 'boolean',
            '@b2': 'bool',
            '++': false
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string' },
                'n': { 'type': 'number' },
                'i': { 'type': 'integer' },
                'i2': { 'type': 'integer' },
                'b': { 'type': 'boolean' },
                'b2': { 'type': 'boolean' },
            },
            required: ['s', 'n', 'i', 'b'],
            additionalProperties: false
        })
    })

    test('Nullable', async () => {
        expect(ajv.transpile({
            '+@s?': 'string',
            '+@n': 'number',
            '+@i': 'integer',
            '@i2?': 'int',
            '+@b': 'boolean',
            '@b2': 'bool',
            '++': false
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', nullable: true },
                'n': { 'type': 'number' },
                'i': { 'type': 'integer' },
                'i2': { 'type': 'integer', nullable: true },
                'b': { 'type': 'boolean' },
                'b2': { 'type': 'boolean' },
            },
            required: ['s', 'n', 'i', 'b'],
            additionalProperties: false
        })
    })

    test('Raw object', async () => {
        expect(ajv.transpile({
            'field': {
                type: 'object',
                properties: {
                    's': { 'type': 'string', nullable: true },
                    'n': { 'type': 'number' },
                    'i': { 'type': 'integer' },
                    'i2': { 'type': 'integer', nullable: true },
                    'b': { 'type': 'boolean' },
                    'b2': { 'type': 'boolean' },
                },
                required: ['s', 'n', 'i', 'b'],
                additionalProperties: false
            }
        })).toEqual({
            type: 'object',
            properties: {
                'field': {
                    type: 'object',
                    properties: {
                        's': { 'type': 'string', nullable: true },
                        'n': { 'type': 'number' },
                        'i': { 'type': 'integer' },
                        'i2': { 'type': 'integer', nullable: true },
                        'b': { 'type': 'boolean' },
                        'b2': { 'type': 'boolean' },
                    },
                    required: ['s', 'n', 'i', 'b'],
                    additionalProperties: false
                }
            }
        })
    })

    test('Nested field', async () => {
        expect(ajv.transpile({
            '+@s?': 'string',
            '+@n': 'number',
            '+@i': 'integer',
            '@i2?': 'int',
            '@f': {
                '@s?': 'string',
                '@n': 'number'
            },
            '++': false
        })).toEqual({
            type: 'object',
            properties: {
                's': { 'type': 'string', nullable: true },
                'n': { 'type': 'number' },
                'i': { 'type': 'integer' },
                'i2': { 'type': 'integer', nullable: true },
                'f': {
                    type: 'object',
                    properties: {
                        's': { 'type': 'string', nullable: true },
                        'n': { 'type': 'number' },
                    }
                }
            },
            required: ['s', 'n', 'i'],
            additionalProperties: false
        })
    })

    test('Raw with nested', async () => {
        expect(ajv.transpile({
            'field': {
                type: 'object',
                properties: {
                    's': { 'type': 'string', nullable: true },
                    'n': { 'type': 'number' },
                    'i': { 'type': 'integer' },
                    'i2': { 'type': 'integer', nullable: true },
                    'b': { 'type': 'boolean' },
                    'arr': { 'type': 'array', '@items': {
                        '@s?': 'string'
                    } },
                },
                required: ['s', 'n', 'i', 'b'],
                additionalProperties: false
            }
        })).toEqual({
            type: 'object',
            properties: {
                'field': {
                    type: 'object',
                    properties: {
                        's': { 'type': 'string', nullable: true },
                        'n': { 'type': 'number' },
                        'i': { 'type': 'integer' },
                        'i2': { 'type': 'integer', nullable: true },
                        'b': { 'type': 'boolean' },
                        'arr': { 'type': 'array', 'items': {
                            'type': 'object',
                            'properties': {
                                's': { 'type': 'string', nullable: true },
                            }
                        } },
                    },
                    required: ['s', 'n', 'i', 'b'],
                    additionalProperties: false
                }
            }
        })
    })
});