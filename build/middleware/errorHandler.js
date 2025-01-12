"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandeler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const errorHandeler = (error, req, res, next) => {
    // console.log("Error Handler executed")
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
    }
    else {
        res.status(500);
    }
    console.log(error);
    res.json({ err: error.message });
};
exports.errorHandeler = errorHandeler;
