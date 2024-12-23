"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveStream = exports.event = void 0;
const events_1 = __importDefault(require("events"));
const live_1 = require("../customDataTypesAndInterfaces/live");
exports.event = new events_1.default();
exports.liveStream = new live_1.LiveStream();
