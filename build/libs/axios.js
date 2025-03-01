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
exports.getDataFromTMDB = exports.PageGetter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const tough_cookie_1 = __importDefault(require("tough-cookie"));
const axios_cookiejar_support_1 = require("axios-cookiejar-support");
const qs_1 = __importDefault(require("qs"));
const errorHandler_1 = require("../middleware/errorHandler");
class PageGetter {
    constructor() {
        this.getPage = (pageUrl) => __awaiter(this, void 0, void 0, function* () {
            // this fuction gets the page of the url provided and returns it
            const response = yield this.axiosObject.get(pageUrl);
            return response.data;
        });
        this.getPagePostReq = (pageUrl_1, moviename_1, year_1, ...args_1) => __awaiter(this, [pageUrl_1, moviename_1, year_1, ...args_1], void 0, function* (pageUrl, moviename, year, genre = "") {
            const data = qs_1.default.stringify({
                year,
                year2: year,
                moviename,
                submit: "submit",
                category: "Hollywood",
                genre,
            });
            const response = yield this.axiosObject.post(pageUrl, data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            return response.data;
        });
        // Create a new cookie jar
        const cookieJar = new tough_cookie_1.default.CookieJar();
        this.axiosObject = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar: cookieJar }));
    }
}
exports.PageGetter = PageGetter;
const getDataFromTMDB = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)({ url: url, headers: { Authorization: `Bearer ${process.env.TmdbApiKey}` } });
        return response.data;
    }
    catch (error) {
        throw new errorHandler_1.AppError("Resource Not Found", 404);
    }
});
exports.getDataFromTMDB = getDataFromTMDB;
