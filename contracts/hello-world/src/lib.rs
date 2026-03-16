#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, BytesN, Env, Vec};

#[contract]
pub struct GuessNumberContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Game(u64),
    Leaderboard(Address),
    LeaderboardPlayers,
    Round,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Hint {
    Higher,
    Lower,
    Correct,
    GameOver,
    None,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GameStatus {
    Active,
    Won,
    Lost,
    Finished,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GameRecord {
    pub game_id: u64,
    pub player_wallet: Address,
    pub secret_number_hash: BytesN<32>,
    pub secret_number: u32,
    pub guess_count: u32,
    pub status: GameStatus,
    pub timestamp: u64,
    pub max_attempts: u32,
    pub last_hint: Hint,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LeaderboardEntry {
    pub player_wallet: Address,
    pub games_won: u32,
    pub best_score: u32,
    pub total_attempts: u32,
}

#[contractimpl]
impl GuessNumberContract {
    pub fn start_game(env: Env, player_wallet: Address, max_attempts: u32, seed: u64) -> u64 {
        if max_attempts == 0 {
            panic!("max attempts must be greater than zero");
        }

        let round = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::Round)
            .unwrap_or(0)
            + 1;
        env.storage().persistent().set(&DataKey::Round, &round);

        let secret_number = Self::pseudo_secret(&env, seed);
        let game_id = Self::game_id(&env, round, seed);
        let secret_number_hash = Self::hash_secret(&env, secret_number);
        let timestamp = env.ledger().timestamp();

        let game = GameRecord {
            game_id,
            player_wallet: player_wallet.clone(),
            secret_number_hash,
            secret_number,
            guess_count: 0,
            status: GameStatus::Active,
            timestamp,
            max_attempts,
            last_hint: Hint::None,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Game(game_id), &game);
        Self::ensure_leaderboard_player(&env, &player_wallet);

        game_id
    }

    pub fn submit_guess(env: Env, game_id: u64, guessed_number: u32) -> Hint {
        if guessed_number == 0 || guessed_number > 100 {
            panic!("guess must be between 1 and 100");
        }

        let mut game = env
            .storage()
            .persistent()
            .get::<DataKey, GameRecord>(&DataKey::Game(game_id))
            .unwrap_or_else(|| panic!("game not found"));

        if game.status != GameStatus::Active {
            panic!("game is not active");
        }

        game.guess_count += 1;

        let hint = if guessed_number == game.secret_number {
            game.status = GameStatus::Won;
            Self::update_leaderboard(&env, &game.player_wallet, game.guess_count);
            Hint::Correct
        } else if game.guess_count >= game.max_attempts {
            game.status = GameStatus::Lost;
            Hint::GameOver
        } else if guessed_number < game.secret_number {
            Hint::Higher
        } else {
            Hint::Lower
        };

        game.last_hint = hint.clone();
        env.storage()
            .persistent()
            .set(&DataKey::Game(game_id), &game);

        hint
    }

    pub fn get_hint(env: Env, game_id: u64) -> Hint {
        let game = env
            .storage()
            .persistent()
            .get::<DataKey, GameRecord>(&DataKey::Game(game_id))
            .unwrap_or_else(|| panic!("game not found"));

        game.last_hint
    }

    pub fn finish_game(env: Env, game_id: u64) -> GameStatus {
        let mut game = env
            .storage()
            .persistent()
            .get::<DataKey, GameRecord>(&DataKey::Game(game_id))
            .unwrap_or_else(|| panic!("game not found"));

        if game.status == GameStatus::Active {
            game.status = GameStatus::Finished;
            game.last_hint = Hint::GameOver;
            env.storage()
                .persistent()
                .set(&DataKey::Game(game_id), &game);
        }

        game.status
    }

    pub fn get_game(env: Env, game_id: u64) -> GameRecord {
        env.storage()
            .persistent()
            .get::<DataKey, GameRecord>(&DataKey::Game(game_id))
            .unwrap_or_else(|| panic!("game not found"))
    }

    pub fn get_leaderboard(env: Env) -> Vec<LeaderboardEntry> {
        let players = env
            .storage()
            .persistent()
            .get::<DataKey, Vec<Address>>(&DataKey::LeaderboardPlayers)
            .unwrap_or_else(|| Vec::new(&env));

        let mut entries = Vec::<LeaderboardEntry>::new(&env);
        let len = players.len();

        for i in 0..len {
            let player = players
                .get(i)
                .unwrap_or_else(|| panic!("leaderboard player missing"));
            let key = DataKey::Leaderboard(player.clone());
            if let Some(entry) = env.storage().persistent().get::<DataKey, LeaderboardEntry>(&key) {
                entries.push_back(entry);
            }
        }

        Self::sort_leaderboard(entries)
    }

    // Legacy wrappers retained for compatibility with earlier scaffolded clients.
    pub fn start_new_round(env: Env, secret_number: u32, max_attempts: u32) -> u64 {
        if secret_number == 0 || secret_number > 100 {
            panic!("secret number must be between 1 and 100");
        }
        if max_attempts == 0 {
            panic!("max attempts must be greater than zero");
        }

        let round = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::Round)
            .unwrap_or(0)
            + 1;
        env.storage().persistent().set(&DataKey::Round, &round);

        let game_id = Self::game_id(&env, round, secret_number as u64);
        let game = GameRecord {
            game_id,
            player_wallet: env.current_contract_address(),
            secret_number_hash: Self::hash_secret(&env, secret_number),
            secret_number,
            guess_count: 0,
            status: GameStatus::Active,
            timestamp: env.ledger().timestamp(),
            max_attempts,
            last_hint: Hint::None,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Game(game_id), &game);

        game_id
    }

    pub fn guess(env: Env, game_id: u64, guessed_number: u32) -> Hint {
        Self::submit_guess(env, game_id, guessed_number)
    }

    pub fn get_state(env: Env, game_id: u64) -> GameRecord {
        Self::get_game(env, game_id)
    }

    fn game_id(env: &Env, round: u32, seed: u64) -> u64 {
        let _ = env;
        let _ = round;
        seed
    }

    fn pseudo_secret(env: &Env, seed: u64) -> u32 {
        let _ = env;
        let mixed = seed
            .wrapping_mul(1_103_515_245)
            .wrapping_add(1_013_904_223)
            .rotate_left(13);

        ((mixed % 100) + 1) as u32
    }

    fn hash_secret(env: &Env, secret_number: u32) -> BytesN<32> {
        let payload = Bytes::from_array(env, &secret_number.to_be_bytes());
        env.crypto().sha256(&payload).into()
    }

    fn ensure_leaderboard_player(env: &Env, player: &Address) {
        let mut players = env
            .storage()
            .persistent()
            .get::<DataKey, Vec<Address>>(&DataKey::LeaderboardPlayers)
            .unwrap_or_else(|| Vec::new(env));

        let len = players.len();
        for i in 0..len {
            let existing = players
                .get(i)
                .unwrap_or_else(|| panic!("leaderboard player missing"));
            if existing == player.clone() {
                return;
            }
        }

        players.push_back(player.clone());
        env.storage()
            .persistent()
            .set(&DataKey::LeaderboardPlayers, &players);
    }

    fn update_leaderboard(env: &Env, player: &Address, guess_count: u32) {
        let key = DataKey::Leaderboard(player.clone());
        let mut entry = env
            .storage()
            .persistent()
            .get::<DataKey, LeaderboardEntry>(&key)
            .unwrap_or(LeaderboardEntry {
                player_wallet: player.clone(),
                games_won: 0,
                best_score: 0,
                total_attempts: 0,
            });

        entry.games_won += 1;
        entry.total_attempts += guess_count;
        if entry.best_score == 0 || guess_count < entry.best_score {
            entry.best_score = guess_count;
        }

        env.storage().persistent().set(&key, &entry);
        Self::ensure_leaderboard_player(env, player);
    }

    fn sort_leaderboard(mut entries: Vec<LeaderboardEntry>) -> Vec<LeaderboardEntry> {
        let len = entries.len();

        if len < 2 {
            return entries;
        }

        for i in 0..len {
            let limit = len - i - 1;
            for j in 0..limit {
                let left = entries
                    .get(j)
                    .unwrap_or_else(|| panic!("left leaderboard entry missing"));
                let right = entries
                    .get(j + 1)
                    .unwrap_or_else(|| panic!("right leaderboard entry missing"));

                if Self::leaderboard_swap_needed(&left, &right) {
                    entries.set(j, right);
                    entries.set(j + 1, left);
                }
            }
        }

        entries
    }

    fn leaderboard_swap_needed(left: &LeaderboardEntry, right: &LeaderboardEntry) -> bool {
        if left.games_won < right.games_won {
            return true;
        }

        left.games_won == right.games_won && left.best_score > right.best_score
    }
}

mod test;
