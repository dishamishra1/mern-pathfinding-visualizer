const mongoose = require("mongoose");

const mazeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  rows: Number,
  cols: Number,
  start: { row: Number, col: Number },
  target: { row: Number, col: Number },
  walls: [[Number]]
}, { timestamps: true });

module.exports = mongoose.model("Maze", mazeSchema);
