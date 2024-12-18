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
exports.seriesSearchController = exports.movieSearchController = exports.keywordSearchController = void 0;
const axios_1 = require("../../libs/axios");
const keywordSearchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.keywordSearchController = keywordSearchController;
const movieSearchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchKeyword, page } = req.query;
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchKeyword}&page=${page ? page : "1"}`;
    const response = yield (0, axios_1.getDataFromTMDB)(searchUrl);
    res.status(200).json(response);
});
exports.movieSearchController = movieSearchController;
const seriesSearchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.seriesSearchController = seriesSearchController;
