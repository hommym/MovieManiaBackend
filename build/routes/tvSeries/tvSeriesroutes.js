"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seriesRouter = void 0;
const express_1 = require("express");
const tvSeriesController_1 = require("./tvSeriesController");
exports.seriesRouter = (0, express_1.Router)();
// routes for getting movie url
exports.seriesRouter.get("/url", tvSeriesController_1.urlController);
// route for getting a movie details
exports.seriesRouter.get("/details", tvSeriesController_1.seriesDetailsController);
// route for getting trending, popular and recent movies
exports.seriesRouter.get("/:category", tvSeriesController_1.seriesCategoryController);
