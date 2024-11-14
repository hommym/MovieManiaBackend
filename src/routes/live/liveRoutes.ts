import { Router } from "express";
import { getFileController, getPlaylistController,saveLiveDataController, uploadController } from "./liveController";
import { getFileFromRequest } from "../../libs/multer";

export const liveRouter = Router();

liveRouter.post("/", saveLiveDataController);
liveRouter.post("/upload", getFileFromRequest("newUpload"), uploadController);
liveRouter.get("/playlist", getPlaylistController);
liveRouter.get("/file/:fileName", getFileController);
