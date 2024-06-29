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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMoviesController = exports.relatedMoviesController = exports.movieDetailsController = exports.recentMoviesController = exports.popularMoviesController = exports.trendingMoviesController = exports.urlController = void 0;
const axios_1 = require("../../libs/axios");
const jsdom_1 = require("../../libs/jsdom");
const urlController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!req.query.title) {
            res.status(400);
            throw new Error("No data pass for the query param title");
        }
        const title = req.query.title;
        // creating url of movie page we will be visiting
        console.log("Creating movie page url....");
        let urlOfMoviePage = "https://www.fzmovies.net/movie-";
        const componentsOfTitle = title.split(" ");
        for (let partOfTitle of componentsOfTitle) {
            if (componentsOfTitle.length - 1 === componentsOfTitle.indexOf(partOfTitle)) {
                urlOfMoviePage = urlOfMoviePage + partOfTitle + "--hmp4.htm";
            }
            urlOfMoviePage = urlOfMoviePage + partOfTitle + "%20";
        }
        console.log("Url created");
        // creating PageGetter object
        const pageGetter = new axios_1.PageGetter();
        // getting the movie page(which is in html form)
        console.log("Getting movie page....");
        const moviePage = yield pageGetter.getPage(urlOfMoviePage);
        console.log("Page available");
        //    getting the document object form html text
        let htmlDocumentObject = (0, jsdom_1.getDocumentObject)(moviePage);
        // looking for a tag that contains the link to next page
        let nextPageLink = "";
        console.log("Searching for divs with class called moviesfiles.....");
        for (let divElement of htmlDocumentObject.querySelectorAll(".moviesfiles")) {
            console.log("A div has been found");
            console.log("Searching for link to next page...");
            const linkTag = (_b = (_a = divElement.querySelector("li")) === null || _a === void 0 ? void 0 : _a.querySelector("a")) === null || _b === void 0 ? void 0 : _b.href;
            if (linkTag) {
                nextPageLink = `https://www.fzmovies.net/${linkTag}`;
                console.log(`The link found = https://www.fzmovies.net/${linkTag}`);
            }
            // the break statement below is just temporary
            break;
        }
        // moving to nextPage
        console.log("Getting second page....");
        const secondPage = yield pageGetter.getPage(nextPageLink);
        console.log("Page available");
        //    getting the document object form html text
        htmlDocumentObject = (0, jsdom_1.getDocumentObject)(secondPage);
        console.log("Searching for divs with class called downloadlinks.....");
        const downloadPageElement = htmlDocumentObject.querySelector(".moviedesc1");
        console.log(downloadPageElement);
        nextPageLink = `https://www.fzmovies.net/${(downloadPageElement === null || downloadPageElement === void 0 ? void 0 : downloadPageElement.querySelector("#downloadlink")).href}`;
        // moving to downloadPage
        console.log("Getting download page....");
        const downloadPage = yield pageGetter.getPage(nextPageLink);
        console.log("Page available");
        //    getting the document object form html text
        htmlDocumentObject = (0, jsdom_1.getDocumentObject)(downloadPage);
        let downloadLink = "";
        console.log("Searching for input tags on the page.....");
        const inputTags = (_c = htmlDocumentObject.querySelector(".moviedesc")) === null || _c === void 0 ? void 0 : _c.querySelectorAll("input");
        if (inputTags) {
            for (let inputTag of inputTags) {
                console.log("An input tag found");
                console.log("Checking if input tag contains download link....");
                if (inputTag.name === "download1" || inputTag.name === "download2" || inputTag.name === "download3") {
                    console.log("Download link found");
                    downloadLink = inputTag.value;
                    break;
                }
            }
        }
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
const trendingMoviesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Getting trending movies...");
        const { timeFrame } = req.query;
        if (timeFrame === "week" || timeFrame === "day") {
            console.log("Hitting Tmdb server ...");
            const response = yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/trending/movie/${timeFrame}`);
            console.log(`Data recieved\nToatal number: ${response.total_results}`);
            console.log("Data sent to client");
            res.status(200).json({ data: response });
        }
        else {
            console.log("Could not get data (invalid query parameter");
            res.status(400);
            throw new Error("No data or Invalid data passed for query parameter timeframe");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.trendingMoviesController = trendingMoviesController;
const popularMoviesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.popularMoviesController = popularMoviesController;
const recentMoviesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.recentMoviesController = recentMoviesController;
const movieDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.movieDetailsController = movieDetailsController;
const relatedMoviesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.relatedMoviesController = relatedMoviesController;
const searchMoviesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.searchMoviesController = searchMoviesController;
