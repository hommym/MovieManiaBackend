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
function areWordsInOrder(s1: string, s2: string) {
  // Helper function to remove punctuation and split into words
  function cleanAndSplit(str: string) {
    return str
      .replace(/[^\w\s]/g, "") // Remove all non-alphanumeric and non-space characters
      .split(/\s+/); // Split into words
  }

  const words1 = cleanAndSplit(s1);
  const words2 = cleanAndSplit(s2);

  let i = 0; // Pointer for words1
  let extraWords = 0; // Counter for extra words in words2

  for (let j = 0; j < words2.length; j++) {
    if (words2[j] === words1[i]) {
      i++; // Move to the next word in words1
      extraWords = 0; // Reset extra word counter
    } else {
      extraWords++; // Increment extra word counter
      if (extraWords > 2) {
        return false; // Too many extra words
      }
    }
    if (i === words1.length) {
      return true; // All words in words1 found in order
    }
  }

  return false; // Not all words found in order
}

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

const searchMovie = async (title: string, year: string, genre: string = "") => {
  let urlNextPage: string = "";
  console.log("Getting search page....");
  console.log("Title= ", title);
  const moviePage = await pageGetter.getPagePostReq("https://www.fzmovies.net/advancedsearch.php", title, year, genre);
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

    if (areWordsInOrder(title, titleOnSite as string)) {
      urlNextPage = `https://www.fzmovies.net/movie-${titleOnSite}--hmp4.htm`;
      break;
    }
  }

  return urlNextPage;
};
export const urlController = async (req: Request, res: Response) => {
  try {
    const { title, year, genre } = req.query;
    if (!title || !year) {
      res.status(400);
      throw new Error("No data pass for the query param title or year");
    }

    // perform a search
    let urlOfMoviePage = await searchMovie((title as string).replace(/[^\w\s]/g, ""), year as string, genre as string);
    console.log(urlOfMoviePage);
    if (urlOfMoviePage === "") {
      urlOfMoviePage = `https://www.fzmovies.net/movie-${replaceSpecialCharacters((title as string).replace(/[^\w\s]/g, ""))}--hmp4.htm`;
      const nextPageLink: string = await getSecondPagelink(urlOfMoviePage);
      if (nextPageLink !== "") {
        const downloadLink = await getDownloadLink(nextPageLink);
        return res.status(200).json({ downloadLink });
      }
      return res.status(404).json({ error: `The movie ${title} is not yet avialable, please try again later` });
    }
    const downloadLink = await getDownloadLink(await getSecondPagelink(urlOfMoviePage));
    res.status(200).json({ downloadLink });

    // let title: string = req.query.title as string;
    // const originalTitle = title;
    // title = replaceSpecialCharacters(originalTitle);
    // // title = title.replace(":", "");
    // // creating url of movie page we will be visiting

    // console.log("Creating movie page url....");
    // let urlOfMoviePage = "";
    // const componentsOfTitle: Array<string> = title.split(" ");

    // for (let partOfTitle of componentsOfTitle) {
    //   urlOfMoviePage = urlOfMoviePage + partOfTitle + "%20";
    // }
    // urlOfMoviePage = `https://www.fzmovies.net/movie-${urlOfMoviePage}--hmp4.htm`;
    // console.log("Url created", urlOfMoviePage);

    // const nextPageLink: string = await getSecondPagelink(urlOfMoviePage);

    // // moving to nextPage
    // console.log("Getting second page....");
    // if (nextPageLink !== "") {
    //   const downloadLink = await getDownloadLink(nextPageLink);
    //   res.status(200).json({ downloadLink });
    // } else {

    // }
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
