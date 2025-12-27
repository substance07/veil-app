/**
 * Universal FHEVM SDK
 * Clean, simple implementation that actually works
 */
// Core FHEVM functionality
export * from './core/index.js';
// Framework adapters - explicit exports to avoid conflicts
export { useWallet, useFhevm, useContract, useDecrypt, useEncrypt } from './adapters/react.js';
// Vue adapter is not exported by default to avoid bundling Vue in non-Vue projects
// Import directly from './adapters/vue.js' if needed
export { FhevmNode } from './adapters/node.js';
