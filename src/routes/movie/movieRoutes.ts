import { Router } from "express";
import { movieCategoryController, movieDetailsController, relatedMoviesController, searchMoviesController, urlController } from "./movieController";
import { verifyJwt } from "../../middleware/verifyJwt";

export const movieRouter = Router();

// routes for getting movie url

movieRouter.get("/url", urlController);



// route for getting a movie details
movieRouter.get("/details", verifyJwt, movieDetailsController);


// route for searching for movies
movieRouter.get("/search", searchMoviesController);


// route for pagination 


// route for getting trending, popular and recent movies
movieRouter.get("/:category", verifyJwt, movieCategoryController);