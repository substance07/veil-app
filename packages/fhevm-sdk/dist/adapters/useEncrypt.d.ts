export declare function useEncrypt(): {
    encrypt: (contractAddress: string, userAddress: string, value: number) => Promise<{
        encryptedData: any;
        proof: any;
    }>;
    isEncrypting: boolean;
    error: string;
};
