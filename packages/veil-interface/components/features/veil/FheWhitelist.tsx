"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useDecrypt, useFheInstance } from "@/lib/hooks"
import useContract from "@/lib/hooks/useContract"
import { useEthersSigner } from "@/lib/hooks"
import { VEIL_WHITELIST_CONTRACT_ADDRESSES } from "@/web3/core/constants/veil"
import VeilWhitelistABI from "@/web3/abis/VeilWhitelist.json"
import type { VeilWhitelist } from "@/web3/contracts"
import { CreateCampaign } from "./CreateCampaign"
import { CampaignsList } from "./CampaignsList"

type WhitelistMode = "manage" | "check" | "all"

interface FheWhitelistProps {
  account: string
  chainId: number
  isConnected: boolean
  isInitialized: boolean
  onMessage: (message: string) => void
  mode?: WhitelistMode
  initialCampaignId?: number
}

interface Campaign {
  id: number
  name: string
  owner: string
  exists: boolean
  whitelistSize: number
}

export function FheWhitelist({
  account,
  chainId,
  isConnected,
  isInitialized,
  onMessage,
  mode = "all",
  initialCampaignId,
}: FheWhitelistProps) {
  const [campaignCount, setCampaignCount] = useState<number>(0)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(initialCampaignId ?? null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [checkResult, setCheckResult] = useState<boolean | null>(null)
  const [checkHandle, setCheckHandle] = useState<string>("")
  const [addressesInput, setAddressesInput] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)

  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptError, setEncryptError] = useState<string>("")
  const { userDecryptEbool, isDecrypting, error: decryptError } = useDecrypt()
  const fheInstance = useFheInstance()

  const contractAddress = VEIL_WHITELIST_CONTRACT_ADDRESSES[chainId as keyof typeof VEIL_WHITELIST_CONTRACT_ADDRESSES]

  const readContract = useContract<VeilWhitelist>(contractAddress, VeilWhitelistABI, false, chainId)
  const writeContract = useContract<VeilWhitelist>(contractAddress, VeilWhitelistABI, true, chainId)
  const signer = useEthersSigner({ chainId })

  const encryptAddress = async (contractAddress: string, userAddress: string, addressToEncrypt: string) => {
    setIsEncrypting(true)
    setEncryptError("")

    try {
      const fhe = fheInstance
      if (!fhe) throw new Error("FHE instance not initialized")

      if (!ethers.isAddress(addressToEncrypt)) {
        throw new Error("Invalid address format")
      }

      const inputHandle = fhe.createEncryptedInput(contractAddress, userAddress)
      inputHandle.addAddress(addressToEncrypt)

      const result = await inputHandle.encrypt()

      if (result && typeof result === "object") {
        const toHexString = (value: any): string => {
          if (typeof value === "string") {
            if (value.startsWith("0x")) {
              return value
            }
            return ethers.hexlify(ethers.toUtf8Bytes(value))
          }
          if (value instanceof Uint8Array) {
            return ethers.hexlify(value)
          }
          if (ArrayBuffer.isView(value)) {
            return ethers.hexlify(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))
          }
          throw new Error("Unsupported data type for encryption result")
        }

        if (result.handles && Array.isArray(result.handles) && result.handles.length > 0) {
          return {
            encryptedData: toHexString(result.handles[0]),
            proof: toHexString(result.inputProof),
          }
        }
        const encryptedData = (result as any).encryptedData
        const proof = (result as any).proof
        if (encryptedData && proof) {
          return {
            encryptedData: toHexString(encryptedData),
            proof: toHexString(proof),
          }
        }
      }

      throw new Error("Invalid encryption result format")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encryption failed"
      setEncryptError(errorMsg)
      throw err
    } finally {
      setIsEncrypting(false)
    }
  }

  const showManagement = mode !== "check"
  const showCheck = mode !== "manage"

  const handleCopyLink = async (link: string) => {
    if (!link || typeof navigator === "undefined" || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(link)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const loadCampaigns = async () => {
    if (!isConnected || !readContract) {
      return
    }

    try {
      const count = await readContract.campaignCount()
      const campaignCountNum = Number(count)
      setCampaignCount(campaignCountNum)

      if (campaignCountNum === 0) {
        setCampaigns([])
        setSelectedCampaignId(null)
        setSelectedCampaign(null)
        return
      }

      const campaignsList: Campaign[] = []
      for (let i = 1; i <= campaignCountNum; i++) {
        try {
          const campaignInfo = await readContract.getCampaignInfo(i)
          if (campaignInfo.exists) {
            campaignsList.push({
              id: i,
              name: campaignInfo.name,
              owner: campaignInfo.owner,
              exists: campaignInfo.exists,
              whitelistSize: Number(campaignInfo.whitelistSize),
            })
          }
        } catch (error) {
          console.error(`Failed to load campaign ${i}:`, error)
        }
      }

      setCampaigns(campaignsList)

      if (!selectedCampaignId && campaignsList.length > 0) {
        const initialMatch = initialCampaignId ? campaignsList.find((c) => c.id === initialCampaignId) : null
        if (initialMatch) {
          setSelectedCampaignId(initialMatch.id)
          setSelectedCampaign(initialMatch)
        } else {
          setSelectedCampaignId(campaignsList[0].id)
          setSelectedCampaign(campaignsList[0])
        }
      } else if (selectedCampaignId) {
        const updated = campaignsList.find((c) => c.id === selectedCampaignId)
        if (updated) {
          setSelectedCampaign(updated)
        }
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error)
    }
  }

  const loadCampaignData = async (campaignId: number) => {
    if (!isConnected || !readContract || !campaignId) {
      return
    }

    try {
      const campaignInfo = await readContract.getCampaignInfo(campaignId)
      const isOwnerResult = await readContract.isCampaignOwner(campaignId, account)

      const campaign: Campaign = {
        id: campaignId,
        name: campaignInfo.name,
        owner: campaignInfo.owner,
        exists: campaignInfo.exists,
        whitelistSize: Number(campaignInfo.whitelistSize),
      }

      setSelectedCampaign(campaign)
      setIsOwner(isOwnerResult)

      console.log("Campaign data loaded:", {
        campaignId,
        name: campaign.name,
        owner: campaign.owner,
        whitelistSize: campaign.whitelistSize,
        isOwner: isOwnerResult,
      })
    } catch (error) {
      console.error("Failed to load campaign data:", error)
      if (error instanceof Error && error.message.includes("CampaignNotFound")) {
        onMessage("Campaign not found")
      }
    }
  }

  const handleCampaignCreated = async (campaignId: number) => {
    await loadCampaigns()
    if (campaignId > 0) {
      setSelectedCampaignId(campaignId)
      await loadCampaignData(campaignId)
    }
  }

  useEffect(() => {
    if (isConnected && isInitialized && readContract && account) {
      loadCampaigns()
    }
  }, [isConnected, isInitialized, account, readContract])

  useEffect(() => {
    if (isConnected && isInitialized && readContract && account && selectedCampaignId) {
      loadCampaignData(selectedCampaignId)
    }
  }, [selectedCampaignId, isConnected, isInitialized, account, readContract])

  const checkAccess = async () => {
    if (!isConnected || !readContract || !writeContract || !selectedCampaignId || !contractAddress) {
      onMessage("Please select a campaign first")
      return
    }

    if (!account) {
      onMessage("Please connect your wallet")
      return
    }

    try {
      setIsChecking(true)
      setCheckResult(null)
      setCheckHandle("")
      onMessage("Encrypting address...")

      onMessage("Encrypting address for whitelist check...")
      const encryptedInput = await encryptAddress(contractAddress, account, account)

      if (!encryptedInput || !encryptedInput.encryptedData || !encryptedInput.proof) {
        throw new Error("Failed to encrypt address")
      }

      onMessage("Checking whitelist...")
      const result = await writeContract.checkAccessAll(
        selectedCampaignId,
        encryptedInput.encryptedData,
        encryptedInput.proof,
      )

      if (!result) {
        throw new Error("No result returned from contract")
      }

      setCheckHandle(result)
      onMessage("Decrypting result...")

      if (!signer) {
        throw new Error("Signer is required for decryption")
      }

      const isWhitelisted = await userDecryptEbool(result, contractAddress, signer)
      setCheckResult(isWhitelisted)

      onMessage(`Whitelist check completed: ${isWhitelisted ? "Whitelisted" : "Not whitelisted"}`)
      setTimeout(() => onMessage(""), 3000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorString = errorMessage.toLowerCase()

      console.error("Check access failed:", error)

      if (errorString.includes("campaignnotfound")) {
        onMessage("Campaign not found")
      } else if (errorString.includes("fhe instance not initialized") || errorString.includes("fhe")) {
        onMessage("FHE instance not initialized. Please wait for initialization.")
      } else if (errorString.includes("encrypt") || errorString.includes("encryption")) {
        onMessage(`Encryption failed: ${errorMessage}`)
      } else if (errorString.includes("decrypt") || errorString.includes("decryption")) {
        onMessage(`Decryption failed: ${errorMessage}`)
      } else if (errorString.includes("user rejected") || errorString.includes("denied")) {
        onMessage("Transaction was rejected")
      } else {
        onMessage(`Check access failed: ${errorMessage}`)
      }
    } finally {
      setIsChecking(false)
    }
  }

  const addToWhitelist = async () => {
    if (!isConnected || !isOwner || !selectedCampaignId || !writeContract || !contractAddress) {
      onMessage("Missing requirements")
      return
    }
  
    try {
      setIsAdding(true)
      onMessage("Processing addresses...")
  
      const addresses = addressesInput
        .split(/[,\n]/)
        .map((a) => a.trim())
        .filter((a) => ethers.isAddress(a))
  
      if (addresses.length === 0) {
        onMessage("No valid addresses found")
        return
      }
  
      const fhe = fheInstance
      if (!fhe) throw new Error("FHE instance not initialized")
  
      onMessage(`Encrypting ${addresses.length} address(es)...`)
  
      const input = fhe.createEncryptedInput(contractAddress, account)
  
      for (const addr of addresses) {
        input.addAddress(addr)
      }
  
      const encrypted = await input.encrypt()
  
      const encryptedAddresses = encrypted.handles
      const attestation = encrypted.inputProof

      console.log("handles count:", encryptedAddresses.length)
      console.log("proof length:", attestation.length)

      if (!readContract) {
        throw new Error("readContract is not available")
      }

      const campaignInfo = await readContract.getCampaignInfo(selectedCampaignId)
      console.log("🔍 Campaign info:", {
        campaignId: selectedCampaignId,
        exists: campaignInfo.exists,
        owner: campaignInfo.owner,
        name: campaignInfo.name,
      })

      if (!campaignInfo.exists) {
        throw new Error(`Campaign ${selectedCampaignId} does not exist on this contract`)
      }

      const accountLower = account.toLowerCase()
      const ownerLower = campaignInfo.owner.toLowerCase()
      console.log("🔍 Owner check:", {
        account: account,
        accountLower: accountLower,
        owner: campaignInfo.owner,
        ownerLower: ownerLower,
        match: accountLower === ownerLower,
      })

      if (accountLower !== ownerLower) {
        throw new Error(
          `You are not the campaign owner. Campaign owner: ${campaignInfo.owner}, Your account: ${account}`
        )
      }

      if (!signer) {
        throw new Error("Signer is not available")
      }
      const signerAddress = await signer.getAddress()
      console.log("🔍 Signer check:", {
        signerAddress: signerAddress,
        account: account,
        match: signerAddress.toLowerCase() === accountLower,
      })

      if (signerAddress.toLowerCase() !== accountLower) {
        throw new Error("Signer address does not match connected account")
      }

      try {
        const encodedData = writeContract.interface.encodeFunctionData(
          "addWhitelist",
          [selectedCampaignId, encryptedAddresses, attestation]
        )
        console.log("✅ Encoded calldata length:", encodedData.length)
        if (encodedData === "0x" || encodedData.length < 10) {
          throw new Error("Encoded calldata is empty or invalid")
        }
      } catch (encodeError) {
        console.error("❌ Encode failed:", encodeError)
        throw new Error(`Failed to encode function data: ${encodeError instanceof Error ? encodeError.message : String(encodeError)}`)
      }

      onMessage("Sending transaction...")

      const tx = await writeContract.addWhitelist(
        selectedCampaignId,
        encryptedAddresses,
        attestation,
        {
          gasLimit: 3_000_000,
        }
      )
  
      await tx.wait()
  
      onMessage(`✅ Added ${addresses.length} address(es)`)
      setAddressesInput("")
      await loadCampaignData(selectedCampaignId)
      await loadCampaigns()
  
    } catch (err: any) {
      console.error("Add whitelist failed:", err)
      onMessage(err?.message || "Add whitelist failed")
    } finally {
      setIsAdding(false)
    }
  }
  

  if (!isConnected || !isInitialized) {
    return null
  }

  if (!contractAddress) {
    return (
      <div className="info-card border-destructive/30">
        <p className="text-destructive text-sm text-center">Contract not deployed on this chain</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Veil Whitelist</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Encrypted whitelist management</p>
          </div>
        </div>

        {showManagement && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Campaign Management</h2>
                <p className="text-neutral-600 text-sm">Create and manage your encrypted whitelist campaigns</p>
              </div>
              <CreateCampaign
                writeContract={writeContract}
                isConnected={isConnected}
                contractAddress={contractAddress}
                onCampaignCreated={handleCampaignCreated}
                onMessage={onMessage}
              />
            </div>

            <CampaignsList
              campaigns={campaigns}
              selectedCampaignId={selectedCampaignId}
              onSelectCampaign={setSelectedCampaignId}
              account={account}
            />
          </div>
        )}

        {selectedCampaign && (
          <div className="info-card">
            <h3 className="text-lg font-bold text-foreground mb-4">Campaign Information</h3>

            <div className="mb-6 p-4 bg-card rounded-xl border-2 border-border">
              <div className="text-muted-foreground text-xs font-medium mb-2">Shareable Check Link</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-foreground text-sm font-mono break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/veil/campaigns/${selectedCampaign.id}`
                    : `/veil/campaigns/${selectedCampaign.id}`}
                </code>
                <button
                  onClick={() =>
                    handleCopyLink(
                      `${typeof window !== "undefined" ? window.location.origin : ""}/veil/campaigns/${selectedCampaign.id}`,
                    )
                  }
                  className="btn-secondary text-xs px-3 py-2"
                >
                  {linkCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <span className="text-muted-foreground text-xs font-medium block mb-1">Campaign Name</span>
                <span className="text-foreground text-lg font-bold">{selectedCampaign.name}</span>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <span className="text-muted-foreground text-xs font-medium block mb-1">Campaign ID</span>
                <span className="text-foreground text-lg font-bold">#{selectedCampaign.id}</span>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <span className="text-muted-foreground text-xs font-medium block mb-1">Whitelist Size</span>
                <span className="text-primary text-xl font-bold">{selectedCampaign.whitelistSize}</span>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <span className="text-muted-foreground text-xs font-medium block mb-1">Owner</span>
                <code className="text-foreground/80 text-xs font-mono">
                  {selectedCampaign.owner
                    ? `${selectedCampaign.owner.slice(0, 6)}...${selectedCampaign.owner.slice(-4)}`
                    : "Loading..."}
                </code>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 ${isOwner ? "border-accent/30 bg-accent/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-accent text-sm font-semibold">You are the campaign owner</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm3 2a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-muted-foreground text-sm">You are not the campaign owner</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedCampaign && campaigns.length > 0 && (
          <div className="info-card text-center py-8">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 9l4-4 4 4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-muted-foreground text-sm">Please select a campaign to view details</p>
          </div>
        )}

        {selectedCampaign && showCheck && (
          <div className="info-card">
            <h3 className="text-lg font-bold text-foreground mb-4">Check Whitelist Access</h3>
            <button
              onClick={checkAccess}
              disabled={isChecking || isEncrypting || isDecrypting || !selectedCampaignId}
              className="btn-primary w-full"
              title={encryptError || decryptError || undefined}
            >
              {isChecking || isEncrypting || isDecrypting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Checking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Check My Access
                </>
              )}
            </button>

            {checkHandle && (
              <div className="mt-4 p-4 bg-card rounded-xl border-2 border-border">
                <span className="text-muted-foreground text-xs font-medium block mb-2">Encrypted Result Handle</span>
                <code className="text-foreground text-xs font-mono break-all">{checkHandle}</code>
              </div>
            )}

            {checkResult !== null && (
              <div
                className={`mt-4 p-4 rounded-xl border-2 ${checkResult ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm font-medium">Whitelist Status</span>
                  <span
                    className={`text-lg font-bold flex items-center gap-2 ${checkResult ? "text-accent" : "text-destructive"}`}
                  >
                    {checkResult ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Whitelisted
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Not Whitelisted
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedCampaign && isOwner && showManagement && (
          <div className="info-card">
            <h3 className="text-lg font-bold text-foreground mb-4">Add Addresses to Whitelist</h3>
            <textarea
              value={addressesInput}
              onChange={(e) => setAddressesInput(e.target.value)}
              placeholder="Enter addresses (one per line or comma-separated)&#10;Example:&#10;0x1234...5678&#10;0xabcd...ef01"
              className="w-full bg-card border-2 border-border rounded-xl p-4 text-foreground text-sm font-mono resize-y min-h-[140px] focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              disabled={isAdding || isEncrypting}
            />
            <button
              onClick={addToWhitelist}
              disabled={!addressesInput.trim() || isAdding || isEncrypting}
              className="btn-primary w-full mt-4"
              title={encryptError || undefined}
            >
              {isAdding || isEncrypting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Whitelist
                </>
              )}
            </button>
          </div>
        )}

        {selectedCampaign && !isOwner && showManagement && (
          <div className="info-card text-center py-6">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-muted-foreground text-sm">Only the campaign owner can add addresses to the whitelist</p>
          </div>
        )}
      </div>
    </div>
  )
}
