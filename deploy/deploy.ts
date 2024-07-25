import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const erc20Deployed = await deploy("EncryptedERC20", {
    from: deployer,
    args: ["Naraggara", "NARA"],
    log: true,
  });

  console.log(`Encrypted ERC20 contract Address: `, erc20Deployed.address);

  const testAsyncDecryptDeployed = await deploy("TestAsyncDecrypt",{from:deployer ,args:[] ,log:true});

  console.log(`TestAsyncDecrypt contract Address: `, testAsyncDecryptDeployed.address);

};
export default func;
func.id = "deploy_confidentialERC20"; // id required to prevent reexecution
func.tags = ["MyERC20"];
