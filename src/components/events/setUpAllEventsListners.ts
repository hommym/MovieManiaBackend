import { saveFileListner } from "./saveFile";

export const setUpAllEventListners = () => {
  console.log("Setting up all event listeners...");
  saveFileListner();
  console.log("Setup done");
};
