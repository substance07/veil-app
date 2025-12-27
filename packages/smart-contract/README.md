# VeilWhitelist - Privacy-Preserving Whitelist Protocol

<p align="center">
    <a target="blank"><img src="./logo.png" alt="VeilWhitelist Logo" width="200" /></a>
</p>

<p align="center">
A decentralized whitelist protocol focused on privacy, powered by Fully Homomorphic Encryption (FHE).
</p>

## Description

**VeilWhitelist** is a smart contract that enables anyone to create campaigns with encrypted whitelists. It leverages Fully Homomorphic Encryption (FHE) powered by the Zama protocol to enable private whitelist management—users can check their eligibility without revealing their addresses, and only the campaign owner can manage the encrypted whitelist.

## Features

1. **Public Campaign Creation**: Anyone can create a campaign and become its owner.

2. **Encrypted Whitelist Management**: Campaign owners can add, remove, and manage encrypted addresses in their whitelist.

3. **Private Eligibility Checks**: Users can privately check if their address is in the whitelist. The result is encrypted and only the user can decrypt it.

4. **Batch Operations**: Support for batch adding and removing whitelist entries for efficient management.

5. **Range Queries**: Support for chunked scanning of large whitelists using range queries.

6. **Ownership Transfer**: Campaign owners can transfer ownership to another address.

## How It Works

### 1. Creating a Campaign

Anyone can create a campaign by calling `createCampaign()` with an optional name. The caller becomes the campaign owner.

```solidity
uint256 campaignId = veilWhitelist.createCampaign("My Campaign");
```

### 2. Adding Whitelist Entries

The campaign owner can add encrypted addresses to the whitelist using `addWhitelist()`. Addresses must be encrypted using the Relayer SDK.

```solidity
veilWhitelist.addWhitelist(campaignId, encryptedAddresses, attestation);
```

### 3. Checking Eligibility

Users can privately check if their address is in the whitelist:

- **Full List Check**: `checkAccessAll()` - Checks the entire whitelist (suitable for small lists)
- **Range Check**: `checkAccessRange()` - Checks a specific range [start, end) for chunked scanning of large lists

The result is encrypted and only the caller can decrypt it off-chain.

### 4. Managing Whitelist

Campaign owners can:
- Remove a single entry: `removeWhitelistAt(index)`
- Remove multiple entries: `removeWhitelistBatch(indices)` - indices must be sorted in descending order
- Clear entire whitelist: `clearWhitelist()`

### 5. Transferring Ownership

Campaign owners can transfer ownership to another address:

```solidity
veilWhitelist.transferCampaignOwnership(campaignId, newOwner);
```

## Contract Architecture

### Main Contract: VeilWhitelist

- **Campaign Management**: Create campaigns, transfer ownership
- **Whitelist Management**: Add, remove, clear encrypted addresses
- **Private Queries**: Encrypted eligibility checks
- **Batch Operations**: Efficient batch management

## Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

**Option 1: Using Hardhat vars command (Recommended)**
```bash
# Set MNEMONIC
npx hardhat vars set MNEMONIC

# Set ETHERSCAN_API_KEY (optional, for contract verification)
npx hardhat vars set ETHERSCAN_API_KEY
```

**Option 2: Using .env file**
```bash
# Create .env file with your mnemonic
MNEMONIC="your mnemonic phrase here"
ETHERSCAN_API_KEY="your etherscan api key" # for verification
```

**View current variables:**
```bash
npx hardhat vars list
```

### Deploy to Local Network (Hardhat)

```bash
npx hardhat deploy --network hardhat
```

### Deploy to Anvil

```bash
npx hardhat deploy --network anvil
```

### Deploy to Sepolia Testnet

```bash
npx hardhat deploy --network sepolia
```

### Using Task Command

```bash
# Deploy to default network (hardhat)
npx hardhat deploy:VeilWhitelist

# Deploy to specific network
npx hardhat deploy:VeilWhitelist --network sepolia
```

### Verify Contract (after deployment)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Format Code

```bash
npm run prettier:write
```

## Tech Stack

- **Zama FHE VM**: Privacy-preserving computation layer
- **FHEVM Solidity**: Fully Homomorphic Encryption for Solidity
- **Hardhat**: Development and testing framework
- **Solidity**: Smart contract development (^0.8.24)
- **TypeScript**: Type-safe development

## Key Functions

### Campaign Management
- `createCampaign(string name)`: Create a new campaign
- `transferCampaignOwnership(uint256 campaignId, address newOwner)`: Transfer campaign ownership
- `getCampaignInfo(uint256 campaignId)`: Get campaign information
- `isCampaignOwner(uint256 campaignId, address account)`: Check if address is campaign owner

### Whitelist Management
- `addWhitelist(uint256 campaignId, externalEaddress[] addrsCt, bytes attestation)`: Add encrypted addresses to whitelist
- `removeWhitelistAt(uint256 campaignId, uint256 index)`: Remove whitelist entry at index
- `removeWhitelistBatch(uint256 campaignId, uint256[] indices)`: Remove multiple entries (indices must be descending)
- `clearWhitelist(uint256 campaignId)`: Clear entire whitelist
- `getEncryptedWhitelistAt(uint256 campaignId, uint256 i)`: Get encrypted entry at index (owner only)

### Eligibility Checks
- `checkAccessAll(uint256 campaignId, externalEaddress userAddrCt, bytes attestation)`: Check eligibility across entire list
- `checkAccessRange(uint256 campaignId, externalEaddress userAddrCt, bytes attestation, uint256 start, uint256 end)`: Check eligibility in range

## Events

- `CampaignCreated(uint256 indexed campaignId, address indexed owner, string name)`
- `CampaignOwnershipTransferred(uint256 indexed campaignId, address indexed prevOwner, address indexed newOwner)`
- `WhitelistAdded(uint256 indexed campaignId, uint256 count)`
- `WhitelistRemoved(uint256 indexed campaignId, uint256 index)`
- `WhitelistCleared(uint256 indexed campaignId)`

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)
- [How to set up a FHEVM Hardhat development environment](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [Run the FHEVM Hardhat Template Tests](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/run_test)
- [Write FHEVM Tests using Hardhat](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## License

[Apache-2.0](LICENSE)
