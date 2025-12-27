"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { EmptyState } from "@/components/common/EmptyState"

interface Campaign {
  id: number
  name: string
  owner: string
  exists: boolean
  whitelistSize: number
}

interface CampaignsListProps {
  campaigns: Campaign[]
  selectedCampaignId: number | null
  onSelectCampaign: (id: number) => void
  account: string
}

export function CampaignsList({ campaigns, selectedCampaignId, onSelectCampaign, account }: CampaignsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [displayCount, setDisplayCount] = useState(20)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const visibleCampaigns = filteredCampaigns.slice(0, displayCount)
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50
    if (bottom && visibleCampaigns.length < filteredCampaigns.length) {
      setDisplayCount((prev) => prev + 20)
    }
  }

  useEffect(() => {
    setDisplayCount(20)
  }, [searchQuery])

  const handleSelect = (id: number) => {
    onSelectCampaign(id)
    setIsOpen(false)
    setSearchQuery("")
  }

  if (campaigns.length === 0) {
    return (
      <div className="info-card">
        <EmptyState
          icon={
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          }
          title="No campaigns yet"
          description="Create your first encrypted whitelist campaign above to get started."
        />
      </div>
    )
  }

  return (
    <div className="info-card" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card border-2 border-border rounded-xl hover:border-border/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          {selectedCampaign ? (
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-bold text-sm">{selectedCampaign.name}</span>
                {selectedCampaign.owner.toLowerCase() === account.toLowerCase() && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Owner
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                #{selectedCampaign.id} • {selectedCampaign.whitelistSize} addresses
              </p>
            </div>
          ) : (
            <div className="text-left">
              <span className="text-foreground font-bold text-sm">Select Campaign</span>
              <p className="text-muted-foreground text-xs">{campaigns.length} campaigns available</p>
            </div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                {filteredCampaigns.length} {filteredCampaigns.length === 1 ? "result" : "results"}
              </p>
            )}
          </div>

          {/* Campaign list with infinite scroll */}
          <div ref={listRef} onScroll={handleScroll} className="max-h-[400px] overflow-y-auto">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 px-4">
                <svg
                  className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-muted-foreground text-sm">No campaigns found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleCampaigns.map((campaign) => {
                  const isSelected = selectedCampaignId === campaign.id
                  const isOwner = campaign.owner.toLowerCase() === account.toLowerCase()

                  return (
                    <button
                      key={campaign.id}
                      onClick={() => handleSelect(campaign.id)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-foreground font-medium text-sm truncate">{campaign.name}</span>
                            {isOwner && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium flex-shrink-0">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Owner
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">#{campaign.id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              {campaign.whitelistSize}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
                {/* Loading indicator for infinite scroll */}
                {visibleCampaigns.length < filteredCampaigns.length && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Showing {visibleCampaigns.length} of {filteredCampaigns.length} • Scroll for more
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
