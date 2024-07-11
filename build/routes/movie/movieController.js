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
exports.movieDetailsController = exports.movieCategoryController = exports.urlController = void 0;
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
const movieCategoryController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // checking the category in which the use wants(ie popular,recent,trending)
        const { category } = req.params;
        const { page } = req.query;
        console.log(`Getting ${category} movies...`);
        let response = undefined;
        if (category === "trending") {
            const timeFrame = req.query.timeFrame ? req.query.timeFrame : "day";
            console.log("Hitting Tmdb server ...");
            response = page
                ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/trending/movie/${timeFrame}?page=${page}`)
                : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/trending/movie/${timeFrame}`);
        }
        else if (category === "popular") {
            response = page ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/movie/popular?page=${page}`) : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/movie/popular`);
        }
        else if (category === "recent") {
            response = page ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/movie/now_playing?page=${page}`) : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/movie/now_playing`);
        }
        else {
            res.status(404);
            throw Error("Resource not found");
        }
        if (response) {
            console.log(`Data recieved\nToatal number: ${response.total_results}`);
        }
        console.log("Data sent to client");
        res.status(200).json({ data: response });
    }
    catch (error) {
        next(error);
    }
});
exports.movieCategoryController = movieCategoryController;
const movieDetailsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("A user is getting a movie details");
        const { movieId } = req.query;
        console.log("Checking if movie Id is pressent...");
        if (movieId) {
            console.log("Movie id present");
            console.log("Getting a movie details...");
            const data = yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/movie/${movieId}`);
            console.log(`Details received movie with id ${movieId} has title ${data.title}`);
            console.log("Getting a related movies...");
            data.relatedMovies = yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/movie/${movieId}/similar`);
            console.log(`Related movies recieved,total= ${data.relatedMovies.total_results}`);
            res.status(200).json({ movieDetails: data });
        }
        else {
            res.status(400);
            throw new Error("No Value passed for the query parameter ");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.movieDetailsController = movieDetailsController;
