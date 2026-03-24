import {NextFunction, Request, Response} from "express";

export const ADMIN_LOGIN = "admin";
export const ADMIN_PASS = "qwerty";
export const ADMIN_TOKEN = 'Basic ' + Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASS}`).toString('base64');

export const baseAuthGuard = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.headers.authorization !== ADMIN_TOKEN) return res.sendStatus(401);

    return next();
};