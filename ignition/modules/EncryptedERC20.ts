import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EncryptedERC20", (m) => {
  const EncryptedERC20 = m.contract("EncryptedERC20", ["Zama", "ZAMA"]);
  return { EncryptedERC20 };
});
