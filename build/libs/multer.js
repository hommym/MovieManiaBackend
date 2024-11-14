"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileFromRequest = void 0;
const multer_1 = __importDefault(require("multer"));
const getFileFromRequest = (fieldName) => {
    return (0, multer_1.default)().single(fieldName);
};
exports.getFileFromRequest = getFileFromRequest;
