/**
 * Wagmi-like hook for FHEVM instance
 */
export declare function useFhevm(): {
    instance: any;
    status: "idle" | "loading" | "ready" | "error";
    error: string;
    initialize: () => Promise<void>;
    isInitialized: boolean;
};
