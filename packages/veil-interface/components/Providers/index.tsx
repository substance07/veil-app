"use client";

import { defaultChain, networks, projectId, wagmiAdapter } from "@/web3/config";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const metadata = {
  name: "Veil Whitelist",
  description: "Encrypted whitelist management for campaigns using Fully Homomorphic Encryption (FHE) technology.",
  url: "https://veil-whitelist.vercel.app/",
  icons: ["https://veil-whitelist.vercel.app/favicon.ico"],
};

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  // @ts-expect-error
  networks: networks,
  defaultNetwork: defaultChain,
  metadata: metadata,
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
    // socials: false,
    // email: false,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "var(--primary)",
    "--w3m-border-radius-master": "1px",
  },
});

export default function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
