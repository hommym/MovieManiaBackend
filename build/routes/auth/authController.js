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
exports.signUpController = void 0;
// libs
const userSchema_1 = require("../../schemas/userSchema");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
            // create a method for sending confirmation email(not IMP yet)
            res.status(200).json({ isAccountCreated: true });
        }
    }
    catch (error) {
        res.status(400);
        next(new Error("The request is missing required fields"));
    }
});
exports.signUpController = signUpController;
