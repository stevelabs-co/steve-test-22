import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService
  extends PrismaClient<PrismaClientOptions, 'query'>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log: [
        { emit: 'stdout', level: 'query' },
        // { emit: 'stdout', level: 'info' },
        // { emit: 'stdout', level: 'warn' },
        // { emit: 'stdout', level: 'error' },
      ],
    });
  }
  async onModuleInit() {
    // this.enableLogs();

    // todo 관리자 초기 생성 아이디 비번

    await this.$connect();
  }

  private enableLogs() {
    if (this.configService.getOrThrow<string>('APP_ENV') !== 'prod') {
      this.$on('query', (event) => {
        // 빈배열일때는 로그를 찍지 않는다.
        // const isEmpty = event.params.length === 2
        // if (event.params.length !== 2) {
        this.logger.log(event.query);
        this.logger.log(event.params);
        // this.logger.log({
        //   param: JSON.parse(event.params),
        //   duration: event.duration,
        // });
        // }
      });
    }
  }
}
