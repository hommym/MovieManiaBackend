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
exports.stopLive = exports.ScheduleLiveListener = exports.setUpFfmpeg = void 0;
const liveSchema_1 = require("../../schemas/liveSchema");
const objects_1 = require("../constants/objects");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = require("fs/promises");
const path_1 = require("../../components/helperMethods/path");
const path_2 = require("path");
let streamingProcess;
let isFfmpegListenersSet = false;
const path = (0, path_2.join)(__dirname, "..", "..", `/routes/live/live.data/playlist.m3u8`);
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const setUpFfmpeg = (url) => {
    return (0, fluent_ffmpeg_1.default)(url)
        .inputOptions(["-re"])
        .outputOptions([
        "-start_number 0", // Start numbering segments at 0
        "-hls_time 8", // Each segment is 10 seconds
        "-hls_list_size 5", // No limit on playlist size (for VOD)
        `-hls_segment_filename ${(0, path_2.join)(__dirname, "..", "..", `/routes/live/live.data`)}/%03d.ts`, // Naming for segment files
        "-hls_flags delete_segments",
    ]);
};
exports.setUpFfmpeg = setUpFfmpeg;
const deleteStreamFile = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folderPath = (0, path_2.join)(__dirname, "..", "..", `/routes/live/live.data`);
        const files = yield (0, promises_1.readdir)(folderPath);
        for (const file of files) {
            const filePath = (0, path_2.join)(folderPath, file);
            yield (0, promises_1.unlink)(filePath);
        }
    }
    catch (error) {
        console.log(error);
    }
});
const ScheduleLiveListener = () => __awaiter(void 0, void 0, void 0, function* () {
    objects_1.event.on("scheduleLive", (liveData) => __awaiter(void 0, void 0, void 0, function* () {
        const { url, _id } = liveData;
        streamingProcess = (0, exports.setUpFfmpeg)(url);
        streamingProcess
            .on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            yield liveSchema_1.LiveSchema.deleteOne({ _id });
            yield deleteStreamFile();
            const liveDataInDatabase = yield liveSchema_1.LiveSchema.find({});
            if (liveDataInDatabase.length !== 0) {
                objects_1.event.emit("scheduleLive", liveDataInDatabase[0]);
            }
            else {
                isFfmpegListenersSet = false;
                streamingProcess = undefined;
            }
        }))
            .on("start", (commadline) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(commadline);
        }))
            .on("error", (err) => __awaiter(void 0, void 0, void 0, function* () {
            yield deleteStreamFile();
            yield liveSchema_1.LiveSchema.deleteMany({});
            const liveDataInDatabase = yield liveSchema_1.LiveSchema.find({});
            //  isFfmpegListenersSet = false;
            streamingProcess = undefined;
            // if (liveDataInDatabase.length !== 0) {
            //   event.emit("scheduleLive", liveDataInDatabase[0]);
            // } else {
            // }
        }));
        // if (!isFfmpegListenersSet) {
        //   isFfmpegListenersSet = true;
        // }
        streamingProcess.save(path);
    }));
});
exports.ScheduleLiveListener = ScheduleLiveListener;
const stopLive = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield (0, path_1.checkPathExists)(path)) {
        try {
            yield liveSchema_1.LiveSchema.deleteOne({});
            streamingProcess.kill("SIGINT");
            yield delay(10000);
            yield deleteStreamFile();
        }
        catch (error) {
            console.log(error);
        }
        res.status(200).json({ message: "Stream Has been stopped" });
    }
    else {
        res.status(404).json({ message: "No Stream Avialable" });
    }
});
exports.stopLive = stopLive;
