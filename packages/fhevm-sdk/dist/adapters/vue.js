/**
 * Vue Adapter - Universal FHEVM SDK
 * Vue composables for FHEVM operations
 */
// Vue types will be available when used in Vue projects
// @ts-ignore
import { ref, computed } from 'vue';
import { initializeFheInstance, createEncryptedInput, decryptValue, publicDecrypt as corePublicDecrypt, decryptMultipleHandles } from '../core/index.js';
// Wallet composable
export function useWalletVue() {
    const address = ref('');
    const isConnected = ref(false);
    const chainId = ref(0);
    const isConnecting = ref(false);
    const error = ref('');
    const connect = async () => {
        if (!window.ethereum) {
            error.value = 'MetaMask not detected';
            return;
        }
        try {
            isConnecting.value = true;
            error.value = '';
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                address.value = accounts[0];
                isConnected.value = true;
                // Get chain ID
                const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
                chainId.value = parseInt(chainIdHex, 16);
            }
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Connection failed';
        }
        finally {
            isConnecting.value = false;
        }
    };
    const disconnect = () => {
        address.value = '';
        isConnected.value = false;
        chainId.value = 0;
        error.value = '';
    };
    return {
        address: computed(() => address.value),
        isConnected: computed(() => isConnected.value),
        chainId: computed(() => chainId.value),
        isConnecting: computed(() => isConnecting.value),
        error: computed(() => error.value),
        connect,
        disconnect,
    };
}
// FHEVM composable
export function useFhevmVue() {
    const instance = ref(null);
    const status = ref('idle');
    const error = ref('');
    const initialize = async () => {
        try {
            status.value = 'loading';
            error.value = '';
            instance.value = await initializeFheInstance();
            status.value = 'ready';
        }
        catch (err) {
            status.value = 'error';
            error.value = err instanceof Error ? err.message : 'FHEVM initialization failed';
        }
    };
    const isInitialized = computed(() => status.value === 'ready');
    return {
        instance: computed(() => instance.value),
        status: computed(() => status.value),
        error: computed(() => error.value),
        initialize,
        isInitialized,
    };
}
// Contract composable
export function useContractVue(address, abi) {
    const contract = ref(null);
    const isReady = ref(false);
    const error = ref('');
    const initializeContract = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not detected');
            }
            const provider = new window.ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            contract.value = new window.ethers.Contract(address, abi, signer);
            isReady.value = true;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Contract initialization failed';
        }
    };
    return {
        contract: computed(() => contract.value),
        isReady: computed(() => isReady.value),
        error: computed(() => error.value),
        initializeContract,
    };
}
// Decryption composable
export function useDecryptVue() {
    const isDecrypting = ref(false);
    const error = ref('');
    const decrypt = async (contractAddress, signer, ciphertextHandle) => {
        try {
            isDecrypting.value = true;
            error.value = '';
            const result = await decryptValue(ciphertextHandle, contractAddress, signer);
            return result;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Decryption failed';
            return null;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    const publicDecrypt = async (encryptedData) => {
        try {
            isDecrypting.value = true;
            error.value = '';
            const result = await corePublicDecrypt(encryptedData);
            return result;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Public decryption failed';
            return null;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    const decryptMultiple = async (contractAddress, signer, handles) => {
        try {
            isDecrypting.value = true;
            error.value = '';
            const result = await decryptMultipleHandles(contractAddress, signer, handles);
            return result;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Multiple decryption failed';
            return null;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    return {
        decrypt,
        publicDecrypt,
        decryptMultiple,
        isDecrypting: computed(() => isDecrypting.value),
        error: computed(() => error.value),
    };
}
// Encryption composable
export function useEncryptVue() {
    const isEncrypting = ref(false);
    const error = ref('');
    const encrypt = async (contractAddress, userAddress, value) => {
        try {
            isEncrypting.value = true;
            error.value = '';
            const result = await createEncryptedInput(contractAddress, userAddress, value);
            return result;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Encryption failed';
            return null;
        }
        finally {
            isEncrypting.value = false;
        }
    };
    return {
        encrypt,
        isEncrypting: computed(() => isEncrypting.value),
        error: computed(() => error.value),
    };
}
// Combined FHEVM operations composable
export function useFhevmOperationsVue() {
    const isEncrypting = ref(false);
    const isDecrypting = ref(false);
    const isProcessing = ref(false);
    const encryptError = ref('');
    const decryptError = ref('');
    const message = ref('');
    const encrypt = async (contractAddress, userAddress, value) => {
        try {
            isEncrypting.value = true;
            encryptError.value = '';
            message.value = 'Encrypting value...';
            const result = await createEncryptedInput(contractAddress, userAddress, value);
            message.value = 'Encryption successful';
            return result;
        }
        catch (err) {
            encryptError.value = err instanceof Error ? err.message : 'Encryption failed';
            message.value = 'Encryption failed';
            return null;
        }
        finally {
            isEncrypting.value = false;
        }
    };
    const decrypt = async (contractAddress, signer, ciphertextHandle) => {
        try {
            isDecrypting.value = true;
            decryptError.value = '';
            message.value = 'Decrypting value...';
            const result = await decryptValue(ciphertextHandle, contractAddress, signer);
            message.value = 'Decryption successful';
            return result;
        }
        catch (err) {
            decryptError.value = err instanceof Error ? err.message : 'Decryption failed';
            message.value = 'Decryption failed';
            return null;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    const publicDecrypt = async (encryptedData) => {
        try {
            isDecrypting.value = true;
            decryptError.value = '';
            message.value = 'Public decrypting value...';
            const result = await corePublicDecrypt(encryptedData);
            message.value = 'Public decryption successful';
            return result;
        }
        catch (err) {
            decryptError.value = err instanceof Error ? err.message : 'Public decryption failed';
            message.value = 'Public decryption failed';
            return null;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    const decryptMultiple = async (contractAddress, signer, handles) => {
        try {
            isDecrypting.value = true;
            decryptError.value = '';
            message.value = 'Decrypting multiple handles...';
            const result = await decryptMultipleHandles(contractAddress, signer, handles);
            message.value = 'Multiple decryption successful';
            return result;
        }
        catch (err) {
            decryptError.value = err instanceof Error ? err.message : 'Multiple decryption failed';
            message.value = 'Multiple decryption failed';
            return null;
        }
        finally {
            isDecrypting.value = false;
        }
    };
    const executeTransaction = async (contract, method, ...args) => {
        try {
            isProcessing.value = true;
            message.value = 'Executing transaction...';
            const tx = await contract[method](...args);
            const receipt = await tx.wait();
            message.value = 'Transaction successful';
            return { tx, receipt };
        }
        catch (err) {
            message.value = 'Transaction failed';
            return { tx: null, receipt: null };
        }
        finally {
            isProcessing.value = false;
        }
    };
    const isBusy = computed(() => isEncrypting.value || isDecrypting.value || isProcessing.value);
    const hasError = computed(() => !!encryptError.value || !!decryptError.value);
    return {
        encrypt,
        decrypt,
        publicDecrypt,
        decryptMultiple,
        executeTransaction,
        isEncrypting: computed(() => isEncrypting.value),
        isDecrypting: computed(() => isDecrypting.value),
        isProcessing: computed(() => isProcessing.value),
        encryptError: computed(() => encryptError.value),
        decryptError: computed(() => decryptError.value),
        message: computed(() => message.value),
        isBusy,
        hasError,
    };
}
