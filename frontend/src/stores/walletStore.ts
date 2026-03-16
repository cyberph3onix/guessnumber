import { create } from 'zustand';

type FreighterApi = {
    isConnected?: () => Promise<boolean>;
    requestAccess: () => Promise<string | { address?: string; publicKey?: string }>;
};

declare global {
    interface Window {
        freighterApi?: FreighterApi;
    }
}

interface WalletState {
    connected: boolean;
    address: string | null;
    balance: number;
    connecting: boolean;
    error: string | null;

    connect: () => Promise<void>;
    disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
    connected: false,
    address: null,
    balance: 0,
    connecting: false,
    error: null,

    connect: async () => {
        set({ connecting: true, error: null });
        try {
            if (typeof window === 'undefined') {
                throw new Error('Wallet connection is only available in the browser.');
            }

            // Preferred integration path for current Freighter versions.
            try {
                const freighterApi = await import('@stellar/freighter-api');
                const status = await freighterApi.isConnected();
                if (status?.error) {
                    throw new Error(String(status.error));
                }
                if (!status?.isConnected) {
                    throw new Error('Freighter extension is not installed or not enabled.');
                }

                const access = await freighterApi.requestAccess();
                if (access?.error) {
                    throw new Error(String(access.error));
                }

                const address = access?.address || null;
                if (!address) {
                    throw new Error('Freighter did not return a wallet address.');
                }

                set({
                    connected: true,
                    address,
                    balance: 0,
                    connecting: false,
                    error: null,
                });
                return;
            } catch (apiError) {
                // Backward-compatible fallback for legacy injected API.
                if (window.freighterApi) {
                    const result = await window.freighterApi.requestAccess();
                    const address =
                        typeof result === 'string'
                            ? result
                            : result?.address || result?.publicKey || null;

                    if (!address || typeof address !== 'string') {
                        throw new Error('Freighter did not return a wallet address.');
                    }

                    set({
                        connected: true,
                        address,
                        balance: 0,
                        connecting: false,
                        error: null,
                    });
                    return;
                }

                throw apiError;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Wallet connection failed.';
            set({ connecting: false, error: message });
            throw new Error(message);
        }
    },

    disconnect: () =>
        set({
            connected: false,
            address: null,
            balance: 0,
            connecting: false,
            error: null,
        }),
}));
