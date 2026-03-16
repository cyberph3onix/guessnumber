const crypto = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID || '';
const NETWORK = process.env.SOROBAN_NETWORK || 'testnet';
const NETWORK_PASSPHRASE = process.env.SOROBAN_NETWORK_PASSPHRASE || '';
const RPC_URL = process.env.SOROBAN_RPC || process.env.SOROBAN_RPC_URL || '';
const SOURCE_ACCOUNT = process.env.SOROBAN_SOURCE || process.env.SOROBAN_SOURCE_ACCOUNT || '';
const SIGNING_SECRET = process.env.SOROBAN_SECRET || '';
const CLI_PATH = process.env.SOROBAN_CLI_PATH || 'stellar';
const ENABLE_ONCHAIN =
  String(process.env.SOROBAN_ENABLE_ONCHAIN || '').toLowerCase() === 'true';
const STRICT_ONCHAIN =
  String(process.env.STRICT_ONCHAIN || '').toLowerCase() === 'true';

function hashSecret(secretNumber) {
  return crypto.createHash('sha256').update(String(secretNumber)).digest('hex');
}

function onChainEnabled() {
  return ENABLE_ONCHAIN && CONTRACT_ID.length > 0 && SOURCE_ACCOUNT.length > 0;
}

function buildInvokeBaseArgs() {
  const args = ['contract', 'invoke', '--id', CONTRACT_ID];

  if (SOURCE_ACCOUNT) {
    args.push('--source-account', SOURCE_ACCOUNT);
  }

  if (SIGNING_SECRET) {
    args.push('--sign-with-key', SIGNING_SECRET);
  }

  if (NETWORK) {
    args.push('--network', NETWORK);
  }

  if (RPC_URL) {
    args.push('--rpc-url', RPC_URL);
  }

  if (NETWORK_PASSPHRASE) {
    args.push('--network-passphrase', NETWORK_PASSPHRASE);
  }

  args.push('--send', 'yes');

  args.push('--');
  return args;
}

function extractTxHash(text) {
  if (!text) {
    return null;
  }

  const match = text.match(/\b([A-Fa-f0-9]{64})\b/);
  return match ? match[1] : null;
}

function parseInvokeResult(stdout) {
  const output = String(stdout || '').trim();
  if (!output) {
    return null;
  }

  try {
    return JSON.parse(output);
  } catch (_err) {
    // Continue with plain-text parsing.
  }

  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const last = lines.length > 0 ? lines[lines.length - 1] : output;

  if (/^-?\d+$/.test(last)) {
    return last;
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(last)) {
    return last;
  }

  const numberMatch = last.match(/-?\d+/);
  if (numberMatch) {
    return numberMatch[0];
  }

  return last;
}

function normalizeHint(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('higher')) {
    return 'higher';
  }
  if (raw.includes('lower')) {
    return 'lower';
  }
  if (raw.includes('correct')) {
    return 'correct';
  }
  if (raw.includes('gameover') || raw.includes('game_over')) {
    return 'gameover';
  }
  if (raw.includes('none')) {
    return 'none';
  }
  return null;
}

async function invokeContract(functionName, argsMap) {
  const args = [...buildInvokeBaseArgs(), functionName];

  Object.entries(argsMap || {}).forEach(([key, value]) => {
    args.push(`--${key}`, String(value));
  });

  const result = await execFileAsync(CLI_PATH, args, {
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  });

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    txHash: extractTxHash(result.stdout) || extractTxHash(result.stderr),
    parsedResult: parseInvokeResult(result.stdout),
  };
}

function handleOnChainFailure(action, game, error, extra = {}) {
  const reason = error instanceof Error ? error.message : String(error);
  if (onChainEnabled() && STRICT_ONCHAIN) {
    throw new Error(`${action} failed in strict on-chain mode: ${reason}`);
  }

  return buildOnChainPayload(game, {
    mode: 'fallback',
    error: reason,
    ...extra,
  });
}

function buildOnChainPayload(game, options = {}) {
  const {
    mode = onChainEnabled() ? 'onchain' : 'mock',
    txHash = null,
    chainGameId = game.chain_game_id || null,
    contractHint = null,
    rawResult = null,
    error = null,
  } = options;

  return {
    enabled: onChainEnabled(),
    mode,
    strict_onchain: STRICT_ONCHAIN,
    tx_hash: txHash,
    result: rawResult,
    contractId: CONTRACT_ID || null,
    network: NETWORK || null,
    networkPassphrase: NETWORK_PASSPHRASE || null,
    rpcUrl: RPC_URL || null,
    source: SOURCE_ACCOUNT || null,
    txHash,
    chainGameId,
    contractHint,
    rawResult,
    error,
    record: {
      game_id: game.game_id,
      player_wallet: game.player_wallet,
      secret_number_hash: game.secret_number_hash,
      guess_count: game.guess_count,
      status: game.status,
      timestamp: game.timestamp,
    },
  };
}

async function startGameOnChain(game) {
  if (!onChainEnabled()) {
    return buildOnChainPayload(game, { mode: 'mock' });
  }

  try {
    const invoke = await invokeContract('start_new_round', {
      secret_number: game.secret_number,
      max_attempts: game.max_attempts,
    });

    const chainGameId = String(invoke.parsedResult || '').trim();

    if (/^-?\d+$/.test(chainGameId)) {
      game.chain_game_id = chainGameId;
    } else {
      throw new Error(`Unable to parse chain_game_id from start_new_round result: ${invoke.parsedResult}`);
    }

    return buildOnChainPayload(game, {
      mode: 'onchain',
      txHash: invoke.txHash,
      chainGameId,
      rawResult: invoke.parsedResult,
    });
  } catch (error) {
    return handleOnChainFailure('start_new_round', game, error);
  }
}

async function submitGuessOnChain(game) {
  if (!onChainEnabled()) {
    return buildOnChainPayload(game, { mode: 'mock' });
  }

  if (!game.chain_game_id || game.guesses.length === 0) {
    return buildOnChainPayload(game, {
      mode: 'fallback',
      error: 'Missing chain game mapping for guess invocation.',
    });
  }

  const latestGuess = game.guesses[game.guesses.length - 1];

  try {
    const invoke = await invokeContract('guess', {
      game_id: game.chain_game_id,
      guessed_number: latestGuess.number,
    });

    return buildOnChainPayload(game, {
      mode: 'onchain',
      txHash: invoke.txHash,
      chainGameId: game.chain_game_id,
      contractHint: normalizeHint(invoke.parsedResult),
      rawResult: invoke.parsedResult,
    });
  } catch (error) {
    return handleOnChainFailure('guess', game, error, {
      chainGameId: game.chain_game_id,
    });
  }
}

async function finishGameOnChain(game) {
  if (!onChainEnabled()) {
    return buildOnChainPayload(game, { mode: 'mock' });
  }

  if (!game.chain_game_id) {
    return buildOnChainPayload(game, {
      mode: 'fallback',
      error: 'Missing chain game mapping for finish invocation.',
    });
  }

  try {
    const invoke = await invokeContract('finish_game', {
      game_id: game.chain_game_id,
    });

    return buildOnChainPayload(game, {
      mode: 'onchain',
      txHash: invoke.txHash,
      chainGameId: game.chain_game_id,
      rawResult: invoke.parsedResult,
    });
  } catch (error) {
    return handleOnChainFailure('finish_game', game, error, {
      chainGameId: game.chain_game_id,
    });
  }
}

module.exports = {
  hashSecret,
  startGameOnChain,
  submitGuessOnChain,
  finishGameOnChain,
};
