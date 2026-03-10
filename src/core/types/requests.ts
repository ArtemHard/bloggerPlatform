import { Request } from "express";

export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;