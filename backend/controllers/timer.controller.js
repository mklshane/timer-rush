import Score from "../models/score.model.js";

export const setScore = async (req, res) => {
    try {
        const { name, target, actual, difference, accuracy } = req.body;

         if (!name || difference == null || accuracy == null) {
           return res.status(400).json({ message: "Missing required fields." });
         }

         const newScore = new Score ({
            name,
            target,
            actual,
            difference,
            accuracy,
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
        const topScores = await Score.find({})
          .sort({ accuracy: -1, difference: 1 }) // Highest accuracy, then smallest difference
          .limit(10);
        
        const leaderboard = topScores.map((score, index) => ({
            rank: index + 1,
            name: score.name,
            accuracy: score.accuracy,
            difference: score.difference,
        }));

        return res.status(200).json({
            success: true,
            message: "Success fetching leaderboard",
            leaderboard
        })
    } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Server error." });
  }
}