"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useWeb3 from "@/lib/hooks/useWeb3"
import { useFhevm } from "@/lib/hooks"
import { MainNav } from "@/components/layout/MainNav"

export default function HomePage() {
  const router = useRouter()
  const [campaignIdInput, setCampaignIdInput] = useState("")
  const [inputError, setInputError] = useState("")

  const { address: account, isConnected } = useWeb3()
  const { status: fhevmStatus, initialize: initializeFhevm } = useFhevm()

  useEffect(() => {
    if (isConnected && fhevmStatus === "idle") {
      initializeFhevm()
    }
  }, [isConnected, fhevmStatus, initializeFhevm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCampaignIdInput(value)

    if (value && value.trim()) {
      const id = Number(value.trim())
      if (!Number.isFinite(id) || id <= 0) {
        setInputError("Invalid Campaign ID")
      } else {
        setInputError("")
      }
    } else {
      setInputError("")
    }
  }

  const handleCheckNavigate = () => {
    const trimmed = campaignIdInput.trim()
    const id = Number(trimmed)
    if (!trimmed || !Number.isFinite(id) || id <= 0) return
    router.push(`/veil/campaigns/${id}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !inputError && campaignIdInput.trim()) {
      handleCheckNavigate()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/20 backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-semibold">Powered by Zama FHE</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Private Whitelist
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                Management
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create encrypted whitelists, verify access privately, and protect user data with fully homomorphic
              encryption on blockchain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/veil/campaigns" className="btn-primary text-lg px-8 py-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Building
              </Link>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Campaign ID"
                  value={campaignIdInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full sm:w-48 px-4 py-3 rounded-xl bg-card border-2 transition-all focus:outline-none text-foreground placeholder:text-muted-foreground ${
                    inputError ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                <button
                  onClick={handleCheckNavigate}
                  disabled={!!inputError || !campaignIdInput.trim()}
                  className="btn-secondary whitespace-nowrap"
                >
                  Check Status →
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-4xl mx-auto">
            <div className="info-card text-center hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground text-sm">Private Verification</div>
            </div>
            <div className="info-card text-center hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">FHE</div>
              <div className="text-muted-foreground text-sm">Encrypted On-Chain</div>
            </div>
            <div className="info-card text-center hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">Web3</div>
              <div className="text-muted-foreground text-sm">Decentralized</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to private whitelist management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="info-card hover:border-primary/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Create Campaign</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Set up a new encrypted whitelist with a custom name
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="info-card hover:border-primary/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Add Addresses</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Upload wallet addresses encrypted with FHE
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="info-card hover:border-primary/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Share & Verify</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Users check status without revealing their address
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="info-card bg-gradient-to-br from-card to-secondary">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-primary text-sm font-semibold">Built with Zama FHEVM</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Privacy-First Technology</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Leveraging Fully Homomorphic Encryption to enable computations on encrypted data without ever revealing
                sensitive information. Your addresses stay private, even during verification.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-primary font-semibold text-sm">Zama</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-primary font-semibold text-sm">FHEVM</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-primary font-semibold text-sm">Ethereum</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-primary font-semibold text-sm">Next.js</span>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/veil/campaigns" className="btn-primary text-base">
                  Get Started Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
