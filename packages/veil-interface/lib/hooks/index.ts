export { default as useWeb3 } from "./useWeb3";
export {
  default as useContract,
  useErc20ContractRead,
  useErc20ContractWrite,
  useVeilWhitelistContractRead,
  useVeilWhitelistContractWrite,
} from "./useContract";
export { useEthersProvider } from "./useEthersProvider";
export { useEthersSigner } from "./useEthersSigner";

// Re-export from @fhevm-sdk for direct use
export { useWallet, useContract as useContractSDK, useDecrypt as useDecryptSDK, useEncrypt } from "@fhevm-sdk";

// Wrapper hooks for compatibility with current API (uses @fhevm-sdk internally)
export { useFhevm } from "./useFhevm";
export {
  useDecrypt,
  type HandleContractPair,
  type FhevmTypeEuint,
  type FhevmUserDecryptOptions,
  type FhevmPublicDecryptOptions,
} from "./useFheDecrypt";
export { getFheInstance, useFheInstance } from "./useFheInstance";

// Deprecated: useZamaRelayerInstance - use useFheInstance instead
// Kept for backward compatibility, but will be removed in the future
export { default as useZamaRelayerInstance } from "./useZamaRelayerInstance";
