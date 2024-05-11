// libs and modules
import { Router } from "express";
import { signUpController, accountConfirmationController, loginController, resetPasswordController, changePasswordController } from "./authController";
import { verifyJwt } from "../../middleware/verifyJwt";
import { verifyUserEmail } from "../../middleware/verifyUserEmail";

export const authRouter = Router();

authRouter.post("/signup", signUpController);

authRouter.post("/account-confirmation/:verfToken", verifyJwt, accountConfirmationController);

authRouter.post("/login", verifyUserEmail, loginController);

authRouter.post("/request-action/reset-password", verifyUserEmail, resetPasswordController);

authRouter.put("/reset-password/:resetToken", verifyJwt, changePasswordController);

authRouter.put("/change-password",verifyJwt,changePasswordController)
