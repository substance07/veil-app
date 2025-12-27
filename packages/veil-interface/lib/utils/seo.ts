import { Metadata } from "next";

export type TSEO = {
  title: string;
  keywords?: string[];
  description: string;
};

const defaultSEO: TSEO = {
  title: "Veil Whitelist – Encrypted Whitelist for Campaigns",
  description:
    "Veil Whitelist is an encrypted whitelist management system for campaigns, powered by Fully Homomorphic Encryption (FHE).",
  keywords: ["Veil", "Whitelist", "FHE", "Encryption", "Campaign"],
};

export function generateMetadata({ title, description, keywords }: Partial<TSEO> = {}): Metadata {
  return {
    title: title ?? defaultSEO.title,
    description: description ?? defaultSEO.description,
    // metadataBase: new URL(""),
    keywords: keywords ?? defaultSEO.keywords,
    twitter: {
      title: title ?? defaultSEO.title,
      description: description ?? defaultSEO.description,
      site: "@zama_fhe",
    },
    openGraph: {
      title: title ?? defaultSEO.title,
      description: description ?? defaultSEO.description,
      siteName: "Veil Whitelist",
    },
  };
}
