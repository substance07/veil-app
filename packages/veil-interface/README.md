# 🔐 Veil Whitelist

> An encrypted whitelist management system for campaigns using Fully Homomorphic Encryption (FHE) technology.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📖 Overview

**Veil Whitelist** is a decentralized application (DApp) that enables campaign creators to manage encrypted whitelists for their campaigns. Built with **Fully Homomorphic Encryption (FHE)** technology, the platform allows users to check their whitelist status without revealing their addresses to the public.

### Key Highlights

- 🔒 **Privacy-First**: Whitelist addresses are encrypted using FHE technology
- 🚀 **Campaign Management**: Create campaigns and manage encrypted whitelists
- ⛓️ **Blockchain Native**: Built on Ethereum with smart contract integration
- 🔍 **Private Verification**: Users can check whitelist status without exposing their addresses

## ✨ Features

### For Campaign Creators

- **Campaign Creation**: Create new campaigns with custom names
- **Whitelist Management**: Add addresses to encrypted whitelists
- **Campaign Dashboard**: View all your created campaigns
- **Share Links**: Generate unique links for each campaign to share with users

### For Users

- **Private Verification**: Check whitelist status without exposing your address
- **Easy Access**: Use campaign ID or direct link to check status
- **Secure**: All whitelist data is encrypted using FHE technology

### Platform Features

- **FHE Encryption**: Fully Homomorphic Encryption for privacy-preserving whitelist checks
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Wallet Integration**: Support for multiple Web3 wallets via Reown AppKit
- **Smart Contract Integration**: Direct interaction with VeilWhitelist smart contract

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) with App Router
- **UI Library**: [React 19.1.0](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **State Management**: [TanStack Query](https://tanstack.com/query)

### Web3 & Blockchain

- **Ethereum Library**: [Ethers.js v6](https://docs.ethers.org/) + [Viem](https://viem.sh/)
- **Wallet Integration**: [Wagmi](https://wagmi.sh/) + [Reown AppKit](https://appkit.reown.com/)
- **FHE Integration**: [Zama FHE Relayer SDK](https://docs.zama.ai/) + [@fhevm-sdk](https://github.com/zama-ai/fhevm-js)
- **Contract Types**: [TypeChain](https://github.com/dethcrypto/TypeChain) for type-safe contract interactions

### Infrastructure

- **Deployment**: [Vercel](https://vercel.com/) or any Next.js-compatible platform

### Development Tools

- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Linting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Web3 Wallet** (MetaMask, WalletConnect, etc.)
- Access to Ethereum network (Sepolia testnet or mainnet)

### Installation

1. **Clone the repository**

\`\`\`bash
git clone <repository-url>
cd veil-app/interface/packages/veil-interface
\`\`\`

2. **Install dependencies**

\`\`\`bash
pnpm install
\`\`\`

3. **Set up environment variables** (optional)

Create a `.env.local` file in the root directory if you need to customize settings:

\`\`\`env
# WalletConnect Project ID (optional - currently hardcoded)
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Custom RPC URL (optional - uses default from Reown AppKit)
# NEXT_PUBLIC_RPC_URL=your_rpc_url

# Chain ID (optional - defaults to Sepolia)
# NEXT_PUBLIC_CHAIN_ID=11155111
\`\`\`

4. **Generate contract types** (if needed)

\`\`\`bash
pnpm typechain:build
\`\`\`

5. **Run the development server**

\`\`\`bash
pnpm dev
\`\`\`

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

\`\`\`bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests with Vitest

# TypeScript
pnpm typechain:build  # Generate TypeChain types from ABIs
\`\`\`

## 📁 Project Structure

\`\`\`
veil-interface/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── veil/              # Veil Whitelist routes
│   │   │   ├── page.tsx       # Home page
│   │   │   └── campaigns/     # Campaign pages
│   │   │       ├── page.tsx   # Campaign management
│   │   │       └── [id]/      # Campaign check page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── common/            # Reusable components (WalletButton, etc.)
│   │   ├── features/          # Feature-specific components
│   │   │   └── veil/         # Veil Whitelist component
│   │   ├── Providers/         # Web3 providers
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useWeb3.ts     # Web3 connection hook
│   │   │   ├── useEthersSigner.ts
│   │   │   ├── useContract.ts
│   │   │   └── useZamaRelayerInstance.ts
│   │   └── utils/             # Utility functions
│   │
│   └── web3/
│       ├── abis/              # Smart contract ABIs
│       │   └── VeilWhitelist.json
│       ├── contracts/         # TypeChain generated contracts
│       └── core/              # Web3 utilities
│           ├── config.ts      # Wagmi/AppKit config
│           └── constants/    # Contract addresses
│
├── public/                     # Static assets
└── package.json
\`\`\`

## 📚 Documentation

### Smart Contract Integration

The platform interacts with the VeilWhitelist smart contract on Ethereum:

- `VeilWhitelist` - Main contract for managing encrypted whitelists
  - Create campaigns
  - Add addresses to whitelist (encrypted)
  - Check whitelist status (private verification)

### Routes

- `/veil` - Home page with campaign overview
- `/veil/campaigns` - Campaign management page (create, add whitelist)
- `/veil/campaigns/[id]` - Campaign check page (verify whitelist status)

### FHE Encryption

The app uses Zama's FHE technology to encrypt whitelist addresses:
- Addresses are encrypted before being stored on-chain
- Users can verify their whitelist status without revealing their address
- Only the contract owner can decrypt and manage the whitelist

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHE technology and Relayer SDK
- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the component library foundation
- [Reown AppKit](https://appkit.reown.com/) for wallet integration

---

**Built with ❤️ for privacy-preserving whitelist management**

For questions or support, please open an issue on GitHub.
