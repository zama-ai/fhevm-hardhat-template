import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:mint")
  .addParam("mint", "Tokens to mint")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const signers = await ethers.getSigners();
    const ConfidentialERC20 = await deployments.get("ConfidentialERC20");

    const encryptedERC20 = await ethers.getContractAt("ConfidentialERC20", ConfidentialERC20.address);

    await encryptedERC20.connect(signers[0]).mint(+taskArguments.mint);

    console.log("Mint done: ", taskArguments.mint);
  });
