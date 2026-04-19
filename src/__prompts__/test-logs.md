import { NextFunction, Request, Response } from 'express';
import { requestLogsRepository } from '../repositories/request-logs.repositories';
import { EHttpStatus } from './../../core/constants/http';
import { getRequestIp } from '../../core/utils/getRequestIp';

type TArgs = {
attemptsLimit: number;
timeWindowDurationSeconds: number;
};

const DEFAULT_ATTEMPTS_LIMIT = 5;
const DEFAULT_TIME_WINDOW_DURATION_SECONDS = 10;

export const getRateLimitMiddleware =
(args?: TArgs) => async (req: Request, res: Response, next: NextFunction) => {
const attemptsLimit = args?.attemptsLimit || DEFAULT_ATTEMPTS_LIMIT;
const timeWindowDurationSeconds =
args?.timeWindowDurationSeconds || DEFAULT_TIME_WINDOW_DURATION_SECONDS;

    const ip = getRequestIp(req);
    const url = req.originalUrl;

    await requestLogsRepository.addRequestLog({ ip, url, date: new Date() });

    const requestsCount = await requestLogsRepository.getRequestByFilterCount({
      ip,
      url,
      timeWindowDurationSeconds,
    });

    if (requestsCount > attemptsLimit) {
      return res.sendStatus(EHttpStatus.MANY_REQUESTS_429);
    }

    next();

};

import { sub } from 'date-fns';
import { requestLogsCollection } from '../../db/mongo.db';
import { TRequestLogsDB } from '../domain/request-logs-db';

export const requestLogsRepository = {
async addRequestLog(log: TRequestLogsDB): Promise<string> {
const { insertedId } = await requestLogsCollection.insertOne(log);

    return insertedId.toString();

},

async getRequestByFilterCount(
filter: { timeWindowDurationSeconds: number } & Omit<
TRequestLogsDB,
'date' >,
): Promise<number> {
const count = await requestLogsCollection.countDocuments({
ip: filter.ip,
url: filter.url,
date: {
$gte: sub(new Date(), { seconds: filter.timeWindowDurationSeconds }),
},
});

    return count;

},
};
