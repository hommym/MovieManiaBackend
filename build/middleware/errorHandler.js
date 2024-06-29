"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandeler = void 0;
const errorHandeler = (error, req, res, next) => {
    // console.log("Error Handler executed")
    if (req.statusCode === 200) {
        res.status(500);
    }
    res.json({ err: error.message });
};
exports.errorHandeler = errorHandeler;
