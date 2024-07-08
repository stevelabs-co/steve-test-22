import {
  HttpException as CommonHttpException,
  HttpStatus,
} from '@nestjs/common';
import { Error } from '../interfaces/error.interface';

export class HttpException extends CommonHttpException {
  constructor(error: Error, responseCode = HttpStatus.BAD_REQUEST) {
    super(error, responseCode);
  }
}
