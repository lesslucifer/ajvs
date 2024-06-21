import { ajvs } from "../lib/ajvs";

describe("# Transpile map", () => {
    const ajv = ajvs()

    test('Simple map', async () => {
        expect(ajv.transpile({
            '@{}map': 'number'
        })).toEqual({
            type: 'object',
            properties: {
                'map': { 'type': 'object', 'patternProperties': { '.*': { type: 'number' } } }
            }
        })
        expect(() => ajv.compile({
            '@{}map': 'number'
        })).not.toThrow()
    })

    test('Map with regex', async () => {
        expect(ajv.transpile({
            '@{[0-9]+}map': 'string'
        })).toEqual({
            type: 'object',
            properties: {
                map: {
                    type: 'object',
                    patternProperties: {
                        '[0-9]+': { 
                            'type': 'string'
                        }
                    }
                }
            }
        })
    })
});