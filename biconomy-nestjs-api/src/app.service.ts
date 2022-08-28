// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from '@nestjs/common';
import { Biconomy } from '@biconomy/mexa';
import { BigNumber, ethers } from 'ethers';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AppService {
  getHello(): string {
    return 'NFT Endpoint GFA';
  }
}
