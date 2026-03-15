# Guess Number Soroban Smart Contract

## Project Description

This project is a basic Soroban smart contract on Stellar that implements a simple on-chain Guess Number game.
The contract stores game state in Soroban persistent storage and allows users to start rounds and submit guesses.

## What It Does

1. Starts a new round with:
	- a secret number (0 to 100)
	- a maximum number of allowed attempts
2. Accepts guesses and returns one of four outcomes:
	- TooLow
	- TooHigh
	- Correct
	- GameOver
3. Tracks and exposes game state:
	- current round number
	- attempts used
	- max attempts
	- whether a round is still active

## Features

- Persistent on-chain game state using Soroban storage
- Clear round lifecycle via `start_new_round`
- Deterministic outcome responses through `guess`
- Built-in state query function via `get_state`
- Unit tests covering:
  - correct guess flow
  - max-attempt game over flow
  - round counter increment behavior

## Deployed Smart Contract Link

🔗 https://lab.stellar.org/r/testnet/contract/CDOHV6LWSWURCSGIHMSE55K2PL3G7HUBMCENUIROOZVLMUHVZ5TUF6WP

## Contract Location

- `contracts/hello-world/src/lib.rs`
- `contracts/hello-world/src/test.rs`

## Quick Commands

From `contracts/hello-world`:

```bash
make build
make test
```
