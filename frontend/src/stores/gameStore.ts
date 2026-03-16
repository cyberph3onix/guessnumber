import { create } from 'zustand';
import { GameSnapshot, Hint } from '@/lib/api';

export interface Guess {
    number: number;
    hint: Hint;
    timestamp: number;
}

interface GameState {
    gameId: string | null;
    isPlaying: boolean;
    secretHash: string | null;
    playerWallet: string | null;
    guesses: Guess[];
    currentAttempt: number;
    maxAttempts: number;
    round: number;
    status: 'idle' | 'playing' | 'won' | 'lost';
    lastHint: Hint | null;

    startGame: (gameId: string, maxAttempts: number) => void;
    hydrateFromSnapshot: (snapshot: GameSnapshot) => void;
    addGuess: (guess: Guess) => void;
    setStatus: (status: 'idle' | 'playing' | 'won' | 'lost') => void;
    setHint: (hint: Hint) => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    gameId: null,
    isPlaying: false,
    secretHash: null,
    playerWallet: null,
    guesses: [],
    currentAttempt: 0,
    maxAttempts: 10,
    round: 0,
    status: 'idle',
    lastHint: null,

    startGame: (gameId, maxAttempts) =>
        set({
            gameId,
            isPlaying: true,
            guesses: [],
            currentAttempt: 0,
            maxAttempts,
            round: 1,
            status: 'playing',
            lastHint: null,
        }),

    hydrateFromSnapshot: (snapshot) =>
        set({
            gameId: snapshot.game_id,
            playerWallet: snapshot.player_wallet,
            secretHash: snapshot.secret_number_hash,
            guesses: snapshot.guesses.map((g) => ({
                number: g.number,
                hint: g.hint,
                timestamp: new Date(g.timestamp).getTime(),
            })),
            currentAttempt: snapshot.guess_count,
            maxAttempts: snapshot.max_attempts,
            status:
                snapshot.status === 'playing'
                    ? 'playing'
                    : snapshot.status === 'won'
                      ? 'won'
                      : 'lost',
            isPlaying: snapshot.status === 'playing',
            lastHint: snapshot.last_hint,
        }),

    addGuess: (guess) =>
        set((state) => ({
            guesses: [...state.guesses, guess],
            currentAttempt: state.currentAttempt + 1,
        })),

    setStatus: (status) =>
        set({ status, isPlaying: status === 'playing' }),

    setHint: (hint) =>
        set({ lastHint: hint }),

    resetGame: () =>
        set({
            gameId: null,
            isPlaying: false,
            secretHash: null,
            playerWallet: null,
            guesses: [],
            currentAttempt: 0,
            maxAttempts: 10,
            round: 0,
            status: 'idle',
            lastHint: null,
        }),
}));
