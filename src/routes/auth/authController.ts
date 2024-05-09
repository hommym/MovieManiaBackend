// libs
import { UserSchema } from "../../schemas/userSchema";
import bcrypt from "bcrypt";

// Custom data types
import { Request, Response, NextFunction } from "express";
import { User } from "../../helperToools/customDataTypes";
import { sendConfirmationMessage } from "../../libs/nodemailer";
import { tObjectId } from "../../libs/mongoose";


export const signUpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientData: User = req.body;

    // hashing password
    clientData.password = await bcrypt.hash(clientData.password, 10);

    // checking if account already existed
    const emailsInDatabase: Array<User> = await UserSchema.find({ email: clientData.email });

    // console.log(userNamesInDatabase,workEmailsInDatabase)
    if (emailsInDatabase.length !== 0) {
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
    res.status(400);
    next(new Error("The request is missing required fields"));
  }
};

export const accountConfirmationController = async (req: Request, res: Response, next: NextFunction) => {



try{

// updating user data
await UserSchema.updateOne({_id:tObjectId(req.body.id)},{$set:{isVerified:true,verfCode:0}})

res.status(200).json({message:"User Account Confirmed successfully"})

}
catch(error){
next(error)
}

}
