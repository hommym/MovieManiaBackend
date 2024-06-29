import {Router} from "express"
import { popularMoviesController, recentMoviesController, relatedMoviesController, searchMoviesController, trendingMoviesController, urlController } from "./movieController"




export const movieRouter= Router()




// routes for getting movie url

movieRouter.get("/url",urlController)


// route for getting trending movies
movieRouter.get("/trending",trendingMoviesController)

// route for getting popular movies
movieRouter.get("/popular", popularMoviesController);

// route for getting recent movies
movieRouter.get("/recent", recentMoviesController);

// route for getting a movie details
movieRouter.get("/details", trendingMoviesController);


// routes related movies
movieRouter.get("/related", relatedMoviesController);


// route for searching for movies
movieRouter.get("/search", searchMoviesController);



