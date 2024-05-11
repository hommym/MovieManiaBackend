"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = void 0;
const jwt_1 = require("../libs/jwt");
const verifyJwt = (req, res, next) => {
    let jwtData = null;
    console.log("Jwt verification began....");
    try {
        if (req.params.verfToken !== undefined) {
            jwtData = (0, jwt_1.verifyToken)(req.params.verfToken);
            console.log("Jwt token Verified");
            req.body.id = jwtData.userId;
            req.body.verfcode = jwtData.code;
        }
        else if (req.headers !== undefined && req.headers.authorization !== undefined) {
            if (!req.headers.authorization.includes("Bearer")) {
                throw new Error("Bad Request Bearer scheme not found");
            }
            jwtData = (0, jwt_1.verifyToken)(req.headers.authorization.split(" ")[1]);
            console.log("Jwt token Verified");
            req.body.id = jwtData.userId;
        }
        else {
            throw new Error("Bad Request Authorization Header not defined");
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyJwt = verifyJwt;