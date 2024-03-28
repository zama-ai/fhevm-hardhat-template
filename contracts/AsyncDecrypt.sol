// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.20;

import "fhevm/lib/TFHE.sol";
import "fhevm/oracle/OracleCaller.sol";

contract MyContract is OracleCaller {
    uint256 public total;

    function myRequest(uint256 input1, uint256 input2) public {
        euint8[] memory cts = new euint8[](1);
        cts[0] = TFHE.asEuint8(42);
        uint256 requestID = Oracle.requestDecryption(cts, this.myCallback.selector, 0, block.timestamp + 100);
        addParamsUint(requestID, input1);
        addParamsUint(requestID, input2);
    }

    function myCallback(uint256 requestID, uint8 decryptedInput) public onlyOracle {
        uint256[] memory params = getParamsUint(requestID);
        total = uint256(decryptedInput) + params[0] + params[1];
    }
}
