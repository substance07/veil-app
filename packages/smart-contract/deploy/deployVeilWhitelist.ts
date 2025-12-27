import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("VeilWhitelist", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });
};

func.tags = ["VeilWhitelist"];
export default func;

