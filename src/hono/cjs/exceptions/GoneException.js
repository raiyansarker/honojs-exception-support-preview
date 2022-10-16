"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoneException = void 0;
const http_status_1 = require("../utils/http-status");
const Exception_1 = require("./Exception");
class GoneException extends Exception_1.Exception {
    constructor(message) {
        super(message || (0, http_status_1.getStatusText)(410), 410);
    }
}
exports.GoneException = GoneException;
