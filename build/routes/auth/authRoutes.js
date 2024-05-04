"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
// libs and modules
const express_1 = require("express");
const authController_1 = require("./authController");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/signup", authController_1.signUpController);
