import { HttpStatus } from "../../core/types/http-statuses";
import { ResultStatus } from "./resultCode";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
  switch (resultCode) {
    case ResultStatus.BadRequest:
      return HttpStatus.BadRequest;
    case ResultStatus.NotFound:
      return HttpStatus.Unauthorized;
    case ResultStatus.Unauthorized:
      return HttpStatus.Unauthorized;
    case ResultStatus.Forbidden:
      return HttpStatus.Forbidden;
    default:
      return HttpStatus.InternalServerError;
  }
};

export const resultCodeToHttpExceptionForDevices = (resultCode: ResultStatus): number => {
  switch (resultCode) {
    case ResultStatus.BadRequest:
      return HttpStatus.BadRequest;
    case ResultStatus.NotFound:
      return HttpStatus.NotFound;
    case ResultStatus.Unauthorized:
      return HttpStatus.Unauthorized;
    case ResultStatus.Forbidden:
      return HttpStatus.Forbidden;
    default:
      return HttpStatus.InternalServerError;
  }
};