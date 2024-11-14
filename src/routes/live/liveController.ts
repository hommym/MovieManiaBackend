import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { event } from "../../components/constants/objects";
import { join } from "path";
import { Segment } from "../../components/customDataTypesAndInterfaces/live";
import { checkPathExists } from "../../components/helperMethods/path";
import { RandomData } from "../../components/helperMethods/randomData";

export const saveLiveDataController = asyncHandler((req: Request, res: Response) => {
  const { m3u8, segments } = req.body;

  if (!m3u8 || !segments) res.status(400).json({ error: "No value passed for m3u8 or segements" });

  event.emit("saveFile", m3u8, join(__dirname, `/live.data/playlist.m3u8`));
  (segments as Array<Segment>).forEach((segment) => {
    event.emit("saveFile", segment.content, join(__dirname, `/live.data/${segment.fileName}.ts`));
  });
  res.status(204).end();
});

export const getPlaylistController = asyncHandler(async (req: Request, res: Response) => {
  const path = join(__dirname, `/live.data/playlist.m3u8`);
  if (await checkPathExists(path)) {
    res.sendFile(path, (err) => {
      if (err) console.log(`File Transfer Error:${err}`);
    });
  } else {
    console.log("Playlist Path does not exist");
    res.end();
  }
});

export const getFileController = asyncHandler(async (req: Request, res: Response) => {
  const { fileName } = req.params;
  console.log(`fileName=${fileName}`);
  const path = join(__dirname, `/live.data/${fileName}`);
  if (await checkPathExists(path)) {
    res.sendFile(path, (err) => {
      if (err) console.log(`File Transfer Error:${err}`);
    });
  } else {
    console.log("Playlist Path does not exist");
    res.end();
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
