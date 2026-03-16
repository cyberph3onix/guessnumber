import axios from 'axios';

export type Hint = 'higher' | 'lower' | 'correct' | 'gameover' | 'none';
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface GuessRecord {
  number: number;
  hint: Hint;
  timestamp: string;
}

export interface ChainReceipt {
  contractId: string | null;
  networkPassphrase: string | null;
  rpcUrl: string | null;
  txHash: string | null;
  record: {
    game_id: string;
    player_wallet: string;
    secret_number_hash: string;
    guess_count: number;
    status: 'playing' | 'won' | 'lost';
    timestamp: number;
  };
}

export interface GameSnapshot {
  game_id: string;
  player_wallet: string;
  secret_number_hash: string;
  guess_count: number;
  max_attempts: number;
  status: 'playing' | 'won' | 'lost';
  timestamp: number;
  guesses: GuessRecord[];
  last_hint: Hint;
  message?: string;
  hint?: Hint;
  chainReceipt?: ChainReceipt;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  gamesWon: number;
  totalAttempts: number;
  bestScore: number;
  avgAttempts: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function withApiPrefix(path: string) {
  return path.startsWith('/api/') ? path : `/api${path}`;
}

async function getWithFallback<T>(path: string): Promise<T> {
  try {
    const res = await http.get<T>(withApiPrefix(path));
    return res.data;
  } catch {
    const res = await http.get<T>(path);
    return res.data;
  }
}

async function postWithFallback<T>(path: string, body: Record<string, unknown>): Promise<T> {
  try {
    const res = await http.post<T>(withApiPrefix(path), body);
    return res.data;
  } catch {
    const res = await http.post<T>(path, body);
    return res.data;
  }
}

export async function startGame(wallet: string | null, maxAttempts = 10): Promise<GameSnapshot> {
  return postWithFallback<GameSnapshot>('/start-game', {
    wallet,
    maxAttempts,
  });
}

export async function submitGuess(gameId: string, guess: number): Promise<GameSnapshot> {
  return postWithFallback<GameSnapshot>('/submit-guess', {
    gameId,
    guess,
  });
}

export async function getGame(gameId: string): Promise<GameSnapshot> {
  return getWithFallback<GameSnapshot>(`/game/${gameId}`);
}

export async function getGames(wallet?: string | null): Promise<GameSnapshot[]> {
  const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : '';
  return getWithFallback<GameSnapshot[]>(`/games${query}`);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return getWithFallback<LeaderboardEntry[]>('/leaderboard');
}
