// libs
import { UserSchema } from "../../schemas/userSchema";
import bcrypt from "bcrypt";

// Custom data types
import { Request, Response, NextFunction } from "express";
import { User, loginCredentials } from "../../helperToools/customDataTypes";
import { sendConfirmationMessage } from "../../libs/nodemailer";
import { tObjectId } from "../../libs/mongoose";
import { jwtForLogIn } from "../../libs/jwt";

export const signUpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName, email, password, userType } = req.body;

    if (!userName || !email || !password || !userType) {
      res.status(400);
      throw new Error("Incomplete body");
    }

    const clientData: User = req.body;

    // hashing password
    clientData.password = await bcrypt.hash(clientData.password, 10);

    // checking if account already existed
    const accountsInDatabase: Array<User> = await UserSchema.find({ email: clientData.email });

    // console.log(userNamesInDatabase,workaccountsInDatabase)
    if (accountsInDatabase.length !== 0) {
      res.status(409).json({ message: "Account with this email already exist" });
    } else {
      // saving data in database
      const savedDocument: User = await UserSchema.create(clientData);
      console.log("account created successfully");
      req.body.user = savedDocument;

      // sending confirmation email
      await sendConfirmationMessage({ to: req.body.user.email, subject: "MovieMania Account Confirmation Email" }, req.body.user._id);

      res.status(200).json({ isAccountCreated: true });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const accountConfirmationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // updating user data
    await UserSchema.updateOne({ _id: tObjectId(req.body.id) }, { $set: { isVerified: true, verfCode: 0 } });

    res.status(200).json({ message: "User Account Verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  console.log("A User is been Authenticated...");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Incomplete body");
    }
    const logInDetails: loginCredentials = req.body;
    console.log("Checking if account exist...");
    // checking if account already existed
    const accountsInDatabase: Array<User> = await UserSchema.find({ email: logInDetails.email });
    if (accountsInDatabase.length === 0) {
      console.log("Account does not exist");
      res.status(409).json({ message: "Invalid email and password" });
    } else {
      console.log("Account exist");

      console.log("Checking if password is correct...");
      const isPasswordCorrect = await bcrypt.compare(logInDetails.password, accountsInDatabase[0].password);

      if (!isPasswordCorrect) {
        console.log("Password Invalid");
        res.status(409);
        throw new Error("Invalid email and password");
      }
      console.log("Password Correct");
      console.log("User Authorized");
      // creating jwt for authorized use
      res.status(200).json({ message: "Login successful", token: jwtForLogIn(String(accountsInDatabase[0]._id)) });
    }
  } catch (error) {
    next(error);
  }
};
