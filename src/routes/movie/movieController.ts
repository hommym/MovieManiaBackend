import { NextFunction, Request, Response } from "express";
import { PageGetter, getDataFromTMDB } from "../../libs/axios";
import { getDocumentObject } from "../../libs/jsdom";
import { BaseResponse } from "../../components/customDataTypesAndInterfaces/tmdbResponses";
import { nextTick } from "process";

export const urlController = async (req: Request, res: Response) => {
  try {
    if (!req.query.title) {
      res.status(400);
      throw new Error("No data pass for the query param title");
    }
    const title: string = req.query.title as string;

    // creating url of movie page we will be visiting
    console.log("Creating movie page url....");
    let urlOfMoviePage = "https://www.fzmovies.net/movie-";
    const componentsOfTitle: Array<string> = title.split(" ");

    for (let partOfTitle of componentsOfTitle) {
      if (componentsOfTitle.length - 1 === componentsOfTitle.indexOf(partOfTitle)) {
        urlOfMoviePage = urlOfMoviePage + partOfTitle + "--hmp4.htm";
      }

      urlOfMoviePage = urlOfMoviePage + partOfTitle + "%20";
    }
    console.log("Url created");

    // creating PageGetter object

    const pageGetter: PageGetter = new PageGetter();

    // getting the movie page(which is in html form)
    console.log("Getting movie page....");
    const moviePage = await pageGetter.getPage(urlOfMoviePage);
    console.log("Page available");

    //    getting the document object form html text
    let htmlDocumentObject = getDocumentObject(moviePage);

    // looking for a tag that contains the link to next page
    let nextPageLink: string = "";
    console.log("Searching for divs with class called moviesfiles.....");
    for (let divElement of htmlDocumentObject.querySelectorAll(".moviesfiles")) {
      console.log("A div has been found");
      console.log("Searching for link to next page...");
      const linkTag = divElement.querySelector("li")?.querySelector("a")?.href;

      if (linkTag) {
        nextPageLink = `https://www.fzmovies.net/${linkTag}`;
        console.log(`The link found = https://www.fzmovies.net/${linkTag}`);
      }
      // the break statement below is just temporary
      break;
    }

    // moving to nextPage
    console.log("Getting second page....");
    const secondPage = await pageGetter.getPage(nextPageLink);
    console.log("Page available");
    //    getting the document object form html text
    htmlDocumentObject = getDocumentObject(secondPage);

    console.log("Searching for divs with class called downloadlinks.....");
    const downloadPageElement = htmlDocumentObject.querySelector(".moviedesc1");
    console.log(downloadPageElement);
    nextPageLink = `https://www.fzmovies.net/${(downloadPageElement?.querySelector("#downloadlink") as HTMLAnchorElement).href}`;

    // moving to downloadPage
    console.log("Getting download page....");
    const downloadPage = await pageGetter.getPage(nextPageLink);
    console.log("Page available");

    //    getting the document object form html text
    htmlDocumentObject = getDocumentObject(downloadPage);
    let downloadLink = "";
    console.log("Searching for input tags on the page.....");
    const inputTags = htmlDocumentObject.querySelector(".moviedesc")?.querySelectorAll("input");

    if (inputTags) {
      for (let inputTag of inputTags) {
        console.log("An input tag found");
        console.log("Checking if input tag contains download link....");
        if (inputTag.name === "download1" || inputTag.name === "download2" || inputTag.name === "download3") {
          console.log("Download link found");
          downloadLink = inputTag.value;
          break;
        }
      }
    }

    res.status(200).json({ downloadLink });
  } catch (error) {
    console.log(`An error occurred ${error}`);
    if (res.statusCode == 200) {
      res.status(500);
    }
    res.json({ error });
  }
};

export const movieCategoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // checking the category in which the use wants(ie popular,recent,trending)
    const { category } = req.params;
    const { page } = req.query;
    console.log(`Getting ${category} movies...`);
    let response: BaseResponse | undefined = undefined;
    if (category === "trending") {
      const timeFrame = req.query.timeFrame ? req.query.timeFrame : "day";
      console.log("Hitting Tmdb server ...");
      response = page
        ? await getDataFromTMDB(`https://api.themoviedb.org/3/trending/movie/${timeFrame}?page=${page}`)
        : await getDataFromTMDB(`https://api.themoviedb.org/3/trending/movie/${timeFrame}`);
    } else if (category === "popular") {
      response = page ? await getDataFromTMDB(`https://api.themoviedb.org/3/movie/popular?page=${page}`) : await getDataFromTMDB(`https://api.themoviedb.org/3/movie/popular`);
    } else if (category === "recent") {
      response = page ? await getDataFromTMDB(`https://api.themoviedb.org/3/movie/now_playing?page=${page}`) : await getDataFromTMDB(`https://api.themoviedb.org/3/movie/now_playing`);
    } else {
      res.status(404);
      throw Error("Resource not found");
    }

    if (response) {
      console.log(`Data recieved\nToatal number: ${response.total_results}`);
    }

    console.log("Data sent to client");
    res.status(200).json({ data: response });
  } catch (error) {
    next(error);
  }
};

export const movieDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("A user is getting a movie details");
    const { movieId } = req.query;

    console.log("Checking if movie Id is pressent...");
    if (movieId) {
      console.log("Movie id present");
      console.log("Getting a movie details...");

      const data = await getDataFromTMDB(`https://api.themoviedb.org/3/movie/${movieId}`);
      console.log(`Details received movie with id ${movieId} has title ${data.title}`);

      console.log("Getting a related movies...");
      data.relatedMovies = await getDataFromTMDB(`https://api.themoviedb.org/3/movie/${movieId}/similar`);
      console.log(`Related movies recieved,total= ${data.relatedMovies.total_results}`);
      res.status(200).json({ movieDetails: data });
    } else {
      res.status(400);
      throw new Error("No Value passed for the query parameter ");
    }
  } catch (error) {
    next(error);
  }
};


