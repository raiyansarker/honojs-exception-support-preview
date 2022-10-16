"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorMiddleware = void 0;
const http_status_1 = require("../../utils/http-status");
const object_1 = require("../../utils/object");
const validator_1 = require("./validator");
const validatorMiddleware = (validationFunction, options) => {
    const v = new validator_1.Validator();
    const handler = async (c, next) => {
        const resultSet = {
            hasError: false,
            messages: [],
            results: [],
        };
        const schema = validationFunction(v, c);
        const validatorList = getValidatorList(schema);
        let data = {};
        for (const [keys, validator] of validatorList) {
            let result;
            try {
                result = await validator.validate(c.req);
            }
            catch (e) {
                // Invalid JSON request
                return c.text((0, http_status_1.getStatusText)(400), 400);
            }
            if (result.isValid) {
                // Set data on request object
                if (result.jsonData) {
                    const dst = data;
                    data = (0, object_1.mergeObjects)(dst, result.jsonData);
                }
                else {
                    c.req.valid(keys, result.value);
                }
            }
            else {
                resultSet.hasError = true;
                if (result.message !== undefined) {
                    resultSet.messages.push(result.message);
                }
            }
            resultSet.results.push(result);
        }
        if (!resultSet.hasError) {
            Object.keys(data).map((key) => {
                c.req.valid(key, data[key]);
            });
        }
        if (options && options.done) {
            const res = options.done(resultSet, c);
            if (res) {
                return res;
            }
        }
        if (resultSet.hasError) {
            return c.text(resultSet.messages.join('\n'), 400);
        }
        await next();
    };
    return handler;
};
exports.validatorMiddleware = validatorMiddleware;
function getValidatorList(schema) {
    const map = [];
    for (const [key, value] of Object.entries(schema)) {
        if (value instanceof validator_1.VObjectBase) {
            const validators = value.getValidators();
            for (const validator of validators) {
                map.push([value.keys, validator]);
            }
        }
        else if (value instanceof validator_1.VBase) {
            map.push([[key], value]);
        }
        else {
            const children = getValidatorList(value);
            for (const [keys, validator] of children) {
                map.push([[key, ...keys], validator]);
            }
        }
    }
    return map;
}
