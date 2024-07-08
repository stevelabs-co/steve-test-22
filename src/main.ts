import { NestFactory, Reflector, HttpAdapterHost } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ErrorFilter } from './shared/filters/error.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
// import * as session from 'express-session';
import { JwtService } from '@nestjs/jwt';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';
// import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.use(cookieParser());

  // CORS 설정
  const corsOptions: CorsOptions = {
    origin: ['http://localhost:3000'], // 프론트엔드 앱의 도메인을 지정
    credentials: true, // 인증 정보 (쿠키 등)를 포함할 경우 true로 설정
  };
  app.enableCors(corsOptions);

  /**
   * env
   */
  const configService = app.get<ConfigService>(ConfigService);

  /**
   * jwt
   */
  const jwtService = app.get<JwtService>(JwtService);

  app.setGlobalPrefix('api');

  const isLocal = configService.getOrThrow<string>('APP_ENV') === 'local';

  /**
   * 프록시 있는 경우
   */
  if (!isLocal) {
    app.set('trust proxy', 1);
  }

  /**
   * 인터셉터 추가
   */
  app.useGlobalInterceptors(new ResponseInterceptor());

  // const serviceDocument = SwaggerModule.createDocument(
  //   app,
  //   new DocumentBuilder().setTitle('cando').setDescription('cando API description').setVersion('1.0').build()
  // );
  // SwaggerModule.setup('/services/docs', app, serviceDocument);
  // const adminDocument = SwaggerModule.createDocument(
  //   app,
  //   new DocumentBuilder()
  //     .setTitle('cando admin')
  //     .setDescription('cando admin API description')
  //     .setVersion('1.0')
  //     .build()
  // );
  // SwaggerModule.setup('/admins/docs', app, adminDocument);

  // app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));

  app.useGlobalPipes(
    new ValidationPipe({
      // 타입 변환
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // 화이트리스트 에러
      forbidNonWhitelisted: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  /**
   * 에러 필터링
   */
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorFilter(httpAdapter, configService, jwtService));

  /**
   * 버전관리
   */
  app.enableVersioning({ type: VersioningType.URI });

  /**
   * http 보안
   */
  app.use(
    // 압축
    compression(),
    // 보안
    helmet(),
    // 요청 제한
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10000, // limit each IP to 100 requests per windowMs
    }),
    // 세션
    // session({
    //   secret: configService.getOrThrow<string>('APP_SESSION_SECRET'),
    //   resave: false,
    //   saveUninitialized: false,
    // store: new RedisStore({
    //   client: new Redis({
    //     host: configService.getOrThrow<string>('REDIS_HOST'),
    //     port: configService.getOrThrow<number>('REDIS_PORT')
    //   })
    // }),
    // cookie: {
    //   secure: isLocal ? false : true,
    //   httpOnly: true
    // }
    // })
  );

  await app.listen(configService.getOrThrow<number>('APP_PORT'), '0.0.0.0');
}
bootstrap();
