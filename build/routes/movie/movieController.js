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
exports.movieDetailsController = exports.movieCategoryController = exports.urlController = void 0;
const axios_1 = require("../../libs/axios");
const jsdom_1 = require("../../libs/jsdom");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const fetchData_1 = require("../../components/fetchData");
const pageGetter = new axios_1.PageGetter();
function replaceSpecialCharacters(input) {
    // Replace '&' with 'and'
    let result = input.replace(/&/g, "and");
    // Remove accents from letters
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return result;
}
function areWordsInOrder(s1, s2) {
    // Helper function to remove punctuation and split into words
    function cleanAndSplit(str) {
        return str
            .replace(/[^\w\s]/g, "") // Remove all non-alphanumeric and non-space characters
            .split(/\s+/); // Split into words
    }
    const words1 = cleanAndSplit(s1);
    const words2 = cleanAndSplit(s2);
    let i = 0; // Pointer for words1
    let extraWords = 0; // Counter for extra words in words2
    for (let j = 0; j < words2.length; j++) {
        if (words2[j] === words1[i]) {
            i++; // Move to the next word in words1
            extraWords = 0; // Reset extra word counter
        }
        else {
            extraWords++; // Increment extra word counter
            if (extraWords > 2) {
                return false; // Too many extra words
            }
        }
        if (i === words1.length) {
            return true; // All words in words1 found in order
        }
    }
    return false; // Not all words found in order
}
const getDownloadLink = (secondPagelink) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let nextPageLink = secondPagelink;
    const secondPage = yield pageGetter.getPage(nextPageLink);
    // console.log("Page available");
    //    getting the document object form html text
    let htmlDocumentObject = (0, jsdom_1.getDocumentObject)(secondPage);
    // console.log("Searching for divs with class called downloadlinks.....");
    const downloadPageElement = htmlDocumentObject.querySelector(".moviedesc1");
    // console.log(downloadPageElement);
    nextPageLink = `https://www.fzmovies.net/${(downloadPageElement === null || downloadPageElement === void 0 ? void 0 : downloadPageElement.querySelector("#downloadlink")).href}`;
    // moving to downloadPage
    // console.log("Getting download page....");
    const downloadPage = yield pageGetter.getPage(nextPageLink);
    // console.log("Page available");
    //    getting the document object form html text
    htmlDocumentObject = (0, jsdom_1.getDocumentObject)(downloadPage);
    let downloadLink = "";
    // console.log("Searching for input tags on the page.....");
    const inputTags = (_a = htmlDocumentObject.querySelector(".moviedesc")) === null || _a === void 0 ? void 0 : _a.querySelectorAll("input");
    if (inputTags) {
        for (let inputTag of inputTags) {
            // console.log("An input tag found");
            // console.log("Checking if input tag contains download link....");
            if (inputTag.name === "download1" || inputTag.name === "download2" || inputTag.name === "download3") {
                // console.log("Download link found");
                downloadLink = inputTag.value;
                break;
            }
        }
    }
    return downloadLink;
});
const getSecondPagelink = (moviePageLink) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Getting movie page....");
    const moviePage = yield pageGetter.getPage(moviePageLink);
    // console.log("Page available");
    //    getting the document object form html text
    let htmlDocumentObject = (0, jsdom_1.getDocumentObject)(moviePage);
    // looking for a tag that contains the link to next page
    let nextPageLink = "";
    // console.log("Searching for divs with class called moviesfiles.....");
    for (let divElement of htmlDocumentObject.querySelectorAll(".moviesfiles")) {
        // console.log("A div has been found");
        // console.log("Searching for link to next page...");
        const linkTag = (_b = (_a = divElement.querySelector("li")) === null || _a === void 0 ? void 0 : _a.querySelector("a")) === null || _b === void 0 ? void 0 : _b.href;
        if (linkTag) {
            nextPageLink = `https://www.fzmovies.net/${linkTag}`;
            // console.log(`The link found = https://www.fzmovies.net/${linkTag}`);
        }
        // the break statement below is just temporary
        break;
    }
    return nextPageLink;
});
const searchMovie = (title_1, year_1, ...args_1) => __awaiter(void 0, [title_1, year_1, ...args_1], void 0, function* (title, year, genre = "") {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let urlNextPage = "";
    console.log("Getting search page....");
    // console.log("Title= ", title);
    const moviePage = yield pageGetter.getPagePostReq("https://www.fzmovies.net/advancedsearch.php", title, year, genre);
    // console.log("Page available");
    //    getting the document object form html text
    let htmlDocumentObject = (0, jsdom_1.getDocumentObject)(moviePage);
    // console.log("Searching for divs with class called mainbox.....");
    for (let divElement of htmlDocumentObject.querySelectorAll(".mainbox")) {
        // console.log("A div has been found");
        // console.log("Searching for link to next page...");
        const titleOnSite = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = divElement
            .querySelector("table")) === null || _a === void 0 ? void 0 : _a.querySelector("tbody")) === null || _b === void 0 ? void 0 : _b.querySelector("tr")) === null || _c === void 0 ? void 0 : _c.querySelectorAll("td")[1]) === null || _d === void 0 ? void 0 : _d.querySelector("span")) === null || _e === void 0 ? void 0 : _e.querySelector("a")) === null || _f === void 0 ? void 0 : _f.querySelector("small")) === null || _g === void 0 ? void 0 : _g.querySelector("b")) === null || _h === void 0 ? void 0 : _h.textContent;
        if (areWordsInOrder(title, titleOnSite)) {
            urlNextPage = `https://www.fzmovies.net/movie-${titleOnSite}--hmp4.htm`;
            break;
        }
    }
    return urlNextPage;
});
const urlController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, year, genre } = req.query;
        if (!title || !year) {
            res.status(400);
            throw new Error("No data pass for the query param title or year");
        }
        // perform a search
        let urlOfMoviePage = yield searchMovie(title.replace(/[^\w\s]/g, ""), year, genre);
        // console.log(urlOfMoviePage);
        if (urlOfMoviePage === "") {
            urlOfMoviePage = `https://www.fzmovies.net/movie-${replaceSpecialCharacters(title.replace(/[^\w\s]/g, ""))}--hmp4.htm`;
            const nextPageLink = yield getSecondPagelink(urlOfMoviePage);
            if (nextPageLink !== "") {
                const downloadLink = yield getDownloadLink(nextPageLink);
                return res.status(200).json({ downloadLink });
            }
            return res.status(404).json({ error: `The movie ${title} is not yet avialable, please try again later` });
        }
        const downloadLink = yield getDownloadLink(yield getSecondPagelink(urlOfMoviePage));
        res.status(200).json({ downloadLink });
    }
    catch (error) {
        console.log(`An error occurred ${error}`);
        if (res.statusCode == 200) {
            res.status(500);
        }
        res.json({ error });
    }
});
exports.urlController = urlController;
exports.movieCategoryController = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, fetchData_1.fetchData)("movie", req, res);
}));
const movieDetailsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, fetchData_1.getContentDetails)("movie", req, res);
});
exports.movieDetailsController = movieDetailsController;
