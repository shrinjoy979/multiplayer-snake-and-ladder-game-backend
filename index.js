const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/roll", (req, res) => {
  const dice = Math.floor(Math.random() * 6) + 1;
  res.json({ dice });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
