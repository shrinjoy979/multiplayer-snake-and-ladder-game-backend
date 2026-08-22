
<img width="1905" height="969" alt="444626744-67457452-73c9-45a0-b0e5-33d3dc2676a1" src="https://github.com/user-attachments/assets/b385baec-b202-4024-a1a5-4296926df0bd" />
<img width="1439" height="727" alt="444626828-9604dd3f-86bd-4122-ae3a-b8bbb22f526d" src="https://github.com/user-attachments/assets/737eea48-35a7-4218-a379-e415fa71aa4f" />
<img width="1914" height="963" alt="444626855-abe6255c-bfa9-49e5-a1ba-76c3e1cebbc1" src="https://github.com/user-attachments/assets/ab9d6e71-f01d-4421-bfc1-072e0893e191" />
<img width="1440" height="726" alt="444626778-0f7a4684-4764-4ebf-8bfc-e7303ff94368" src="https://github.com/user-attachments/assets/88ad238c-02be-45f4-bb9a-44219397f889" />



# Multiplayer Snake and Ladder Game Backend

Backend server for a real-time multiplayer Snake and Ladder betting game built with Node.js, Express, Socket.IO, PostgreSQL, and Prisma.

The backend manages multiplayer game rooms, real-time game state, player turns, game results, user data, betting information, and payment records. It works together with the Web3 frontend to provide a multiplayer gaming experience with SOL-based betting through the Solana blockchain.

## Related Repositories

### Frontend

The Web3 frontend is maintained in a separate repository:

[Multiplayer Snake and Ladder Game Frontend](https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-frontend-web3)

### Live Application

[Play SnakesWin](https://snake-win.vercel.app/)

### Backend

This repository contains the backend server:

[Multiplayer Snake and Ladder Game Backend](https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-backend)

---

## Overview

The backend provides the server-side infrastructure required for the multiplayer Snake and Ladder game.

It is responsible for:

* Creating and managing game rooms
* Joining multiplayer games
* Maintaining real-time game state
* Managing player turns
* Generating dice rolls
* Applying snakes and ladders
* Detecting game winners
* Persisting users and games
* Tracking betting amounts
* Recording payment information
* Calculating winner payouts
* Broadcasting game state through Socket.IO
* Persisting game results using PostgreSQL and Prisma

The game currently supports two players per game room.

---

## Features

* Real-time multiplayer gameplay
* Game room creation
* Game room joining using a unique game code
* Two-player game support
* Real-time communication using Socket.IO
* Server-side turn management
* Server-side dice generation
* Snake and ladder game logic
* Winner detection
* Game status tracking
* User persistence
* Game persistence
* Payment record persistence
* SOL/lamport amount handling
* Winner payout calculation
* PostgreSQL database integration
* Prisma ORM
* CORS support
* REST API endpoints
* Web3 frontend integration

The game state is maintained in memory for active Socket.IO games, while persistent information such as users, games, winners, and payments is stored in PostgreSQL through Prisma.

---

## Tech Stack

### Backend

* Node.js
* Express.js
* Socket.IO
* JavaScript
* CORS
* dotenv

### Database

* PostgreSQL
* Prisma ORM
* Prisma Client

### Blockchain Integration

* Solana
* SOL
* Lamports
* Solana-compatible Web3 frontend

The backend package currently includes Express, Socket.IO, Prisma, PostgreSQL support through `pg`, CORS, and dotenv.

---

## Architecture

```text
                         Player
                           |
                           |
                    Solana Wallet
                           |
                           v
              +------------------------+
              |    React Web3 Frontend |
              |    Vite + TypeScript   |
              +-----------+------------+
                          |
                          |
                    Socket.IO / HTTP
                          |
                          v
              +------------------------+
              |      Node.js Backend   |
              |        Express         |
              |       Socket.IO        |
              +-----------+------------+
                          |
             +------------+-------------+
             |                          |
             v                          v
    +------------------+       +------------------+
    |    PostgreSQL    |       |      Solana      |
    |     + Prisma     |       |    Blockchain    |
    +------------------+       +------------------+
```

The frontend communicates with the backend through HTTP APIs and Socket.IO. The backend persists application data in PostgreSQL through Prisma, while Solana transactions are handled by the Web3 frontend.

---

## Game Flow

The general game flow is:

```text
1. Player connects their Solana wallet
        |
        v
2. Player selects a betting amount
        |
        v
3. Player creates a game
        |
        v
4. Backend generates a game code
        |
        v
5. Second player joins using the game code
        |
        v
6. Backend adds both players to the Socket.IO room
        |
        v
7. Game starts
        |
        v
8. Players take turns rolling the dice
        |
        v
9. Backend updates player positions
        |
        v
10. Snakes and ladders are applied
        |
        v
11. First player to reach square 100 wins
        |
        v
12. Game result is persisted
        |
        v
13. Winner payout information is calculated
```

---

## Game Logic

The backend uses a 100-square board.

### Snakes

The current snake positions are:

```text
98 -> 78
95 -> 56
93 -> 73
87 -> 36
64 -> 60
49 -> 11
26 -> 10
```

### Ladders

The current ladder positions are:

```text
2  -> 38
7  -> 14
8  -> 31
21 -> 42
28 -> 84
51 -> 67
71 -> 91
```

These positions are defined directly in the backend game logic.

---

## Real-Time Multiplayer

Socket.IO is used to maintain real-time communication between the frontend and backend.

### Create Game

The `createGame` event creates a new game room and assigns the first connected player to it.

```text
Client
  |
  | createGame
  v
Backend
  |
  | Generate game code
  |
  | Create game state
  |
  | Join Socket.IO room
  v
Client
  |
  | gameCreated
  v
Game Code
```

### Join Game

A second player can join an existing game using its game code.

The backend:

* Validates that the game exists
* Ensures the room has fewer than two players
* Adds the second player
* Initializes player positions
* Joins the Socket.IO room
* Updates the game status to `in_progress`
* Stores the second player's user ID

### Player Ready

The `playerReady` event tells all players in the room that the game can start.

```text
playerReady
     |
     v
Backend
     |
     v
startGame
     |
     v
All players in room
```

### Roll Dice

The `rollDice` event handles the main gameplay logic.

The backend:

1. Validates the game
2. Checks whose turn it is
3. Generates a random dice value from 1 to 6
4. Calculates the new player position
5. Prevents movement beyond square 100
6. Applies snakes or ladders
7. Updates the player's position
8. Switches the turn
9. Broadcasts the updated game state
10. Detects the winner when a player reaches square 100

### Game Over

When a player reaches square 100, the backend broadcasts the `gameOver` event and updates the corresponding game record with the winner and `completed` status.

### Disconnect

When a player disconnects, their Socket.IO connection is removed from active games. Empty games are deleted from the in-memory game state.

---

## REST API

The backend exposes REST endpoints for persistent application data.

### Save User

```http
POST /api/save-user
```

Stores or updates a user.

Example request:

```json
{
  "id": "user-id",
  "name": "Player Name",
  "email": "player@example.com"
}
```

---

### Save Game Details

```http
POST /api/save-game-details
```

Creates a new game record.

Example request:

```json
{
  "creator_id": "user-id",
  "bet_amount": "100000000",
  "game_code": "abc123",
  "player_one_public_key": "solana-public-key",
  "status": "waiting"
}
```

The betting amount is stored as a `BigInt`, which is suitable for representing lamports without floating-point precision issues.

---

### Get Winner Details

```http
GET /api/get-winner-details
```

Query parameters:

```text
gameId
userId
```

Example:

```http
GET /api/get-winner-details?gameId=abc123&userId=user-id
```

The endpoint determines the player's role in the game and returns the winner public key and calculated winning amount. The current payout calculation applies a 3% platform cut to the doubled bet amount.

---

### Get Bet Amount

```http
GET /api/get-bet-amount
```

Query parameter:

```text
gameId
```

Example:

```http
GET /api/get-bet-amount?gameId=abc123
```

The backend converts the stored lamport amount into SOL before returning it to the client.

---

### Update Player Two Public Key

```http
POST /api/update-player-two-public-key
```

Example request:

```json
{
  "game_code": "abc123",
  "player_two_public_key": "solana-public-key"
}
```

---

### Save Payment Details

```http
POST /api/save-payment-details
```

Stores payment information associated with a user and game.

Example request:

```json
{
  "userId": "user-id",
  "user_public_key": "solana-public-key",
  "amount": "100000000",
  "status": "Win",
  "payment_signature": "transaction-signature",
  "game_code": "abc123"
}
```

The backend stores payment amounts as `BigInt` and preserves the Solana transaction signature when provided.

---

### Get Recent Results

```http
GET /api/all-recent-results
```

Returns recent payment and game result records ordered by creation time.

Payment amounts are converted to strings before being returned to avoid JavaScript `BigInt` serialization issues.

---

## Database

The backend uses PostgreSQL with Prisma ORM.

The Prisma schema currently contains three primary models:

### Users

Stores player information.

```text
users
├── id
├── name
├── email
├── profile_image
└── createdAt
```

### Games

Stores game information.

```text
games
├── id
├── bet_amount
├── game_code
├── status
├── creator_id
├── player_two_id
├── winner_user_id
├── player_one_public_key
├── player_two_public_key
└── createdAt
```

### Payments

Stores payment and result information.

```text
payments
├── id
├── user_id
├── user_public_key
├── amount
├── status
├── payment_signature
├── game_code
└── createdAt
```

The Prisma schema uses PostgreSQL as its datasource and Prisma Client as the generated client.

---

## Project Structure

```text
multiplayer-snake-and-ladder-game-backend/
│
├── prisma/
│   └── schema.prisma
│
├── .env.example
├── .gitignore
├── db.js
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

### File Overview

| File                   | Purpose                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `index.js`             | Main Express and Socket.IO server, REST APIs, multiplayer game logic, and game events |
| `db.js`                | PostgreSQL connection and database initialization                                     |
| `prisma/schema.prisma` | Prisma database schema and relationships                                              |
| `.env.example`         | Example environment variable configuration                                            |
| `package.json`         | Project metadata, scripts, and dependencies                                           |
| `package-lock.json`    | Locked npm dependency versions                                                        |

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

You will also need a PostgreSQL database accessible through a `DATABASE_URL`.

---

## Clone the Repository

```bash
git clone https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-backend.git
```

Navigate into the project:

```bash
cd multiplayer-snake-and-ladder-game-backend
```

---

## Install Dependencies

```bash
npm install
```

The backend dependencies include Express, Socket.IO, Prisma, PostgreSQL client libraries, CORS, and dotenv.

---

## Environment Variables

Create a `.env` file in the project root.

You can use `.env.example` as a reference.

```env
DATABASE_URL="your-postgresql-connection-string"
```

The Prisma datasource reads the PostgreSQL connection string from `DATABASE_URL`.

Do not commit your `.env` file or database credentials to GitHub.

---

## Database Setup

After configuring `DATABASE_URL`, generate the Prisma client:

```bash
npx prisma generate
```

Apply the Prisma schema to your database:

```bash
npx prisma db push
```

For development environments, you can also use Prisma migrations:

```bash
npx prisma migrate dev
```

---

## Start the Server

Start the backend server with:

```bash
node index.js
```

The server listens on port:

```text
4000
```

The current implementation starts the HTTP and Socket.IO server on port 4000.

The backend will then be available at:

```text
http://localhost:4000
```

---

## Connecting the Frontend

Clone the frontend repository:

```bash
git clone https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-frontend-web3.git
```

Navigate into the frontend:

```bash
cd multiplayer-snake-and-ladder-game-frontend-web3
```

Install dependencies:

```bash
npm install
```

Create the frontend `.env` file based on `.env.example`.

Configure the backend URL:

```env
VITE_API_URL=http://localhost:4000
```

Then start the frontend:

```bash
npm run dev
```

The frontend is built with React, TypeScript, Vite, Tailwind CSS, Solana Web3.js, and the Solana Wallet Adapter.

---

## Frontend and Backend

The project is split into two repositories:

```text
SnakesWin
│
├── Frontend
│   └── React + TypeScript + Vite
│
└── Backend
    ├── Node.js
    ├── Express
    ├── Socket.IO
    ├── Prisma
    └── PostgreSQL
```

### Frontend Repository

[shrinjoy979/multiplayer-snake-and-ladder-game-frontend-web3](https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-frontend-web3)

### Backend Repository

[shrinjoy979/multiplayer-snake-and-ladder-game-backend](https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-backend)

### Live Application

[snake-win.vercel.app](https://snake-win.vercel.app/)

---

## CORS Configuration

The Socket.IO server currently allows connections from:

```text
http://localhost:5173
https://snake-win.vercel.app
```

The Express application also enables CORS middleware.

If you deploy the frontend to another domain, update the Socket.IO CORS configuration in `index.js`.

---

## Betting and Payout Logic

The backend stores betting amounts as lamports using PostgreSQL `BigInt`.

For winner calculation, the current implementation:

1. Reads the player's bet amount.
2. Doubles the amount.
3. Calculates a 3% platform cut.
4. Subtracts the platform cut.
5. Returns the resulting winning amount.

Conceptually:

```text
Total Pool = Bet Amount × 2

Platform Fee = Total Pool × 3%

Winner Amount = Total Pool - Platform Fee
```

The current implementation performs these calculations using `BigInt` values.

---

## Important Implementation Notes

### Active Game State

Active multiplayer game state is currently stored in an in-memory JavaScript object:

```javascript
let games = {};
```

This contains information such as:

* Players
* Player positions
* Current turn

This means active game state is lost if the backend process restarts. Persistent user, game, and payment information is stored separately in PostgreSQL.

### Player Limit

The current Socket.IO game logic allows a maximum of two players per game room.

### Game Completion

A game is marked as `completed` when a player reaches square 100, and the winner's user ID is persisted in the database.

---

## Development

Run the server locally:

```bash
node index.js
```

For development, you can use a process manager such as `nodemon` if you add it to the project:

```bash
npx nodemon index.js
```

---

## Testing

The current `package.json` does not contain an automated test suite.

The existing test script is a placeholder:

```bash
npm test
```

For production development, automated tests can be added for:

* Game creation
* Game joining
* Turn validation
* Dice rolls
* Snake and ladder movement
* Winner detection
* Game persistence
* Payment records
* REST API validation
* Socket.IO events

---

## Future Improvements

Potential improvements for the backend include:

* Persistent multiplayer game state
* Redis-based game state for scalable Socket.IO deployments
* Improved game room validation
* Authentication and authorization
* Server-side wallet verification
* Stronger payment verification
* On-chain game settlement
* Transaction verification
* Anti-cheat mechanisms
* Match history
* Player statistics
* Leaderboards
* Tournament support
* Automated tests
* API documentation
* Input validation
* Rate limiting
* Structured logging
* Production monitoring
* Horizontal scaling

---

## Security Considerations

This project handles multiplayer gameplay and blockchain-related payment information.

Before using the system with real funds or deploying it to production, additional security measures should be implemented, including:

* Server-side validation of all game actions
* Verification of Solana transaction signatures
* Authentication and authorization
* Rate limiting
* Input validation
* Protection against replay attacks
* Stronger game-state validation
* Secure database credentials
* Secure environment configuration
* Anti-cheat mechanisms
* Production-grade error handling
* Transaction reconciliation

The current repository should be considered an educational and experimental implementation rather than a production-ready betting platform.

---

## Contributing

Contributions and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "Add your feature"
```

5. Push your branch.

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

## License

This project is intended for educational and experimental purposes.

The repository currently uses the ISC license as specified in `package.json`.

---

## Author

**Shrinjoy Saha**

GitHub: [@shrinjoy979](https://github.com/shrinjoy979)

---

## Related Links

* [Live Application](https://snake-win.vercel.app/)
* [Frontend Repository](https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-frontend-web3)
* [Backend Repository](https://github.com/shrinjoy979/multiplayer-snake-and-ladder-game-backend)

If you find the project useful, consider giving the repositories a star on GitHub.
