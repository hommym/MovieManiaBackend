import { NextFunction, Request, Response } from "express";
import { PageGetter, getDataFromTMDB } from "../../libs/axios";
import { getDocumentObject } from "../../libs/jsdom";
import { BaseResponse } from "../../components/customDataTypesAndInterfaces/tmdbResponses";
import asyncHandler from "express-async-handler";
import { fetchData, getContentDetails } from "../../components/fetchData";

export const urlController = asyncHandler(async (req: Request, res: Response) => {});

export const seriesCategoryController = asyncHandler(async (req: Request, res: Response) => {
  await fetchData("tv", req, res);
});

export const seriesDetailsController = asyncHandler(async (req: Request, res: Response) => {
  await getContentDetails("tv", req, res);
});
