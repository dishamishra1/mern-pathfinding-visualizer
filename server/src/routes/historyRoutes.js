const express = require("express");
const History = require("../models/History");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const history = await History.create({ user: req.user._id, ...req.body });
  res.status(201).json(history);
});

router.get("/", protect, async (req, res) => {
  const history = await History.find({ user: req.user._id }).sort("-createdAt").limit(10);
  res.json(history);
});

module.exports = router;
