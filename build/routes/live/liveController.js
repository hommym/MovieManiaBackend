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
exports.getNewsController = exports.addNewsController = exports.stopSteamController = exports.uploadController = exports.getUploadedFilesController = exports.getFileController = exports.getPlaylistController = exports.deletePlaylistController = exports.addToPlaylistController = exports.beginStreamController = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const objects_1 = require("../../components/constants/objects");
const path_1 = require("path");
const path_2 = require("../../components/helperMethods/path");
const randomData_1 = require("../../components/helperMethods/randomData");
const liveSchema_1 = require("../../schemas/liveSchema");
exports.beginStreamController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playListData = yield liveSchema_1.LiveSchema.find({});
    if ((yield (0, path_2.checkPathExists)((0, path_1.join)(__dirname, `/live.data/playlist.m3u8`))) || objects_1.liveStream.url !== "") {
        res.status(409).json({ message: "A Video is Already been streamed" });
        return;
    }
    else if (playListData.length === 0) {
        res.status(404).json({ message: "No Item in playlist to start stream" });
        return;
    }
    const { url, _id } = playListData[0];
    objects_1.liveStream.initialise(url, _id).setupStreamListners().startStream();
    res.status(200).json({ message: "Stream has started" });
}));
exports.addToPlaylistController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.status(400).json({ message: "No body present" });
        return;
    }
    // add body validator
    res.status(201).json(yield liveSchema_1.LiveSchema.create(req.body));
}));
exports.deletePlaylistController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.params;
    yield liveSchema_1.LiveSchema.deleteOne({ title });
    res.status(204).end();
}));
exports.getPlaylistController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(yield liveSchema_1.LiveSchema.find({}));
}));
exports.getFileController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName } = req.params;
    // console.log(`fileName=${fileName}`);
    const path = (0, path_1.join)(__dirname, `/live.data/${fileName}`);
    if (yield (0, path_2.checkPathExists)(path)) {
        res.setHeader("Accept-Ranges", "bytes");
        res.sendFile(path, (err) => {
            if (err)
                console.log(`File Transfer Error:${err}`);
        });
    }
    else {
        // console.log("Playlist Path does not exist");
        res.status(404).end();
    }
}));
exports.getUploadedFilesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName } = req.params;
    // console.log(`fileName=${fileName}`);
    const path = (0, path_1.join)(__dirname, `/uploads/${fileName}`);
    if (yield (0, path_2.checkPathExists)(path)) {
        res.setHeader("Accept-Ranges", "bytes");
        res.sendFile(path, (err) => {
            if (err)
                console.log(`File Transfer Error:${err}`);
        });
    }
    else {
        // console.log("Playlist Path does not exist");
        res.status(404).end();
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
        let path = (0, path_1.join)(__dirname, `/uploads/${fileName}${videoMimeTypeMap[file.mimetype]}`);
        while (true) {
            if (!(yield (0, path_2.checkPathExists)(path))) {
                break;
            }
            fileName = new randomData_1.RandomData().getRandomString(10);
            path = (0, path_1.join)(__dirname, `/uploads/${fileName}${videoMimeTypeMap[file.mimetype]}`);
        }
        objects_1.event.emit("saveFile", file.buffer, path);
        res.status(200).json({ urlVideo: `${process.env.BaseUrl}/api/live/uploads/${fileName}${videoMimeTypeMap[file.mimetype]}` });
    }
}));
exports.stopSteamController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Stopping Streaming");
    if (yield objects_1.liveStream.stopStream())
        res.status(200).json({ message: "Stream Stopped" });
    else {
        res.status(404).json({ message: "No Stream Avialable to Stop" });
    }
}));
exports.addNewsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { news } = req.body;
    if (!news)
        res.status(400).json({ message: "No data passed for news" });
    else {
        objects_1.liveStream.newsData[0] = news;
        res.status(200).json({ message: "News Updated Sucessfully" });
    }
}));
exports.getNewsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ news: objects_1.liveStream.newsData[0] });
}));
