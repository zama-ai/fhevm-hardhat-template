import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Prints accounts and their balances for the current Hardhat network.
 *
 * Usage:
 *   npx hardhat balances
 *   npx hardhat balances --network localhost
 */
task("balances", "Prints the list of accounts with their balances").setAction(
  async (_args: unknown, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const accounts = await ethers.getSigners();

    console.log(`Network: ${hre.network.name}`);
    console.log("Accounts with balances:");

    for (const account of accounts) {
      const balance = await ethers.provider.getBalance(account.address);
      const formatted = ethers.formatEther(balance);
      console.log(`- ${account.address}: ${formatted} ETH`);
    }
  },
);
