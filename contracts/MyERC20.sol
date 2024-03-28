// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import "fhevm/lib/TFHE.sol";
import "fhevm-contracts/contracts/token/ERC20/EncryptedERC20.sol";

contract MyERC20 is EncryptedERC20 {
    constructor() EncryptedERC20("MyToken", "MYTOKEN") {
        _mint(1000000, msg.sender);
    }
}
