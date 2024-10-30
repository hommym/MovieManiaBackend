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
exports.fetchData = fetchData;
exports.getContentDetails = getContentDetails;
const axios_1 = require("../libs/axios");
// this method is for getting content(wheather movies or series ) data base on categories like recent,trending and popular
function fetchData(contentType, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { category } = req.params;
        const { page } = req.query;
        console.log(`Getting ${category} ${contentType}...`);
        let response = undefined;
        if (category === "trending") {
            const timeFrame = req.query.timeFrame ? req.query.timeFrame : "day";
            console.log("Hitting Tmdb server ...");
            response = page
                ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/trending/${contentType}/${timeFrame}?page=${page}`)
                : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/trending/${contentType}/${timeFrame}`);
        }
        else if (category === "popular") {
            response = page ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/popular?page=${page}`) : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/popular`);
        }
        else if (category === "recent") {
            if (contentType == "movie") {
                response = page
                    ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/now_playing?page=${page}`)
                    : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/now_playing`);
            }
            else {
                response = page
                    ? yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/airing_today?page=${page}`)
                    : yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/airing_today`);
            }
        }
        else {
            res.status(404);
            throw Error("Resource not found");
        }
        if (response) {
            console.log(`Data received\nTotal number: ${response.total_results}`);
        }
        console.log("Data sent to client");
        res.status(200).json({ data: response });
    });
}
// this method is for getting details about a content(wheather movies or series) using the contentId
function getContentDetails(contentType, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`A user is getting ${contentType} details`);
        const { contentId } = req.query;
        console.log(`Checking if ${contentType} Id is present...`);
        if (contentId) {
            console.log(`${contentType} id present`);
            console.log(`Getting ${contentType} details...`);
            const data = yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/${contentId}`);
            console.log(`Details received: ${contentType} with id ${contentId} has title ${data.title}`);
            console.log(`Getting related ${contentType}s...`);
            data[`${contentType === "movie" ? "relatedMovies" : "relatedSeries"}`] = yield (0, axios_1.getDataFromTMDB)(`https://api.themoviedb.org/3/${contentType}/${contentId}/similar`);
            console.log(`Related ${contentType}s received, total= ${contentType === "movie" ? data.relatedMovies.total_results : data.relatedSeries.total_results}`);
            res.status(200).json({ contentDetails: data });
        }
        else {
            res.status(400);
            throw new Error(`No value passed for the query parameter`);
        }
    });
}
