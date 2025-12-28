let fheInstance = null;
let initializationPromise = null;
export async function initializeFheInstance(options) {
    if (fheInstance) {
        console.log('♻️ Reusing existing FHEVM instance');
        return fheInstance;
    }
    if (initializationPromise) {
        console.log('⏳ FHEVM initialization already in progress, waiting...');
        return initializationPromise;
    }
    initializationPromise = (async () => {
        try {
            if (typeof window !== 'undefined' && window.ethereum) {
                fheInstance = await initializeBrowserFheInstance();
            }
            else {
                fheInstance = await initializeNodeFheInstance(options?.rpcUrl);
            }
            return fheInstance;
        }
        catch (error) {
            initializationPromise = null;
            throw error;
        }
    })();
    return initializationPromise;
}
async function initializeBrowserFheInstance() {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
    }
    let sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
        throw new Error('RelayerSDK not loaded. Please include the script tag in your HTML:\n<script src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"></script>');
    }
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    console.log('✅ FHEVM SDK initialized with CDN');
    const config = { ...SepoliaConfig, network: window.ethereum };
    try {
        fheInstance = await createInstance(config);
        return fheInstance;
    }
    catch (err) {
        console.error('FHEVM browser instance creation failed:', err);
        throw err;
    }
}
async function initializeNodeFheInstance(rpcUrl) {
    try {
        console.log('🚀 Initializing REAL FHEVM Node.js instance...');
        const finalRpcUrl = rpcUrl ||
            (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_RPC_URL) ||
            'https://ethereum-sepolia-rpc.publicnode.com';
        if (!finalRpcUrl || typeof finalRpcUrl !== 'string' || !finalRpcUrl.startsWith('http')) {
            throw new Error(`Invalid RPC URL: ${finalRpcUrl}. Please provide a valid RPC URL via NEXT_PUBLIC_RPC_URL environment variable or rpcUrl parameter.`);
        }
        console.log(`📡 Using RPC URL: ${finalRpcUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        const relayerSDKModule = await eval('import("@zama-fhe/relayer-sdk/node")');
        const { createInstance, SepoliaConfig, generateKeypair } = relayerSDKModule;
        const ethersModule = await eval('import("ethers")');
        let provider;
        let network;
        try {
            provider = new ethersModule.ethers.JsonRpcProvider(finalRpcUrl);
            network = await provider.getNetwork();
            console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);
        }
        catch (providerError) {
            console.error('❌ Failed to create or connect to RPC provider:', providerError.message);
            throw new Error(`RPC connection failed: ${providerError.message}. Please check your RPC URL: ${finalRpcUrl}`);
        }
        const chainIdHex = `0x${network.chainId.toString(16)}`;
        const eip1193Provider = {
            request: async ({ method, params }) => {
                try {
                    switch (method) {
                        case 'eth_chainId':
                            return chainIdHex;
                        case 'eth_accounts':
                            return ['---YOUR-ADDRESS-HERE---'];
                        case 'eth_requestAccounts':
                            return ['---YOUR-ADDRESS-HERE---'];
                        case 'eth_call':
                            try {
                                return await provider.call(params[0]);
                            }
                            catch (callError) {
                                if (callError.code === 'CALL_EXCEPTION') {
                                    console.warn(`⚠️ Call exception for ${method}:`, callError.message);
                                    return null;
                                }
                                throw callError;
                            }
                        case 'eth_sendTransaction':
                            return await provider.broadcastTransaction(params[0]);
                        default:
                            throw new Error(`Unsupported method: ${method}`);
                    }
                }
                catch (error) {
                    console.error(`❌ EIP-1193 provider error for ${method}:`, error.message);
                    throw error;
                }
            },
            on: () => { },
            removeListener: () => { }
        };
        const config = {
            ...SepoliaConfig,
            network: eip1193Provider
        };
        fheInstance = await createInstance(config);
        console.log('✅ REAL FHEVM Node.js instance created successfully!');
        return fheInstance;
    }
    catch (err) {
        const errorMessage = err?.message || 'Unknown error';
        console.error('❌ FHEVM Node.js instance creation failed:', errorMessage);
        if (errorMessage.includes('CALL_EXCEPTION') || errorMessage.includes('missing revert data')) {
            console.error('💡 Tip: This error usually means the RPC endpoint cannot reach the FHEVM contract.');
            console.error('💡 Try using a different RPC URL or check if the network is accessible.');
        }
        if (errorMessage.includes('network') || errorMessage.includes('detect network')) {
            console.error('💡 Tip: Check your RPC URL and ensure the network is accessible.');
        }
        throw err;
    }
}
export function getFheInstance() {
    return fheInstance;
}
export async function decryptValue(encryptedBytes, contractAddress, signer) {
    const fhe = getFheInstance();
    if (!fhe)
        throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');
    try {
        console.log('🔐 Using EIP-712 user decryption for handle:', encryptedBytes);
        const keypair = fhe.generateKeypair();
        const handleContractPairs = [
            {
                handle: encryptedBytes,
                contractAddress: contractAddress,
            },
        ];
        const startTimeStamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";
        const contractAddresses = [contractAddress];
        const eip712 = fhe.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
        const signature = await signer.signTypedData(eip712.domain, {
            UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        }, eip712.message);
        const result = await fhe.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, signature.replace("0x", ""), contractAddresses, await signer.getAddress(), startTimeStamp, durationDays);
        return Number(result[encryptedBytes]);
    }
    catch (error) {
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
            throw new Error('Decryption service is temporarily unavailable. Please try again later.');
        }
        throw error;
    }
}
export async function batchDecryptValues(handles, contractAddress, signer) {
    const fhe = getFheInstance();
    if (!fhe)
        throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');
    try {
        console.log('🔐 Using EIP-712 batch user decryption for handles:', handles);
        const keypair = fhe.generateKeypair();
        const handleContractPairs = handles.map(handle => ({
            handle,
            contractAddress: contractAddress,
        }));
        const startTimeStamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";
        const contractAddresses = [contractAddress];
        const eip712 = fhe.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
        const signature = await signer.signTypedData(eip712.domain, {
            UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        }, eip712.message);
        const result = await fhe.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, signature.replace("0x", ""), contractAddresses, await signer.getAddress(), startTimeStamp, durationDays);
        // Convert result to numbers
        const decryptedValues = {};
        for (const handle of handles) {
            decryptedValues[handle] = Number(result[handle]);
        }
        return decryptedValues;
    }
    catch (error) {
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
            throw new Error('Decryption service is temporarily unavailable. Please try again later.');
        }
        throw error;
    }
}
export async function encryptValue(contractAddress, address, plainDigits) {
    const relayer = getFheInstance();
    if (!relayer)
        throw new Error("FHEVM not initialized");
    const inputHandle = relayer.createEncryptedInput(contractAddress, address);
    for (const d of plainDigits) {
        inputHandle.add8(d);
    }
    const ciphertextBlob = await inputHandle.encrypt();
    return ciphertextBlob;
}
export async function createEncryptedInput(contractAddress, userAddress, value) {
    const fhe = getFheInstance();
    if (!fhe)
        throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');
    console.log(`🔐 Creating encrypted input for contract ${contractAddress}, user ${userAddress}, value ${value}`);
    const inputHandle = fhe.createEncryptedInput(contractAddress, userAddress);
    inputHandle.add32(value);
    const result = await inputHandle.encrypt();
    console.log('✅ Encrypted input created successfully');
    console.log('🔍 Encrypted result structure:', result);
    if (result && typeof result === 'object') {
        if (result.handles && Array.isArray(result.handles) && result.handles.length > 0) {
            return {
                encryptedData: result.handles[0],
                proof: result.inputProof
            };
        }
        else if (result.encryptedData && result.proof) {
            return {
                encryptedData: result.encryptedData,
                proof: result.proof
            };
        }
        else {
            return {
                encryptedData: result,
                proof: result
            };
        }
    }
    return {
        encryptedData: result,
        proof: result
    };
}
export async function publicDecrypt(encryptedBytes) {
    const fhe = getFheInstance();
    if (!fhe)
        throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');
    try {
        let handle = encryptedBytes;
        if (typeof handle === "string" && handle.startsWith("0x") && handle.length === 66) {
            console.log('🔓 Calling publicDecrypt with handle:', handle);
            const result = await fhe.publicDecrypt([handle]);
            console.log('🔓 publicDecrypt returned:', result);
            let decryptedValue;
            if (result && typeof result === 'object') {
                if (result.clearValues && typeof result.clearValues === 'object') {
                    decryptedValue = result.clearValues[handle];
                    console.log('🔓 Extracted from clearValues:', decryptedValue);
                    console.log('🔓 Value type:', typeof decryptedValue);
                    console.log('🔓 Is BigInt?', typeof decryptedValue === 'bigint');
                }
                else if (Array.isArray(result)) {
                    decryptedValue = result[0];
                    console.log('🔓 Extracted from array:', decryptedValue);
                }
                else {
                    decryptedValue = result[handle] || Object.values(result)[0];
                    console.log('🔓 Extracted from object:', decryptedValue);
                }
            }
            else {
                decryptedValue = result;
                console.log('🔓 Direct value:', decryptedValue);
            }
            let numberValue;
            if (typeof decryptedValue === 'bigint') {
                numberValue = Number(decryptedValue);
                console.log('🔓 Converted BigInt to number:', numberValue);
            }
            else {
                numberValue = Number(decryptedValue);
                console.log('🔓 Converted to number:', numberValue);
            }
            if (isNaN(numberValue)) {
                console.error('❌ Decryption returned NaN. Raw value:', decryptedValue);
                console.error('❌ Full response structure:', {
                    hasClearValues: !!result?.clearValues,
                    hasAbiEncoded: !!result?.abiEncodedClearValues,
                    hasProof: !!result?.decryptionProof,
                    clearValuesKeys: result?.clearValues ? Object.keys(result.clearValues) : []
                });
                throw new Error(`Decryption returned invalid value: ${decryptedValue}`);
            }
            console.log('🔓 Final number value:', numberValue);
            return numberValue;
        }
        else {
            throw new Error('Invalid ciphertext handle for decryption');
        }
    }
    catch (error) {
        console.error('❌ Decryption error:', error);
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
            throw new Error('Decryption service is temporarily unavailable. Please try again later.');
        }
        throw error;
    }
}
export async function requestUserDecryption(contractAddress, signer, ciphertextHandle) {
    const relayer = getFheInstance();
    if (!relayer)
        throw new Error("FHEVM not initialized");
    const keypair = relayer.generateKeypair();
    const handleContractPairs = [
        {
            handle: ciphertextHandle,
            contractAddress: contractAddress,
        },
    ];
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];
    const eip712 = relayer.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
    const signature = await signer.signTypedData(eip712.domain, {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
    }, eip712.message);
    const result = await relayer.userDecrypt(handleContractPairs, keypair.privateKey, keypair.publicKey, signature.replace("0x", ""), contractAddresses, await signer.getAddress(), startTimeStamp, durationDays);
    return Number(result[ciphertextHandle]);
}
export async function decryptMultipleHandles(contractAddress, signer, handles) {
    const relayer = getFheInstance();
    if (!relayer)
        throw new Error("FHEVM not initialized");
    if (!handles || handles.length === 0) {
        throw new Error("Handles array cannot be empty");
    }
    console.log('🔐 Calling publicDecrypt with handles:', handles);
    const result = await relayer.publicDecrypt(handles);
    console.log('🔐 publicDecrypt result structure:', {
        hasClearValues: !!result?.clearValues,
        hasAbiEncoded: !!result?.abiEncodedClearValues,
        hasProof: !!result?.decryptionProof,
        clearValuesKeys: result?.clearValues ? Object.keys(result.clearValues) : [],
        resultKeys: Object.keys(result || {})
    });
    const values = handles.map(handle => {
        let decrypted;
        if (result?.clearValues && typeof result.clearValues === 'object') {
            decrypted = result.clearValues[handle];
            console.log(`🔐 Extracted ${handle} from clearValues:`, decrypted, 'Type:', typeof decrypted);
        }
        else if (result && typeof result === 'object') {
            decrypted = result[handle];
            console.log(`🔐 Extracted ${handle} from result:`, decrypted);
        }
        else {
            throw new Error(`Failed to decrypt handle: ${handle} - result format not recognized`);
        }
        if (decrypted === undefined || decrypted === null) {
            throw new Error(`Failed to decrypt handle: ${handle} - value not found`);
        }
        let numberValue;
        if (typeof decrypted === 'bigint') {
            numberValue = Number(decrypted);
            console.log(`🔐 Converted BigInt to number for ${handle}:`, numberValue);
        }
        else {
            numberValue = Number(decrypted);
        }
        if (isNaN(numberValue)) {
            throw new Error(`Decryption returned invalid value for handle ${handle}: ${decrypted}`);
        }
        return numberValue;
    });
    const abiEncodedClearValues = result?.abiEncodedClearValues;
    const decryptionProof = result?.decryptionProof;
    console.log('🔐 Proof check:', {
        hasAbiEncoded: !!abiEncodedClearValues,
        hasProof: !!decryptionProof,
        proofType: typeof decryptionProof
    });
    if (!decryptionProof) {
        console.error('❌ Decryption proof not found. Full result:', result);
        throw new Error("Decryption proof not found in result. Result structure: " + JSON.stringify(Object.keys(result || {})));
    }
    let cleartexts;
    if (abiEncodedClearValues) {
        cleartexts = abiEncodedClearValues;
        console.log('🔐 Using abiEncodedClearValues from result');
    }
    else {
        const { ethers } = await import('ethers');
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();
        const types = handles.map(() => 'uint32');
        cleartexts = abiCoder.encode(types, values);
        console.log('🔐 Encoded cleartexts manually:', cleartexts);
    }
    console.log('🔐 Final values:', values);
    console.log('🔐 Cleartexts length:', cleartexts?.length);
    console.log('🔐 Proof length:', decryptionProof?.length);
    return {
        cleartexts,
        decryptionProof,
        values
    };
}
export async function fetchPublicDecryption(handles) {
    const relayer = getFheInstance();
    if (!relayer)
        throw new Error("FHEVM not initialized");
    return relayer.publicDecrypt(handles);
}
