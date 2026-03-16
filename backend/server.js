const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const {
    hashSecret,
    startGameOnChain,
    submitGuessOnChain,
    finishGameOnChain,
} = require('./sorobanService');

const app = express();
const PORT = process.env.PORT || 4000;
const STRICT_ONCHAIN =
    String(process.env.STRICT_ONCHAIN || '').toLowerCase() === 'true';

app.use(cors());
app.use(express.json());

// In-memory game store used as an API cache and fail-safe.
// On-chain integration hooks are exposed through sorobanService.
const games = new Map();
const leaderboard = new Map();

function generateSecret() {
    return Math.floor(Math.random() * 100) + 1;
}

function generateGameId() {
    return 'game_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

function normalizeWallet(wallet) {
    if (typeof wallet !== 'string' || wallet.length < 8) {
        return 'anonymous_wallet';
    }
    return wallet;
}

function publicGameResponse(game) {
    return {
        game_id: game.game_id,
        chain_game_id: game.chain_game_id || null,
        player_wallet: game.player_wallet,
        secret_number_hash: game.secret_number_hash,
        guess_count: game.guess_count,
        max_attempts: game.max_attempts,
        status: game.status,
        timestamp: game.timestamp,
        guesses: game.guesses,
        last_hint: game.last_hint,
    };
}

function compactWallet(wallet) {
    if (wallet.length <= 14) {
        return wallet;
    }
    return wallet.slice(0, 8) + '...' + wallet.slice(-4);
}

async function startGameHandler(req, res) {
    const { wallet, maxAttempts = 10 } = req.body;
    const safeMaxAttempts = Number(maxAttempts);

    if (!Number.isInteger(safeMaxAttempts) || safeMaxAttempts <= 0 || safeMaxAttempts > 20) {
        return res.status(400).json({
            error: 'maxAttempts must be an integer between 1 and 20',
        });
    }

    const gameId = generateGameId();
    const secret = generateSecret();
    const playerWallet = normalizeWallet(wallet);
    const timestamp = Date.now();

    const game = {
        game_id: gameId,
        chain_game_id: null,
        player_wallet: playerWallet,
        secret_number: secret,
        secret_number_hash: hashSecret(secret),
        guess_count: 0,
        max_attempts: safeMaxAttempts,
        guesses: [],
        status: 'playing',
        timestamp,
        last_hint: 'none',
    };

    games.set(gameId, game);

    console.log(`[NEW GAME] ${gameId} | Max: ${safeMaxAttempts} | Player: ${playerWallet}`);

    let chainReceipt;
    try {
        chainReceipt = await startGameOnChain(game);
    } catch (error) {
        games.delete(gameId);
        return res.status(502).json({
            error: 'Failed to initialize on-chain game.',
            reason: error instanceof Error ? error.message : String(error),
        });
    }

    return res.json({
        ...publicGameResponse(game),
        hint: game.last_hint,
        message: 'Game started. Guess a number between 1 and 100.',
        chainReceipt,
    });
}

async function submitGuessHandler(req, res) {
    const { gameId, guess } = req.body;
    const numericGuess = Number(guess);

    const game = games.get(gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'playing') {
        return res.status(400).json({ error: 'Game is already finished' });
    }

    if (!Number.isInteger(numericGuess) || numericGuess < 1 || numericGuess > 100) {
        return res.status(400).json({ error: 'Guess must be between 1 and 100' });
    }

    const previousState = {
        guess_count: game.guess_count,
        status: game.status,
        last_hint: game.last_hint,
        guesses: [...game.guesses],
    };

    game.guess_count++;

    let hint;
    if (numericGuess === game.secret_number) {
        hint = 'correct';
        game.status = 'won';
    } else if (game.guess_count >= game.max_attempts) {
        hint = 'gameover';
        game.status = 'lost';
    } else if (numericGuess < game.secret_number) {
        hint = 'higher';
    } else {
        hint = 'lower';
    }

    game.last_hint = hint;
    game.guesses.push({
        number: numericGuess,
        hint,
        timestamp: new Date().toISOString(),
    });

    console.log(
        `[GUESS] ${gameId} | Guess: ${numericGuess} | Hint: ${hint} | Attempts: ${game.guess_count}/${game.max_attempts}`
    );

    let chainReceipt;
    try {
        chainReceipt =
            game.status === 'playing'
                ? await submitGuessOnChain(game)
                : await finishGameOnChain(game);
    } catch (error) {
        game.guess_count = previousState.guess_count;
        game.status = previousState.status;
        game.last_hint = previousState.last_hint;
        game.guesses = previousState.guesses;

        return res.status(502).json({
            error: 'On-chain guess invocation failed.',
            reason: error instanceof Error ? error.message : String(error),
        });
    }

    if (hint === 'correct') {
        updateLeaderboard(game.player_wallet, game.guess_count);
    }

    if (chainReceipt.contractHint && chainReceipt.contractHint !== hint) {
        console.warn(
            `[CHAIN MISMATCH] ${gameId} | api=${hint} chain=${chainReceipt.contractHint}`
        );
    }

    return res.json({
        ...publicGameResponse(game),
        hint,
        chainReceipt,
    });
}

function gameByIdHandler(req, res) {
    const game = games.get(req.params.id);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    return res.json(publicGameResponse(game));
}

function leaderboardHandler(_req, res) {
    const entries = Array.from(leaderboard.values())
        .sort((a, b) => b.gamesWon - a.gamesWon || a.avgAttempts - b.avgAttempts)
        .slice(0, 20)
        .map((entry, i) => ({
            rank: i + 1,
            ...entry,
        }));

    return res.json(entries);
}

function gamesHandler(req, res) {
    const wallet = req.query.wallet;
    const allGames = Array.from(games.values())
        .filter((g) => {
            if (!wallet) {
                return true;
            }
            return g.player_wallet === wallet;
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((game) => publicGameResponse(game));

    return res.json(allGames);
}

// ═══════════════════════════════════════════
// Leaderboard Helper
// ═══════════════════════════════════════════
function updateLeaderboard(wallet, attempts) {
    const existing = leaderboard.get(wallet) || {
        wallet: compactWallet(wallet),
        gamesWon: 0,
        totalAttempts: 0,
        bestScore: Infinity,
        avgAttempts: 0,
    };

    existing.gamesWon++;
    existing.totalAttempts += attempts;
    existing.bestScore = Math.min(existing.bestScore, attempts);
    existing.avgAttempts = parseFloat(
        (existing.totalAttempts / existing.gamesWon).toFixed(1)
    );

    leaderboard.set(wallet, existing);
}

app.post('/start-game', startGameHandler);
app.post('/api/start-game', startGameHandler);
app.post('/submit-guess', submitGuessHandler);
app.post('/api/submit-guess', submitGuessHandler);
app.get('/game/:id', gameByIdHandler);
app.get('/api/game/:id', gameByIdHandler);
app.get('/leaderboard', leaderboardHandler);
app.get('/api/leaderboard', leaderboardHandler);
app.get('/games', gamesHandler);
app.get('/api/games', gamesHandler);

// ═══════════════════════════════════════════
// Health Check
// ═══════════════════════════════════════════
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        strictOnchain: STRICT_ONCHAIN,
        activeGames: games.size,
        leaderboardEntries: leaderboard.size,
        uptime: process.uptime(),
    });
});

// ═══════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════
app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   GuessNumber Stellar — API Server    ║
  ║   Running on port ${PORT}               ║
  ╚═══════════════════════════════════════╝
  `);
});
