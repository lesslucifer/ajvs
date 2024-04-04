import { ajvs } from "../lib/ajvs";

enum TestEnum {
    A = 'A',
    B = 'B'
}

enum TestEnumIndex {
    A, B, C
}

describe("# Transpile enum", () => {
    const ajv = ajvs()

    test('Simple enum', async () => {
        expect(ajv.transpile({
            '^e': [1,2,3],
        })).toEqual({
            type: 'object',
            properties: {
                'e': { 'enum': [1,2,3] }
            }
        })
    })

    test('Complex enum', async () => {
        expect(ajv.transpile({
            '^e': [1,2,3, 'a', 'b'],
        })).toEqual({
            type: 'object',
            properties: {
                'e': { 'enum': [1,2,3, 'a', 'b'] }
            }
        })
    })

    test('Object enum', async () => {
        expect(ajv.transpile({
            '^e': {1: 'x', 'x': 2}
        })).toEqual({
            type: 'object',
            properties: {
                'e': { 'enum': ['x', 2] }
            }
        })
    })

    test('TS enum string', async () => {
        expect(ajv.transpile({
            '^e': TestEnum
        })).toEqual({
            type: 'object',
            properties: {
                'e': { 'enum': ['A', 'B'] }
            }
        })
    })

    test('TS enum index', async () => {
        expect(ajv.transpile({
            '^e': TestEnumIndex
        })).toEqual({
            type: 'object',
            properties: {
                'e': { 'enum': ['A', 'B', 'C', 0,1,2] }
            }
        })
    })
});