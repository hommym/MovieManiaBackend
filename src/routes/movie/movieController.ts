import { NextFunction, Request, Response } from "express";
import { PageGetter, getDataFromTMDB } from "../../libs/axios";
import { getDocumentObject } from "../../libs/jsdom";
import { BaseResponse } from "../../components/customDataTypesAndInterfaces/tmdbResponses";
import asyncHandler from "express-async-handler";
import { nextTick } from "process";
import { fetchData, getContentDetails } from "../../components/fetchData";

const pageGetter: PageGetter = new PageGetter();
function replaceSpecialCharacters(input: string): string {
  // Replace '&' with 'and'
  let result = input.replace(/&/g, "and");

  // Remove accents from letters
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return result;
}

function haveOrderedWords(str1: string, str2: string): boolean {
    // Helper function to split string into lowercase words without punctuation
    const getWords = (str: string) =>
        str
            .toLowerCase() // Convert to lowercase for case-insensitive comparison
            .replace(/[^\w\s]/g, "") // Remove non-word characters (punctuation)
            .split(/\s+/); // Split by whitespace

    const words1 = getWords(str1);
    const words2 = getWords(str2);

    // Convert words1 to a string to make it easier to search for in words2
    const subString = words1.join(" ");
    const fullString = words2.join(" ");

    // Check if words1 appears in words2 as a contiguous subarray
    return fullString.includes(subString);
}

// Test cases
console.log(haveOrderedWords("Joker Folie a Deux", "Joker - Folie a Deux")); // true
console.log(haveOrderedWords("Joker Folie a Deux", "This Joker Folie a Deux movie is amazing")); // true
console.log(haveOrderedWords("Joker Folie a Deux", "Joker Folie Deux a")); // false
console.log(haveOrderedWords("Joker Folie a Deux", "Joker Folie Deux")); // false

const getDownloadLink = async (secondPagelink: string) => {
  let nextPageLink = secondPagelink;
  const secondPage = await pageGetter.getPage(nextPageLink);
  console.log("Page available");
  //    getting the document object form html text
  let htmlDocumentObject = getDocumentObject(secondPage);

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

  return downloadLink;
};

const getSecondPagelink = async (moviePageLink: string) => {
  console.log("Getting movie page....");
  const moviePage = await pageGetter.getPage(moviePageLink);
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
  return nextPageLink;
};

const searchMovie = async (title: string) => {
    console.log("Getting search page....");
    console.log("Title= ",title)
    const moviePage = await pageGetter.getPage(`https://www.fzmovies.net/csearch.php?searchname=${title}`);
    console.log("Page available");

    //    getting the document object form html text
    let htmlDocumentObject = getDocumentObject(moviePage);
      console.log("Searching for divs with class called mainbox.....");
      for (let divElement of htmlDocumentObject.querySelectorAll(".mainbox")) {
        console.log("A div has been found");
        console.log("Searching for link to next page...");
        const titleOnSite = divElement
          .querySelector("table")
          ?.querySelector("tbody")
          ?.querySelector("tr")
          ?.querySelectorAll("td")[1]
          ?.querySelector("span")
          ?.querySelector("a")
          ?.querySelector("small")
          ?.querySelector("b")?.textContent;
        if (haveOrderedWords(title, titleOnSite!)) {
          return `https://www.fzmovies.net/movie-${titleOnSite}--hmp4.htm`;
        }
        // the break statement below is just temporary
      
      }


  return "";
};
export const urlController = async (req: Request, res: Response) => {
  try {
    if (!req.query.title) {
      res.status(400);
      throw new Error("No data pass for the query param title");
    }
    let title: string = req.query.title as string;
    const originalTitle = title;
    title = replaceSpecialCharacters(originalTitle);
    // title = title.replace(":", "");
    // creating url of movie page we will be visiting

    console.log("Creating movie page url....");
    let urlOfMoviePage = "";
    const componentsOfTitle: Array<string> = title.split(" ");

    for (let partOfTitle of componentsOfTitle) {
      urlOfMoviePage = urlOfMoviePage + partOfTitle + "%20";
    }
    urlOfMoviePage = `https://www.fzmovies.net/movie-${urlOfMoviePage}--hmp4.htm`;
    console.log("Url created", urlOfMoviePage);
    

    const nextPageLink: string = await getSecondPagelink(urlOfMoviePage);

    // moving to nextPage
    console.log("Getting second page....");
    if (nextPageLink !== "") {
      const downloadLink = await getDownloadLink(nextPageLink);
      res.status(200).json({ downloadLink });
    } else {
      // perform a search
      urlOfMoviePage = await searchMovie(title);
      console.log(urlOfMoviePage)
      if (urlOfMoviePage === "") return res.status(404).json({ error: `The movie ${originalTitle} is not yet avialable, please try again later` });
      const downloadLink = await getDownloadLink(await getSecondPagelink(urlOfMoviePage));
      res.status(200).json({ downloadLink });
    }
  } catch (error) {
    console.log(`An error occurred ${error}`);
    if (res.statusCode == 200) {
      res.status(500);
    }
    res.json({ error });
  }
};

export const movieCategoryController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await fetchData("movie", req, res);
});

export const movieDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  await getContentDetails("movie", req, res);
};
