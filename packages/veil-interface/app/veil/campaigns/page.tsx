"use client";

import { useEffect, useState } from "react";
import useWeb3 from "@/lib/hooks/useWeb3";
import { useFhevm } from "@/lib/hooks";
import { MainNav } from "@/components/layout/MainNav";
import { CampaignManagement } from "@/components/features/veil/CampaignManagement";

export default function VeilCampaignManagementPage() {
  const [message, setMessage] = useState<string>("");

  const { address: account, chainId, isConnected } = useWeb3();
  const { status: fhevmStatus, initialize: initializeFhevm, error: fhevmError } = useFhevm();

  useEffect(() => {
    if (isConnected && fhevmStatus === "idle") {
      initializeFhevm();
    }
  }, [isConnected, fhevmStatus, initializeFhevm]);

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
        {fhevmStatus === "initializing" ? (
          <div className="info-card">
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 animate-spin text-primary mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-muted-foreground text-sm font-medium">Initializing FHE...</p>
              <p className="text-muted-foreground text-xs mt-2">Please wait a moment</p>
            </div>
          </div>
        ) : (
          <CampaignManagement
            account={account || ""}
            chainId={chainId || 0}
            isConnected={isConnected}
            isInitialized={fhevmStatus === "ready"}
            onMessage={setMessage}
            mode="manage"
          />
        )}
      </main>
    </div>
  );
}
