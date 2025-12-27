"use client"

import { use, useMemo, useState } from "react"
import { useFhevm } from "@/lib/hooks"
import { CheckWhitelistPublic } from "@/components/features/veil/CheckWhitelistPublic"
import Link from "next/link"
import WalletButton from "@/components/common/WalletButton/index"

export default function VeilCampaignCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const campaignId = useMemo(() => Number(resolvedParams.id), [resolvedParams.id])
  const [message, setMessage] = useState<string>("")

  const { status: fhevmStatus, initialize: initializeFhevm, error: fhevmError } = useFhevm()

  if (fhevmStatus === "idle") {
    initializeFhevm()
  }

  const targetChainId = 11155111

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-background" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-foreground text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors">
                  Veil
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">Encrypted Whitelist</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4">
              {fhevmStatus === "ready" && (
                <div className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-accent text-xs font-semibold">FHE Ready</span>
                </div>
              )}

              <WalletButton />
            </nav>
          </div>
        </div>
      </header>

      {message && (
        <div className="px-4 sm:px-6 py-3 bg-yellow-500/10 border-b-2 border-yellow-500/20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
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
          <div className="max-w-5xl mx-auto text-destructive text-sm font-medium">FHEVM Error: {fhevmError}</div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Campaign #{campaignId}</h1>
          <p className="text-muted-foreground">Check whitelist for this campaign</p>
        </div>

        {Number.isFinite(campaignId) && campaignId > 0 ? (
          <CheckWhitelistPublic campaignId={campaignId} chainId={targetChainId} onMessage={setMessage} />
        ) : (
          <div className="info-card border-destructive/30">
            <p className="text-destructive text-sm text-center">Invalid Campaign ID</p>
          </div>
        )}
      </main>
    </div>
  )
}
