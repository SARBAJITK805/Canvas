import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common_backend/config";

interface IJwtPayload extends JwtPayload {
    _id: string;
}

export interface AuthRequest extends Request {
    userId: string
}

export async function authMiddleware(req:Request, res: Response, next: NextFunction) {
    const token = req.headers["authorization"];
    try {
        const decoded = jwt.verify(token || "", JWT_SECRET as string) as IJwtPayload;
        (req as AuthRequest).userId = decoded.userId;
        return next();
    } catch (err) {
        res.status(403).json({ msg: "Invalid token" });
    }

}