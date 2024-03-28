import { expect } from "chai";
import { ethers, network } from "hardhat";

import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployMyERC20Fixture } from "./MyERC20.fixture";

describe("MyERC20", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const contract = await deployMyERC20Fixture();
    this.contractAddress = await contract.getAddress();
    this.erc20 = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  it("should read token name and symbol", async function () {
    const name = await this.erc20.name();
    expect(name, "Naraggara");
    const symbol = await this.erc20.symbol();
    expect(symbol, "NARA");
  });

  it("should get own balance and total supply", async function () {
    const token = this.instances.alice.getPublicKey(this.contractAddress)!;
    const encryptedBalance = await this.erc20.balanceOf(this.signers.alice, token.publicKey, token.signature);
    // Decrypt the balance
    const balance = this.instances.alice.decrypt(this.contractAddress, encryptedBalance);
    expect(balance).to.equal(1000000);

    const totalSupply = await this.erc20.totalSupply();
    expect(totalSupply).to.equal(1000000);
  });

  it("should transfer tokens between two users", async function () {
    const encryptedTransferAmount = this.instances.alice.encrypt64(1337);
    const tx = await this.erc20["transfer(address,bytes)"](this.signers.bob.address, encryptedTransferAmount);
    await tx.wait();

    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress)!;

    const encryptedBalanceAlice = await this.erc20.balanceOf(
      this.signers.alice,
      tokenAlice.publicKey,
      tokenAlice.signature,
    );

    // Decrypt the balance
    const balanceAlice = this.instances.alice.decrypt(this.contractAddress, encryptedBalanceAlice);

    expect(balanceAlice).to.equal(1000000 - 1337);

    const bobErc20 = this.erc20.connect(this.signers.bob);

    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;

    const encryptedBalanceBob = await bobErc20.balanceOf(this.signers.bob, tokenBob.publicKey, tokenBob.signature);

    // Decrypt the balance
    const balanceBob = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob);

    expect(balanceBob).to.equal(1337);
  });

  it("should only be able to read own balance", async function () {
    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress)!;

    // Alice cannot decrypt Bob's balance
    await expect(this.erc20.balanceOf(this.signers.bob, tokenAlice.publicKey, tokenAlice.signature)).to.be.revertedWith(
      "User cannot reencrypt a non-owned wallet balance",
    );

    // Alice cannot read her own balance with an invalid EIP-712 signature
    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;
    await expect(this.erc20.balanceOf(this.signers.alice, tokenBob.publicKey, tokenBob.signature)).to.be.revertedWith(
      "EIP712 signer and transaction signer do not match",
    );
  });

  it("balanceOfMe should recover own's balance handle", async function () {
    if (network.name == "hardhat") {
      // mocked mode
      expect(await this.erc20.balanceOfMe()).to.be.eq(1000000n);
    } else {
      // fhevm node mode (real handle)
      expect(await this.erc20.balanceOfMe()).to.be.eq(
        71480303746443559211476173181663275878345533655723421767618276236756512920548n,
      );
    }
  });

  it("should not transfer tokens between two users if balance is unsufficient", async function () {
    const encryptedTransferAmount = this.instances.alice.encrypt64(1337000);
    const tx = await this.erc20["transfer(address,bytes)"](this.signers.bob.address, encryptedTransferAmount);
    await tx.wait();

    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress)!;

    const encryptedBalanceAlice = await this.erc20.balanceOf(
      this.signers.alice,
      tokenAlice.publicKey,
      tokenAlice.signature,
    );

    // Decrypt the balance
    const balanceAlice = this.instances.alice.decrypt(this.contractAddress, encryptedBalanceAlice);

    expect(balanceAlice).to.equal(1000000);

    const bobErc20 = this.erc20.connect(this.signers.bob);

    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;

    const encryptedBalanceBob = await bobErc20.balanceOf(this.signers.bob, tokenBob.publicKey, tokenBob.signature);

    // Decrypt the balance
    const balanceBob = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob);

    expect(balanceBob).to.equal(0);
  });

  it("should be able to transferFrom only if allowance is sufficient", async function () {
    const encryptedAllowanceAmount = this.instances.alice.encrypt64(1337);
    const tx = await this.erc20["approve(address,bytes)"](this.signers.bob.address, encryptedAllowanceAmount);
    await tx.wait();

    const bobErc20 = this.erc20.connect(this.signers.bob);
    const encryptedTransferAmount = this.instances.bob.encrypt64(1338); // above allowance so next tx should actually not send any token
    const tx2 = await bobErc20["transferFrom(address,address,bytes)"](
      this.signers.alice.address,
      this.signers.bob.address,
      encryptedTransferAmount,
    );
    await tx2.wait();

    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress)!;
    const encryptedBalanceAlice = await this.erc20.balanceOf(
      this.signers.alice,
      tokenAlice.publicKey,
      tokenAlice.signature,
    );

    // Decrypt the balance
    const balanceAlice = this.instances.alice.decrypt(this.contractAddress, encryptedBalanceAlice);
    expect(balanceAlice).to.equal(1000000); // check that transfer did not happen, as expected

    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;
    const encryptedBalanceBob = await bobErc20.balanceOf(this.signers.bob, tokenBob.publicKey, tokenBob.signature);
    // Decrypt the balance
    const balanceBob = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob);
    expect(balanceBob).to.equal(0); // check that transfer did not happen, as expected

    const encryptedTransferAmount2 = this.instances.bob.encrypt64(1337); // below allowance so next tx should send token
    const tx3 = await bobErc20["transferFrom(address,address,bytes)"](
      this.signers.alice.address,
      this.signers.bob.address,
      encryptedTransferAmount2,
    );
    await tx3.wait();

    const encryptedBalanceAlice2 = await this.erc20.balanceOf(
      this.signers.alice,
      tokenAlice.publicKey,
      tokenAlice.signature,
    );
    // Decrypt the balance
    const balanceAlice2 = this.instances.alice.decrypt(this.contractAddress, encryptedBalanceAlice2);
    expect(balanceAlice2).to.equal(1000000 - 1337); // check that transfer did happen this time

    const encryptedBalanceBob2 = await bobErc20.balanceOf(this.signers.bob, tokenBob.publicKey, tokenBob.signature);
    const balanceBob2 = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob2);
    expect(balanceBob2).to.equal(1337); // check that transfer did happen this time
  });

  it("only spender and owner could read their allowance", async function () {
    const encryptedAllowanceAmount = this.instances.alice.encrypt64(1337);
    const tx = await this.erc20["approve(address,bytes)"](this.signers.bob.address, encryptedAllowanceAmount);
    await tx.wait();

    const bobErc20 = this.erc20.connect(this.signers.bob);
    const encryptedTransferAmount = this.instances.bob.encrypt64(337);
    const tx2 = await bobErc20["transferFrom(address,address,bytes)"](
      this.signers.alice.address,
      this.signers.bob.address,
      encryptedTransferAmount,
    );
    await tx2.wait();

    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress)!;

    // Alice decrypts the allowance for (Alice,Bob)
    let encryptedAllowanceAliceBob = await this.erc20.allowance(
      this.signers.alice,
      this.signers.bob,
      tokenAlice.publicKey,
      tokenAlice.signature,
    );
    let allowanceAliceBob = this.instances.alice.decrypt(this.contractAddress, encryptedAllowanceAliceBob);
    expect(allowanceAliceBob).to.equal(1000);

    // Bob decrypts the allowance for (Alice,Bob)
    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;
    encryptedAllowanceAliceBob = await bobErc20.allowance(
      this.signers.alice,
      this.signers.bob,
      tokenBob.publicKey,
      tokenBob.signature,
    );
    allowanceAliceBob = this.instances.bob.decrypt(this.contractAddress, encryptedAllowanceAliceBob);
    expect(allowanceAliceBob).to.equal(1000);

    // Carol cannot get the allowance for (Alice,Bob)
    const tokenCarol = this.instances.carol.getPublicKey(this.contractAddress)!;
    await expect(
      this.erc20
        .connect(this.signers.carol)
        .allowance(this.signers.alice, this.signers.bob, tokenCarol.publicKey, tokenCarol.signature),
    ).to.be.revertedWith("Caller must be owner or spender");

    // Alice cannot decrypt with invalid EIP-712 signature
    await expect(
      this.erc20.allowance(this.signers.alice, this.signers.bob, tokenBob.publicKey, tokenBob.signature),
    ).to.be.revertedWith("EIP712 signer and transaction signer do not match");

    // Carol would get a null allowance for (Alice,Carol)
    expect(
      this.instances.carol.decrypt(
        this.contractAddress,
        await this.erc20
          .connect(this.signers.carol)
          .allowance(this.signers.alice, this.signers.carol, tokenCarol.publicKey, tokenCarol.signature),
      ),
    ).to.equal(0n);
  });

  it("should handle errors correctly", async function () {
    let encryptedTransferAmount = this.instances.alice.encrypt64(1337);
    const tx = await this.erc20["transfer(address,bytes)"](this.signers.bob.address, encryptedTransferAmount);
    await tx.wait();
    const tokenAlice = this.instances.alice.getPublicKey(this.contractAddress)!;
    let encryptedErrorCode = await this.erc20.reencryptError(0n, tokenAlice.publicKey, tokenAlice.signature);
    // Decrypt the error code
    let errorCode = this.instances.alice.decrypt(this.contractAddress, encryptedErrorCode);
    expect(errorCode).to.equal(0);

    // case 2 failed transfer
    encryptedTransferAmount = this.instances.alice.encrypt64(100000000n);
    const tx2 = await this.erc20["transfer(address,bytes)"](this.signers.bob.address, encryptedTransferAmount);
    await tx2.wait();
    encryptedErrorCode = await this.erc20.reencryptError(1n, tokenAlice.publicKey, tokenAlice.signature);
    // Decrypt the error code
    errorCode = this.instances.alice.decrypt(this.contractAddress, encryptedErrorCode);
    expect(errorCode).to.equal(1);

    // case 3 successful transferFrom
    const encryptedAllowanceAmount = this.instances.alice.encrypt64(2000000);
    const tx3 = await this.erc20["approve(address,bytes)"](this.signers.bob.address, encryptedAllowanceAmount);
    await tx3.wait();

    const bobErc20 = this.erc20.connect(this.signers.bob);
    encryptedTransferAmount = this.instances.bob.encrypt64(1338);
    const tx4 = await bobErc20["transferFrom(address,address,bytes)"](
      this.signers.alice.address,
      this.signers.bob.address,
      encryptedTransferAmount,
    );
    await tx4.wait();
    const tokenBob = this.instances.bob.getPublicKey(this.contractAddress)!;
    encryptedErrorCode = await bobErc20.reencryptError(2n, tokenBob.publicKey, tokenBob.signature);
    // Decrypt the error code
    errorCode = this.instances.bob.decrypt(this.contractAddress, encryptedErrorCode);
    expect(errorCode).to.equal(0);
    // Bob cannot decrypt with invalid EIP-712 signature
    await expect(bobErc20.reencryptError(2n, tokenAlice.publicKey, tokenAlice.signature)).to.be.revertedWith(
      "EIP712 signer and transaction signer do not match",
    );

    // case 4 failed transferFrom because of unsufficient balance
    encryptedTransferAmount = this.instances.bob.encrypt64(1500000);
    const tx5 = await bobErc20["transferFrom(address,address,bytes)"](
      this.signers.alice.address,
      this.signers.bob.address,
      encryptedTransferAmount,
    );
    await tx5.wait();
    encryptedErrorCode = await bobErc20.reencryptError(3n, tokenBob.publicKey, tokenBob.signature);
    // Decrypt the error code
    errorCode = this.instances.bob.decrypt(this.contractAddress, encryptedErrorCode);
    expect(errorCode).to.equal(1);

    // case 5 failed transferFrom because of unsufficient allowance
    const tokenCarol = this.instances.carol.getPublicKey(this.contractAddress)!;
    encryptedTransferAmount = this.instances.bob.encrypt64(1);
    const tx6 = await this.erc20
      .connect(this.signers.carol)
      ["transferFrom(address,address,bytes)"](
        this.signers.alice.address,
        this.signers.bob.address,
        encryptedTransferAmount,
      );
    await tx6.wait();
    encryptedErrorCode = await this.erc20
      .connect(this.signers.carol)
      .reencryptError(4n, tokenCarol.publicKey, tokenCarol.signature);
    // Decrypt the error code
    errorCode = this.instances.carol.decrypt(this.contractAddress, encryptedErrorCode);
    expect(errorCode).to.equal(2);

    // Cannot decrypt an invalid transferID
    if (network.name !== "hardhat") {
      // only true in real fhEVM mode (TFHE.isInitialized always returns true in mocked mode)
      await expect(
        this.erc20.connect(this.signers.carol).reencryptError(5n, tokenCarol.publicKey, tokenCarol.signature),
      ).to.be.revertedWith("Invalid transferId");
    }

    // Non-sender cannot decrypt
    await expect(
      this.erc20.connect(this.signers.alice).reencryptError(4n, tokenAlice.publicKey, tokenAlice.signature),
    ).to.be.revertedWith("Only spender can reencrypt his error");
  });
});
