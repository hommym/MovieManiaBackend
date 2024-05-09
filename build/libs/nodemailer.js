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
exports.sendConfirmationMessage = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const userSchema_1 = require("../schemas/userSchema");
const jwt_1 = require("./jwt");
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SmtpUserName,
        pass: process.env.SmtpSecret,
    },
});
const sendConfirmationMessage = (emailData, id) => __awaiter(void 0, void 0, void 0, function* () {
    // creating confirmation message with onfirmation url
    const randomNumberForVerfCode = Math.floor(Math.random() * 90000) + 10000;
    // setting verfCode
    yield userSchema_1.UserSchema.updateOne({ _id: id }, { $set: { verfCode: randomNumberForVerfCode } });
    console.log("Verfication for account set..");
    //   setting message
    emailData.text = `Hi thank you for registering for MovieMania Account \n \n To complete the account creation process please click the link below \n \n ${process.env.BaseUrl}/${(0, jwt_1.jwtForSignUp)(String(id), randomNumberForVerfCode)}`;
    // sending mail
    yield transporter.sendMail(emailData);
});
exports.sendConfirmationMessage = sendConfirmationMessage;
