// libs and modules
import { Router } from "express";
import { signUpController } from "./authController";




export const authRouter = Router();


authRouter.post("/signup",signUpController)
