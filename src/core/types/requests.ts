import { Request } from "express";
import { IdType } from "./id";

export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;
export type RequestWithUserId<U extends IdType> = Request<{}, {}, {}, {}, U>;
export type RequestWithDeviceId = Request<{}, {}, {}, {}, { deviceId: string }>;