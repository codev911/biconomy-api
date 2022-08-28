require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://localhost:8545"
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: [
        "0xaa9a2295b27de8507d3024f5a0baa7afd78c2c497d874f499336ae1dbf32c2ad"
      ]
    },
    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [
        "0xaa9a2295b27de8507d3024f5a0baa7afd78c2c497d874f499336ae1dbf32c2ad"
      ]
    }
  },
  etherscan: {
    apiKey: "EP56D8EPKQTQP8ZUQGI7ZJSCR5ND83UHZG" // polygonscan.com
    // apiKey: "G6PTA2Q5WRCTB275969G54XYJ1RXFPK6EX" // etherscan.io
  }
};
