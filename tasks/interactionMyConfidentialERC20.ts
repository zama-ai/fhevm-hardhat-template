import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { reencryptEuint64 } from "../test/reencrypt";
import { MyConfidentialERC20 } from "../types";
import { createInstance } from "./instance.ts";

task("mint")
  .addParam("amount", "Tokens to mint")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    try {
      const { ethers, deployments } = hre;

      // Validate input
      const amount = Number(taskArguments.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      // Get contract and signer
      const ERC20 = await deployments.get("MyConfidentialERC20");
      const signers = await ethers.getSigners();
      const erc20 = (await ethers.getContractAt("MyConfidentialERC20", ERC20.address)) as MyConfidentialERC20;

      console.info("Starting mint process...");
      console.info(`Contract address: ${ERC20.address}`);
      console.info(`Minting ${amount} tokens to address: ${signers[0].address}`);

      const tx = await erc20.connect(signers[0]).mint(signers[0], amount);
      console.info("Transaction submitted, waiting for confirmation...");

      const rcpt = await tx.wait();
      console.info("✅ Mint transaction successful!");
      console.info("Transaction hash:", rcpt!.hash);
      console.info(`${amount} tokens were minted to ${signers[0].address}`);
    } catch (error) {
      console.error("❌ Mint failed:");
      console.error(error instanceof Error ? error.message : error);
      throw error;
    }
  });

task("balance")
  .addParam("privatekey", "Private key of the address to check balance for")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    try {
      const { ethers, deployments } = hre;

      // Create wallet from private key and get address
      const wallet = new ethers.Wallet(taskArguments.privatekey);
      const address = wallet.address;

      console.info("Checking balance for address:", address);

      // Get contract
      const ERC20 = await deployments.get("MyConfidentialERC20");
      const erc20 = (await ethers.getContractAt("MyConfidentialERC20", ERC20.address)) as MyConfidentialERC20;

      const fhevm = await createInstance(hre);

      // Get balance handle
      const balanceHandle = await erc20.balanceOf(address);
      console.info("✅ Retrieved balance handle successfully");

      let balance;
      // Check if the handle is 0
      if (balanceHandle === 0n) {
        balance = 0n;
      } else {
        // Reencrypt and display balance using the wallet derived from private key
        balance = await reencryptEuint64(wallet, fhevm, balanceHandle, ERC20.address);
      }

      console.info("----------------------------------------");
      console.info(`Address: ${address}`);
      console.info(`Balance: ${balance.toString()} tokens`);
      console.info("----------------------------------------");
    } catch (error) {
      console.error("❌ Balance check failed:");
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

task("transfer")
  .addParam("to", "Recipient address")
  .addParam("amount", "Amount to transfer")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    try {
      const { ethers, deployments } = hre;

      // Validate inputs
      if (!ethers.isAddress(taskArguments.to)) {
        throw new Error("Invalid recipient address format");
      }

      const amount = Number(taskArguments.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      console.info("Starting transfer process...");

      const ERC20 = await deployments.get("MyConfidentialERC20");
      const signers = await ethers.getSigners();
      const erc20 = (await ethers.getContractAt("MyConfidentialERC20", ERC20.address)) as MyConfidentialERC20;

      console.info(`Contract address: ${ERC20.address}`);
      console.info(`From: ${signers[0].address}`);
      console.info(`To: ${taskArguments.to}`);
      console.info(`Amount: ${amount} tokens`);

      // Create and encrypt the transfer amount
      const instance = await createInstance(hre);
      const input = instance.createEncryptedInput(ERC20.address, signers[0].address);
      input.add64(amount);
      const encryptedAmount = await input.encrypt();

      console.info("Submitting transfer transaction...");
      const tx = await erc20
        .connect(signers[0])
        ["transfer(address,bytes32,bytes)"](taskArguments.to, encryptedAmount.handles[0], encryptedAmount.inputProof);

      console.info("Waiting for confirmation...");
      const rcpt = await tx.wait();

      console.info("----------------------------------------");
      console.info("✅ Transfer successful!");
      console.info("Transaction hash:", rcpt!.hash);
      console.info(`Transferred ${amount} tokens to ${taskArguments.to}`);
      console.info("----------------------------------------");
    } catch (error) {
      console.error("❌ Transfer failed:");
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });
