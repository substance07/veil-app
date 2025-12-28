"use client";

import { useEffect } from "react";
import { useFhevm as useFhevmSDK } from "@fhevm-sdk";

type FhevmStatus = "idle" | "initializing" | "ready" | "error";

export function useFhevm() {
  const { instance, status: sdkStatus, error: sdkError, initialize: sdkInitialize, isInitialized } = useFhevmSDK();

  const status: FhevmStatus =
    sdkStatus === "idle"
      ? "idle"
      : sdkStatus === "loading"
        ? "initializing"
        : sdkStatus === "ready"
          ? "ready"
          : "error";

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && status === "idle") {
      const timer = setTimeout(() => {
        if (status === "idle") {
          sdkInitialize();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [status, sdkInitialize]);

  return {
    status,
    error: sdkError || null,
    initialize: sdkInitialize,
    instance,
  };
}
