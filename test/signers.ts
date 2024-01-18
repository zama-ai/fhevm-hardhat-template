import { NonceManager } from "ethers";
import { ethers } from "hardhat";

// Module augmentation to add 'address' to NonceManager
declare module "ethers" {
  interface NonceManager {
    address: string;
  }
}

// Extend the NonceManager prototype
Object.defineProperty(ethers.NonceManager.prototype, "address", {
  get: function () {
    return this.signer.address;
  },
  enumerable: true,
});

export interface Signers {
  alice: NonceManager;
  bob: NonceManager;
  carol: NonceManager;
  dave: NonceManager;
  eve: NonceManager;
}

let signers: Signers;

export const initSigners = async (): Promise<void> => {
  if (!signers) {
    const eSigners = await ethers.getSigners();
    signers = {
      alice: new NonceManager(eSigners[0]),
      bob: new NonceManager(eSigners[1]),
      carol: new NonceManager(eSigners[2]),
      dave: new NonceManager(eSigners[3]),
      eve: new NonceManager(eSigners[4]),
    };
  }
};

export const getSigners = async (): Promise<Signers> => {
  return signers;
};
