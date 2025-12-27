import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying VeilWhitelist with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const VeilWhitelist = await ethers.getContractFactory("VeilWhitelist");
  const veilWhitelist = await VeilWhitelist.deploy();

  await veilWhitelist.waitForDeployment();

  const address = await veilWhitelist.getAddress();
  console.log("VeilWhitelist deployed to:", address);

  // Verify deployment
  const code = await ethers.provider.getCode(address);
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  
  console.log("Deployment successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

