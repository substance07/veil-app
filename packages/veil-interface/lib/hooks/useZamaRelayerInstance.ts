import { useQuery } from "@tanstack/react-query";
import { useFheInstance } from "./useFheInstance";

let sdkInitialized = false;

export type FhevmStatus = "idle" | "initializing" | "ready" | "error";

/**
 * @deprecated This hook has been deprecated. 
 * Use `useFheInstance()` from `@/lib/hooks` or `useFhevm()` from `@fhevm-sdk` instead.
 * 
 * This hook still works for backward compatibility, but will be removed in the future.
 * 
 * Migration:
 * - Replace `useZamaRelayerInstance()` with `useFheInstance()` or `useFhevm().instance`
 */
export default function useZamaRelayerInstance() {
  // Prefer using instance from @fhevm-sdk through useFheInstance
  const sdkInstance = useFheInstance();
  if (sdkInstance) {
    return sdkInstance;
  }
  
  // Fallback to old implementation if @fhevm-sdk hasn't been initialized
  const { data, isLoading, isError, error, status } = useQuery({
    queryKey: ["zamaRelayerInstance"],
    queryFn: async () => {
      if (typeof window === "undefined") {
        return null;
      }

      if (!window.relayerSDK) {
        throw new Error("Relayer SDK not loaded on window object");
      }

      const { initSDK, createInstance } = window.relayerSDK;

      if (typeof initSDK !== "function") {
        throw new Error("initSDK is not available on window.relayerSDK");
      }

      if (typeof createInstance !== "function") {
        throw new Error("createInstance is not available on window.relayerSDK");
      }

      if (!sdkInitialized) {
        const startTime = Date.now();
        try {
          const initResult = await initSDK();
          const duration = Date.now() - startTime;
        } catch (initError) {
          const duration = Date.now() - startTime;
          throw initError;
        }
        sdkInitialized = true;
      }

      const config = window.relayerSDK.ZamaEthereumConfig || window.relayerSDK.SepoliaConfig;

      if (config) {
        config.relayerUrl = "https://relayer.testnet.zama.org";
        config.network = "https://ethereum-sepolia-rpc.publicnode.com";
        config.aclContractAddress = "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D";
        config.kmsContractAddress = "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A";
        config.inputVerifierContractAddress = "0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0";
        config.verifyingContractAddressDecryption = "0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478";
        config.verifyingContractAddressInputVerification = "0x483b9dE06E4E4C7D35CCf5837A1668487406D955";
        config.gatewayChainId = 10901;
      }

      if (!config) {
        throw new Error(
          "Config (ZamaEthereumConfig or SepoliaConfig) is not available on window.relayerSDK after initialization"
        );
      }

      if (typeof config !== "object") {
        throw new Error(`Config is not an object, got: ${typeof config}`);
      }

      if (!("verifyingContractAddressDecryption" in config)) {
        throw new Error("Config is missing required property: verifyingContractAddressDecryption");
      }
      try {
        const instance = await createInstance(config);
        return instance;
      } catch (createError) {
        throw createError;
      }
    },
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: (failureCount: number) => {
      console.debug(
        `🔍 [ZamaRelayer] Retry attempt ${failureCount}, window.relayerSDK exists:`,
        typeof window !== "undefined" && !!window.relayerSDK
      );
      if (typeof window !== "undefined" && !window.relayerSDK && failureCount < 10) {
        console.error("❌ [ZamaRelayer] Relayer SDK not found on window object.");
        return true; // Retry to wait for SDK to load
      }
      return false;
    },
    retryDelay: 1_000,
    staleTime: 60 * 60_000,
  });

  console.debug("🔍 [ZamaRelayer] Query state:", {
    status,
    isLoading,
    isError,
    hasData: !!data,
    error: error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
      : null,
  });

  return data;
}
