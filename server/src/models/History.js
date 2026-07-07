const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  algorithm: String,
  visitedNodes: Number,
  pathLength: Number,
  timeTaken: Number
}, { timestamps: true });

module.exports = mongoose.model("History", historySchema);
