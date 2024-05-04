// libs
import { UserSchema } from "../../schemas/userSchema";
import bcrypt from "bcrypt";

// Custom data types
import { Request, Response, NextFunction } from "express";
import { User } from "../../helperToools/customDataTypes";

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
    }
    else{
      // saving data in database
      const savedDocument: User = await UserSchema.create(clientData);
      console.log("account created successfully");
      req.body.user = savedDocument;


        // create a method for sending confirmation email(not IMP yet)


     res.status(200).json({isAccountCreated:true})
    }


  } catch (error) {
    res.status(400);
    next(new Error("The request is missing required fields"));
  }
};
