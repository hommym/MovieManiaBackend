"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpAllEventListners = void 0;
const saveFile_1 = require("./saveFile");
const setUpAllEventListners = () => {
    console.log("Setting up all event listeners...");
    (0, saveFile_1.saveFileListner)();
    console.log("Setup done");
};
exports.setUpAllEventListners = setUpAllEventListners;
