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

export type ExternalProvider = {
  isMetaMask?: boolean;
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void,
  ) => void;
  send?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void,
  ) => void;
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>;
};
