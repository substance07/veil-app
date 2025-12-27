"use client"

import { useEffect, useState } from "react"
import useWeb3 from "@/lib/hooks/useWeb3"
import { useFhevm } from "@/lib/hooks"
import { MainNav } from "@/components/layout/MainNav"
import { FheWhitelist } from "@/components/features/veil/FheWhitelist"

export default function VeilCampaignManagementPage() {
  const [message, setMessage] = useState<string>("")

  const { address: account, chainId, isConnected } = useWeb3()
  const { status: fhevmStatus, initialize: initializeFhevm, error: fhevmError } = useFhevm()

  useEffect(() => {
    if (isConnected && fhevmStatus === "idle") {
      initializeFhevm()
    }
  }, [isConnected, fhevmStatus, initializeFhevm])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MainNav />

      {/* Messages */}
      {message && (
        <div className="px-4 sm:px-6 py-3 bg-yellow-500/10 border-b-2 border-yellow-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-yellow-200 font-medium text-sm">{message}</span>
            <button
              onClick={() => setMessage("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close message"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {fhevmError && (
        <div className="px-4 sm:px-6 py-3 bg-destructive/10 border-b-2 border-destructive/20">
          <div className="max-w-7xl mx-auto text-destructive text-sm font-medium">FHEVM Error: {fhevmError}</div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <FheWhitelist
          account={account || ""}
          chainId={chainId || 0}
          isConnected={isConnected}
          isInitialized={fhevmStatus === "ready"}
          onMessage={setMessage}
          mode="manage"
        />
      </main>
    </div>
  )
}
