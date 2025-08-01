import type React from "react";
import { useState, useEffect, useRef } from "react";
import  axiosHeader  from "./utils/axiosHeader";

type GameState =
  | "nameEntry"
  | "targetDisplay"
  | "timerVisible"
  | "timerHidden"
  | "results";

type PlayerResult = {
  name: string;
  difference: number;
  accuracy: number;
  target: number;
  actual: number;
};

const TimerGame: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>("nameEntry");
  const [name, setName] = useState("");
  const [targetTime, setTargetTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [difference, setDifference] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [rank, setRank] = useState("");
  const [leaderboard, setLeaderboard] = useState<PlayerResult[]>([]);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const stopTimeRef = useRef<number>(0);
  const hideTimerTimeoutRef = useRef<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Generate random target time between 6 and 20 seconds
  const generateTargetTime = () => {
    return Math.floor(Math.random() * 15) + 6;
  };

  // Start the game
  const startGame = () => {
    const target = generateTargetTime();
    setTargetTime(target);
    setGameState("targetDisplay");
    setTimeout(() => {
      setGameState("timerVisible");
      startTimer();
    }, 3000);
  };

  // Start the timer
  const startTimer = () => {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    if (hideTimerTimeoutRef.current) {
      clearTimeout(hideTimerTimeoutRef.current);
    }
    hideTimerTimeoutRef.current = setTimeout(() => {
      setGameState("timerHidden");
    }, 5000);

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
    }, 10);
  };

  // Stop the timer
  const stopTimer = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hideTimerTimeoutRef.current) {
      clearTimeout(hideTimerTimeoutRef.current);
      hideTimerTimeoutRef.current = null;
    }

    stopTimeRef.current = Date.now();
    const actualTime = (stopTimeRef.current - startTimeRef.current) / 1000;
    const diff = Math.abs(actualTime - targetTime);
    const acc = Math.max(0, 100 - (diff / targetTime) * 100);

    setDifference(diff);
    setAccuracy(acc);
    setElapsedTime(actualTime);

    let playerRank = "";
    if (diff < 0.1) playerRank = "TIME LORD";
    else if (diff < 0.5) playerRank = "MASTER";
    else if (diff < 1.0) playerRank = "EXPERT";
    else if (diff < 1.5) playerRank = "SKILLED";
    else if (diff < 2.0) playerRank = "NOVICE";
    else playerRank = "BEGINNER";

    setRank(playerRank);

    

    try {
      await axiosHeader.post("/timer/score", {
        name,
        target: targetTime,
        actual: actualTime,
        difference: diff,
        accuracy: acc,
      });

      await fetchLeaderboard();
    } catch (error) {
      console.error("Error posting score: ", error); 
    }
    setGameState("results");
  };

  // Reset the game
  const resetGame = () => {
    setGameState("nameEntry");
    setName("");
    setTargetTime(0);
    setElapsedTime(0);
    setDifference(0);
    setAccuracy(0);
    setRank("");
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axiosHeader.get("/timer/leaderboard");
      console.log("Leaderboard:", response.data.leaderboard );
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard: ", error);
    }
  }

  // fetch leaderboard
  useEffect(() => {
    fetchLeaderboard();
  }, [])


  // Handle keyboard and touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "nameEntry" && e.key === "Enter" && name.trim()) {
        startGame();
      }
      if (
        (gameState === "timerVisible" || gameState === "timerHidden") &&
        e.key === " "
      ) {
        stopTimer();
        e.preventDefault();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameState === "timerVisible" || gameState === "timerHidden") {
        stopTimer();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gameState, name]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (hideTimerTimeoutRef.current) {
        clearTimeout(hideTimerTimeoutRef.current);
      }
    };
  }, []);



  return (
    <div>
      {/* Main Game Container */}
      <div
        className="w-full min-h-screen flex flex-col justify-center items-center relative border-4 border-[#00ffcc] rounded-lg bg-[#1e2a44]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          boxShadow: "inset 0 0 15px rgba(0,255,255,0.2)",
        }}
      >
        {/* Pixel corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-[#ff00ff]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-[#ff00ff]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#ff00ff]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ff00ff]"></div>

        {/* Pixel stars */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-[#ffcc00]"></div>
        <div className="absolute top-4 right-4 w-3 h-3 bg-[#ffffff]"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 bg-[#ffcc00]"></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 bg-[#00ffcc]"></div>
        <div className="absolute top-12 left-12 w-2 h-2 bg-[#ff00ff] animate-pulse"></div>
        <div className="absolute bottom-12 right-12 w-2 h-2 bg-[#00ff00] animate-pulse"></div>

        {/* Game Content */}
        <div className="p-6 flex flex-col items-center md:max-w-lg max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl font-black tracking-wider mb-2"
              style={{
                color: "#00ffcc",
                textShadow: `
                  -2px -2px 0 #ff00ff,
                  2px -2px 0 #ff00ff,
                  -2px 2px 0 #ff00ff,
                  2px 2px 0 #ff00ff,
                  -3px -3px 0 #000,
                  3px -3px 0 #000,
                  -3px 3px 0 #000,
                  3px 3px 0 #000
                `,
                transform: "perspective(600px) rotateX(10deg)",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              TIMER RUSH
            </h1>
            <div
              className="text-xs font-bold tracking-wider"
              style={{
                color: "#ff00ff",
                textShadow:
                  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              MSE
            </div>
          </div>

          {/* Game States */}
          <div className="w-full">
            {gameState === "nameEntry" && (
              <div className="mb-6 p-4 border-4 border-[#ff00ff] rounded bg-white">
                <h2
                  className="text-sm md:text-base font-bold mb-4 text-center"
                  style={{
                    color: "#ff00ff",
                    textShadow:
                      "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  PLAYER NAME
                </h2>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-center font-bold text-sm md:text-base border-2 border-[#00ffcc] rounded mb-4"
                  style={{
                    background: "#e0e0e0",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                  placeholder="YOUR NAME"
                  maxLength={20}
                  autoFocus
                />
                <button
                  onClick={startGame}
                  disabled={!name.trim()}
                  className={`w-full py-3 font-bold text-sm md:text-base border-4 rounded ${
                    name.trim()
                      ? "bg-[#00ff00] border-[#00ff00] hover:scale-105 active:scale-95"
                      : "bg-gray-500 border-gray-500 opacity-50 cursor-not-allowed"
                  }`}
                  style={{
                    color: "#000",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  START
                </button>
              </div>
            )}

            {gameState === "targetDisplay" && (
              <div className="p-6 border-4 border-[#ff5500] rounded bg-[#ffff00] animate-pulse">
                <h2
                  className="text-sm md:text-base font-bold mb-4 text-center"
                  style={{
                    color: "#ff5500",
                    textShadow:
                      "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  TARGET TIME
                </h2>
                <div
                  className="text-3xl md:text-4xl font-black text-center mb-4"
                  style={{
                    color: "#ff5500",
                    textShadow: `
                      -3px -3px 0 #000,
                      3px -3px 0 #000,
                      -3px 3px 0 #000,
                      3px 3px 0 #000
                    `,
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  {targetTime.toFixed(2)}s
                </div>
                <p
                  className="text-xs font-bold text-center"
                  style={{
                    color: "#8b008b",
                    textShadow:
                      "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  REMEMBER IT!
                </p>
              </div>
            )}

            {(gameState === "timerVisible" || gameState === "timerHidden") && (
              <div>
                <div className="mb-4 p-3 border-4 border-[#0066ff] rounded bg-[#00ccff]">
                  <h2
                    className="text-sm md:text-base font-bold text-center"
                    style={{
                      color: "#0066ff",
                      textShadow:
                        "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    TARGET: {targetTime.toFixed(2)}s
                  </h2>
                </div>

                <div
                  className={`p-6 border-4 rounded mb-6 text-center ${
                    gameState === "timerVisible"
                      ? "bg-[#00ff00] border-[#00ff00] animate-pulse"
                      : "bg-gray-500 border-gray-500"
                  }`}
                >
                  <div
                    className="text-3xl md:text-4xl font-black mb-2"
                    style={{
                      color:
                        gameState === "timerVisible" ? "#00ff00" : "#999999",
                      textShadow:
                        gameState === "timerVisible"
                          ? `
                            -3px -3px 0 #000,
                            3px -3px 0 #000,
                            -3px 3px 0 #000,
                            3px 3px 0 #000
                          `
                          : "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    {gameState === "timerVisible"
                      ? elapsedTime.toFixed(2)
                      : "???.??"}
                  </div>
                  <div
                    className="text-xs font-bold"
                    style={{
                      color:
                        gameState === "timerVisible" ? "#006600" : "#333333",
                      textShadow:
                        "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    {gameState === "timerVisible" ? "TIMER ON" : "TIMER OFF"}
                  </div>
                </div>

                <button
                  onClick={stopTimer}
                  className="w-full py-4 font-bold text-sm md:text-base border-4 border-[#ff0000] rounded bg-[#ff0000] hover:scale-105 active:scale-95"
                  style={{
                    color: "#ffffff",
                    textShadow:
                      "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  STOP!
                </button>
                <div
                  className="text-xs mt-3 font-bold text-center"
                  style={{
                    color: "#ffcc00",
                    textShadow:
                      "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                    fontFamily: '"Press Start 2P", monospace',
                  }}
                >
                  (TAP OR PRESS SPACE)
                </div>
              </div>
            )}

            {gameState === "results" && (
              <div>
                <div className="mb-6 p-4 border-4 border-[#ff00ff] rounded bg-[#ff66cc]">
                  <h2
                    className="text-sm md:text-base font-bold mb-4 text-center"
                    style={{
                      color: "#ff00ff",
                      textShadow:
                        "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    RESULTS
                  </h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      {
                        label: "TARGET",
                        value: `${targetTime.toFixed(2)}s`,
                        bg: "bg-[#ffff00]",
                        border: "border-[#ffcc00]",
                        text: "text-[#663300]",
                      },
                      {
                        label: "YOUR TIME",
                        value: `${elapsedTime.toFixed(2)}s`,
                        bg: "bg-[#00ff00]",
                        border: "border-[#00cc00]",
                        text: "text-[#006600]",
                      },
                      {
                        label: "DIFFERENCE",
                        value: `${difference.toFixed(2)}s`,
                        bg: "bg-[#ff6666]",
                        border: "border-[#ff0000]",
                        text: "text-[#660000]",
                      },
                      {
                        label: "ACCURACY",
                        value: `${accuracy.toFixed(1)}%`,
                        bg: "bg-[#00ccff]",
                        border: "border-[#0066ff]",
                        text: "text-[#003366]",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 border-4 ${item.border} ${item.bg} rounded text-center`}
                      >
                        <div
                          className={`text-xs font-bold mb-2 ${item.text}`}
                          style={{
                            textShadow:
                              "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
                            fontFamily: '"Press Start 2P", monospace',
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          className={`text-lg font-black ${item.text}`}
                          style={{
                            textShadow: `
                              -2px -2px 0 #fff,
                              2px -2px 0 #fff,
                              -2px 2px 0 #fff,
                              2px 2px 0 #fff
                            `,
                            fontFamily: '"Press Start 2P", monospace',
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 p-4 border-4 border-[#ff9900] rounded bg-[#ffcc00] text-center">
                    <div
                      className="text-xs font-bold mb-3 text-[#663300]"
                      style={{
                        textShadow:
                          "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      RANK
                    </div>
                    <div
                      className="text-xl font-black text-[#663300] animate-pulse"
                      style={{
                        textShadow: `
                          -3px -3px 0 #fff,
                          3px -3px 0 #fff,
                          -3px 3px 0 #fff,
                          3px 3px 0 #000
                        `,
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      {rank}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    onClick={startGame}
                    className="flex-1 py-3 font-bold text-sm border-4 border-[#00cc00] rounded bg-[#00ff00] hover:scale-105 active:scale-95"
                    style={{
                      color: "#000",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={resetGame}
                    className="flex-1 py-3 font-bold text-sm border-4 border-[#0033cc] rounded bg-[#0066ff] hover:scale-105 active:scale-95"
                    style={{
                      color: "#ffffff",
                      textShadow:
                        "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    NEW PLAYER
                  </button>
                </div>

                {leaderboard.length > 0 && (
                  <div className="mb-10 p-4 border-4 border-[#660099] rounded bg-[#9933cc]">
                    <h3
                      className="text-sm md:text-base font-bold mb-3 text-center"
                      style={{
                        color: "#cc99ff",
                        textShadow:
                          "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      LEADERBOARD
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b-2 border-[#cc99ff]">
                            <th
                              className="text-left py-2 px-3 font-bold"
                              style={{
                                color: "#cc99ff",
                                textShadow:
                                  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                fontFamily: '"Press Start 2P", monospace',
                              }}
                            >
                              RANK
                            </th>
                            <th
                              className="text-left py-2 px-3 font-bold"
                              style={{
                                color: "#cc99ff",
                                textShadow:
                                  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                fontFamily: '"Press Start 2P", monospace',
                              }}
                            >
                              NAME
                            </th>
                            <th
                              className="text-left py-2 px-3 font-bold"
                              style={{
                                color: "#cc99ff",
                                textShadow:
                                  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                fontFamily: '"Press Start 2P", monospace',
                              }}
                            >
                              DIFF
                            </th>
                            <th
                              className="text-left py-2 px-3 font-bold"
                              style={{
                                color: "#cc99ff",
                                textShadow:
                                  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                fontFamily: '"Press Start 2P", monospace',
                              }}
                            >
                              ACC
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.slice(0, 5).map((player, index) => (
                            <tr
                              key={index}
                              className={`border-b-2 border-[#cc99ff] ${
                                index % 2 === 0
                                  ? "bg-[#cc99ff33]"
                                  : "bg-[#ffffff33]"
                              }`}
                            >
                              <td
                                className="py-2 px-3 font-bold"
                                style={{
                                  color: "#ffffff",
                                  textShadow:
                                    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                  fontFamily: '"Press Start 2P", monospace',
                                }}
                              >
                                #{index + 1}
                              </td>
                              <td
                                className="py-2 px-3 font-bold"
                                style={{
                                  color: "#ffffff",
                                  textShadow:
                                    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                  fontFamily: '"Press Start 2P", monospace',
                                }}
                              >
                                {player.name}
                              </td>
                              <td
                                className="py-2 px-3 font-bold"
                                style={{
                                  color: "#ffffff",
                                  textShadow:
                                    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                  fontFamily: '"Press Start 2P", monospace',
                                }}
                              >
                                {player.difference.toFixed(2)}s
                              </td>
                              <td
                                className="py-2 px-3 font-bold"
                                style={{
                                  color: "#ffffff",
                                  textShadow:
                                    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
                                  fontFamily: '"Press Start 2P", monospace',
                                }}
                              >
                                {player.accuracy.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
        
        body {
          overscroll-behavior: none;
          touch-action: manipulation;
          font-family: 'Press Start 2P', monospace;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default TimerGame;
