const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/mazes", require("./src/routes/mazeRoutes"));
app.use("/api/history", require("./src/routes/historyRoutes"));

app.get("/", (req, res) => res.json({ message: "Pathfinding API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
