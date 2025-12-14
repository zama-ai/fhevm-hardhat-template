# FHECounter – Contract Overview

This template contains an example contract `FHECounter` that demonstrates how to work with encrypted data in FHEVM.

## Core idea

The contract stores an encrypted counter value `_count` of type `euint32` and exposes the following functions:

- `getCount()` — returns the current encrypted counter value.
- `increment(externalEuint32 inputEuint32, bytes inputProof)` — increases the counter by an encrypted amount.
- `decrement(externalEuint32 inputEuint32, bytes inputProof)` — decreases the counter by an encrypted amount.

Conversions and operations are performed via the `FHE` library:

- `FHE.fromExternal` — converts an external encrypted value and its proof into the internal `euint32` type.
- `FHE.add` / `FHE.sub` — arithmetic operations on encrypted integers.
- `FHE.allowThis` / `FHE.allow` — control who is allowed to decrypt the result.

## Example usage pattern

A typical flow looks like this:

1. The client encrypts a number locally and sends the encrypted value plus a proof to `increment` or `decrement`.
2. The contract updates `_count` using only encrypted data (it never sees the plaintext).
3. Decryption is available only to parties explicitly authorized by the key holder via `FHE.allow`.

## Security notes

For simplicity, the demo contract may omit:

- overflow / range checks,
- additional access control restrictions.

In a production contract, you should add these safeguards explicitly.
