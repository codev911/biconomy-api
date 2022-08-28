// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from '@nestjs/common';
import { Biconomy } from '@biconomy/mexa';
import { ethers } from 'ethers';
import { ExternalProvider } from './app.module';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AppService {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  private confNetwork = require('./networkconfig.json');
  private rpcProvider = new ethers.providers.JsonRpcProvider(
    this.confNetwork.url,
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  private confContract = require('./contractconfig.json');
  private jpycCompiledData = require('./jpycabi.json');
  private nftCompiledData = require('./nftabi.json');
  private gasTankCompiledData = require('./gastankabi.json');
  private jpcyForwardCompiledData = require('./jpycforwardabi.json');
  // Endpoint area
  getHello(): string {
    return 'NFT Endpoint GFA';
  }

  async getJpycBalance(address: string): Promise<any> {
    if (ethers.utils.isAddress(address)) {
      const jpyc = await this.createJpycContract(this.rpcProvider);
      const info = await Promise.all([
        jpyc.functions.balanceOf(address),
        jpyc.functions.decimals(),
      ]);
      const humanBalance = parseInt(
        ethers.utils.formatUnits(info[0][0], info[1][0]),
      );
      return { jpycBalance: humanBalance };
    } else {
      throw 'invalid address provided!';
    }
  }

  async getGasBalance(): Promise<any> {
    const biconomyGas = await this.createGasTankContract(this.rpcProvider);
    const balance = await biconomyGas.functions.dappBalances(
      process.env.FUNDKEY,
    );
    return balance;
  }

  // private area
  private createGasTankContract(provider: any): any {
    try {
      return new ethers.Contract(
        this.confContract.gasTank,
        this.gasTankCompiledData,
        provider,
      );
    } catch {
      throw 'invalid provider';
    }
  }
  private createJpycForwarderContract(provider: any): any {
    try {
      return new ethers.Contract(
        this.confContract.jpycForwarder,
        this.jpcyForwardCompiledData,
        provider,
      );
    } catch {
      throw 'invalid provider';
    }
  }
  private createJpycContract(provider: any): any {
    try {
      return new ethers.Contract(
        this.confContract.jpyc,
        this.jpycCompiledData,
        provider,
      );
    } catch {
      throw 'invalid provider';
    }
  }
  private createNftContract(provider: any): any {
    try {
      return new ethers.Contract(
        this.confContract.erc1155,
        this.nftCompiledData,
        provider,
      );
    } catch {
      throw 'invalid provider';
    }
  }
  private async createBiconomyProvider(
    caller: string,
    apikey: string,
  ): Promise<any> {
    let signer;

    try {
      signer = new ethers.Wallet(caller);
    } catch {
      throw 'This caller is not correct private key';
    }

    const providerRpcSigner = new ethers.providers.JsonRpcSigner(
      signer,
      this.rpcProvider,
    );
    // const web3HttpProvider = await require('web3-providers-http');
    // const providerWeb3Http = await new web3HttpProvider(this.confNetwork.url);

    try {
      return new Biconomy(providerRpcSigner as ExternalProvider, {
        apiKey: apikey,
        contractAddresses: [
          this.confContract.erc1155,
          this.confContract.jpycForwarder,
        ],
      }).ethersProvider;
    } catch (e) {
      throw e;
    }
  }
}
