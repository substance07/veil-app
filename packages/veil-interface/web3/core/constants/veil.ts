import { ChainId } from "./chains"

export type AddressMap = {
  [chainId: number]: string
}

export const VEIL_WHITELIST_CONTRACT_ADDRESSES: AddressMap = {
  [ChainId.SEPOLIA]: "0x233013532ae88D96634684C24D84D952b1060303",
}

export const CONTRACT_ADDRESSES = {
  31337: "0x40e8Aa088739445BC3a3727A724F56508899f65B", // Local Hardhat
  11155111: VEIL_WHITELIST_CONTRACT_ADDRESSES[ChainId.SEPOLIA], // Sepolia
}
