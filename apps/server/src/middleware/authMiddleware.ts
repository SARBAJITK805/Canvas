import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface IJwtPayload extends JwtPayload {
    _id: string;
}

export interface IGetUserAuthInfoRequest extends Request {
    userId: string
}

export async function authMiddleware(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
    const token = req.headers["authorization"];
    const decoded = await jwt.verify(token || "", JWT_SECRET) as IJwtPayload
    if (decoded) {
        req.userId = decoded.userId
        next()
    } else {
        //unauthorized
        res.status(403).json({
            mgs:"Error in auth middleware"
        })
    }
}