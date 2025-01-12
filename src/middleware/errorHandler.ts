import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  message: string;
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}

export const errorHandeler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // console.log("Error Handler executed")
  if (error instanceof AppError) {
    res.status(error.statusCode)
  } else {
    res.status(500);
  }
  console.log(error);
  res.json({ err: error.message });
};
