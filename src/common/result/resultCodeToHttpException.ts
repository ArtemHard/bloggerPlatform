import { ResultStatus } from "./resultCode";
import { HttpStatuses } from "../types/httpStatuses";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
  switch (resultCode) {
    case ResultStatus.BadRequest:
      return HttpStatuses.BadRequest;
    case ResultStatus.Forbidden:
      return HttpStatuses.Forbidden;
    default:
      return HttpStatuses.ServerError;
  }
};
