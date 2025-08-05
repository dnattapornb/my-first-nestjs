import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { IsUniqueConstraint } from './common/validators/is-unique.constraint';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
        // uri: configService.get<string>('MONGODB_URI'),
        // user: configService.get<string>('MONGODB_USER'),
        // pass: configService.get<string>('MONGODB_PASS'),
        // dbName: configService.get<string>('MONGODB_DATABASE'),
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    UsersModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
