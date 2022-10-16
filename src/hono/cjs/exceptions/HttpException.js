"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
const Exception_1 = require("./Exception");
class HttpException extends Exception_1.Exception {
    constructor(message, status) {
        super(message, status);
    }
}
exports.HttpException = HttpException;
