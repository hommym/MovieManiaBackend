import dotenv from "dotenv";
dotenv.config();
import axios, { Axios } from "axios";
import tough from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import qs from "qs";

export class PageGetter {
  private axiosObject: Axios;
  constructor() {
    // Create a new cookie jar
    const cookieJar = new tough.CookieJar();
    this.axiosObject = wrapper(axios.create({ jar: cookieJar }));
  }

  getPage = async (pageUrl: string): Promise<string> => {
    // this fuction gets the page of the url provided and returns it
    const response = await this.axiosObject.get(pageUrl);
    return response.data as string;
  };

  getPagePostReq = async (pageUrl: string, moviename: string, year: string, genre:string=""): Promise<string> => {
    const data = qs.stringify({
      year,
      year2: year,
      moviename,
      submit: "submit",
      category: "Hollywood",
      genre
    });
    const response = await this.axiosObject.post(pageUrl, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data as string;
  };
}

export const getDataFromTMDB = async (url: string) => {
  const response = await axios({ url: url, headers: { Authorization: `Bearer ${process.env.TmdbApiKey}` } });
  return response.data;
};
