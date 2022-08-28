// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { writeFile } = require("fs/promises");
const hre = require("hardhat");
const path = require("path");
const arg = require("../arg");

async function main() {
  const Nft = await ethers.getContractFactory("ERC1155");
  const nft = await Nft.deploy(
    arg[0],
    arg[2],
    arg[3],
    arg[4]
  );
  await nft.deployed();
  console.log("Deployed NFT : ", nft.address);

  const JpycForward = await ethers.getContractFactory("JPYCGSNForwarder");
  const jpycForward = await JpycForward.deploy(
    arg[1],
    arg[0],
  );
  await jpycForward.deployed();
  console.log("Deployed JPYC Forwarder : ", jpycForward.address);

  if(hre.network.config.chainId !== undefined){
    const data = {
      trustedForwarder: arg[0],
      erc1155: nft.address,
      jpyc: arg[1],
      jpycForwarder: jpycForward.address
    }
    const data2 = {
      url: hre.network.config.url,
      chainId: hre.network.config.chainId
    }
    
    console.log("Save or Replace contract config for biconomy-nestjs-api");
    const targetpath = path.format({
      dir: path.join(__dirname + '/../../biconomy-nestjs-api/src'),
      base: 'contractconfig.json'
    });
    await writeFile(targetpath, JSON.stringify(data), (err) => {
      if(err){
        consolse.log(err);
      }
    });
  
    console.log("Save or Replace network config for biconomy-nestjs-api");
    const targetpath2 = path.format({
      dir: path.join(__dirname + '/../../biconomy-nestjs-api/src'),
      base: 'networkconfig.json'
    });
    await writeFile(targetpath2, JSON.stringify(data2), (err) => {
      if(err){
        consolse.log(err);
      }
    });
    
    console.log("Wait 40 second for block confirm before verify contract.");
    setTimeout(async () => {
      console.log("Verify NFT Contract");
      await hre.run("verify:verify", {
        address: nft.address,
        constructorArguments: [
          arg[0],
          arg[2],
          arg[3],
          arg[4]
        ],
      });

      console.log("Verify JPYC Forwarder Contract");
      await hre.run("verify:verify", {
        address: jpycForward.address,
        constructorArguments: [
          arg[1],
          arg[0],
        ],
      });
    }, 40000);
  }else{
    console.log("Skip because local")
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
