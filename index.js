const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const pool = require("./db");

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
  const { id, name, email, profileImage } = req.body;

  try {
    // await pool.query(
    //   `INSERT INTO users (id, name, email, profile_image) VALUES ($1, $2, $3, $4)
    //    ON CONFLICT (id) DO UPDATE SET name = $2, email = $3, profile_image = $4`,
    //   [id, name, email, profileImage]
    // );

    await prisma.user.upsert({
      where: { id },
      update: { name, email, profileImage },
      create: { id, name, email, profileImage },
    });

    res.json({ message: "User saved successfully" });
  } catch (error) {
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

  socket.on("joinGame", (gameId) => {
    if(games[gameId] && games[gameId].players.length < 2) {
      games[gameId].players.push(socket.id);
      games[gameId].positions[games[gameId].players[0]] = 0;
      games[gameId].positions[games[gameId].players[1]] = 0;
      socket.join(gameId);
      io.to(gameId).emit("startGame", {players: games[gameId].players});
    }
  });

  socket.on("rollDice", ({gameId, player, username}) => {
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
      io.to(gameId).emit("gameOver", { winner: username });
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
