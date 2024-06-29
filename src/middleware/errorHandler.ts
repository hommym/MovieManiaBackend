import { Request, Response ,NextFunction} from "express";

export const errorHandeler = (error:Error,req:Request,res:Response,next:NextFunction) => {
// console.log("Error Handler executed")
if(req.statusCode===200){
    res.status(500)
}
res.json({err:error.message})
};
