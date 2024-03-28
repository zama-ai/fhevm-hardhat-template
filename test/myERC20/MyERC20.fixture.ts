import { ethers } from "hardhat";

import type { MyERC20 } from "../../types";
import { getSigners } from "../signers";

export async function deployMyERC20Fixture(): Promise<MyERC20> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("MyERC20");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  return contract;
}
