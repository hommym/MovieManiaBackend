"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.getFileController = exports.getPlaylistController = exports.beginStreamController = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const objects_1 = require("../../components/constants/objects");
const path_1 = require("path");
const path_2 = require("../../components/helperMethods/path");
const randomData_1 = require("../../components/helperMethods/randomData");
const axios_1 = __importDefault(require("axios"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
exports.beginStreamController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { videoUrl } = req.body;
    const path = (0, path_1.join)(__dirname, `/live.data/playlist.m3u8`);
    if (!videoUrl)
        res.status(400).json({ error: "No data passed for videoUrl" });
    // Start downloading and processing video
    const response = yield axios_1.default.get(videoUrl, { responseType: "stream" });
    console.log("Breaking up data..");
    (0, fluent_ffmpeg_1.default)(response.data)
        .outputOptions([
        "-start_number 0", // Start numbering segments at 0
        "-hls_time 10", // Each segment is 10 seconds
        "-hls_list_size 0", // No limit on playlist size (for VOD)
        `-hls_segment_filename ${(0, path_1.join)(__dirname, `/live.data`)}/%03d.ts`, // Naming for segment files
    ])
        .on("end", () => {
        console.log("HLS segments and playlist created");
    })
        .on("start", (commadline) => {
        console.log("ffmpeg has started processing the video..");
        res.status(200).json({ message: "Stream has started" });
    })
        .on("error", (err) => {
        console.error("Error during processing:", err.message);
    })
        .save(path);
}));
exports.getPlaylistController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const path = (0, path_1.join)(__dirname, `/live.data/playlist.m3u8`);
    if (yield (0, path_2.checkPathExists)(path)) {
        res.sendFile(path, (err) => {
            if (err)
                console.log(`File Transfer Error:${err}`);
        });
    }
    else {
        console.log("Playlist Path does not exist");
        res.end();
    }
}));
exports.getFileController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName } = req.params;
    console.log(`fileName=${fileName}`);
    const path = (0, path_1.join)(__dirname, `/live.data/${fileName}`);
    if (yield (0, path_2.checkPathExists)(path)) {
        res.sendFile(path, (err) => {
            if (err)
                console.log(`File Transfer Error:${err}`);
        });
    }
    else {
        console.log("Playlist Path does not exist");
        res.end();
    }
}));
exports.uploadController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const allowedVideoMimeTypes = ["video/mp4", "video/mpeg", "video/3gpp", "video/x-matroska"];
    const videoMimeTypeMap = {
        "video/mp4": ".mp4",
        "video/mpeg": ".mpeg",
        "video/3gpp": ".3gp",
        "video/x-matroska": ".mkv",
    };
    if (!file || !allowedVideoMimeTypes.includes(file.mimetype))
        res.status(400).json({ message: "No file provided or file type not supported" });
    else {
        let fileName = new randomData_1.RandomData().getRandomString(10);
        let path = (0, path_1.join)(__dirname, `/live.data/${fileName}${videoMimeTypeMap[file.mimetype]}`);
        while (true) {
            if (!(yield (0, path_2.checkPathExists)(path))) {
                break;
            }
            fileName = new randomData_1.RandomData().getRandomString(10);
            path = (0, path_1.join)(__dirname, `/live.data/${fileName}${videoMimeTypeMap[file.mimetype]}`);
        }
        objects_1.event.emit("saveFile", file.buffer, path);
        res.status(200).json({ urlVideo: `${process.env.BaseUrl}/api/live/file/${fileName}${videoMimeTypeMap[file.mimetype]}` });
    }
}));
