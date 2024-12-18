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
import { stopLive } from "../../components/events/live";
import { LiveSchema } from "../../schemas/liveSchema";

export const beginStreamController = asyncHandler(async (req: Request, res: Response) => {
  const playListData = await LiveSchema.find({});
  if (await checkPathExists(join(__dirname, `/live.data/playlist.m3u8`))) {
    res.status(409).json({ message: "A Video is Already been streamed" });
    return;
  } else if (playListData.length === 0) res.status(404).json({ message: "No Item in playlist to start stream" });
  event.emit("scheduleLive", playListData[0]);
  res.status(200).json({ message: "Stream has started" });
  // const { videoUrl } = req.body;
  // const path = join(__dirname, `/live.data/playlist.m3u8`);

  // if (!videoUrl) res.status(400).json({ error: "No data passed for videoUrl" });
  // console.log("Breaking up data..");
  // streamingProcess = ffmpeg(videoUrl)
  //   .inputOptions(["-re"])
  //   .outputOptions([
  //     "-start_number 0", // Start numbering segments at 0
  //     "-hls_time 8", // Each segment is 10 seconds
  //     "-hls_list_size 5", // No limit on playlist size (for VOD)
  //     `-hls_segment_filename ${join(__dirname, `/live.data`)}/%03d.ts`, // Naming for segment files
  //     "-hls_flags delete_segments",
  //   ])
  //   .on("end", async () => {
  //     try {
  //       const folderPath = join(__dirname, `/live.data`);
  //       const files = await readdir(folderPath);

  //       for (const file of files) {
  //         const filePath = join(folderPath, file);
  //         await unlink(filePath);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //     streamingProcess = undefined;
  //   })
  //   .on("start", (commadline) => {
  //     console.log(commadline);
  //   })
  //   .on("error", async (err) => {
  //     console.error("Error during processing:", err.message);
  //     const folderPath = join(__dirname, `/live.data`);
  //     const files = await readdir(folderPath);
  //     console.log("Deleting files in error handler");
  //     for (const file of files) {
  //       const filePath = join(folderPath, file);
  //       await unlink(filePath);
  //     }
  //     streamingProcess = undefined;
  //   })
  //   .save(path);
});

export const addToPlaylistController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(400).json({ message: "No body present" });
    return;
  }
  // add body validator
  res.status(201).json(await LiveSchema.create(req.body));
});

export const deletePlaylistController = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.params;
  await LiveSchema.deleteOne({ title });
  res.status(204).end();
});

export const getPlaylistController = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(await LiveSchema.find({}));
});

export const getFileController = asyncHandler(async (req: Request, res: Response) => {
  const { fileName } = req.params;
  // console.log(`fileName=${fileName}`);
  const path = join(__dirname, `/live.data/${fileName}`);
  if (await checkPathExists(path)) {
    res.setHeader("Accept-Ranges", "bytes");
    res.sendFile(path, (err) => {
      if (err) console.log(`File Transfer Error:${err}`);
    });
  } else {
    // console.log("Playlist Path does not exist");
    res.status(404).end();
  }
});

export const getUploadedFilesController = asyncHandler(async (req: Request, res: Response) => {
  const { fileName } = req.params;
  // console.log(`fileName=${fileName}`);
  const path = join(__dirname, `/uploads/${fileName}`);
  if (await checkPathExists(path)) {
    res.setHeader("Accept-Ranges", "bytes");
    res.sendFile(path, (err) => {
      if (err) console.log(`File Transfer Error:${err}`);
    });
  } else {
    // console.log("Playlist Path does not exist");
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
    let path = join(__dirname, `/uploads/${fileName}${videoMimeTypeMap[file!.mimetype]}`);
    while (true) {
      if (!(await checkPathExists(path))) {
        break;
      }
      fileName = new RandomData().getRandomString(10);
      path = join(__dirname, `/uploads/${fileName}${videoMimeTypeMap[file!.mimetype]}`);
    }
    event.emit("saveFile", file!.buffer, path);
    res.status(200).json({ urlVideo: `${process.env.BaseUrl}/api/live/uploads/${fileName}${videoMimeTypeMap[file!.mimetype]}` });
  }
});

export const stopSteamController = asyncHandler(async (req: Request, res: Response) => {
  console.log("Stopping Streaming");
  await stopLive(res);
});
