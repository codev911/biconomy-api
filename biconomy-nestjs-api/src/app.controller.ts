// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/nft/balance')
  getBalancePost(
    @Body('address') address: string,
    @Body('nftId') nftId: any[],
  ) {
    return this.appService.getUserBalancePost(address, nftId);
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
  @Post('/biconomy-gsn/jpyc/transfer')
  sendJpycGsn(
    @Body('caller') caller: string,
    @Body('to') to: string,
    @Body('value') value: number,
    @Body('nonce') nonce: string,
  ) {
    return this.appService.sendJpycGsn(caller, to, value, nonce);
  }
}
