// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from '@nestjs/common';
import { ethers, BigNumber } from 'ethers';
import axios from 'axios';
// import { Biconomy } from '@biconomy/mexa';
// import { ExternalProvider } from './app.module';
// import * as web3http from 'web3-providers-http';

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
  private gasTankForwarderCompiledData = require('./gastankforwarderabi.json');
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
      return { address: address, jpycBalance: humanBalance };
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
  async sendJpycGsn(
    caller: string,
    to: string,
    value: number,
    nonce: string,
  ): Promise<any> {
    let signer;

    try {
      signer = new ethers.Wallet(caller);
    } catch (e) {
      throw 'Invalid caller private key!';
    }

    if (ethers.utils.isAddress(to)) {
      try {
        const jpycContract = await this.createJpycForwarderContract(
          this.rpcProvider,
        );
        const expired = new Date().getTime() / 1000 + 3600;
        const domain = {
          name: 'JPY Coin',
          version: '1',
          chainId: this.confNetwork.chainId,
          verifyingContract: this.confContract.jpyc,
        };
        const TransferWithAuthorization = [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ];
        const types = { TransferWithAuthorization };
        const message = {
          from: signer.address,
          to: to,
          value: ethers.utils.parseEther(value.toString()),
          validAfter: 0,
          validBefore: expired.toFixed(0),
          nonce: nonce,
        };

        const signature = await signer._signTypedData(domain, types, message);

        const v = '0x' + signature.slice(130, 132);
        const r = signature.slice(0, 66);
        const s = '0x' + signature.slice(66, 130);

        const datapopulated =
          await jpycContract.populateTransaction.forwardTransactionWithPermit(
            signer.address,
            to,
            ethers.utils.parseEther(value.toString()),
            0,
            expired.toFixed(0),
            nonce,
            v,
            r,
            s,
          );
        const estimateGas =
          await jpycContract.estimateGas.forwardTransactionWithPermit(
            signer.address,
            to,
            ethers.utils.parseEther(value.toString()),
            0,
            expired.toFixed(0),
            nonce,
            v,
            r,
            s,
          );
        return this.createBiconomyTransaction(
          caller,
          datapopulated.to,
          estimateGas,
          datapopulated.data,
        );
      } catch (e: any) {
        return e;
      }
    } else {
      return 'Invalid address param!';
    }
  }

  // private area
  private createGasTankForwarderContract(provider: any): any {
    try {
      return new ethers.Contract(
        this.confContract.trustedForwarder,
        this.gasTankForwarderCompiledData,
        provider,
      );
    } catch {
      throw 'invalid provider';
    }
  }
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
  private async createBiconomyTransaction(
    caller: string,
    to: string,
    gasLimit: BigNumber,
    datainput: string,
  ): Promise<any> {
    let signer;
    const isSc = await this.rpcProvider.getCode(to);

    try {
      signer = new ethers.Wallet(caller);
    } catch {
      throw 'This caller is not correct private key';
    }

    if (!ethers.utils.isAddress(to) || !(isSc.length > 2)) {
      throw 'target address is not smartcontract address';
    }

    try {
      const forwarderContract = await this.createGasTankForwarderContract(
        this.rpcProvider,
      );
      const getNonce = await forwarderContract.functions.getNonce(
        signer.address,
        process.env.FUNDKEY,
      );

      const biconomyForwarderDomainData = {
        name: 'Biconomy Forwarder',
        version: '1',
        verifyingContract: this.confContract.trustedForwarder,
        salt: ethers.utils.hexZeroPad(
          ethers.BigNumber.from(this.confNetwork.chainId).toHexString(),
          32,
        ),
      };
      const ERC20ForwardRequest = [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'txGas', type: 'uint256' },
        { name: 'tokenGasPrice', type: 'uint256' },
        { name: 'batchId', type: 'uint256' },
        { name: 'batchNonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ];
      const types = { ERC20ForwardRequest };
      const request = {
        from: signer.address,
        to: to,
        token: ethers.constants.AddressZero,
        txGas: gasLimit,
        tokenGasPrice: '0',
        batchId: parseInt(process.env.FUNDKEY),
        batchNonce: parseInt(getNonce),
        deadline: Math.floor(Date.now() / 1000 + 3600),
        data: datainput,
      };
      const signature = await signer._signTypedData(
        biconomyForwarderDomainData,
        types,
        request,
      );
      const domainSeparator = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'address', 'bytes32'],
          [
            ethers.utils.id(
              'EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)',
            ),
            ethers.utils.id(biconomyForwarderDomainData.name),
            ethers.utils.id(biconomyForwarderDomainData.version),
            biconomyForwarderDomainData.verifyingContract,
            biconomyForwarderDomainData.salt,
          ],
        ),
      );

      const param = [request, domainSeparator, signature];
      const { data } = await axios.post(
        'https://api.biconomy.io/api/v2/meta-tx/native',
        JSON.stringify({
          to: to,
          apiId: process.env.API,
          params: param,
          from: signer.address,
          signatureType: 'EIP712_SIGN',
        }),
        {
          headers: {
            'x-api-key': process.env.API,
            'Content-Type': 'application/json;charset=utf-8',
          },
        },
      );

      return data;
    } catch (e) {
      throw e;
    }
  }
}
