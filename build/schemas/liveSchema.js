"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// the userSchema
const liveSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    posterUrl: {
        type: String,
        require: false
    },
});
exports.LiveSchema = mongoose_1.default.model("Live", liveSchema);
