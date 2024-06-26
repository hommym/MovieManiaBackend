"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieRouter = void 0;
const express_1 = require("express");
const movieController_1 = require("./movieController");
const verifyJwt_1 = require("../../middleware/verifyJwt");
exports.movieRouter = (0, express_1.Router)();
// routes for getting movie url
exports.movieRouter.get("/url", movieController_1.urlController);
// route for getting trending movies
exports.movieRouter.get("/trending", verifyJwt_1.verifyJwt, movieController_1.trendingMoviesController);
// route for getting popular movies
exports.movieRouter.get("/popular", verifyJwt_1.verifyJwt, movieController_1.popularMoviesController);
// route for getting recent movies
exports.movieRouter.get("/recent", verifyJwt_1.verifyJwt, movieController_1.recentMoviesController);
// route for getting a movie details
exports.movieRouter.get("/details", verifyJwt_1.verifyJwt, movieController_1.trendingMoviesController);
// routes related movies
exports.movieRouter.get("/related", verifyJwt_1.verifyJwt, movieController_1.relatedMoviesController);
// route for searching for movies
exports.movieRouter.get("/search", movieController_1.searchMoviesController);
