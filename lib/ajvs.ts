import AJV, { JSONSchemaType, Schema, ValidateFunction } from 'ajv'
import { AjvsUtils } from './utils';
import { isString, isUndefined } from 'util';

export type AJVSchema<T = any> = Schema | JSONSchemaType<T>

export function ajvs(ajv?: AJV) {
    return new AJVS(ajv)
}

enum AJVNameInferType {
    RAW,
    ARRAY,
    MAP,
    ENUM
}

interface AJVSNameDesc {
    applyShortcut: boolean;
    name: string;
    isRequired: boolean;
    allowNull: boolean;
    type: AJVNameInferType
    min?: number
    max?: number
    pattern?: string
}

export enum AJVSToken {
    ADDITIONAL_FIELDS = '++'
}

const ALL_AJVS_TOKENS: string[] = Object.values(AJVSToken)

const AJVS_SUPPORT_SHORT_TYPES = {
    'string': 'string',
    'number': 'number',
    'integer': 'integer',
    'int': 'integer',
    'boolean': 'boolean',
    'bool': 'boolean'
}

const arrayModRegEx = /^\[(\d*)-?(\d*)\]/
const mapModRegEx = /^{(.*)}/
const minLenRegEx = /^len([\<\>])=([\d]+)$/;
const patternRegEx = /^p=(.*)$/;
const limitRegEx = /^([\<\>])(=?)(-?[\d\.]+)$/;
const multipleOfRegEx = /^\%(-?[\d\.]+)$/;

export class AJVS {
    constructor(public ajv?: AJV) {
        if (!this.ajv) {
            this.ajv = new AJV()
        }
    }

    transpile<T>(schema: AJVSchema<T>): AJVSchema<T> {
        return this.parseKeyValue({
            applyShortcut: true,
            isRequired: false,
            name: '',
            type: AJVNameInferType.RAW,
            allowNull: false
        }, schema)
    }

    compile<T>(schema: Schema | JSONSchemaType<T>): ValidateFunction<T> {
        return this.ajv.compile(this.transpile(schema))
    }

    private parseNameDesc(name: string) {
        const sch: AJVSNameDesc = {
            applyShortcut: false,
            name,
            isRequired: false,
            allowNull: false,
            type: AJVNameInferType.RAW
        }

        if (ALL_AJVS_TOKENS.includes(name)) {
            return sch;
        }

        let hasModifier = true
        while (hasModifier) {
            hasModifier = false
            if (sch.name.startsWith('@')) {
                sch.applyShortcut = true
                sch.name = sch.name.substring(1)
                hasModifier = true
            }

            if (sch.name.startsWith('+')) {
                sch.isRequired = true
                sch.name = sch.name.substring(1)
                hasModifier = true
            }

            if (arrayModRegEx.test(sch.name)) {
                const matches = sch.name.match(arrayModRegEx)
                sch.type = AJVNameInferType.ARRAY
                sch.name = sch.name.substring(matches[0].length)
                sch.min = matches[1] ? parseInt(matches[1]) : undefined
                sch.max = matches[2] ? parseInt(matches[2]) : undefined
                hasModifier = true
            }

            if (mapModRegEx.test(sch.name)) {
                const matches = sch.name.match(mapModRegEx)
                sch.type = AJVNameInferType.MAP
                sch.name = sch.name.substring(matches[0].length)
                sch.pattern = matches[1]
                hasModifier = true
            }

            if (sch.name.startsWith('{}')) {
                sch.type = AJVNameInferType.MAP
                sch.name = sch.name.substring(2)
                hasModifier = true
            }

            if (sch.name.startsWith('^')) {
                sch.type = AJVNameInferType.ENUM
                sch.name = sch.name.substring(1)
                hasModifier = true
            }

            if (sch.name.endsWith('?')) {
                sch.allowNull = true
                sch.name = sch.name.substring(0, sch.name.length - 1)
                hasModifier = true
            }
        }

        return sch
    }

    private parseKeyValue<T>(desc: AJVSNameDesc, schema: AJVSchema<T>): AJVSchema<T> {
        let output = schema
        if (desc.applyShortcut) {
            if (isString(schema)) {
                output = this.buildStringSchema(schema, {})
            }
            if (AjvsUtils.isPlainObject(schema)) {
                output = this.buildObjectSchema(schema)
            }
        }
        else if (AjvsUtils.isPlainObject(schema)) {
            output = this.buildRawObjectSchema(schema)
        }

        if (desc.allowNull && AjvsUtils.isPlainObject(output)) {
            output['nullable'] = true
        }

        if (desc.type === AJVNameInferType.ENUM) {
            output = {
                'enum': Array.isArray(output) ? output : AjvsUtils.isPlainObject(output) ? Object.values(output) : output
            }
        }
        else if (desc.type === AJVNameInferType.ARRAY) {
            output = {
                'type': 'array',
                'items': output,
                ...(desc.min ? { 'minItems': desc.min } : {}),
                ...(desc.max ? { 'maxItems': desc.max } : {})
            }
        }
        else if (desc.type === AJVNameInferType.MAP) {
            const pattern = desc.pattern ? desc.pattern : '.*'
            output = {
                'type': 'object',
                'patternProperties': {
                    [pattern]: output
                }
            }
        }

        return output
    }

    private buildRawObjectSchema<T>(schema: AJVSchema<T>) {
        const output: AJVSchema<T> = {}
        for (const [key, val] of Object.entries(schema)) {
            const desc = this.parseNameDesc(key)
            output[desc.name] = this.parseKeyValue(desc, val)
        }
        return output
    }

    private buildStringSchema(schema: string, output: Object) {
        const sepIndex = schema.indexOf('|')
        const mod = sepIndex >= 0 ? schema.substring(0, sepIndex) : schema

        if (AJVS_SUPPORT_SHORT_TYPES[mod]) {
            output['type'] = AjvsUtils.pushOrConvertToArray(output['type'], AJVS_SUPPORT_SHORT_TYPES[mod])
        }
        else if (AjvsUtils.eqOrHas(output['type'], 'string')) {
            if (minLenRegEx.test(mod)) {
                const matches = mod.match(minLenRegEx);
                const cmp = matches[1];
                const val = parseInt(matches[2]);
                const keyword = cmp == '>' ? 'minLength' : 'maxLength';
                output[keyword] = val;
            }
            else if (patternRegEx.test(mod)) {
                output['pattern'] = schema.substring(2);
                return output // pattern will match the rest of the string, no more recursion
            }
        }
        else if (AjvsUtils.eqOrHas(output['type'], 'number') || AjvsUtils.eqOrHas(output['type'], 'integer')) {
            if (limitRegEx.test(mod)) {
                const matches = mod.match(limitRegEx);
                const cmp = matches[1];
                const eq = matches[2] == '='
                const val = Number.isInteger(matches[3]) ? parseInt(matches[3]) : parseFloat(matches[3]);

                const keyword = cmp == '>' ? (eq ? 'minimum' : 'exclusiveMinimum') : (eq ? 'maximum' : 'exclusiveMaximum')
                output[keyword] = val;
            }
            else if (multipleOfRegEx.test(mod)) {
                const matches = mod.match(multipleOfRegEx);
                const val = Number.isInteger(matches[1]) ? parseInt(matches[1]) : parseFloat(matches[1]);
                output['multipleOf'] = val;
            }
        }
        else {
            throw new Error(`Unknown ajvs modifier (${mod})`)
        }

        return sepIndex >= 0 ? this.buildStringSchema(schema.substring(sepIndex + 1), output) : output
    }

    private buildObjectSchema(schema: Object) {
        const output: Object = {};
        let required: string[] = [];
        let additionalProperties = undefined;
        for (const key in schema) {
            const desc = this.parseNameDesc(key);
            const subSch = schema[key];

            if (desc.name === AJVSToken.ADDITIONAL_FIELDS) {
                additionalProperties = subSch;
                continue;
            }

            output[desc.name] = this.parseKeyValue(desc, subSch);

            if (desc.isRequired) {
                required.push(desc.name);
            }
        }

        return {
            type: 'object',
            properties: output,
            ...(required.length ? { required } : {}),
            ...(isUndefined(additionalProperties) ? {}: { additionalProperties: additionalProperties })
        };
    }
}