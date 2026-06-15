import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContractModule } from './contract/contract.module';
import { LoggerModule } from 'nestjs-pino';
import { loggerOptions } from './config/logger.config';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: loggerOptions.pinoHttp,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow('DB_USERNAME'),
        password: config.getOrThrow('DB_PASSWORD'),
        database: config.getOrThrow('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('MAIL_HOST'),
          port: config.getOrThrow<number>('MAIL_PORT'),
          secure: true,
          auth: {
            user: config.getOrThrow('MAIL_USERNAME'),
            pass: config.getOrThrow('MAIL_PASSWORD'),
          },
        },
      }),
    }),
    AuthModule,
    UserModule,
    MailModule,
    ContractModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
