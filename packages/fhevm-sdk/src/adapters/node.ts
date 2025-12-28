import { 
  initializeFheInstance, 
  getFheInstance, 
  decryptValue,
  createEncryptedInput,
  publicDecrypt,
  decryptMultipleHandles
} from '../core/index.js';
import { ethers } from 'ethers';

export interface FhevmNodeOptions {
  rpcUrl?: string;
  privateKey?: string;
  chainId?: number;
}

export class FhevmNode {
  private instance: any = null;
  private isReady = false;
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private options: FhevmNodeOptions;

  constructor(options: FhevmNodeOptions = {}) {
    const defaultRpcUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_RPC_URL) ||
      'https://ethereum-sepolia-rpc.publicnode.com';
    
    this.options = {
      rpcUrl: options.rpcUrl || defaultRpcUrl,
      chainId: options.chainId || 11155111,
      ...options
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing FHEVM Node.js instance...');
      
      if (!this.options.rpcUrl || typeof this.options.rpcUrl !== 'string' || !this.options.rpcUrl.startsWith('http')) {
        throw new Error(`Invalid RPC URL: ${this.options.rpcUrl}. Please provide a valid RPC URL.`);
      }
      
      this.instance = await initializeFheInstance({ 
        rpcUrl: this.options.rpcUrl 
      });
      
      try {
        this.provider = new ethers.JsonRpcProvider(this.options.rpcUrl);
        
        const network = await this.provider.getNetwork();
        console.log(`✅ Provider connected to network: ${network.name} (chainId: ${network.chainId})`);
      } catch (providerError: any) {
        console.error('❌ Failed to create RPC provider:', providerError.message);
        throw new Error(`RPC connection failed: ${providerError.message}. Please check your RPC URL: ${this.options.rpcUrl}`);
      }
      
      if (this.options.privateKey) {
        this.wallet = new ethers.Wallet(this.options.privateKey, this.provider);
        console.log(`✅ Wallet connected: ${await this.wallet.getAddress()}`);
      } else {
        console.log('⚠️ No private key provided - wallet operations disabled');
      }
      
      this.isReady = true;
      console.log('✅ FHEVM Node instance ready');
    } catch (error) {
      console.error('❌ FHEVM Node initialization failed:', error);
      throw error;
    }
  }

  async encrypt(contractAddress: string, userAddress: string, value: number) {
    if (!this.isReady) throw new Error('FHEVM not initialized');
    console.log(`🔐 Encrypting value ${value} for contract ${contractAddress}, user ${userAddress}`);
    return createEncryptedInput(contractAddress, userAddress, value);
  }

  async decrypt(handle: string, contractAddress: string, signer?: any) {
    if (!this.isReady) throw new Error('FHEVM not initialized');
    
    const signerToUse = signer || this.wallet;
    if (!signerToUse) {
      throw new Error('No signer available. Provide a signer or initialize with privateKey');
    }
    
    console.log(`🔓 Decrypting handle ${handle} for contract ${contractAddress}`);
    return decryptValue(handle, contractAddress, signerToUse);
  }

  async publicDecrypt(handle: string) {
    if (!this.isReady) throw new Error('FHEVM not initialized');
    console.log(`🔓 Public decrypting handle ${handle}`);
    return publicDecrypt(handle);
  }

  async decryptMultiple(contractAddress: string, handles: string[], signer?: any) {
    if (!this.isReady) throw new Error('FHEVM not initialized');
    
    const signerToUse = signer || this.wallet;
    if (!signerToUse) {
      throw new Error('No signer available. Provide a signer or initialize with privateKey');
    }
    
    console.log(`🔓 Decrypting ${handles.length} handles for contract ${contractAddress}`);
    return decryptMultipleHandles(contractAddress, signerToUse, handles);
  }

  createContract(address: string, abi: any[]) {
    if (!this.provider) throw new Error('Provider not initialized');
    if (!this.wallet) throw new Error('Wallet not initialized - provide privateKey');
    
    return new ethers.Contract(address, abi, this.wallet);
  }

  async executeEncryptedTransaction(
    contract: ethers.Contract,
    methodName: string,
    encryptedData: any,
    ...additionalParams: any[]
  ) {
    if (!this.isReady) throw new Error('FHEVM not initialized');
    
    console.log(`📝 Executing encrypted transaction: ${methodName}`);
    
    try {
      let handle: any, proof: any;
      
      if (encryptedData && typeof encryptedData === 'object') {
        if (encryptedData.handles && Array.isArray(encryptedData.handles) && encryptedData.handles.length > 0) {
          handle = encryptedData.handles[0];
          proof = encryptedData.inputProof;
        } else if (encryptedData.encryptedData && encryptedData.proof) {
          handle = encryptedData.encryptedData;
          proof = encryptedData.proof;
        } else {
          handle = encryptedData;
          proof = encryptedData;
        }
      } else {
        handle = encryptedData;
        proof = encryptedData;
      }
      
      if (handle instanceof Uint8Array) {
        handle = ethers.hexlify(handle);
      }
      if (proof instanceof Uint8Array) {
        proof = ethers.hexlify(proof);
      }
      
      const tx = await contract[methodName](
        handle,
        proof,
        ...additionalParams
      );
      
      console.log(`✅ Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed: ${receipt?.hash}`);
      
      return receipt;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  async getAddress(): Promise<string | null> {
    if (!this.wallet) return null;
    return this.wallet.getAddress();
  }

  getProvider() {
    return this.provider;
  }

  getWallet() {
    return this.wallet;
  }

  getInstance() {
    return this.instance;
  }

  getStatus() {
    return this.isReady ? 'ready' : 'idle';
  }

  getConfig() {
    return {
      rpcUrl: this.options.rpcUrl,
      chainId: this.options.chainId,
      hasWallet: !!this.wallet,
      hasProvider: !!this.provider,
      isReady: this.isReady
    };
  }
}
