// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/jpyc/:address')
  getJpcyBalance(@Param('address') param: any): any {
    return this.appService.getJpycBalance(param);
  }

  // biconomy gsn
  @Get('/biconomy-gsn/balance')
  getGasBalance(): any {
    return this.appService.getGasBalance();
  }
}
