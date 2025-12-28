import { useState, useCallback } from 'react';
import { initializeFheInstance } from '../core/index.js';
export function useFhevm(options) {
    const [instance, setInstance] = useState(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const initialize = useCallback(async () => {
        if (status === 'ready' || status === 'loading') {
            console.log(`⏭️ Skipping FHEVM initialization - status: ${status}`);
            return;
        }
        setStatus('loading');
        setError('');
        try {
            const fheInstance = await initializeFheInstance(options);
            setInstance(fheInstance);
            setStatus('ready');
            console.log('✅ FHEVM initialized');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStatus('error');
            console.error('❌ FHEVM initialization failed:', err);
        }
    }, [status, options]);
    return {
        instance,
        status,
        error,
        initialize,
        isInitialized: status === 'ready',
    };
}
