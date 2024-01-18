import { ethers } from "hardhat";

import type { ConfidentialERC20 } from "../../types";
import { getSigners } from "../signers";

export async function deployEncryptedERC20Fixture(): Promise<ConfidentialERC20> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("ConfidentialERC20");
  const contract = await contractFactory.connect(signers.alice).deploy("Naraggara", "NARA"); // City of Zama's battle
  await contract.waitForDeployment();

  return contract;
}
