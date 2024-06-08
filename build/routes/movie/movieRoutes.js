"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieRouter = void 0;
const express_1 = require("express");
const movieController_1 = require("./movieController");
exports.movieRouter = (0, express_1.Router)();
// routes related movies
// routes for getting movie url
exports.movieRouter.get("/url", movieController_1.urlController);
// route for getting a movie details
// route for getting recent movies
// route for getting popular movies
// route for searching for movies
