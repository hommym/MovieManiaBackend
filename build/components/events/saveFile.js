"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFileListner = void 0;
const promises_1 = require("fs/promises");
const objects_1 = require("../constants/objects");
const saveFileListner = () => {
    objects_1.event.on("saveFile", (file, path) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Saving a file...");
        yield (0, promises_1.writeFile)(path, file);
        console.log("File saved");
    }));
};
exports.saveFileListner = saveFileListner;
