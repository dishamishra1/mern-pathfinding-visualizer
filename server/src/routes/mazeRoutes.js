const express = require("express");
const Maze = require("../models/Maze");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const maze = await Maze.create({ user: req.user._id, ...req.body });
    res.status(201).json(maze);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  const mazes = await Maze.find({ user: req.user._id }).sort("-createdAt");
  res.json(mazes);
});

router.delete("/:id", protect, async (req, res) => {
  await Maze.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Deleted" });
});

module.exports = router;
