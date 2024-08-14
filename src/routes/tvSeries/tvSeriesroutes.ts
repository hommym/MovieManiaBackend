import { Router } from "express";

import { verifyJwt } from "../../middleware/verifyJwt";
import { seriesCategoryController, seriesDetailsController, urlController } from "./tvSeriesController";

export const seriesRouter = Router();

// routes for getting movie url

seriesRouter.get("/url", urlController);

// route for getting a movie details
seriesRouter.get("/details", verifyJwt, seriesDetailsController);

// route for getting trending, popular and recent movies
seriesRouter.get("/:category", verifyJwt, seriesCategoryController);
