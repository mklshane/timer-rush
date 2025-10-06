
import Score from "../models/score.model.js";

export const setScore = async (req, res) => {
  try {
    const { name, target, actual, difference, accuracy } = req.body;
    const event = req.params.event;

    if (!name || difference == null || accuracy == null) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["cs", "it"].includes(event)) {
      return res.status(400).json({ message: "Invalid event." });
    }

    const newScore = new Score({
      name,
      target,
      actual,
      difference,
      accuracy,
      event,
    });

    await newScore.save();

    return res.status(201).json({
      success: true,
      message: "Score saved successfully.",
      score: newScore,
    });
  } catch (error) {
    console.error("Error saving score: ", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const event = req.params.event; 

    if (!["cs", "it"].includes(event)) {
      return res.status(400).json({ message: "Invalid event." });
    }

    const topScores = await Score.find({ event })
      .sort({ accuracy: -1, difference: 1 })
      .limit(10);

    const leaderboard = topScores.map((score, index) => ({
      rank: index + 1,
      name: score.name,
      accuracy: score.accuracy,
      difference: score.difference,
      target: score.target,
      actual: score.actual,
    }));

    return res.status(200).json({
      success: true,
      message: "Success fetching leaderboard",
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
