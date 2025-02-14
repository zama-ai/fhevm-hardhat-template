#!/bin/bash

# Assumes the following:
# 1. A local and **fresh** fhEVM node is already running.
# 2. All test addresses are funded (e.g. via the fund_test_addresses.sh script).
npx hardhat clean
mkdir fhevmTemp
cp -L -r node_modules/fhevm fhevmTemp/
npx hardhat compile:specific --contract fhevmTemp/fhevm/lib
npx hardhat compile:specific --contract fhevmTemp/fhevm/gateway
rm -rf fhevmTemp

PRIVATE_KEY_GATEWAY_DEPLOYER=$(grep PRIVATE_KEY_GATEWAY_DEPLOYER .env | cut -d '"' -f 2)
npx hardhat task:computePredeployAddress --private-key "$PRIVATE_KEY_GATEWAY_DEPLOYER"

npx hardhat task:computeACLAddress
npx hardhat task:computeTFHEExecutorAddress
npx hardhat task:computeKMSVerifierAddress
npx hardhat task:deployACL
npx hardhat task:deployTFHEExecutor
npx hardhat task:deployKMSVerifier

npx hardhat task:launchFhevm --skip-get-coin true
