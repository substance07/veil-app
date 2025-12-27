"use client";

import { useState } from "react";
import type { VeilWhitelist } from "@/web3/contracts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateCampaignProps {
  writeContract: VeilWhitelist | null;
  isConnected: boolean;
  contractAddress: string | undefined;
  onCampaignCreated: (campaignId: number) => void;
  onMessage: (message: string) => void;
}

export function CreateCampaign({
  writeContract,
  isConnected,
  contractAddress,
  onCampaignCreated,
  onMessage,
}: CreateCampaignProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState<string>("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const createCampaign = async () => {
    if (!isConnected || !writeContract || !newCampaignName.trim() || !contractAddress) return;

    try {
      setIsCreatingCampaign(true);
      onMessage("Creating campaign...");

      const tx = await writeContract.createCampaign(newCampaignName.trim());
      onMessage("Waiting for confirmation...");
      const receipt = await tx.wait();

      // Get the campaign ID from events
      const campaignCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = writeContract.interface.parseLog(log);
          return parsed?.name === "CampaignCreated";
        } catch {
          return false;
        }
      });

      let newCampaignId = 0;
      if (campaignCreatedEvent) {
        try {
          const parsed = writeContract.interface.parseLog(campaignCreatedEvent);
          newCampaignId = Number(parsed?.args.campaignId);
        } catch (err) {
          console.error("Failed to parse campaign ID from event:", err);
        }
      }

      onMessage(`Campaign "${newCampaignName.trim()}" created successfully!`);
      setNewCampaignName("");
      onCampaignCreated(newCampaignId);
      setIsOpen(false);

      setTimeout(() => onMessage(""), 3000);
    } catch (error: any) {
      console.error("Create campaign failed:", error);
      onMessage("Failed to create campaign");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        New Campaign
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Create New Campaign
            </DialogTitle>
            <DialogDescription>Start a new encrypted whitelist campaign with FHE protection.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <label htmlFor="campaign-name" className="block text-sm font-medium text-foreground mb-2">
                Campaign Name
              </label>
              <input
                id="campaign-name"
                type="text"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="e.g., Early Adopters Whitelist"
                className="w-full bg-card border-2 border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                disabled={isCreatingCampaign}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isCreatingCampaign && newCampaignName.trim()) {
                    createCampaign();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Choose a descriptive name to identify this campaign.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isCreatingCampaign}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-medium text-sm hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!newCampaignName.trim() || isCreatingCampaign}
                className="flex-1 btn-primary"
              >
                {isCreatingCampaign ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
