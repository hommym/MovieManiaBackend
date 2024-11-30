import { Router } from "express";
import { beginStreamController, getFileController, getPlaylistController,stopSteamController,uploadController } from "./liveController";
import { getFileFromRequest } from "../../libs/multer";

export const liveRouter = Router();

liveRouter.post("/schedule", beginStreamController);
liveRouter.post("/stop",stopSteamController)
liveRouter.post("/upload", getFileFromRequest("newUpload"), uploadController);
liveRouter.get("/playlist", getPlaylistController);
liveRouter.get("/file/:fileName", getFileController);
