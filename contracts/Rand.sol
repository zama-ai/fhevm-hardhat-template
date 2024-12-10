// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @notice Contract for generating random encrypted numbers
contract Rand is SepoliaZamaFHEVMConfig {
    /// @notice Encrypted unsigned integers of various sizes
    ebool public valueb;
    euint4 public value4;
    euint8 public value8;
    euint16 public value16;
    euint32 public value32;
    euint64 public value64;
    euint64 public value64Bounded;
    euint128 public value128;
    euint256 public value256;
    ebytes64 public value512;
    ebytes128 public value1024;
    ebytes256 public value2048;

    /// @notice Constructor to set FHE configuration
    constructor() {}

    /// @notice Generate random 8-bit encrypted unsigned integer
    function generateBool() public {
        valueb = TFHE.randEbool();
        TFHE.allowThis(valueb);
        TFHE.allow(valueb, msg.sender);
    }

    function generate4() public {
        value4 = TFHE.randEuint4();
        TFHE.allowThis(value4);
        TFHE.allow(value4, msg.sender);
    }

    function generate4UpperBound(uint8 upperBound) public {
        value4 = TFHE.randEuint4(upperBound);
        TFHE.allowThis(value4);
        TFHE.allow(value4, msg.sender);
    }

    function generate8() public {
        value8 = TFHE.randEuint8();
        TFHE.allowThis(value8);
        TFHE.allow(value8, msg.sender);
    }

    /// @notice Generate random 8-bit encrypted unsigned integer with upper bound
    /// @param upperBound The maximum value (exclusive) for the generated number
    function generate8UpperBound(uint8 upperBound) public {
        value8 = TFHE.randEuint8(upperBound);
        TFHE.allowThis(value8);
        TFHE.allow(value8, msg.sender);
    }

    /// @notice Generate random 16-bit encrypted unsigned integer
    function generate16() public {
        value16 = TFHE.randEuint16();
        TFHE.allowThis(value16);
        TFHE.allow(value16, msg.sender);
    }

    /// @notice Generate random 16-bit encrypted unsigned integer with upper bound
    /// @param upperBound The maximum value (exclusive) for the generated number
    function generate16UpperBound(uint16 upperBound) public {
        value16 = TFHE.randEuint16(upperBound);
        TFHE.allowThis(value16);
        TFHE.allow(value16, msg.sender);
    }

    /// @notice Generate random 32-bit encrypted unsigned integer
    function generate32() public {
        value32 = TFHE.randEuint32();
        TFHE.allowThis(value32);
        TFHE.allow(value32, msg.sender);
    }

    /// @notice Generate random 32-bit encrypted unsigned integer with upper bound
    /// @param upperBound The maximum value (exclusive) for the generated number
    function generate32UpperBound(uint32 upperBound) public {
        value32 = TFHE.randEuint32(upperBound);
        TFHE.allowThis(value32);
        TFHE.allow(value32, msg.sender);
    }

    /// @notice Generate random 64-bit encrypted unsigned integer
    function generate64() public {
        value64 = TFHE.randEuint64();
        TFHE.allowThis(value64);
        TFHE.allow(value64, msg.sender);
    }

    function generate64UpperBound(uint64 upperBound) public {
        value64 = TFHE.randEuint64(upperBound);
        TFHE.allowThis(value64);
        TFHE.allow(value64, msg.sender);
    }

    /// @notice Generate random 64-bit encrypted unsigned integer with error handling
    /// @dev This function attempts a failing call and then generates a bounded random number
    function generate64Reverting() public {
        try this.failingCall() {} catch {}
        value64Bounded = TFHE.randEuint64(1024);
        TFHE.allowThis(value64Bounded);
        TFHE.allow(value64Bounded, msg.sender);
    }

    // Function that always reverts after generating a random number
    function failingCall() public {
        value64 = TFHE.randEuint64();
        TFHE.allowThis(value64);
        TFHE.allow(value64, msg.sender);
        revert();
    }

    function generate128() public {
        value128 = TFHE.randEuint128();
        TFHE.allowThis(value128);
        TFHE.allow(value128, msg.sender);
    }

    function generate128UpperBound(uint128 upperBound) public {
        value128 = TFHE.randEuint128(upperBound);
        TFHE.allowThis(value128);
        TFHE.allow(value128, msg.sender);
    }

    function generate256() public {
        value256 = TFHE.randEuint256();
        TFHE.allowThis(value256);
        TFHE.allow(value256, msg.sender);
    }

    function generate256UpperBound(uint256 upperBound) public {
        value256 = TFHE.randEuint256(upperBound);
        TFHE.allowThis(value256);
        TFHE.allow(value256, msg.sender);
    }

    function generate512() public {
        value512 = TFHE.randEbytes64();
        TFHE.allowThis(value512);
        TFHE.allow(value512, msg.sender);
    }

    function generate1024() public {
        value1024 = TFHE.randEbytes128();
        TFHE.allowThis(value1024);
        TFHE.allow(value1024, msg.sender);
    }

    function generate2048() public {
        value2048 = TFHE.randEbytes256();
        TFHE.allowThis(value2048);
        TFHE.allow(value2048, msg.sender);
    }
}