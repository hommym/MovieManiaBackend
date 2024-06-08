import {Router} from "express"
import { urlController } from "./movieController"




export const movieRouter= Router()


// routes related movies

// routes for getting movie url

movieRouter.get("/url",urlController)



// route for getting a movie details

// route for getting recent movies

// route for getting popular movies

// route for searching for movies



