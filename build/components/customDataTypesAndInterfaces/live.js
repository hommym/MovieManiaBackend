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
exports.LiveStream = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const liveSchema_1 = require("../../schemas/liveSchema");
const path_2 = require("../helperMethods/path");
class LiveStream {
    constructor() {
        this.url = "";
        this.id = "";
        this.streamingProcess = null;
        this.path = (0, path_1.join)(__dirname, "..", "..", `/routes/live/live.data/playlist.m3u8`);
    }
    delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(resolve, ms));
        });
    }
    initialise(url, id) {
        this.url = url;
        this.id = id;
        this.streamingProcess = (0, fluent_ffmpeg_1.default)(this.url)
            .inputOptions(["-re"])
            .outputOptions([
            "-start_number 0", // Start numbering segments at 0
            "-hls_time 8", // Each segment is 10 seconds
            "-hls_list_size 5", // No limit on playlist size (for VOD)
            `-hls_segment_filename ${(0, path_1.join)(__dirname, "..", "..", `/routes/live/live.data`)}/%03d.ts`, // Naming for segment files
            "-hls_flags delete_segments",
        ]);
        return this;
    }
    deleteStreamFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const folderPath = (0, path_1.join)(__dirname, "..", "..", `/routes/live/live.data`);
                const files = yield (0, promises_1.readdir)(folderPath);
                for (const file of files) {
                    const filePath = (0, path_1.join)(folderPath, file);
                    yield (0, promises_1.unlink)(filePath);
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    setupStreamListners() {
        this.streamingProcess
            .on("end", () => __awaiter(this, void 0, void 0, function* () {
            yield liveSchema_1.LiveSchema.deleteOne({ _id: this.id });
            yield this.deleteStreamFiles();
            const liveDataInDatabase = yield liveSchema_1.LiveSchema.find({});
            if (liveDataInDatabase.length !== 0) {
                const { url, _id } = liveDataInDatabase[0];
                this.initialise(url, _id).setupStreamListners().startStream();
            }
            else {
                this.url = "";
            }
        }))
            .on("start", (commadline) => __awaiter(this, void 0, void 0, function* () {
            console.log(commadline);
        }))
            .on("error", (err) => __awaiter(this, void 0, void 0, function* () {
            yield this.deleteStreamFiles();
            // await LiveSchema.deleteOne({ _id: this.id });
            // const liveDataInDatabase = await LiveSchema.find({});
            // if (liveDataInDatabase.length !== 0) {
            //   const { url, _id } = liveDataInDatabase[0] as Live;
            //   this.url = url;
            //   this.id = _id;
            //   this.startStream();
            // } else {
            //   this.url = "";
            // }
        }));
        return this;
    }
    startStream() {
        if (this.url !== "") {
            this.streamingProcess.save(this.path);
        }
    }
    stopStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield (0, path_2.checkPathExists)(this.path)) {
                try {
                    this.url = "";
                    this.streamingProcess.kill("SIGINT");
                    yield this.delay(20000);
                    yield this.deleteStreamFiles();
                    // await LiveSchema.deleteOne({ _id: this.id });
                }
                catch (error) {
                    console.log(error);
                }
                return true;
            }
            else {
                return false;
            }
        });
    }
}
exports.LiveStream = LiveStream;
