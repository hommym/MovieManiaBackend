"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieRouter = void 0;
const express_1 = require("express");
const movieController_1 = require("./movieController");
const verifyJwt_1 = require("../../middleware/verifyJwt");
exports.movieRouter = (0, express_1.Router)();
// routes for getting movie url
exports.movieRouter.get("/url", movieController_1.urlController);
// route for getting a movie details
exports.movieRouter.get("/details", verifyJwt_1.verifyJwt, movieController_1.movieDetailsController);
// route for getting trending, popular and recent movies
exports.movieRouter.get("/:category", verifyJwt_1.verifyJwt, movieController_1.movieCategoryController);
