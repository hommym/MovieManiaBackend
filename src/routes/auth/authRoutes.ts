// libs and modules
import { Router } from "express";
import { signUpController,accountConfirmationController, loginController } from "./authController";
import { verifyJwt } from "../../middleware/verifyJwt";




export const authRouter = Router();


authRouter.post("/signup",signUpController)

authRouter.post("/account-confirmation/:verfToken",verifyJwt,accountConfirmationController)

authRouter.post("/login",loginController)
