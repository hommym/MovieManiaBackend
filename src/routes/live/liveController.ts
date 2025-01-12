import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { event, liveStream } from "../../components/constants/objects";
import { join } from "path";
import { Segment } from "../../components/customDataTypesAndInterfaces/live";
import { checkPathExists } from "../../components/helperMethods/path";
import { RandomData } from "../../components/helperMethods/randomData";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { readdir, unlink } from "fs/promises";
import { LiveSchema } from "../../schemas/liveSchema";

export const beginStreamController = asyncHandler(async (req: Request, res: Response) => {
  const playListData = await LiveSchema.find({});
  if ((await checkPathExists(join(__dirname, `/live.data/playlist.m3u8`))) || liveStream.url !== "") {
    res.status(409).json({ message: "A Video is Already been streamed" });
    return;
  } else if (playListData.length === 0) {
    res.status(404).json({ message: "No Item in playlist to start stream" });
    return;
  }
  const { url, _id } = playListData[0];
  liveStream.initialise(url, _id).setupStreamListners().startStream();
  res.status(200).json({ message: "Stream has started" });
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
  if (await liveStream.stopStream()) res.status(200).json({ message: "Stream Stopped" });
  else {
    res.status(404).json({ message: "No Stream Avialable to Stop" });
  }
});

export const addNewsController = asyncHandler(async (req: Request, res: Response) => {
  const { news } = req.body;

  if (!news) res.status(400).json({ message: "No data passed for news" });
  else {
    liveStream.newsData[0] = news;
    res.status(200).json({ message: "News Updated Sucessfully" });
  }
});

export const getNewsController= asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ news: liveStream.newsData[0] });
})

export const resetLiveController = asyncHandler(async (req: Request, res: Response) => {
await liveStream.resetStream();
res.status(204).end();
});
