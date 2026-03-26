import { ethers } from "hardhat";

/**
 * Simple script that prints the connected network name and chain ID.
 *
 * Usage:
 *   npx hardhat run scripts/show-network.ts --network localhost
 *   npx hardhat run scripts/show-network.ts --network zama-dev
 */
async function main() {
  const network = await ethers.provider.getNetwork();

  console.log("Connected to network:");
  console.log(`- name: ${network.name || "unknown"}`);
  console.log(`- chainId: ${network.chainId.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
