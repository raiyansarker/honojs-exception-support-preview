"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VBooleanArray = exports.VStringArray = exports.VNumberArray = exports.VBoolean = exports.VNumber = exports.VString = exports.VBase = exports.Validator = exports.VArray = exports.VObject = exports.VObjectBase = void 0;
const json_1 = require("../../utils/json");
const rule_1 = require("./rule");
const sanitizer_1 = require("./sanitizer");
class VObjectBase {
    constructor(container, key) {
        this.keys = [];
        this._isOptional = false;
        this.getValidators = () => {
            const validators = [];
            const thisKeys = [];
            Object.assign(thisKeys, this.keys);
            const walk = (container, keys, isOptional) => {
                for (const v of Object.values(container)) {
                    if (v instanceof VArray || v instanceof VObject) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        isOptional || (isOptional = v._isOptional);
                        keys.push(...v.keys);
                        walk(v.container, keys, isOptional);
                        const tmp = [];
                        Object.assign(tmp, thisKeys);
                        keys = tmp;
                    }
                    else if (v instanceof VBase) {
                        if (isOptional)
                            v.isOptional();
                        v.baseKeys.push(...keys);
                        validators.push(v);
                    }
                }
            };
            walk(this.container, this.keys, this._isOptional);
            return validators;
        };
        this.container = container;
        if (this instanceof VArray) {
            this.keys.push(key, '[*]');
        }
        else if (this instanceof VObject) {
            this.keys.push(key);
        }
    }
    isOptional() {
        this._isOptional = true;
        return this;
    }
}
exports.VObjectBase = VObjectBase;
class VObject extends VObjectBase {
    constructor(container, key) {
        super(container, key);
    }
}
exports.VObject = VObject;
class VArray extends VObjectBase {
    constructor(container, key) {
        super(container, key);
        this.type = 'array';
    }
}
exports.VArray = VArray;
class Validator {
    constructor() {
        this.isArray = false;
        this.isOptional = false;
        this.query = (key) => new VString({ target: 'query', key: key });
        this.header = (key) => new VString({ target: 'header', key: key });
        this.body = (key) => new VString({ target: 'body', key: key });
        this.json = (key) => {
            if (this.isArray) {
                return new VStringArray({ target: 'json', key: key });
            }
            else {
                return new VString({ target: 'json', key: key });
            }
        };
        this.array = (path, validator) => {
            this.isArray = true;
            const res = validator(this);
            const arr = new VArray(res, path);
            return arr;
        };
        this.object = (path, validator) => {
            const res = validator(this);
            const obj = new VObject(res, path);
            return obj;
        };
    }
}
exports.Validator = Validator;
class VBase {
    constructor(options) {
        this.baseKeys = [];
        this._nested = () => (this.baseKeys.length ? true : false);
        this.addRule = (rule) => {
            this.rules.push(rule);
            return this;
        };
        this.addSanitizer = (sanitizer) => {
            this.sanitizers.push(sanitizer);
            return this;
        };
        this.isRequired = () => {
            return this.addRule((value) => {
                if (value !== undefined && value !== null && value !== '')
                    return true;
                return false;
            });
        };
        this.isOptional = () => {
            this._optional = true;
            return this.addRule(() => true);
        };
        this.isEqual = (comparison) => {
            return this.addRule((value) => {
                return value === comparison;
            });
        };
        this.asNumber = () => {
            const newVNumber = new VNumber(this);
            return newVNumber;
        };
        this.asBoolean = () => {
            const newVBoolean = new VBoolean(this);
            return newVBoolean;
        };
        this.validate = async (req) => {
            const result = {
                isValid: true,
                message: undefined,
                target: this.target,
                key: this.key,
                value: undefined,
                jsonData: undefined,
            };
            let value = undefined;
            if (this.target === 'query') {
                value = req.query(this.key);
            }
            if (this.target === 'header') {
                value = req.header(this.key);
            }
            if (this.target === 'body') {
                const body = await req.parseBody();
                value = body[this.key];
            }
            if (this.target === 'json') {
                if (this._nested()) {
                    this.key = `${this.baseKeys.join('.')}.${this.key}`;
                }
                let obj = {};
                try {
                    obj = (await req.json());
                }
                catch (e) {
                    throw new Error('Malformed JSON in request body');
                }
                const dst = {};
                value = (0, json_1.JSONPathCopy)(obj, dst, this.key);
                if (this.isArray && !Array.isArray(value)) {
                    value = [value];
                }
                if (this._nested())
                    result.jsonData = dst;
            }
            result.value = value;
            if (this._nested() && this.target != 'json') {
                result.isValid = false;
            }
            else {
                result.isValid = this.validateValue(value);
            }
            if (result.isValid === false) {
                if (this._message) {
                    result.message = this._message;
                }
                else {
                    const valToStr = Array.isArray(value)
                        ? `[${value
                            .map((val) => val === undefined ? 'undefined' : typeof val === 'string' ? `"${val}"` : val)
                            .join(', ')}]`
                        : value;
                    switch (this.target) {
                        case 'query':
                            result.message = `Invalid Value: the query parameter "${this.key}" is invalid - ${valToStr}`;
                            break;
                        case 'header':
                            result.message = `Invalid Value: the request header "${this.key}" is invalid - ${valToStr}`;
                            break;
                        case 'body':
                            result.message = `Invalid Value: the request body "${this.key}" is invalid - ${valToStr}`;
                            break;
                        case 'json':
                            result.message = `Invalid Value: the JSON body "${this.key}" is invalid - ${valToStr}`;
                            break;
                    }
                }
            }
            return result;
        };
        this.validateValue = (value) => {
            // Check type
            if (this.isArray) {
                if (!Array.isArray(value)) {
                    return false;
                }
                for (const val of value) {
                    if (typeof val === 'undefined' && this._nested()) {
                        value.pop();
                    }
                    for (const val of value) {
                        if (typeof val !== this.type) {
                            // Value is of wrong type here
                            // If not optional, or optional and not undefined, return false
                            if (!this._optional || typeof val !== 'undefined')
                                return false;
                        }
                    }
                }
                // Sanitize
                for (const sanitizer of this.sanitizers) {
                    value = value.map((innerVal) => sanitizer(innerVal));
                }
                for (const rule of this.rules) {
                    for (const val of value) {
                        if (!rule(val)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            else {
                if (typeof value !== this.type) {
                    if (this._optional && typeof value === 'undefined') {
                        // Do nothing.
                        // The value is allowed to be `undefined` if it is `optional`
                    }
                    else {
                        return false;
                    }
                }
                // Sanitize
                for (const sanitizer of this.sanitizers) {
                    value = sanitizer(value);
                }
                for (const rule of this.rules) {
                    if (!rule(value)) {
                        return false;
                    }
                }
                return true;
            }
        };
        this.target = options.target;
        this.key = options.key;
        this.type = options.type || 'string';
        this.rules = [];
        this.sanitizers = [];
        this.isArray = options.isArray || false;
        this._optional = false;
    }
    message(value) {
        this._message = value;
        return this;
    }
}
exports.VBase = VBase;
class VString extends VBase {
    constructor(options) {
        super(options);
        this.asArray = () => {
            return new VStringArray(this);
        };
        this.isEmpty = (options = { ignore_whitespace: false }) => {
            return this.addRule((value) => rule_1.rule.isEmpty(value, options));
        };
        this.isLength = (options, arg2) => {
            return this.addRule((value) => rule_1.rule.isLength(value, options, arg2));
        };
        this.isAlpha = () => {
            return this.addRule((value) => rule_1.rule.isAlpha(value));
        };
        this.isNumeric = () => {
            return this.addRule((value) => rule_1.rule.isNumeric(value));
        };
        this.contains = (elem, options = {
            ignoreCase: false,
            minOccurrences: 1,
        }) => {
            return this.addRule((value) => rule_1.rule.contains(value, elem, options));
        };
        this.isIn = (options) => {
            return this.addRule((value) => rule_1.rule.isIn(value, options));
        };
        this.match = (regExp) => {
            return this.addRule((value) => rule_1.rule.match(value, regExp));
        };
        this.trim = () => {
            return this.addSanitizer((value) => sanitizer_1.sanitizer.trim(value));
        };
        this.type = 'string';
    }
}
exports.VString = VString;
class VNumber extends VBase {
    constructor(options) {
        super(options);
        this.asArray = () => {
            return new VNumberArray(this);
        };
        this.isGte = (min) => {
            return this.addRule((value) => rule_1.rule.isGte(value, min));
        };
        this.isLte = (min) => {
            return this.addRule((value) => rule_1.rule.isLte(value, min));
        };
        this.type = 'number';
    }
}
exports.VNumber = VNumber;
class VBoolean extends VBase {
    constructor(options) {
        super(options);
        this.asArray = () => {
            return new VBooleanArray(this);
        };
        this.isTrue = () => {
            return this.addRule((value) => rule_1.rule.isTrue(value));
        };
        this.isFalse = () => {
            return this.addRule((value) => rule_1.rule.isFalse(value));
        };
        this.type = 'boolean';
    }
}
exports.VBoolean = VBoolean;
class VNumberArray extends VNumber {
    constructor(options) {
        super(options);
        this.isArray = true;
    }
}
exports.VNumberArray = VNumberArray;
class VStringArray extends VString {
    constructor(options) {
        super(options);
        this.isArray = true;
    }
}
exports.VStringArray = VStringArray;
class VBooleanArray extends VBoolean {
    constructor(options) {
        super(options);
        this.isArray = true;
    }
}
exports.VBooleanArray = VBooleanArray;
