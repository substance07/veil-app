type InitializeOptions = {
    rpcUrl?: string;
    maxRetries?: number;
    retryDelayMs?: number;
};
export declare function useFhevm(options?: InitializeOptions): {
    instance: any;
    status: "idle" | "loading" | "ready" | "error";
    error: string;
    initialize: () => Promise<void>;
    isInitialized: boolean;
};
export {};
