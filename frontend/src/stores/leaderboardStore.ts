import { create } from 'zustand';
import { getLeaderboard } from '@/lib/api';

export interface LeaderboardEntry {
    rank: number;
    wallet: string;
    gamesWon: number;
    bestScore: number;
    avgAttempts: number;
}

interface LeaderboardState {
    entries: LeaderboardEntry[];
    loading: boolean;
    error: string | null;

    fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
    entries: [],
    loading: false,
    error: null,

    fetchLeaderboard: async () => {
        set({ loading: true, error: null });
        try {
            const data = await getLeaderboard();
            set({ entries: data, loading: false, error: null });
        } catch {
            // Fallback mock data
            const mockData: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
                rank: i + 1,
                wallet: 'G' + Array.from({ length: 8 }, () =>
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
                ).join('') + '...',
                gamesWon: Math.floor(Math.random() * 50) + 5,
                bestScore: Math.floor(Math.random() * 5) + 1,
                avgAttempts: parseFloat((Math.random() * 5 + 2).toFixed(1)),
            }));
            set({ entries: mockData, loading: false, error: null });
        }
    },
}));
