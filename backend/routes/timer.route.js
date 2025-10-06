
import express from "express";
import { getLeaderboard, setScore } from "../controllers/timer.controller.js";

const router = express.Router();

/* 
router.post("/score", setScore);
router.get("/leaderboard", getLeaderboard); */

router.post("/:event/score", setScore);
router.get("/:event/leaderboard", getLeaderboard);

export default router;
