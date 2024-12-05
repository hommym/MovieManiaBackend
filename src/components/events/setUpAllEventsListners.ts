import { ScheduleLiveListener } from "./live";
import { saveFileListner } from "./saveFile";

export const setUpAllEventListners = () => {
  console.log("Setting up all event listeners...");
  saveFileListner();
  ScheduleLiveListener();
  console.log("Setup done");
};
