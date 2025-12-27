/**
 * Vue Adapter - Universal FHEVM SDK
 * Vue composables for FHEVM operations
 */
import { Signer } from 'ethers';
export declare function useWalletVue(): {
    address: any;
    isConnected: any;
    chainId: any;
    isConnecting: any;
    error: any;
    connect: () => Promise<void>;
    disconnect: () => void;
};
export declare function useFhevmVue(): {
    instance: any;
    status: any;
    error: any;
    initialize: () => Promise<void>;
    isInitialized: any;
};
export declare function useContractVue(address: string, abi: any[]): {
    contract: any;
    isReady: any;
    error: any;
    initializeContract: () => Promise<void>;
};
export declare function useDecryptVue(): {
    decrypt: (contractAddress: string, signer: Signer, ciphertextHandle: string) => Promise<number | null>;
    publicDecrypt: (encryptedData: any) => Promise<number | null>;
    decryptMultiple: (contractAddress: string, signer: Signer, handles: string[]) => Promise<{
        cleartexts: string;
        decryptionProof: string;
        values: number[];
    } | null>;
    isDecrypting: any;
    error: any;
};
export declare function useEncryptVue(): {
    encrypt: (contractAddress: string, userAddress: string, value: number) => Promise<{
        encryptedData: any;
        proof: any;
    } | null>;
    isEncrypting: any;
    error: any;
};
export declare function useFhevmOperationsVue(): {
    encrypt: (contractAddress: string, userAddress: string, value: number) => Promise<{
        encryptedData: any;
        proof: any;
    } | null>;
    decrypt: (contractAddress: string, signer: Signer, ciphertextHandle: string) => Promise<number | null>;
    publicDecrypt: (encryptedData: any) => Promise<number | null>;
    decryptMultiple: (contractAddress: string, signer: Signer, handles: string[]) => Promise<{
        cleartexts: string;
        decryptionProof: string;
        values: number[];
    } | null>;
    executeTransaction: (contract: any, method: string, ...args: any[]) => Promise<{
        tx: any;
        receipt: any;
    }>;
    isEncrypting: any;
    isDecrypting: any;
    isProcessing: any;
    encryptError: any;
    decryptError: any;
    message: any;
    isBusy: any;
    hasError: any;
};
