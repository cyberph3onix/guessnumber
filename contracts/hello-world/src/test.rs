#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn guess_flow_correct_path() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    let round = client.start_new_round(&42, &3);
    assert_eq!(round, 1);

    assert_eq!(client.guess(&20), GuessOutcome::TooLow);
    assert_eq!(client.guess(&50), GuessOutcome::TooHigh);
    assert_eq!(client.guess(&42), GuessOutcome::Correct);

    let state = client.get_state();
    assert_eq!(state.round, 1);
    assert_eq!(state.max_attempts, 3);
    assert_eq!(state.attempts_used, 3);
    assert!(!state.active);
}

#[test]
fn game_over_after_max_attempts() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    client.start_new_round(&7, &2);
    assert_eq!(client.guess(&1), GuessOutcome::TooLow);
    assert_eq!(client.guess(&2), GuessOutcome::GameOver);

    let state = client.get_state();
    assert_eq!(state.attempts_used, 2);
    assert!(!state.active);
}

#[test]
fn round_counter_increments() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    assert_eq!(client.start_new_round(&10, &1), 1);
    assert_eq!(client.guess(&8), GuessOutcome::GameOver);
    assert_eq!(client.start_new_round(&11, &2), 2);

    let state = client.get_state();
    assert_eq!(state.round, 2);
    assert_eq!(state.max_attempts, 2);
    assert_eq!(state.attempts_used, 0);
    assert!(state.active);
}
