// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppController } from './app.controller';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AppModule {}
