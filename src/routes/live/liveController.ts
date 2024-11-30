import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { event } from "../../components/constants/objects";
import { join } from "path";
import { Segment } from "../../components/customDataTypesAndInterfaces/live";
import { checkPathExists } from "../../components/helperMethods/path";
import { RandomData } from "../../components/helperMethods/randomData";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { readdir, unlink } from "fs/promises";

export const beginStreamController = asyncHandler(async (req: Request, res: Response) => {
  const { videoUrl } = req.body;
  const path = join(__dirname, `/live.data/playlist.m3u8`);

  if (!videoUrl) res.status(400).json({ error: "No data passed for videoUrl" });
  console.log("Breaking up data..");
  ffmpeg(videoUrl)
    .inputOptions(["-re"])
    .outputOptions([
      "-start_number 0", // Start numbering segments at 0
      "-hls_time 8", // Each segment is 10 seconds
      "-hls_list_size 5", // No limit on playlist size (for VOD)
      `-hls_segment_filename ${join(__dirname, `/live.data`)}/%03d.ts`, // Naming for segment files
      "-hls_flags delete_segments",
    ])
    .on("end", async () => {
      console.log("HLS segments and playlist created");
      try {
        const folderPath = join(__dirname, `/live.data`);
        console.log(folderPath);
        const files = await readdir(folderPath);

        for (const file of files) {
          console.log(file);
          const filePath = join(folderPath, file);
          await unlink(filePath);
        }
      } catch (error) {
        console.log(error);
      }
    })
    .on("start", (commadline) => {
      console.log(commadline);
      res.status(200).json({ message: "Stream has started" });
    })
    .on("error", (err) => {
      console.error("Error during processing:", err.message);
    })
    .save(path);
});

export const getPlaylistController = asyncHandler(async (req: Request, res: Response) => {
  const path = join(__dirname, `/live.data/playlist.m3u8`);
  if (await checkPathExists(path)) {
    res.sendFile(path, (err) => {
      if (err) console.log(`File Transfer Error:${err}`);
    });
  } else {
    console.log("Playlist Path does not exist");
    res.status(404).end();
  }
});

export const getFileController = asyncHandler(async (req: Request, res: Response) => {
  const { fileName } = req.params;
  console.log(`fileName=${fileName}`);
  const path = join(__dirname, `/live.data/${fileName}`);
  if (await checkPathExists(path)) {
    res.setHeader("Accept-Ranges", "bytes");
    res.sendFile(path, (err) => {
      if (err) console.log(`File Transfer Error:${err}`);
    });
  } else {
    console.log("Playlist Path does not exist");
    res.status(404).end();
  }
});

export const uploadController = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const allowedVideoMimeTypes = ["video/mp4", "video/mpeg", "video/3gpp", "video/x-matroska"];
  const videoMimeTypeMap: { [key: string]: string } = {
    "video/mp4": ".mp4",
    "video/mpeg": ".mpeg",
    "video/3gpp": ".3gp",
    "video/x-matroska": ".mkv",
  };
  if (!file || !allowedVideoMimeTypes.includes(file.mimetype)) res.status(400).json({ message: "No file provided or file type not supported" });
  else {
    let fileName = new RandomData().getRandomString(10);
    let path = join(__dirname, `/live.data/${fileName}${videoMimeTypeMap[file!.mimetype]}`);
    while (true) {
      if (!(await checkPathExists(path))) {
        break;
      }
      fileName = new RandomData().getRandomString(10);
      path = join(__dirname, `/live.data/${fileName}${videoMimeTypeMap[file!.mimetype]}`);
    }
    event.emit("saveFile", file!.buffer, path);
    res.status(200).json({ urlVideo: `${process.env.BaseUrl}/api/live/file/${fileName}${videoMimeTypeMap[file!.mimetype]}` });
  }
});
