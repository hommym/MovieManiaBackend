import { writeFile } from "fs/promises";
import { event } from "../constants/objects";

export const saveFileListner = () => {
  event.on("saveFile", async (file: string|Buffer, path: string) => {
    console.log("Saving a file...");
    await writeFile(path, file);
    console.log("File saved");
  });
};
