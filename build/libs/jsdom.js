"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentObject = void 0;
const jsdom_1 = __importDefault(require("jsdom"));
const getDocumentObject = (htmlData) => {
    const { window } = new jsdom_1.default.JSDOM(htmlData);
    return window.document;
};
exports.getDocumentObject = getDocumentObject;
