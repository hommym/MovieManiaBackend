"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveRouter = void 0;
const express_1 = require("express");
const liveController_1 = require("./liveController");
const multer_1 = require("../../libs/multer");
exports.liveRouter = (0, express_1.Router)();
exports.liveRouter.post("/schedule", liveController_1.beginStreamController);
exports.liveRouter.post("/upload", (0, multer_1.getFileFromRequest)("newUpload"), liveController_1.uploadController);
exports.liveRouter.get("/playlist", liveController_1.getPlaylistController);
exports.liveRouter.get("/file/:fileName", liveController_1.getFileController);