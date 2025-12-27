"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useDecrypt, useFheInstance } from "@/lib/hooks";
import useContract from "@/lib/hooks/useContract";
import { useEthersProvider, useEthersSigner } from "@/lib/hooks";
import { VEIL_WHITELIST_CONTRACT_ADDRESSES } from "@/web3/core/constants/veil";
import VeilWhitelistABI from "@/web3/abis/VeilWhitelist.json";
import type { VeilWhitelist } from "@/web3/contracts";
import { useAppKit } from "@reown/appkit/react";

interface CheckWhitelistPublicProps {
  campaignId: number;
  chainId: number;
  onMessage?: (message: string) => void;
}

export function CheckWhitelistPublic({ campaignId, chainId, onMessage }: CheckWhitelistPublicProps) {
  const [addressInput, setAddressInput] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [checkHandle, setCheckHandle] = useState<string>("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptError, setEncryptError] = useState<string>("");

  const { publicDecryptEbool, isDecrypting, error: decryptError } = useDecrypt();
  const fheInstance = useFheInstance();
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });
  const appKit = useAppKit();

  const contractAddress = VEIL_WHITELIST_CONTRACT_ADDRESSES[chainId as keyof typeof VEIL_WHITELIST_CONTRACT_ADDRESSES];

  const readContract = useContract<VeilWhitelist>(contractAddress, VeilWhitelistABI, false, chainId);
  const writeContract = useContract<VeilWhitelist>(contractAddress, VeilWhitelistABI, true, chainId);

  const [connectedAddress, setConnectedAddress] = useState<string>("");

  useEffect(() => {
    const getConnectedAddress = async () => {
      if (signer) {
        try {
          const address = await signer.getAddress();
          setConnectedAddress(address);
          setAddressInput(address);
        } catch (error) {
          console.error("Failed to get connected address:", error);
          setConnectedAddress("");
        }
      } else {
        setConnectedAddress("");
        setAddressInput("");
      }
    };
    getConnectedAddress();
  }, [signer]);

  const encryptAddress = async (contractAddress: string, addressToEncrypt: string, userAddress: string) => {
    setIsEncrypting(true);
    setEncryptError("");

    try {
      const fhe = fheInstance;
      if (!fhe) throw new Error("FHE instance not initialized");

      // Validate address
      if (!ethers.isAddress(addressToEncrypt)) {
        throw new Error("Invalid address format");
      }

      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address format");
      }

      const inputHandle = fhe.createEncryptedInput(contractAddress, userAddress);
      inputHandle.addAddress(addressToEncrypt);

      const result = await inputHandle.encrypt();

      if (result && typeof result === "object") {
        const toHexString = (value: any): string => {
          if (typeof value === "string") {
            if (value.startsWith("0x")) {
              return value;
            }
            return ethers.hexlify(ethers.toUtf8Bytes(value));
          }
          if (value instanceof Uint8Array) {
            return ethers.hexlify(value);
          }
          if (ArrayBuffer.isView(value)) {
            return ethers.hexlify(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
          }
          throw new Error("Unsupported data type for encryption result");
        };

        if (result.handles && Array.isArray(result.handles) && result.handles.length > 0) {
          return {
            encryptedData: toHexString(result.handles[0]),
            proof: toHexString(result.inputProof),
          };
        }
        const encryptedData = (result as any).encryptedData;
        const proof = (result as any).proof;
        if (encryptedData && proof) {
          return {
            encryptedData: toHexString(encryptedData),
            proof: toHexString(proof),
          };
        }
      }

      throw new Error("Invalid encryption result format");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encryption failed";
      setEncryptError(errorMsg);
      throw err;
    } finally {
      setIsEncrypting(false);
    }
  };

  const checkAccess = async () => {
    if (!signer) {
      onMessage?.("Please connect your wallet to check whitelist");
      try {
        appKit?.open?.({ view: "Connect" });
      } catch (error) {
        console.error("Failed to open wallet connect:", error);
      }
      return;
    }

    if (!connectedAddress) {
      onMessage?.("Unable to get wallet address. Please try again.");
      return;
    }

    const addressToCheck = connectedAddress;

    if (!readContract || !writeContract || !contractAddress || !provider) {
      onMessage?.("Contract not available on this chain");
      return;
    }

    if (!signer) {
      onMessage?.("Please connect your wallet to check whitelist");
      try {
        appKit?.open?.({ view: "Connect" });
      } catch (error) {
        console.error("Failed to open wallet connect:", error);
      }
      return;
    }

    try {
      setIsChecking(true);
      setCheckResult(null);
      setCheckHandle("");
      onMessage?.("Encrypting address...");

      const userAddress = await signer.getAddress();

      if (addressToCheck.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error(
          `Address to check must match connected wallet. Your wallet: ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`
        );
      }

      const encryptedInput = await encryptAddress(contractAddress, addressToCheck, userAddress);

      if (!encryptedInput || !encryptedInput.encryptedData || !encryptedInput.proof) {
        throw new Error("Failed to encrypt address");
      }

      onMessage?.("Sending transaction to check whitelist...");

      const tx = await writeContract.checkAccessAll(campaignId, encryptedInput.encryptedData, encryptedInput.proof);

      onMessage?.("Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Transaction not confirmed");
      }

      onMessage?.("Reading result from contract...");

      const encryptedResult = await writeContract.getMyLastCheck(campaignId);

      console.log("encryptedResult from contract:", encryptedResult);

      if (!encryptedResult) {
        throw new Error("No result received from contract");
      }

      const handleString =
        typeof encryptedResult === "string"
          ? encryptedResult.startsWith("0x")
            ? encryptedResult
            : `0x${encryptedResult}`
          : String(encryptedResult);

      if (handleString.length !== 66 || !handleString.startsWith("0x")) {
        console.error("Invalid handle format:", handleString);
        throw new Error(`Invalid handle: ${handleString.substring(0, 20)}...`);
      }

      setCheckHandle(handleString);
      onMessage?.("Decrypting result...");

      const isWhitelisted = await publicDecryptEbool(handleString);
      setCheckResult(isWhitelisted);

      onMessage?.(`Result: ${isWhitelisted ? "This address is whitelisted" : "This address is not whitelisted"}`);
      setTimeout(() => onMessage?.(""), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorString = errorMessage.toLowerCase();

      console.error("Check access failed:", error);

      if (errorString.includes("campaignnotfound")) {
        onMessage?.("Campaign not found");
      } else if (errorString.includes("fhe instance not initialized") || errorString.includes("fhe")) {
        onMessage?.("FHE instance not initialized. Please wait...");
      } else if (errorString.includes("encrypt") || errorString.includes("encryption")) {
        onMessage?.(`Encryption failed: ${errorMessage}`);
      } else if (errorString.includes("decrypt") || errorString.includes("decryption")) {
        onMessage?.(`Decryption failed: ${errorMessage}`);
      } else if (errorString.includes("user rejected") || errorString.includes("denied")) {
        onMessage?.("Transaction rejected");
      } else if (errorString.includes("sendernotallowed")) {
        onMessage?.("ACL Error: Encrypted address does not match transaction sender address");
      } else {
        onMessage?.(`Check failed: ${errorMessage}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (!contractAddress) {
    return (
      <div className="info-card border-destructive/30">
        <p className="text-destructive text-sm text-center">Contract not deployed on this chain</p>
      </div>
    );
  }

  return (
    <div className="info-card">
      <h3 className="text-lg font-bold text-foreground mb-4">Check Whitelist</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Enter an address to check if it is in the whitelist for campaign #{campaignId}
      </p>

      <div className="space-y-4">
        {connectedAddress && (
          <div className="p-3 bg-card border-2 border-border rounded-xl">
            <span className="text-muted-foreground text-xs font-medium block mb-1">Wallet address being checked</span>
            <code className="text-foreground text-sm font-mono break-all">{connectedAddress}</code>
          </div>
        )}

        {!signer && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-200 text-xs">
              ⚠️ You need to connect your wallet to check whitelist. The wallet will be required to sign a transaction
              to perform the check.
            </p>
          </div>
        )}

        <button
          onClick={checkAccess}
          disabled={isChecking || isEncrypting || isDecrypting || !signer || !connectedAddress}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          title={encryptError || decryptError || (!signer ? "Please connect wallet" : undefined)}
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
              Check Whitelist
            </>
          )}
        </button>

        {checkResult !== null && (
          <div
            className={`mt-4 p-4 rounded-xl border-2 ${
              checkResult ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">Whitelist Status</span>
              <span
                className={`text-lg font-bold flex items-center gap-2 ${
                  checkResult ? "text-accent" : "text-destructive"
                }`}
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
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Not Whitelisted
                  </>
                )}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Address: <code className="font-mono">{addressInput}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
