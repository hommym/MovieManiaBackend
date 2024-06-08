import axios, { Axios } from "axios";
import tough from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

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
}


