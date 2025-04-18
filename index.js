const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://snake-win.vercel.app"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.post("/api/save-user", async (req, res) => {
  const { id, name, email } = req.body;

  try {
    await prisma.users.upsert({
      where: { id },
      update: { name, email },
      create: { id, name, email },
    });

    res.json({ message: "User saved successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/save-game-details", async (req, res) => {
  const { creator_id, bet_amount, game_code, player_one_public_key, status } = req.body;

  try {
    await prisma.games.create({
      data: {
        creator_id,
        bet_amount: BigInt(bet_amount),
        game_code,
        player_one_public_key,
        status,
      },
    });

    res.status(201).json({ message: "Game details saved successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/get-winner-details", async (req, res) => {
  const { gameId, userId } = req.query;

  const game = await prisma.games.findFirst({
    where: {
      AND: [
        { game_code: gameId },
        {
          OR: [
            { creator_id: userId },
            { player_two_id: userId },
          ],
        },
      ],
    },
  });

  if (!game) {
    return res.status(404).json({ message: 'No details found' });
  }

  // Assign the role
  let role = "unknown";

  if (game.creator_id === userId) {
    role = "creator";
  } else if (game.player_two_id === userId) {
    role = "player_two";
  }

  // Do the calculation
  const betAmount = game.bet_amount;
  const doubled = betAmount * 2n;
  const cut = doubled * 3n / 100n; // 3% cut
  const wining_amount = doubled - cut;

  res.json({
    winner_public_key: role === 'creator' ? game.player_one_public_key :  game.player_two_public_key,
    wining_amount: wining_amount.toString()
  });
});

app.get("/api/get-bet-amount", async (req, res) => {
  const { gameId } = req.query;

  const game = await prisma.games.findFirst({
    where: {
      game_code: gameId,
    },
  });

  if (!game) {
    return res.status(404).json({ message: 'No game found' });
  }

  let amount = Number(game.bet_amount) / 1_000_000_000;

  res.json({
    bet_amount: amount.toString(), // Convert BigInt for frontend
  });
});

app.post("/api/update-player-two-public-key", async (req, res) => {
  const { game_code, player_two_public_key } = req.body;

  try {
    await prisma.games.update({
      where: {
        game_code: game_code
      },
      data: {
        player_two_public_key: player_two_public_key
      }
    });

    res.status(200).json({ message: "Game details updated successfully" });
  } catch(error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

const boardSize = 100;
const snakes = { 98: 78, 95: 56, 93: 73, 87: 36, 64: 60, 49: 11, 26: 10 };
const ladders = { 2: 38, 7: 14, 8: 31, 21: 42, 28: 84, 51: 67, 71: 91 };

let games = {};

/*{
  "k5f3q9": {
    players: ["socket12345"],
    positions: {},
    turn: 0
  }
}*/

io.on("connection", (socket) => {
  console.log('A user connected', socket.id);

  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substring(2, 8);
    games[gameId] = { players: [socket.id], positions: {}, turn: 0 };
    socket.join(gameId);
    socket.emit("gameCreated", { gameId });
  });

  socket.on("joinGame", async (gameId, playerTwoId) => {
    if(games[gameId] && games[gameId].players.length < 2) {
      games[gameId].players.push(socket.id);
      games[gameId].positions[games[gameId].players[0]] = 0;
      games[gameId].positions[games[gameId].players[1]] = 0;
      socket.join(gameId);

      try {
        await prisma.games.update({
          where: {
            game_code: gameId,
          },
          data: {
            player_two_id: playerTwoId,
            status: 'in_progress',
          },
        });
  
        console.log(`Game ${gameId} updated in DB with player_two and status IN_PROGRESS`);
      } catch (error) {
        console.error(`Failed to update game ${gameId}:`, error);
      }
    }
  });

  socket.on("playerReady", (gameId) => {
    io.to(gameId).emit("startGame", {players: games[gameId].players});
  });

  socket.on("rollDice", async ({gameId, player, username, userId}) => {
    if(!games[gameId]) return;

    let currentTurn = games[gameId].turn;
    if(games[gameId].players[currentTurn] !== player) return;

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    // const diceRoll = 100;
    let newPosition = games[gameId].positions[player] + diceRoll;

    if (newPosition > boardSize) {
      newPosition = games[gameId].positions[player];
    } else if (snakes[newPosition]) {
      newPosition = snakes[newPosition];
    } else if (ladders[newPosition]) {
      newPosition = ladders[newPosition];
    }

    games[gameId].positions[player] = newPosition;

    if (newPosition === boardSize) {
      io.to(gameId).emit("gameOver", { winner: username, userId: userId });

      await prisma.games.updateMany({
        where: {
          game_code: gameId,
        },
        data: {
          winner_user_id: userId,
          status: 'completed',
        },
      });

      return;
    }

    games[gameId].turn = (games[gameId].turn + 1) % games[gameId].players.length;

    io.to(gameId).emit("updateGame", {
      positions: games[gameId].positions,
      diceRoll,
      currentTurn: games[gameId].turn,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    Object.keys(games).forEach((gameId) => {
      games[gameId].players = games[gameId].players.filter(
        (p) => p !== socket.id
      );
      if (games[gameId].players.length === 0) delete games[gameId];
    });
  });
});

server.listen(4000, () => {
  console.log(`Server started at: 4000`);
});
