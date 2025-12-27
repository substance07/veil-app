import { ChainId } from "./chains";

export type AddressMap = {
  [chainId: number]: string;
};

export const VEIL_WHITELIST_CONTRACT_ADDRESSES: AddressMap = {
  [ChainId.SEPOLIA]: "0x019ac24154842df3D9D60Fb69B742F56d4D43C04",
};

export const CONTRACT_ADDRESSES = {
  31337: "0x40e8Aa088739445BC3a3727A724F56508899f65B", // Local Hardhat
  11155111: VEIL_WHITELIST_CONTRACT_ADDRESSES[ChainId.SEPOLIA], // Sepolia
};
