
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  target: {
    type: Number,
    required: true,
  },
  actual: {
    type: Number,
    required: true,
  },
  difference: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  event: {
   
    type: String,
    required: true,
    enum: ["cs", "it"], 
    default: "cs",
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

const Score = mongoose.model("Score", scoreSchema);
export default Score;
