import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVeilWhitelist: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying VeilWhitelist with account:", deployer);

  const deployResult = await deploy("VeilWhitelist", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("VeilWhitelist deployed to:", deployResult.address);
};

export default deployVeilWhitelist;
deployVeilWhitelist.tags = ["VeilWhitelist"];

