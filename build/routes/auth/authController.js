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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountConfirmationController = exports.signUpController = void 0;
// libs
const userSchema_1 = require("../../schemas/userSchema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = require("../../libs/nodemailer");
const mongoose_1 = require("../../libs/mongoose");
const signUpController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientData = req.body;
        // hashing password
        clientData.password = yield bcrypt_1.default.hash(clientData.password, 10);
        // checking if account already existed
        const emailsInDatabase = yield userSchema_1.UserSchema.find({ email: clientData.email });
        // console.log(userNamesInDatabase,workEmailsInDatabase)
        if (emailsInDatabase.length !== 0) {
            res.status(409).json({ message: "Account with this email already exist" });
        }
        else {
            // saving data in database
            const savedDocument = yield userSchema_1.UserSchema.create(clientData);
            console.log("account created successfully");
            req.body.user = savedDocument;
            // sending confirmation email
            yield (0, nodemailer_1.sendConfirmationMessage)({ to: req.body.user.email, subject: "MovieMania Account Confirmation Email" }, req.body.user._id);
            res.status(200).json({ isAccountCreated: true });
        }
    }
    catch (error) {
        console.log(error);
        res.status(400);
        next(new Error("The request is missing required fields"));
    }
});
exports.signUpController = signUpController;
const accountConfirmationController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // updating user data
        yield userSchema_1.UserSchema.updateOne({ _id: (0, mongoose_1.tObjectId)(req.body.id) }, { $set: { isVerified: true, verfCode: 0 } });
        res.status(200).json({ message: "User Account Confirmed successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.accountConfirmationController = accountConfirmationController;
