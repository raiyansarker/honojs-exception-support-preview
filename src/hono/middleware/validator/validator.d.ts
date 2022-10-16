import type { JSONObject, JSONPrimitive, JSONArray } from '../../utils/json';
import type { Schema } from './middleware';
declare type Target = 'query' | 'header' | 'body' | 'json';
declare type Type = JSONPrimitive | JSONObject | JSONArray | File;
declare type Rule = (value: Type) => boolean;
declare type Sanitizer = (value: Type) => Type;
export declare abstract class VObjectBase<T extends Schema> {
    container: T;
    keys: string[];
    protected _isOptional: boolean;
    constructor(container: T, key: string);
    isOptional(): this;
    getValidators: () => VBase[];
}
export declare class VObject<T extends Schema> extends VObjectBase<T> {
    constructor(container: T, key: string);
}
export declare class VArray<T extends Schema> extends VObjectBase<T> {
    type: 'array';
    constructor(container: T, key: string);
}
export declare class Validator {
    isArray: boolean;
    isOptional: boolean;
    query: (key: string) => VString;
    header: (key: string) => VString;
    body: (key: string) => VString;
    json: (key: string) => VString;
    array: <T extends Schema>(path: string, validator: (v: Validator) => T) => VArray<T>;
    object: <T extends Schema>(path: string, validator: (v: Validator) => T) => VObject<T>;
}
export declare type ValidateResult = {
    isValid: boolean;
    message: string | undefined;
    target: Target;
    key: string;
    value: Type;
    jsonData: JSONObject | undefined;
};
declare type VOptions = {
    target: Target;
    key: string;
    type?: 'string' | 'number' | 'boolean' | 'object';
    isArray?: boolean;
};
export declare abstract class VBase {
    type: 'string' | 'number' | 'boolean' | 'object';
    target: Target;
    baseKeys: string[];
    key: string;
    rules: Rule[];
    sanitizers: Sanitizer[];
    isArray: boolean;
    private _message;
    private _optional;
    constructor(options: VOptions);
    private _nested;
    addRule: (rule: Rule) => this;
    addSanitizer: (sanitizer: Sanitizer) => this;
    isRequired: () => this;
    isOptional: () => this;
    isEqual: (comparison: unknown) => this;
    asNumber: () => VNumber;
    asBoolean: () => VBoolean;
    message(value: string): this;
    validate: (req: Request) => Promise<ValidateResult>;
    private validateValue;
}
export declare class VString extends VBase {
    constructor(options: VOptions);
    asArray: () => VStringArray;
    isEmpty: (options?: {
        ignore_whitespace: boolean;
    }) => this;
    isLength: (options: Partial<{
        min: number;
        max: number;
    }> | number, arg2?: number) => this;
    isAlpha: () => this;
    isNumeric: () => this;
    contains: (elem: string, options?: Partial<{
        ignoreCase: boolean;
        minOccurrences: number;
    }>) => this;
    isIn: (options: string[]) => this;
    match: (regExp: RegExp) => this;
    trim: () => this;
}
export declare class VNumber extends VBase {
    constructor(options: VOptions);
    asArray: () => VNumberArray;
    isGte: (min: number) => this;
    isLte: (min: number) => this;
}
export declare class VBoolean extends VBase {
    constructor(options: VOptions);
    asArray: () => VBooleanArray;
    isTrue: () => this;
    isFalse: () => this;
}
export declare class VNumberArray extends VNumber {
    isArray: true;
    constructor(options: VOptions);
}
export declare class VStringArray extends VString {
    isArray: true;
    constructor(options: VOptions);
}
export declare class VBooleanArray extends VBoolean {
    isArray: true;
    constructor(options: VOptions);
}
export {};
