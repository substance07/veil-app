"use client"

import { type ERC20, ERC20__factory, type VeilWhitelist, VeilWhitelist__factory } from "@/web3/contracts"
import { VEIL_WHITELIST_CONTRACT_ADDRESSES } from "@/web3/core/constants"
import { type BaseContract, Contract, isAddress } from "ethers"
import { useMemo } from "react"
import { zeroAddress } from "viem"
import { useEthersProvider } from "./useEthersProvider"
import { useEthersSigner } from "./useEthersSigner"
import useWeb3 from "./useWeb3"

export default function useContract<T extends BaseContract = BaseContract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSigner = false,
  _chainId?: number,
): T | null {
  const { chain } = useWeb3()
  const chainId = Number(_chainId ?? chain.id)
  const provider = useEthersProvider({ chainId })
  const signer = useEthersSigner({ chainId })

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]

    if (!address) return null

    try {
      if (!isAddress(address) || address === zeroAddress) {
        throw Error(`Invalid address: ${address}.`)
      }
      if (withSigner && !signer) return null
      if (withSigner && signer) {
        return new Contract(address, ABI, signer) as unknown as T
      } else if (provider) {
        return new Contract(address, ABI, provider) as unknown as T
      }
      return null
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSigner, signer])
}

export function useVeilWhitelistContractRead() {
  return useContract<VeilWhitelist>(VEIL_WHITELIST_CONTRACT_ADDRESSES, VeilWhitelist__factory.abi, false)
}

export function useVeilWhitelistContractWrite() {
  return useContract<VeilWhitelist>(VEIL_WHITELIST_CONTRACT_ADDRESSES, VeilWhitelist__factory.abi, true)
}

export function useErc20ContractRead(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20__factory.abi, false)
}

export function useErc20ContractWrite(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20__factory.abi, true)
}
