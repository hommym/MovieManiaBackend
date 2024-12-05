import { Live, LiveSchema } from "../../schemas/liveSchema";
import { event } from "../constants/objects";
import ffmpeg from "fluent-ffmpeg";
import { readdir, unlink } from "fs/promises";
import { checkPathExists } from "../../components/helperMethods/path";
import { RandomData } from "../../components/helperMethods/randomData";
import { join } from "path";
import { Response } from "express";

let streamingProcess: any;
let isFfmpegListenersSet: boolean = false;
const path = join(__dirname, "..", "..", `/routes/live/live.data/playlist.m3u8`);
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const setUpFfmpeg = (url: string) => {
  return ffmpeg(url)
    .inputOptions(["-re"])
    .outputOptions([
      "-start_number 0", // Start numbering segments at 0
      "-hls_time 8", // Each segment is 10 seconds
      "-hls_list_size 5", // No limit on playlist size (for VOD)
      `-hls_segment_filename ${join(__dirname, "..", "..", `/routes/live/live.data`)}/%03d.ts`, // Naming for segment files
      "-hls_flags delete_segments",
    ]);
};

const deleteStreamFile = async () => {
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
};

export const ScheduleLiveListener = async () => {
  event.on("scheduleLive", async (liveData: Live) => {
    const { url, _id } = liveData;

    streamingProcess = setUpFfmpeg(url);

    streamingProcess
      .on("end", async () => {
        await LiveSchema.deleteOne({ _id });
        await deleteStreamFile();
        const liveDataInDatabase = await LiveSchema.find({});
        if (liveDataInDatabase.length !== 0) {
          event.emit("scheduleLive", liveDataInDatabase[0]);
        } else {
          isFfmpegListenersSet = false;
          streamingProcess = undefined;
        }
      })
      .on("start", async (commadline: any) => {
        console.log(commadline);
      })
      .on("error", async (err: any) => {
        await deleteStreamFile();
        await LiveSchema.deleteMany({});
        const liveDataInDatabase = await LiveSchema.find({});
        //  isFfmpegListenersSet = false;
        streamingProcess = undefined;
        // if (liveDataInDatabase.length !== 0) {
        //   event.emit("scheduleLive", liveDataInDatabase[0]);
        // } else {
        // }
      });
    // if (!isFfmpegListenersSet) {

    //   isFfmpegListenersSet = true;
    // }
    streamingProcess.save(path);
  });
};

export const stopLive = async (res: Response) => {
  if (await checkPathExists(path)) {
    try {
      streamingProcess.kill("SIGINT");
      await delay(10000);
      await deleteStreamFile();
      await LiveSchema.deleteMany({});
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ message: "Stream Has been stopped" });
  } else {
    res.status(404).json({ message: "No Stream Avialable" });
  }
};
