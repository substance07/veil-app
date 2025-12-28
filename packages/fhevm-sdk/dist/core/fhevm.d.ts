export declare function initializeFheInstance(options?: {
    rpcUrl?: string;
    maxRetries?: number;
    retryDelayMs?: number;
}): Promise<any>;
export declare function getFheInstance(): any;
export declare function decryptValue(encryptedBytes: string, contractAddress: string, signer: any): Promise<number>;
export declare function batchDecryptValues(handles: string[], contractAddress: string, signer: any): Promise<Record<string, number>>;
export declare function encryptValue(contractAddress: string, address: string, plainDigits: number[]): Promise<any>;
export declare function createEncryptedInput(contractAddress: string, userAddress: string, value: number): Promise<{
    encryptedData: any;
    proof: any;
}>;
export declare function publicDecrypt(encryptedBytes: string): Promise<number>;
export declare function requestUserDecryption(contractAddress: string, signer: any, ciphertextHandle: string): Promise<number>;
export declare function decryptMultipleHandles(contractAddress: string, signer: any, handles: string[]): Promise<{
    cleartexts: string;
    decryptionProof: string;
    values: number[];
}>;
export declare function fetchPublicDecryption(handles: string[]): Promise<any>;
