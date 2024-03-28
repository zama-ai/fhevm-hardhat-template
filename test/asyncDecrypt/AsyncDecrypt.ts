import { expect } from "chai";
import { ethers } from "hardhat";

import { asyncDecrypt, awaitAllDecryptionResults } from "../asyncDecrypt";
import { getSigners, initSigners } from "../signers";

describe("TestAsyncDecrypt", function () {
  before(async function () {
    await asyncDecrypt();
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const contractFactory = await ethers.getContractFactory("MyContract");
    this.contract = await contractFactory.connect(this.signers.alice).deploy();
  });

  it("test async decrypt", async function () {
    const tx2 = await this.contract.connect(this.signers.carol).myRequest(8, 10, { gasLimit: 500_000 });
    await tx2.wait();
    await awaitAllDecryptionResults();
    const y = await this.contract.total();
    expect(y).to.equal(42 + 8 + 10);
  });
});
