import mongoose, { Types } from "mongoose";

export type User = {
  readonly _id?: Types.ObjectId;
  userName: string;
  email: string;
  password: string;
  userType: string;
  phone?: string | null;
  isVerified?: boolean;
  verfCode?: number;
};
