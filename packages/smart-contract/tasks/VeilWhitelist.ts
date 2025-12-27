import { task } from "hardhat/config";

task("deploy:VeilWhitelist", "Deploy VeilWhitelist contract")
  .addOptionalParam("targetNetwork", "Network to deploy to", "hardhat")
  .setAction(async function (taskArgs, hre) {
    const { targetNetwork } = taskArgs;
    
    console.log(`Deploying VeilWhitelist to ${targetNetwork}...`);
    
    await hre.run("compile");
    
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    
    const VeilWhitelist = await hre.ethers.getContractFactory("VeilWhitelist");
    const veilWhitelist = await VeilWhitelist.deploy();
    
    await veilWhitelist.waitForDeployment();
    
    const address = await veilWhitelist.getAddress();
    console.log("VeilWhitelist deployed to:", address);
    
    if (targetNetwork !== "hardhat" && targetNetwork !== "anvil") {
      console.log("\nTo verify on Etherscan, run:");
      console.log(`npx hardhat verify --network ${targetNetwork} ${address}`);
    }
  });

