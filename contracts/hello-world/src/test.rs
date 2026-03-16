#![cfg(test)]

use super::*;
use soroban_sdk::{Address, Env};
use soroban_sdk::testutils::Address as _;

#[test]
fn start_and_win_updates_leaderboard() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    let player = Address::generate(&env);
    let game_id = client.start_game(&player, &5, &11);

    let initial = client.get_game(&game_id);
    assert_eq!(initial.game_id, game_id);
    assert_eq!(initial.player_wallet, player);
    assert_eq!(initial.guess_count, 0);
    assert_eq!(initial.status, GameStatus::Active);
    assert_eq!(initial.last_hint, Hint::None);
    assert!(initial.secret_number >= 1 && initial.secret_number <= 100);

    let wrong_guess = if initial.secret_number == 1 {
        2
    } else {
        initial.secret_number - 1
    };
    let expected_hint = if wrong_guess < initial.secret_number {
        Hint::Higher
    } else {
        Hint::Lower
    };

    assert_eq!(client.submit_guess(&game_id, &wrong_guess), expected_hint);
    assert_eq!(client.submit_guess(&game_id, &initial.secret_number), Hint::Correct);
    assert_eq!(client.get_hint(&game_id), Hint::Correct);

    let finished = client.get_game(&game_id);
    assert_eq!(finished.status, GameStatus::Won);
    assert_eq!(finished.guess_count, 2);

    let leaderboard = client.get_leaderboard();
    assert_eq!(leaderboard.len(), 1);
    let top = leaderboard.get(0).unwrap();
    assert_eq!(top.player_wallet, player);
    assert_eq!(top.games_won, 1);
    assert_eq!(top.best_score, 2);
}

#[test]
fn gameover_after_max_attempts() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    let player = Address::generate(&env);
    let game_id = client.start_game(&player, &2, &3);
    let game = client.get_game(&game_id);

    let always_wrong = if game.secret_number == 1 { 2 } else { 1 };

    assert_ne!(client.submit_guess(&game_id, &always_wrong), Hint::Correct);
    assert_eq!(client.submit_guess(&game_id, &always_wrong), Hint::GameOver);
    assert_eq!(client.get_hint(&game_id), Hint::GameOver);

    let final_state = client.get_game(&game_id);
    assert_eq!(final_state.status, GameStatus::Lost);
    assert_eq!(final_state.guess_count, 2);
}

#[test]
fn finish_game_marks_active_session_finished() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    let player = Address::generate(&env);
    let game_id = client.start_game(&player, &4, &7);

    assert_eq!(client.finish_game(&game_id), GameStatus::Finished);
    let state = client.get_game(&game_id);
    assert_eq!(state.status, GameStatus::Finished);
    assert_eq!(state.last_hint, Hint::GameOver);
}

#[test]
fn leaderboard_sorted_by_wins_then_best_score() {
    let env = Env::default();
    let contract_id = env.register(GuessNumberContract, ());
    let client = GuessNumberContractClient::new(&env, &contract_id);

    let player_a = Address::generate(&env);
    let player_b = Address::generate(&env);

    let game_a1 = client.start_game(&player_a, &5, &1);
    let a1 = client.get_game(&game_a1);
    assert_eq!(client.submit_guess(&game_a1, &a1.secret_number), Hint::Correct);

    let game_a2 = client.start_game(&player_a, &5, &2);
    let a2 = client.get_game(&game_a2);
    let wrong = if a2.secret_number == 1 { 2 } else { a2.secret_number - 1 };
    assert_ne!(client.submit_guess(&game_a2, &wrong), Hint::Correct);
    assert_eq!(client.submit_guess(&game_a2, &a2.secret_number), Hint::Correct);

    let game_b = client.start_game(&player_b, &5, &3);
    let b = client.get_game(&game_b);
    assert_eq!(client.submit_guess(&game_b, &b.secret_number), Hint::Correct);

    let leaderboard = client.get_leaderboard();
    assert_eq!(leaderboard.len(), 2);

    let first = leaderboard.get(0).unwrap();
    let second = leaderboard.get(1).unwrap();

    assert_eq!(first.player_wallet, player_a);
    assert_eq!(first.games_won, 2);
    assert_eq!(second.player_wallet, player_b);
    assert_eq!(second.games_won, 1);
}
