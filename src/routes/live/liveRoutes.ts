import { Router } from "express";
import {
  addNewsController,
  addToPlaylistController,
  beginStreamController,
  deletePlaylistController,
  getFileController,
  getNewsController,
  getPlaylistController,
  getUploadedFilesController,
  stopSteamController,
  uploadController,
} from "./liveController";
import { getFileFromRequest } from "../../libs/multer";

export const liveRouter = Router();

liveRouter.post("/schedule", beginStreamController);
liveRouter.post("/stop", stopSteamController);
liveRouter.post("/upload", getFileFromRequest("newUpload"), uploadController);
liveRouter.get("/playlist", getPlaylistController);
liveRouter.post("/playlist", addToPlaylistController);
liveRouter.delete("/playlist/:title", deletePlaylistController);
liveRouter.get("/file/:fileName", getFileController);
liveRouter.get("/uploads/:fileName", getUploadedFilesController);
liveRouter.post("/news",addNewsController)
liveRouter.get("/news",getNewsController)
