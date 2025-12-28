# 🔐 Veil App - Private Whitelist Management

A private whitelist management application built with FHEVM, allowing you to create and manage fully encrypted whitelist lists on the blockchain. User addresses are encrypted using Fully Homomorphic Encryption (FHE), ensuring absolute privacy even during verification.

## 🌟 **Key Features**

- **🔒 Private Whitelist Management** - Create and manage whitelist campaigns with FHE encryption
- **🛡️ Privacy Protection** - Addresses are fully encrypted and never exposed on the blockchain
- **✅ Zero-Knowledge Verification** - Users can check whitelist status without revealing their address
- **📦 Universal FHEVM SDK** - Framework-agnostic SDK supporting React, Next.js, Vue, and Node.js
- **⚡ Next.js Interface** - Modern web interface with Next.js 16 and React 19

## 🏗️ **Project Architecture**

```
veil-app/
├── packages/
│   ├── fhevm-sdk/                    # Universal FHEVM SDK Core
│   │   ├── src/
│   │   │   ├── core/                 # Core FHEVM functionality
│   │   │   │   ├── fhevm.ts         # FHEVM client initialization
│   │   │   │   ├── contracts.ts     # Contract interaction utilities
│   │   │   │   └── index.ts         # Core exports
│   │   │   └── adapters/             # Framework-specific adapters
│   │   │       ├── react.ts          # React hooks
│   │   │       ├── useWallet.ts      # Wallet connection hook
│   │   │       ├── useFhevm.ts       # FHEVM instance hook
│   │   │       ├── useContract.ts    # Contract interaction hook
│   │   │       ├── useEncrypt.ts     # Encryption hook
│   │   │       ├── useDecrypt.ts     # Decryption hook
│   │   │       ├── vue.ts            # Vue composables
│   │   │       └── node.ts           # Node.js class adapter
│   │   └── dist/                     # Built output
│   │
│   ├── smart-contract/               # Smart Contracts
│   │   ├── contracts/
│   │   │   └── VeilWhitelist.sol    # Main whitelist contract
│   │   ├── deploy/                   # Deployment scripts
│   │   ├── test/                     # Contract tests
│   │   └── types/                    # TypeScript types
│   │
│   └── veil-interface/               # Next.js Frontend
│       ├── app/                      # Next.js App Router
│       │   ├── page.tsx              # Home page
│       │   └── veil/
│       │       └── campaigns/        # Campaign management pages
│       ├── components/               # React components
│       │   ├── features/veil/        # Veil-specific components
│       │   ├── common/               # Shared components
│       │   └── ui/                   # UI components
│       ├── lib/                      # Utilities and hooks
│       └── web3/                      # Web3 integration
│           ├── contracts/            # Contract wrappers
│           └── abis/                  # Contract ABIs
│
├── scripts/
│   └── generateTsAbis.ts             # ABI generation script
├── pnpm-workspace.yaml              # Monorepo configuration
└── README.md                         # This file
```

## 📐 **Data Architecture**

```
┌─────────────────────────────────────────────────────────┐
│              Veil Interface (Next.js)                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Campaign Management Pages                       │  │
│  │  - Create Campaign                               │  │
│  │  - Add Encrypted Addresses                       │  │
│  │  - Verify Access                                 │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │  FHEVM SDK Adapters (React Hooks)                │  │
│  │  - useWallet, useFhevm, useEncrypt, useDecrypt   │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────┘
                  │
      ┌───────────▼───────────┐
      │   @fhevm-sdk/core     │
      │                       │
      │  - FHEVM Client       │
      │  - Encryption/Decrypt │
      │  - Contract Utils      │
      └───────────┬───────────┘
                  │
      ┌───────────▼───────────┐
      │  Zama Relayer SDK     │
      │  (@zama-fhe/relayer) │
      └───────────┬───────────┘
                  │
      ┌───────────▼───────────┐
      │  VeilWhitelist.sol    │
      │  (FHEVM Contract)     │
      └───────────────────────┘
```

## 🚀 **Quick Start**

### **Requirements**

- **Node.js** 20+
- **pnpm** (recommended) or npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (for testnet transactions)

### **Installation**

```bash
# 1. Clone repository
git clone <repository-url>
cd veil-app

# 2. Install dependencies
pnpm install

# 3. Build SDK
pnpm sdk:build

# 4. Compile smart contracts
pnpm compile

# 5. Generate TypeScript ABIs
pnpm generate
```

### **Run Application**

```bash
# Run Next.js interface (development)
pnpm start
# or
pnpm --filter veil-interface dev

# Interface will run at http://localhost:9099
```

### **Deploy Smart Contracts**

```bash
# Deploy to localhost
pnpm deploy:localhost

# Deploy to Sepolia testnet
pnpm deploy:sepolia
```

## 🛠️ **Development**

### **Main Scripts**

```bash
# Build SDK
pnpm sdk:build
pnpm sdk:watch          # Watch mode

# Smart Contracts
pnpm compile            # Compile contracts
pnpm hardhat:test       # Run contract tests
pnpm deploy:localhost   # Deploy to localhost
pnpm deploy:sepolia     # Deploy to Sepolia

# Frontend
pnpm start              # Start Next.js dev server
pnpm next:build         # Build Next.js app
pnpm next:lint          # Lint Next.js code

# Utilities
pnpm generate           # Generate TypeScript ABIs
pnpm format             # Format code
pnpm lint               # Lint all packages
```

### **Package Structure**

#### **fhevm-sdk**
Universal FHEVM SDK with adapters for multiple frameworks:
- React hooks (`useWallet`, `useFhevm`, `useEncrypt`, `useDecrypt`)
- Vue composables (`useWalletVue`, `useFhevmVue`, etc.)
- Node.js class (`FhevmNode`)

#### **smart-contract**
Smart contracts using FHEVM:
- `VeilWhitelist.sol` - Main contract for whitelist management
- Supports creating campaigns, adding encrypted addresses, and verifying access

#### **veil-interface**
Next.js frontend application:
- Campaign management UI
- Wallet integration
- FHEVM operations interface

## 📚 **Using the SDK**

### **React/Next.js Hooks**

```typescript
import { useWallet, useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk';

function WhitelistComponent() {
  // Wallet connection
  const { address, isConnected, connect } = useWallet();
  
  // FHEVM instance
  const { status, initialize, isInitialized } = useFhevm();
  
  // Encryption
  const { encrypt, isEncrypting } = useEncrypt();
  
  // Decryption
  const { decrypt, isDecrypting } = useDecrypt();
  
  useEffect(() => {
    if (isConnected && status === 'idle') {
      initialize();
    }
  }, [isConnected, status, initialize]);
  
  const handleAddToWhitelist = async () => {
    // Encrypt address
    const encrypted = await encrypt(contractAddress, address, address);
    // Add to whitelist via contract...
  };
  
  const handleCheckStatus = async () => {
    // Check whitelist status (encrypted)
    // Decrypt result if needed
  };
  
  return (
    <div>
      {!isConnected && <button onClick={connect}>Connect Wallet</button>}
      {isConnected && isInitialized && (
        <>
          <button onClick={handleAddToWhitelist}>Add to Whitelist</button>
          <button onClick={handleCheckStatus}>Check Status</button>
        </>
      )}
    </div>
  );
}
```

### **Vue Composables**

```typescript
<script setup lang="ts">
import { useWalletVue, useFhevmVue, useEncryptVue } from '@fhevm-sdk';

const { address, isConnected, connect } = useWalletVue();
const { status, initialize } = useFhevmVue();
const { encrypt } = useEncryptVue();

watch(() => isConnected.value, (newVal) => {
  if (newVal && status.value === 'idle') {
    initialize();
  }
});
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">Connect Wallet</button>
    <button v-if="isConnected" @click="handleAddToWhitelist">
      Add to Whitelist
    </button>
  </div>
</template>
```

### **Node.js Adapter**

```typescript
import { FhevmNode } from '@fhevm-sdk';

const fhevm = new FhevmNode({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  privateKey: 'YOUR_PRIVATE_KEY',
  chainId: 11155111
});

await fhevm.initialize();

// Encrypt address
const encrypted = await fhevm.encrypt(contractAddress, walletAddress, address);

// Interact with contract
  const contract = fhevm.createContract(contractAddress, abi);
await contract.addToWhitelist(encrypted.encryptedData, encrypted.proof);
```

## 🧪 **Testing**

### **Smart Contract Tests**

```bash
# Run all tests
pnpm hardhat:test

# Run from smart-contract package
cd packages/smart-contract
pnpm test
```

Tests run in Hardhat's FHEVM mock environment, allowing fast testing without a real network.

### **Frontend Tests**

```bash
# Run tests for veil-interface
cd packages/veil-interface
pnpm test
```

## 🏆 **Key Features**

### **✅ Universal FHEVM SDK**
- Framework-agnostic core
- Adapters for React, Vue, and Node.js
- Full TypeScript support
- Wagmi-like API pattern

### **✅ Private Whitelist Management**
- Create campaigns with custom names
- Add addresses encrypted with FHE
- Verify access without revealing addresses
- Manage ownership and permissions

### **✅ FHEVM 0.10.0 Support**
- EIP-712 signature-based decryption
- Public decryption support
- Encrypted address operations
- Real blockchain interactions

### **✅ Modern Tech Stack**
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Wagmi & Viem for Web3

## 📋 **Contract Details**

**VeilWhitelist Contract:**
- **Network:** Sepolia testnet (Chain ID: 11155111)
- **FHEVM Version:** 0.10.0
- **Relayer SDK:** 0.3.0-5

## 🔗 **Related Documentation**

- [FHEVM SDK Documentation](./packages/fhevm-sdk/README.md)
- [Smart Contract Documentation](./packages/smart-contract/README.md)
- [Veil Interface Documentation](./packages/veil-interface/README.md)

## 📝 **License**

BSD-3-Clause-Clear - see LICENSE file for details

## 🤝 **Contributing**

Contributions are welcome! Please see the contributing guide for more information.

---

**Built with Privacy for Private Whitelist Management using Zama FHEVM**
# veil-app
