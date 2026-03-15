#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env};

#[contract]
pub struct GuessNumberContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Secret,
    MaxAttempts,
    AttemptsUsed,
    Round,
    Active,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GuessOutcome {
    TooLow,
    TooHigh,
    Correct,
    GameOver,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GameState {
    pub round: u32,
    pub max_attempts: u32,
    pub attempts_used: u32,
    pub active: bool,
}

#[contractimpl]
impl GuessNumberContract {
    pub fn start_new_round(env: Env, secret_number: u32, max_attempts: u32) -> u32 {
        if secret_number > 100 {
            panic!("secret number must be between 0 and 100");
        }
        if max_attempts == 0 {
            panic!("max attempts must be greater than 0");
        }

        let round = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::Round)
            .unwrap_or(0)
            + 1;

        env.storage()
            .persistent()
            .set(&DataKey::Secret, &secret_number);
        env.storage()
            .persistent()
            .set(&DataKey::MaxAttempts, &max_attempts);
        env.storage().persistent().set(&DataKey::AttemptsUsed, &0u32);
        env.storage().persistent().set(&DataKey::Round, &round);
        env.storage().persistent().set(&DataKey::Active, &true);

        round
    }

    pub fn guess(env: Env, guessed_number: u32) -> GuessOutcome {
        let active = env
            .storage()
            .persistent()
            .get::<DataKey, bool>(&DataKey::Active)
            .unwrap_or(false);
        if !active {
            panic!("no active round");
        }

        let secret = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::Secret)
            .unwrap_or(0);
        let max_attempts = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::MaxAttempts)
            .unwrap_or(0);
        let attempts_used = env
            .storage()
            .persistent()
            .get::<DataKey, u32>(&DataKey::AttemptsUsed)
            .unwrap_or(0)
            + 1;

        env.storage()
            .persistent()
            .set(&DataKey::AttemptsUsed, &attempts_used);

        if guessed_number == secret {
            env.storage().persistent().set(&DataKey::Active, &false);
            return GuessOutcome::Correct;
        }

        if attempts_used >= max_attempts {
            env.storage().persistent().set(&DataKey::Active, &false);
            return GuessOutcome::GameOver;
        }

        if guessed_number < secret {
            GuessOutcome::TooLow
        } else {
            GuessOutcome::TooHigh
        }
    }

    pub fn get_state(env: Env) -> GameState {
        GameState {
            round: env
                .storage()
                .persistent()
                .get::<DataKey, u32>(&DataKey::Round)
                .unwrap_or(0),
            max_attempts: env
                .storage()
                .persistent()
                .get::<DataKey, u32>(&DataKey::MaxAttempts)
                .unwrap_or(0),
            attempts_used: env
                .storage()
                .persistent()
                .get::<DataKey, u32>(&DataKey::AttemptsUsed)
                .unwrap_or(0),
            active: env
                .storage()
                .persistent()
                .get::<DataKey, bool>(&DataKey::Active)
                .unwrap_or(false),
        }
    }
}

mod test;
