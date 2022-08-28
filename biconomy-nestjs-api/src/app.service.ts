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
    const readableBalance = parseInt(ethers.utils.formatEther(balance[0]));
    return { gasBalance: readableBalance };
  }
  async getUserBalancePost(address: string, nftId: any[]): Promise<any> {
    if (ethers.utils.isAddress(address)) {
      const nftContract = await this.createNftContract(this.rpcProvider);
      const data = {
        address: address,
        balance: null,
      };
      const ids = [];
      const accounts = [];
      const getExistCall: any = [];

      for (let a = 0; a < nftId.length; a++) {
        const cvToBig = ethers.BigNumber.from(nftId[a].toString());
        getExistCall.push(nftContract.functions.exists(cvToBig));
      }

      const getExist = await Promise.all(getExistCall);

      for (let a = 0; a < getExist.length; a++) {
        if (getExist[a][0]) {
          ids.push(nftId[a]);
          accounts.push(address);
        }
      }

      const bal = await nftContract.functions.balanceOfBatch(accounts, ids);
      const cvBal = [];

      for (let b = 0; b < bal[0].length; b++) {
        cvBal.push(parseInt(bal[0][b].toString()));
      }

      const newId = [];
      const newBal = [];

      for (let c = 0; c < cvBal.length; c++) {
        if (cvBal[c] !== 0) {
          newId.push(ids[c]);
          newBal.push(cvBal[c]);
        }
      }

      data.balance = {
        ids: newId,
        amounts: newBal,
      };

      return data;
    } else {
      return 'Invalid address param!';
    }
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
