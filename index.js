const express = require("express");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const boardSize = 100;
const snakes = { 98: 78, 95: 56, 93: 73, 87: 36, 64: 60, 49: 11, 26: 10 };
const ladders = { 2: 38, 7: 14, 8: 31, 21: 42, 28: 84, 51: 67, 71: 91 };

let players = {};

// Roll Dice and Update Player Position
app.post("/roll", (req, res) => {
  const { player } = req.body;
  if (!players[player]) players[player] = 1;

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  let newPosition = players[player] + diceRoll;

  if (newPosition > boardSize) {
    newPosition = players[player]; // Stay in place if roll exceeds board size
  } else {
    if (snakes[newPosition]) {
      newPosition = snakes[newPosition];
    } else if (ladders[newPosition]) {
      newPosition = ladders[newPosition];
    }
  }

  players[player] = newPosition;

  res.json({ diceRoll, newPosition });
});

// Get Player Position
app.get("/position/:player", (req, res) => {
  const { player } = req.params;
  res.json({ position: players[player] || 1 });
});

// Reset Game
app.post("/reset", (req, res) => {
  players = {};
  res.json({ message: "Game reset successfully" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
