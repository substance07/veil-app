import { ethers } from 'ethers';
export interface FhevmNodeOptions {
    rpcUrl?: string;
    privateKey?: string;
    chainId?: number;
}
export declare class FhevmNode {
    private instance;
    private isReady;
    private provider;
    private wallet;
    private options;
    constructor(options?: FhevmNodeOptions);
    initialize(): Promise<void>;
    encrypt(contractAddress: string, userAddress: string, value: number): Promise<{
        encryptedData: any;
        proof: any;
    }>;
    decrypt(handle: string, contractAddress: string, signer?: any): Promise<number>;
    publicDecrypt(handle: string): Promise<number>;
    decryptMultiple(contractAddress: string, handles: string[], signer?: any): Promise<{
        cleartexts: string;
        decryptionProof: string;
        values: number[];
    }>;
    createContract(address: string, abi: any[]): ethers.Contract;
    executeEncryptedTransaction(contract: ethers.Contract, methodName: string, encryptedData: any, ...additionalParams: any[]): Promise<any>;
    getAddress(): Promise<string | null>;
    getProvider(): ethers.JsonRpcProvider | null;
    getWallet(): ethers.Wallet | null;
    getInstance(): any;
    getStatus(): "idle" | "ready";
    getConfig(): {
        rpcUrl: string | undefined;
        chainId: number | undefined;
        hasWallet: boolean;
        hasProvider: boolean;
        isReady: boolean;
    };
}
