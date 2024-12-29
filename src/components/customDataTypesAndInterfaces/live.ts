import ffmpeg from "fluent-ffmpeg";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import { Live, LiveSchema } from "../../schemas/liveSchema";
import { checkPathExists } from "../helperMethods/path";

export interface Segment {
  fileName: string;
  content: string;
}

export class LiveStream {
  url: string = "";
  private id: any = "";
  private streamingProcess: any = null;
  private path = join(__dirname, "..", "..", `/routes/live/live.data/playlist.m3u8`);

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  initialise(url: string, id: any) {
    this.url = url;
    this.id = id;
    this.streamingProcess = ffmpeg(this.url)
      .inputOptions(["-re"])
      .outputOptions([
        "-start_number 0", // Start numbering segments at 0
        "-hls_time 8", // Each segment is 10 seconds
        "-hls_list_size 5", // No limit on playlist size (for VOD)
        `-hls_segment_filename ${join(__dirname, "..", "..", `/routes/live/live.data`)}/%03d.ts`, // Naming for segment files
        "-hls_flags delete_segments",
      ]);

    return this;
  }

  private async deleteStreamFiles() {
    try {
      const folderPath = join(__dirname, "..", "..", `/routes/live/live.data`);
      const files = await readdir(folderPath);

      for (const file of files) {
        const filePath = join(folderPath, file);
        await unlink(filePath);
      }
    } catch (error) {
      console.log(error);
    }
  }

  setupStreamListners() {
    this.streamingProcess
      .on("end", async () => {
        await LiveSchema.deleteOne({ _id: this.id });
        await this.deleteStreamFiles();
        const liveDataInDatabase = await LiveSchema.find({});
        if (liveDataInDatabase.length !== 0) {
          const { url, _id } = liveDataInDatabase[0] as Live;
          this.initialise(url, _id).setupStreamListners().startStream();
        } else {
          this.url = "";
        }
      })
      .on("start", async (commadline: any) => {
        console.log(commadline);
      })
      .on("error", async (err: any) => {
        await this.deleteStreamFiles();
        // await LiveSchema.deleteOne({ _id: this.id });
        // const liveDataInDatabase = await LiveSchema.find({});
        // if (liveDataInDatabase.length !== 0) {
        //   const { url, _id } = liveDataInDatabase[0] as Live;
        //   this.url = url;
        //   this.id = _id;
        //   this.startStream();
        // } else {
        //   this.url = "";
        // }
      });
    return this;
  }

  startStream() {
    if (this.url !== "") {
      this.streamingProcess.save(this.path);
    }
  }
  async stopStream() {
    if (await checkPathExists(this.path)) {
      try {
        this.url = "";
        this.streamingProcess.kill("SIGINT");
        await this.delay(20000);
        await this.deleteStreamFiles();
        // await LiveSchema.deleteOne({ _id: this.id });
      } catch (error) {
        console.log(error);
      }
      return true;
    } else {
      return false;
    }
  }

  newsData = [
    "BBC WORLD SERVICE NEWS UPDATE:||Mexico unveils emergency strategy to protect its migrants in US || Mexico has announced an emergency strategy to protect migrants in the US, after president-elect, Donald Trump, threatened to deport millions of illegal people || Also: the virtual blaze that is an internet success.||",
  ];
}
