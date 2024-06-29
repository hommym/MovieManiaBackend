import { Router } from "express";
import { popularMoviesController, recentMoviesController, relatedMoviesController, searchMoviesController, trendingMoviesController, urlController } from "./movieController";
import { verifyJwt } from "../../middleware/verifyJwt";

export const movieRouter = Router();

// routes for getting movie url

movieRouter.get("/url", urlController);

// route for getting trending movies
movieRouter.get("/trending", verifyJwt, trendingMoviesController);

// route for getting popular movies
movieRouter.get("/popular", verifyJwt, popularMoviesController);

// route for getting recent movies
movieRouter.get("/recent", verifyJwt, recentMoviesController);

// route for getting a movie details
movieRouter.get("/details", verifyJwt, trendingMoviesController);

// routes related movies
movieRouter.get("/related", verifyJwt, relatedMoviesController);

// route for searching for movies
movieRouter.get("/search", searchMoviesController);
