export type GameState =
  | "nameEntry"
  | "targetDisplay"
  | "timerVisible"
  | "timerHidden"
  | "results";

export type PlayerResult = {
  name: string;
  difference: number;
  accuracy: number;
  target: number;
  actual: number;
};

export type RankInfo = {
  title: string;
  color: string;
  minDiff: number;
  maxDiff: number;
};

export const RANKS: RankInfo[] = [
  { title: "TIME LORD", color: "#ff00ff", minDiff: 0, maxDiff: 0.1 },
  { title: "MASTER", color: "#00ffff", minDiff: 0.1, maxDiff: 0.5 },
  { title: "EXPERT", color: "#ffff00", minDiff: 0.5, maxDiff: 1.0 },
  { title: "SKILLED", color: "#00ff00", minDiff: 1.0, maxDiff: 1.5 },
  { title: "NOVICE", color: "#ff9900", minDiff: 1.5, maxDiff: 2.0 },
  { title: "BEGINNER", color: "#ff0000", minDiff: 2.0, maxDiff: Infinity },
];
