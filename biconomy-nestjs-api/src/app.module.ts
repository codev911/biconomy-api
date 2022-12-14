// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppController } from './app.controller';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppService } from './app.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AppModule {}
