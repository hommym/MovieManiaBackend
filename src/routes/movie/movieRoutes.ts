import { Router } from "express";
import { movieCategoryController, movieDetailsController, urlController } from "./movieController";
import { verifyJwt } from "../../middleware/verifyJwt";

export const movieRouter = Router();

// routes for getting movie url

movieRouter.get("/url", urlController);

// route for getting a movie details
movieRouter.get("/details", movieDetailsController);

// route for getting trending, popular and recent movies
movieRouter.get("/:category", movieCategoryController);
