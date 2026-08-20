# 🐍 SnakesWin – Multiplayer Snake & Ladder Backend

Backend server for **SnakesWin**, a real-time multiplayer Snake & Ladder betting game built on the **Solana blockchain**.

The backend manages multiplayer game rooms, real-time game state, player turns, game results, user data, betting information, and payment records.

---

## 🎮 About SnakesWin

SnakesWin is a multiplayer Snake & Ladder game where two players compete in real time while using **SOL-based bets**.

Players can:

- Create a game room
- Join an existing game
- Place SOL bets
- Play Snake & Ladder in real time
- Track game state and turns
- Win the pooled bet
- Store game and payment results

The frontend is deployed at:

https://snake-win.vercel.app

---

## ✨ Features

- 🎮 Real-time multiplayer gameplay
- 🔗 Socket.IO based communication
- 🏠 Create and join game rooms
- 👥 Two-player game support
- 🎲 Server-side dice rolling
- 🐍 Snake and ladder game logic
- 🔄 Real-time player position updates
- 🔁 Turn management
- 🏆 Winner detection
- 💰 SOL-based betting support
- 💸 Winner payout calculation
- 💳 Payment record management
- 👤 User management
- 📊 Recent game/payment results
- 🗄️ PostgreSQL database
- 🔥 Prisma ORM
- 🌐 REST API
- 🔐 CORS configuration
- ⚙️ Environment variable support

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │   SnakesWin Client  │
                    │ React + Solana Web3 │
                    └──────────┬──────────┘
                               │
                     REST API / Socket.IO
                               │
                               ▼
                    ┌─────────────────────┐
                    │   SnakesWin Backend │
                    │ Node.js + Express   │
                    │     Socket.IO       │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             ┌──────────────┐      ┌──────────────┐
             │   Prisma ORM │      │ Game State   │
             └──────┬───────┘      │  In-Memory   │
                    │              └──────────────┘
                    ▼
             ┌──────────────┐
             │  PostgreSQL  │
             │ Users/Games  │
             │  Payments    │
             └──────────────┘


