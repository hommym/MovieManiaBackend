import { getDataFromTMDB } from "../libs/axios";
import { BaseResponse } from "./customDataTypesAndInterfaces/tmdbResponses";
import { Request, Response } from "express";


// this method is for getting content(wheather movies or series ) data base on categories like recent,trending and popular
export async function fetchData(contentType: string, req: Request, res: Response) {
  const { category } = req.params;
  const { page } = req.query;
  console.log(`Getting ${category} ${contentType}...`);

  let response: BaseResponse | undefined = undefined;

  if (category === "trending") {
    const timeFrame = req.query.timeFrame ? req.query.timeFrame : "day";
    console.log("Hitting Tmdb server ...");
    response = page
      ? await getDataFromTMDB(`https://api.themoviedb.org/3/trending/${contentType}/${timeFrame}?page=${page}`)
      : await getDataFromTMDB(`https://api.themoviedb.org/3/trending/${contentType}/${timeFrame}`);
  } else if (category === "popular") {
    response = page ? await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/popular?page=${page}`) : await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/popular`);
  } else if (category === "recent") {
    if (contentType == "movie") {
      response = page
        ? await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/now_playing?page=${page}`)
        : await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/now_playing`);
    } else {
      response = page
        ? await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/airing_today?page=${page}`)
        : await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/airing_today`);
    }
  } else {
    res.status(404);
    throw Error("Resource not found");
  }

  if (response) {
    console.log(`Data received\nTotal number: ${response.total_results}`);
  }

  console.log("Data sent to client");
  res.status(200).json({ data: response });
}

// this method is for getting details about a content(wheather movies or series) using the contentId
export async function getContentDetails(contentType: string, req: Request, res: Response) {
  console.log(`A user is getting ${contentType} details`);
  const { contentId } = req.query;

  console.log(`Checking if ${contentType} Id is present...`);
  if (contentId) {
    console.log(`${contentType} id present`);
    console.log(`Getting ${contentType} details...`);

    const data = await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/${contentId}`);
    console.log(`Details received: ${contentType} with id ${contentId} has title ${data.title}`);

    console.log(`Getting related ${contentType}s...`);
    data[`${contentType==="movie"?"relatedMovies":"relatedSeries"}`] = await getDataFromTMDB(`https://api.themoviedb.org/3/${contentType}/${contentId}/similar`);

    


    console.log(`Related ${contentType}s received, total= ${contentType === "movie" ? data.relatedMovies.total_results : data.relatedSeries.total_results}`);
    res.status(200).json({ contentDetails: data });
  } else {
    res.status(400);
    throw new Error(`No value passed for the query parameter`);
  }
}


