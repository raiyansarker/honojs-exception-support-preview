"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = void 0;
const http_status_1 = require("../utils/http-status");
const Exception_1 = require("./Exception");
class BadRequestException extends Exception_1.Exception {
    constructor(message) {
        super(message || (0, http_status_1.getStatusText)(400), 400);
    }
}
exports.BadRequestException = BadRequestException;
