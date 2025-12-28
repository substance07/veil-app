import { ChainId } from "./chains";

export type AddressMap = {
  [chainId: number]: string;
};

export const VEIL_WHITELIST_CONTRACT_ADDRESSES: AddressMap = {
  [ChainId.SEPOLIA]: "0x31af7289ec951ebf0bd2bb62a6c4502ecd006301",
};

export const CONTRACT_ADDRESSES = {
  11155111: VEIL_WHITELIST_CONTRACT_ADDRESSES[ChainId.SEPOLIA],
};
