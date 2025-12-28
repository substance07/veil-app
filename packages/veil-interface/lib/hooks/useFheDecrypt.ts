"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { Signer, AddressLike } from "ethers";
import { useFheInstance } from "./useFheInstance";

export type HandleContractPair = {
  handle: string | Uint8Array;
  contractAddress: string;
};

export type FhevmTypeEuint = 8 | 16 | 32 | 64 | 128 | 256;

export type FhevmUserDecryptOptions = {
  instance?: any;
  keypair?: {
    publicKey: string;
    privateKey: string;
  };
  validity?: {
    startTimestamp?: string | number;
    durationDays?: string | number;
  };
};

export type FhevmPublicDecryptOptions = {
  instance?: any;
};

// Helper function to get value from decrypt result
function getDecryptedValue(result: any, handle: string): boolean | number | bigint | string | null {
  const clearValues = result.clearValues || result;
  const value = clearValues[handle];
  return value !== null && value !== undefined ? value : null;
}

// Helper function to create user decrypt signature
async function createUserDecryptSignature(
  relayerInstance: any,
  signer: Signer,
  contractAddresses: string[],
  keypair: { publicKey: string; privateKey: string },
  startTimestamp: string | number,
  durationDays: string | number
): Promise<string> {
  const eip712 = relayerInstance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);

  const signature = await signer.signTypedData(
    eip712.domain,
    {
      UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
    },
    eip712.message
  );

  // Signature must not have "0x" prefix
  return signature.replace("0x", "");
}

export function useDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use instance from @fhevm-sdk
  const relayerInstance = useFheInstance();

  // ========== Public Decrypt Methods ==========

  /**
   * Public decrypt for boolean (ebool)
   */
  const publicDecryptEbool = useCallback(
    async (handleBytes32: string, options?: FhevmPublicDecryptOptions): Promise<boolean> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.publicDecrypt !== "function") {
        const errMsg = "publicDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const instance = options?.instance || relayerInstance;
        const result = await instance.publicDecrypt([handleBytes32]);
        const value = getDecryptedValue(result, handleBytes32);

        if (value === null) {
          throw new Error("Decryption returned null or undefined");
        }

        return Boolean(value);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Public decrypt ebool failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  /**
   * Public decrypt for unsigned integer (euint)
   */
  const publicDecryptEuint = useCallback(
    async (fhevmType: FhevmTypeEuint, handleBytes32: string, options?: FhevmPublicDecryptOptions): Promise<bigint> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.publicDecrypt !== "function") {
        const errMsg = "publicDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const instance = options?.instance || relayerInstance;
        const result = await instance.publicDecrypt([handleBytes32]);
        const value = getDecryptedValue(result, handleBytes32);

        if (value === null) {
          throw new Error("Decryption returned null or undefined");
        }

        return BigInt(value as number | bigint);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Public decrypt euint failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  /**
   * Public decrypt for address (eaddress)
   */
  const publicDecryptEaddress = useCallback(
    async (handleBytes32: string, options?: FhevmPublicDecryptOptions): Promise<string> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.publicDecrypt !== "function") {
        const errMsg = "publicDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const instance = options?.instance || relayerInstance;
        const result = await instance.publicDecrypt([handleBytes32]);
        const value = getDecryptedValue(result, handleBytes32);

        if (value === null) {
          throw new Error("Decryption returned null or undefined");
        }

        // Address can be string or bytes32, convert to string
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "bigint" || typeof value === "number") {
          return `0x${value.toString(16).padStart(40, "0")}`;
        }
        throw new Error("Invalid address format");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Public decrypt eaddress failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  // ========== User Decrypt Methods ==========

  /**
   * User decrypt for boolean (ebool)
   */
  const userDecryptEbool = useCallback(
    async (
      handleBytes32: string,
      contractAddress: AddressLike,
      user: Signer,
      options?: FhevmUserDecryptOptions
    ): Promise<boolean> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.userDecrypt !== "function") {
        const errMsg = "userDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const instance = options?.instance || relayerInstance;
        // Resolve contractAddress to string
        let contractAddr: string;
        if (typeof contractAddress === "string") {
          contractAddr = contractAddress;
        } else if (contractAddress && typeof contractAddress === "object" && "getAddress" in contractAddress) {
          contractAddr = await contractAddress.getAddress();
        } else {
          contractAddr = String(contractAddress);
        }
        const userAddress = await user.getAddress();

        // Generate or use keypair from options
        const keypair = options?.keypair || instance.generateKeypair();

        // Set validity from options or default
        const validity = options?.validity || {};
        const startTimestamp = validity.startTimestamp || Math.floor(Date.now() / 1000).toString();
        const durationDays = validity.durationDays || "1";

        const contractAddresses: string[] = [contractAddr];

        // Create signature
        const signature = await createUserDecryptSignature(
          instance,
          user,
          contractAddresses,
          keypair,
          startTimestamp,
          durationDays
        );

        // Call userDecrypt
        const handleContractPairs: HandleContractPair[] = [
          {
            handle: handleBytes32,
            contractAddress: contractAddr,
          },
        ];

        const result = await instance.userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature,
          contractAddresses,
          userAddress,
          startTimestamp,
          durationDays
        );

        const value = getDecryptedValue(result, handleBytes32);

        if (value === null) {
          throw new Error("Decryption returned null or undefined");
        }

        return Boolean(value);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "User decrypt ebool failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  /**
   * User decrypt for unsigned integer (euint)
   */
  const userDecryptEuint = useCallback(
    async (
      fhevmType: FhevmTypeEuint,
      handleBytes32: string,
      contractAddress: AddressLike,
      user: Signer,
      options?: FhevmUserDecryptOptions
    ): Promise<bigint> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.userDecrypt !== "function") {
        const errMsg = "userDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const instance = options?.instance || relayerInstance;
        // Resolve contractAddress to string
        let contractAddr: string;
        if (typeof contractAddress === "string") {
          contractAddr = contractAddress;
        } else if (contractAddress && typeof contractAddress === "object" && "getAddress" in contractAddress) {
          contractAddr = await contractAddress.getAddress();
        } else {
          contractAddr = String(contractAddress);
        }
        const userAddress = await user.getAddress();

        // Generate or use keypair from options
        const keypair = options?.keypair || instance.generateKeypair();

        // Set validity from options or default
        const validity = options?.validity || {};
        const startTimestamp = validity.startTimestamp || Math.floor(Date.now() / 1000).toString();
        const durationDays = validity.durationDays || "1";

        const contractAddresses: string[] = [contractAddr];

        // Create signature
        const signature = await createUserDecryptSignature(
          instance,
          user,
          contractAddresses,
          keypair,
          startTimestamp,
          durationDays
        );

        // Call userDecrypt
        const handleContractPairs: HandleContractPair[] = [
          {
            handle: handleBytes32,
            contractAddress: contractAddr,
          },
        ];

        const result = await instance.userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature,
          contractAddresses,
          userAddress,
          startTimestamp,
          durationDays
        );

        const value = getDecryptedValue(result, handleBytes32);

        if (value === null) {
          throw new Error("Decryption returned null or undefined");
        }

        return BigInt(value as number | bigint);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "User decrypt euint failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  /**
   * User decrypt for address (eaddress)
   */
  const userDecryptEaddress = useCallback(
    async (
      handleBytes32: string,
      contractAddress: AddressLike,
      user: Signer,
      options?: FhevmUserDecryptOptions
    ): Promise<string> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.userDecrypt !== "function") {
        const errMsg = "userDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const instance = options?.instance || relayerInstance;
        // Resolve contractAddress to string
        let contractAddr: string;
        if (typeof contractAddress === "string") {
          contractAddr = contractAddress;
        } else if (contractAddress && typeof contractAddress === "object" && "getAddress" in contractAddress) {
          contractAddr = await contractAddress.getAddress();
        } else {
          contractAddr = String(contractAddress);
        }
        const userAddress = await user.getAddress();

        // Generate or use keypair from options
        const keypair = options?.keypair || instance.generateKeypair();

        // Set validity from options or default
        const validity = options?.validity || {};
        const startTimestamp = validity.startTimestamp || Math.floor(Date.now() / 1000).toString();
        const durationDays = validity.durationDays || "1";

        const contractAddresses: string[] = [contractAddr];

        // Create signature
        const signature = await createUserDecryptSignature(
          instance,
          user,
          contractAddresses,
          keypair,
          startTimestamp,
          durationDays
        );

        // Call userDecrypt
        const handleContractPairs: HandleContractPair[] = [
          {
            handle: handleBytes32,
            contractAddress: contractAddr,
          },
        ];

        const result = await instance.userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature,
          contractAddresses,
          userAddress,
          startTimestamp,
          durationDays
        );

        const value = getDecryptedValue(result, handleBytes32);

        if (value === null) {
          throw new Error("Decryption returned null or undefined");
        }

        // Address can be string or bytes32, convert to string
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "bigint" || typeof value === "number") {
          return `0x${value.toString(16).padStart(40, "0")}`;
        }
        throw new Error("Invalid address format");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "User decrypt eaddress failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  // ========== Legacy Methods (for backward compatibility) ==========

  /**
   * @deprecated Use publicDecryptEbool, publicDecryptEuint, or publicDecryptEaddress instead
   */
  const decrypt = useCallback(
    async (
      handle: string | string[],
      contractAddress?: string,
      signer?: any
    ): Promise<boolean | number | bigint | null> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.publicDecrypt !== "function") {
        const errMsg = "publicDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const handles = Array.isArray(handle) ? handle : [handle];
        const result = await relayerInstance.publicDecrypt(handles);
        const clearValues = (result as any).clearValues || result;
        const targetHandle = Array.isArray(handle) ? handle[0] : handle;
        const decryptedValue = clearValues[targetHandle];

        if (decryptedValue === null || decryptedValue === undefined) {
          throw new Error("Decryption returned null or undefined");
        }

        return decryptedValue as boolean | number | bigint;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  /**
   * @deprecated Use userDecryptEbool, userDecryptEuint, or userDecryptEaddress instead
   */
  const userDecrypt = useCallback(
    async (
      handleContractPairs: HandleContractPair[],
      contractAddresses: string[],
      userAddress: string,
      signer: Signer,
      startTimestamp?: string | number,
      durationDays?: string | number
    ): Promise<Record<string, boolean | number | bigint | string>> => {
      if (!relayerInstance) {
        const errMsg = "FHE instance not initialized";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (typeof relayerInstance.userDecrypt !== "function") {
        const errMsg = "userDecrypt method not available on FHE instance";
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (!signer) {
        const errMsg = "Signer is required for userDecrypt";
        setError(errMsg);
        throw new Error(errMsg);
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const keypair = relayerInstance.generateKeypair();
        const startTimeStamp = startTimestamp || Math.floor(Date.now() / 1000).toString();
        const duration = durationDays || "1";

        const signature = await createUserDecryptSignature(
          relayerInstance,
          signer,
          contractAddresses,
          keypair,
          startTimeStamp,
          duration
        );

        const result = await relayerInstance.userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature,
          contractAddresses,
          userAddress,
          startTimeStamp,
          duration
        );

        return result as Record<string, boolean | number | bigint | string>;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "User decryption failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [relayerInstance]
  );

  return {
    // Public decrypt methods
    publicDecryptEbool,
    publicDecryptEuint,
    publicDecryptEaddress,
    // User decrypt methods
    userDecryptEbool,
    userDecryptEuint,
    userDecryptEaddress,
    // Legacy methods (deprecated)
    decrypt,
    userDecrypt,
    // State
    isDecrypting,
    error,
  };
}
