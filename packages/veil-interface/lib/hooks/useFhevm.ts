"use client"

import { useEffect } from "react"
import { useFhevm as useFhevmSDK } from "@fhevm-sdk"

type FhevmStatus = "idle" | "initializing" | "ready" | "error"

/**
 * Wrapper hook for compatibility with current API
 * Uses @fhevm-sdk internally
 */
export function useFhevm() {
  const { instance, status: sdkStatus, error: sdkError, initialize: sdkInitialize, isInitialized } = useFhevmSDK()

  // Map status from @fhevm-sdk to current status
  const status: FhevmStatus = 
    sdkStatus === "idle" ? "idle" :
    sdkStatus === "loading" ? "initializing" :
    sdkStatus === "ready" ? "ready" :
    "error"

  // Auto-initialize when wallet is connected
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && status === "idle") {
      // Wait a bit to ensure SDK has loaded
      const timer = setTimeout(() => {
        if (status === "idle") {
          sdkInitialize()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status, sdkInitialize])

  return {
    status,
    error: sdkError || null,
    initialize: sdkInitialize,
    instance, // Expose instance so other hooks can use it
  }
}
