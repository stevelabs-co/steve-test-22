import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
// import { WebClient } from '@slack/web-api';
import { Request } from 'express';
import { HttpException } from '../exceptions/http.exception';
import { Error } from '../interfaces/error.interface';
import { Response } from '../interfaces/response.interface';
import * as dayjs from 'dayjs';
// import { slackLogger } from '../middlewares/slack-logger.middleware';
// import { JwtService } from '@nestjs/jwt';
import * as path from 'path';
import * as fs from 'fs';
import { JwtService } from '@nestjs/jwt';

@Catch()
export class ErrorFilter<E> implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  catch(exception: E, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    //에러발생 시
    const request = ctx.getRequest();
    if (request.file) {
      const files = fs.readdirSync(path.join(__dirname, '../../uploads'));
      files.forEach((file) => {
        const filePath = path.join(__dirname, '../../uploads', file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }

    if (exception instanceof NotFoundException) {
      const request = ctx.getRequest<Request>();
      const { ip } = request;
      const userAgent = request.get('user-agent') || '';
      this.logger.log(
        `${exception.message} ${exception.getStatus()} - ${userAgent} ${ip}`,
      );
      return httpAdapter.reply(ctx.getResponse(), exception.getResponse());
    }

    this.logger.error(exception);
    console.error('exception==>', exception);

    if (
      exception instanceof HttpException ||
      exception instanceof BadRequestException
    ) {
      const httpStatus = exception.getStatus();
      const request = ctx.getRequest<Request>();
      const response = exception.getResponse() as Error;

      // 에러 발생 시 상태코드가 401(직접 지정), 500인 경우 슬랙에 로그 발송
      // if (httpStatus === 401 || httpStatus === 500) {
      //   slackLogger(this.configService, this.jwtService, ctx, exception);
      // }

      return httpAdapter.reply(
        ctx.getResponse(),
        {
          code: response.code ?? null,
          message: response.message,
          data: null,
        },
        // as Response,
        httpStatus,
      );
    }

    return httpAdapter.reply(
      ctx.getResponse(),
      {
        code: null,
        message: (exception as any).message,
        data: null,
      },
      //  as Response,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
