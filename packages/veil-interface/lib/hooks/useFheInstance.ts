"use client"

import { useFhevm } from "./useFhevm"
import { getFheInstance as getFheInstanceSDK } from "@fhevm-sdk"

// Hook version to get FHE instance from @fhevm-sdk
export function useFheInstance() {
  const { instance } = useFhevm()
  
  // Cache instance so getFheInstance() can access it
  if (instance) {
    cachedInstance = instance
  }
  
  return instance
}

// Function to get FHE instance (compatible with @fhevm-sdk API)
// Prefer using instance from @fhevm-sdk, fallback to cached instance
let cachedInstance: any = null

export function getFheInstance() {
  // Try to get from @fhevm-sdk first
  try {
    const sdkInstance = getFheInstanceSDK()
    if (sdkInstance) {
      return sdkInstance
    }
  } catch (e) {
    // If not available, use cached instance
  }
  
  // Return cached instance if available (set by useFheInstance)
  return cachedInstance
}

// Internal function to cache instance (called by useFheInstance)
export function setCachedFheInstance(instance: any) {
  cachedInstance = instance
}
