import { NextFunction, Request, Response } from "express";
import { PageGetter, getDataFromTMDB } from "../../libs/axios";

export const keywordSearchController = async (req: Request, res: Response) => {};

export const movieSearchController = async (req: Request, res: Response) => {
  const { searchKeyword, page } = req.query;
  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchKeyword}&page=${page ? page : "1"}`;

  const response = await getDataFromTMDB(searchUrl);
  res.status(200).json(response);
};

export const seriesSearchController = async (req: Request, res: Response) => {};
