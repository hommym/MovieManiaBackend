import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { keywordSearchController, movieSearchController, seriesSearchController } from "./searchController";



export const searchRouter = Router();


searchRouter.get("/keyword",verifyJwt,keywordSearchController)
searchRouter.get("/movies",verifyJwt,movieSearchController)
searchRouter.get("/tv-series",verifyJwt,seriesSearchController)