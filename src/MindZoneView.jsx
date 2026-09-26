import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Brain,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Flame,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Check,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  FileCheck,
  Layers,
  Hash,
  Lightbulb,
  CheckCheck,
} from "lucide-react";
import TiltCard from "./TiltCard.jsx";

/* =========================================================================
   SUDOKU PUZZLE GENERATOR & SOLVER LOGIC
   ========================================================================= */
const SUDOKU_BOARDS = {
  easy: [
    [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
  ],
  medium: [
    [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0],
    ],
    [
      [1, 0, 0, 4, 8, 9, 0, 0, 6],
      [7, 3, 0, 0, 0, 0, 0, 4, 0],
      [0, 0, 0, 0, 0, 1, 2, 9, 5],
      [0, 0, 7, 1, 2, 0, 6, 0, 0],
      [5, 0, 0, 7, 0, 3, 0, 0, 8],
      [0, 0, 6, 0, 9, 5, 7, 0, 0],
      [9, 1, 4, 6, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 0, 3, 7],
      [8, 0, 0, 5, 1, 2, 0, 0, 4],
    ],
  ],
  hard: [
    [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0],
    ],
  ],
};

function solveSudoku(grid) {
  const board = grid.map((r) => [...r]);
  function isValid(b, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (b[row][i] === num && i !== col) return false;
      if (b[i][col] === num && i !== row) return false;
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const boxCol = 3 * Math.floor(col / 3) + (i % 3);
      if (b[boxRow][boxCol] === num && (boxRow !== row || boxCol !== col)) return false;
    }
    return true;
  }
  function solve() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, r, c, num)) {
              board[r][c] = num;
              if (solve()) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  solve();
  return board;
}

/* =========================================================================
   MEMORY MATCH GOVERNANCE ASSETS
   ========================================================================= */
const MEMORY_SYMBOLS = [
  { id: "mantralaya", title: "Mantralaya", icon: "🏛️", desc: "State Secretariat" },
  { id: "krishi", title: "ZP Krishi", icon: "🌾", desc: "Agriculture Vibhag" },
  { id: "jal", title: "Jal Swaraj", icon: "💧", desc: "Rural Water Supply" },
  { id: "gr", title: "G.R. Directives", icon: "📜", desc: "Official Resolutions" },
  { id: "shield", title: "Cyber Shield", icon: "🛡️", desc: "Secure BDMS Vault" },
  { id: "bdms", title: "BDMS Core", icon: "💻", desc: "Financial Matrix" },
  { id: "power", title: "Mahavitaran", icon: "⚡", desc: "Grid Infrastructure" },
  { id: "arogya", title: "Arogya Vibhag", icon: "🏥", desc: "District Healthcare" },
];

/* =========================================================================
   MAIN MIND ZONE COMPONENT
   ========================================================================= */
export default function MindZoneView({ isLight, currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState("sudoku"); // "sudoku" | "memory" | "quests"

  // User XP and Streak State from localStorage
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem("zpbdms_mind_stats");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      xp: 450,
      streak: 3,
      level: 2,
      lastQuestDate: "",
      questsCompleted: { q1: false, q2: false, q3: false },
    };
  });

  const saveStats = (newStats) => {
    setUserStats(newStats);
    try {
      localStorage.setItem("zpbdms_mind_stats", JSON.stringify(newStats));
    } catch (e) {}
  };

  const addXP = (amount) => {
    const nextXP = userStats.xp + amount;
    const nextLevel = Math.floor(nextXP / 300) + 1;
    saveStats({
      ...userStats,
      xp: nextXP,
      level: nextLevel,
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* 4K Header Banner */}
      <div
        className={isLight ? "glass-card-4k-light" : "glass-card-4k"}
        style={{
          padding: "24px 28px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="badge-4k-gold">4K ULTRA GRAPHICS</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.12)",
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                <Flame size={12} /> {userStats.streak} Day Focus Streak
              </span>
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: "-0.5px",
                margin: 0,
                color: isLight ? "#0f172a" : "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Brain size={28} color="#f59e0b" style={{ filter: "drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))" }} />
              ZPBDMS Mind Zone & Focus Sanctuary
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: isLight ? "#64748b" : "#94a3b8" }}>
              Sharpen your cognitive agility, working memory, and operational logic between high-intensity governance tasks.
            </p>
          </div>

          {/* XP & Level Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 18px",
              borderRadius: 14,
              background: isLight ? "rgba(241, 245, 249, 0.9)" : "rgba(255, 255, 255, 0.04)",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 0 14px rgba(245, 158, 11, 0.4)",
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Level {userStats.level} Strategist
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: isLight ? "#0f172a" : "#ffffff" }}>
                {userStats.xp} <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation with Golden Active Glow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 22,
            borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: 18,
            overflowX: "auto",
          }}
        >
          {[
            { id: "sudoku", label: "Sudoku 4K Grid", icon: Hash, desc: "Logic & Focus" },
            { id: "memory", label: "Maharashtra Memory Match", icon: Layers, desc: "Pattern Recall" },
            { id: "quests", label: "Daily ZP Task Quests", icon: Trophy, desc: "Speed Audit & Logic" },
          ].map(({ id, label, icon: SubIcon, desc }) => {
            const active = activeSubTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSubTab(id)}
                className={active ? (isLight ? "nav-tab-golden-active-light" : "nav-tab-golden-active") : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: active
                    ? undefined
                    : isLight
                    ? "#f8fafc"
                    : "rgba(255, 255, 255, 0.03)",
                  border: active
                    ? undefined
                    : isLight
                    ? "1px solid #e2e8f0"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  color: active ? (isLight ? "#0f172a" : "#ffffff") : isLight ? "#475569" : "#94a3b8",
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {active && <div className="nav-tab-neon-pill" />}
                <SubIcon size={16} color={active ? "#ff0055" : "currentColor"} />
                <div style={{ textAlign: "left" }}>
                  <div>{label}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: SUDOKU 4K */}
      {activeSubTab === "sudoku" && <SudokuGame isLight={isLight} onWin={() => addXP(150)} />}

      {/* SUB-VIEW 2: MEMORY MATCH */}
      {activeSubTab === "memory" && <MemoryMatchGame isLight={isLight} onWin={() => addXP(100)} />}

      {/* SUB-VIEW 3: DAILY ZP QUESTS */}
      {activeSubTab === "quests" && (
        <DailyQuestsGame
          isLight={isLight}
          userStats={userStats}
          onCompleteQuest={(qId, xp) => {
            const nextCompleted = { ...userStats.questsCompleted, [qId]: true };
            const nextXP = userStats.xp + xp;
            saveStats({
              ...userStats,
              xp: nextXP,
              questsCompleted: nextCompleted,
            });
          }}
        />
      )}
    </div>
  );
}

/* =========================================================================
   GAME 1: SUDOKU 4K ELITE
   ========================================================================= */
function SudokuGame({ isLight, onWin }) {
  const [difficulty, setDifficulty] = useState("easy"); // "easy" | "medium" | "hard"
  const [initialBoard, setInitialBoard] = useState(SUDOKU_BOARDS.easy[0]);
  const [board, setBoard] = useState(() => SUDOKU_BOARDS.easy[0].map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState([0, 0]); // [row, col]
  const [history, setHistory] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isWon, setIsWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Solved solution matrix for instant verification
  const solution = useMemo(() => solveSudoku(initialBoard), [initialBoard]);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isRunning && !isWon) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isWon]);

  // Load new puzzle
  const startNewGame = (diff = difficulty) => {
    const pool = SUDOKU_BOARDS[diff] || SUDOKU_BOARDS.easy;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    setInitialBoard(chosen);
    setBoard(chosen.map((r) => [...r]));
    setHistory([]);
    setSeconds(0);
    setIsRunning(true);
    setIsWon(false);
    setMistakes(0);
    setSelectedCell([0, 0]);
  };

  // Keyboard navigation & number input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isWon) return;
      const [r, c] = selectedCell;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCell([Math.max(0, r - 1), c]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCell([Math.min(8, r + 1), c]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedCell([r, Math.max(0, c - 1)]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedCell([r, Math.min(8, c + 1)]);
      } else if (e.key >= "1" && e.key <= "9") {
        inputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        inputNumber(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, board, initialBoard, isWon]);

  const inputNumber = (num) => {
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return; // Locked initial cell

    if (num !== 0 && solution[r][c] !== num) {
      setMistakes((m) => m + 1);
    }

    setHistory((prev) => [...prev, board.map((row) => [...row])]);
    const nextBoard = board.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? num : val))
    );
    setBoard(nextBoard);

    // Check completion
    let allFilled = true;
    let allCorrect = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (nextBoard[i][j] === 0) allFilled = false;
        if (nextBoard[i][j] !== solution[i][j]) allCorrect = false;
      }
    }
    if (allFilled && allCorrect) {
      setIsWon(true);
      setIsRunning(false);
      if (onWin) onWin();
    }
  };

  const undoMove = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const [selR, selC] = selectedCell;
  const selectedVal = board[selR]?.[selC];

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={isLight ? "glass-card-4k-light" : "glass-card-4k"}
      style={{ padding: "26px", position: "relative" }}
    >
      {/* Top Game Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                startNewGame(d);
              }}
              style={{
                textTransform: "capitalize",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background:
                  difficulty === d
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : isLight
                    ? "#f1f5f9"
                    : "rgba(255, 255, 255, 0.05)",
                color: difficulty === d ? "#ffffff" : isLight ? "#475569" : "#94a3b8",
                border:
                  difficulty === d
                    ? "1px solid #f59e0b"
                    : isLight
                    ? "1px solid #cbd5e1"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: difficulty === d ? "0 0 10px rgba(245, 158, 11, 0.4)" : "none",
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: isLight ? "#0f172a" : "#f1f5f9",
              background: isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)",
              padding: "6px 12px",
              borderRadius: 8,
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Clock size={15} color="#f59e0b" />
            {formatTime(seconds)}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 600, color: mistakes > 2 ? "#ef4444" : "#94a3b8" }}>
            Mistakes: <strong style={{ color: mistakes > 0 ? "#ef4444" : "#10b981" }}>{mistakes}</strong>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            title={isRunning ? "Pause Game" : "Resume Game"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isLight ? "#475569" : "#94a3b8",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} color="#10b981" />}
          </button>

          <button
            onClick={() => startNewGame()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.05)",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
              color: isLight ? "#0f172a" : "#ffffff",
            }}
          >
            <RotateCcw size={13} /> New Game
          </button>
        </div>
      </div>

      {/* SUDOKU GRID & CONTROLS CONTAINER */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center", alignItems: "flex-start" }}>
        {/* 9x9 Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, minmax(34px, 48px))",
            gridTemplateRows: "repeat(9, minmax(34px, 48px))",
            gap: 1,
            background: isLight ? "#94a3b8" : "rgba(245, 158, 11, 0.35)",
            padding: 2,
            borderRadius: 12,
            border: "2px solid #f59e0b",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.25), 0 10px 30px rgba(0, 0, 0, 0.5)",
            userSelect: "none",
          }}
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r][c] !== 0;
              const isSelected = selR === r && selC === c;
              const isSameVal = selectedVal !== 0 && val === selectedVal;
              const isConflict =
                val !== 0 && !isInitial && solution[r][c] !== val;

              // Border accents for 3x3 subgrids
              const borderBottom = (r + 1) % 3 === 0 && r < 8 ? "2px solid #f59e0b" : undefined;
              const borderRight = (c + 1) % 3 === 0 && c < 8 ? "2px solid #f59e0b" : undefined;

              let cellBg = isLight ? "#ffffff" : "rgba(15, 20, 32, 0.95)";
              if (isSelected) {
                cellBg = "rgba(245, 158, 11, 0.3)";
              } else if (isSameVal) {
                cellBg = isLight ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.18)";
              } else if (selR === r || selC === c) {
                cellBg = isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.03)";
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell([r, c])}
                  className="sudoku-cell"
                  style={{
                    background: cellBg,
                    borderBottom,
                    borderRight,
                    color: isConflict
                      ? "#ef4444"
                      : isInitial
                      ? isLight
                        ? "#0f172a"
                        : "#ffffff"
                      : "#38bdf8",
                    outline: isSelected ? "2px solid #f59e0b" : "none",
                    outlineOffset: -2,
                    zIndex: isSelected ? 2 : 1,
                  }}
                >
                  {val !== 0 ? val : ""}
                </div>
              );
            })
          )}
        </div>

        {/* Number Pad & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 240, maxWidth: 280 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? "#475569" : "#cbd5e1" }}>
            Number Input Pad
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => inputNumber(num)}
                style={{
                  height: 52,
                  borderRadius: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  cursor: "pointer",
                  background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.06)",
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                  color: isLight ? "#0f172a" : "#ffffff",
                  transition: "all 0.12s ease",
                  boxShadow: isLight ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f59e0b";
                  e.currentTarget.style.boxShadow = "0 0 12px rgba(245, 158, 11, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Erase & Undo Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              onClick={() => inputNumber(0)}
              style={{
                padding: "12px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              Erase
            </button>
            <button
              onClick={undoMove}
              disabled={history.length === 0}
              style={{
                padding: "12px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: history.length === 0 ? "not-allowed" : "pointer",
                opacity: history.length === 0 ? 0.4 : 1,
                background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                color: isLight ? "#475569" : "#cbd5e1",
              }}
            >
              Undo
            </button>
          </div>

          {/* Quick Help Guide */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.02)",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: 11.5,
              color: isLight ? "#64748b" : "#94a3b8",
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>
              <Lightbulb size={13} /> Keyboard Shortcuts
            </div>
            Use <strong>Arrow Keys</strong> to move reticle, <strong>1-9</strong> to fill digit, and <strong>Backspace</strong> to clear.
          </div>
        </div>
      </div>

      {/* VICTORY MODAL OVERLAY */}
      {isWon && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(8, 10, 18, 0.88)",
            backdropFilter: "blur(12px)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: 20,
          }}
        >
          <div
            className="glass-card-4k"
            style={{
              maxWidth: 420,
              width: "100%",
              padding: 32,
              textAlign: "center",
              border: "2px solid #f59e0b",
              boxShadow: "0 0 35px rgba(245, 158, 11, 0.5)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                margin: "0 auto 16px",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.6)",
              }}
            >
              <Trophy size={32} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 8px" }}>
              Sudoku Mastered!
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Flawless cognitive analytical execution. Solved in{" "}
              <strong style={{ color: "#f59e0b" }}>{formatTime(seconds)}</strong> with{" "}
              <strong style={{ color: "#38bdf8" }}>{mistakes}</strong> mistakes.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#f59e0b",
                fontWeight: 800,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              <Sparkles size={16} /> +150 Strategy XP Awarded!
            </div>

            <div>
              <button
                onClick={() => startNewGame()}
                className="btn-red-gradient"
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 800,
                  borderRadius: 10,
                }}
              >
                Play Another Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   GAME 2: MAHARASHTRA MEMORY MATCH (16 CARDS / 8 PAIRS)
   ========================================================================= */
function MemoryMatchGame({ isLight, onWin }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("zpbdms_memory_best") || "999", 10);
    } catch (e) {
      return 999;
    }
  });

  const shuffleCards = () => {
    const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((sym, idx) => ({
      uniqueId: `${sym.id}-${idx}`,
      symbolId: sym.id,
      title: sym.title,
      icon: sym.icon,
      desc: sym.desc,
    }));

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsPlaying(true);
    setIsWon(false);
  };

  useEffect(() => {
    shuffleCards();
  }, []);

  // Timer
  useEffect(() => {
    let timer = null;
    if (isPlaying && !isWon) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isWon]);

  const handleCardClick = (index) => {
    if (!isPlaying || isWon) return;
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].symbolId)) return;

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const cardA = cards[firstIdx];
      const cardB = cards[secondIdx];

      if (cardA.symbolId === cardB.symbolId) {
        // MATCH!
        const nextMatched = [...matchedIds, cardA.symbolId];
        setMatchedIds(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.length === MEMORY_SYMBOLS.length) {
          setIsWon(true);
          setIsPlaying(false);
          const finalMoves = moves + 1;
          if (finalMoves < bestScore) {
            setBestScore(finalMoves);
            try {
              localStorage.setItem("zpbdms_memory_best", finalMoves.toString());
            } catch (e) {}
          }
          if (onWin) onWin();
        }
      } else {
        // NO MATCH -> flip back after 800ms
        setTimeout(() => {
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={isLight ? "glass-card-4k-light" : "glass-card-4k"}
      style={{ padding: "26px", position: "relative" }}
    >
      {/* Top Header stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", color: isLight ? "#0f172a" : "#ffffff" }}>
            Maharashtra ZP Governance Pairs
          </h2>
          <div style={{ fontSize: 12.5, color: isLight ? "#64748b" : "#94a3b8" }}>
            Match all 8 pairs of Maharashtra State administrative symbols with minimum moves.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.04)",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: 13,
              fontWeight: 700,
              color: isLight ? "#0f172a" : "#ffffff",
            }}
          >
            Moves: <strong style={{ color: "#f59e0b" }}>{moves}</strong>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.04)",
              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: 13,
              fontWeight: 700,
              color: isLight ? "#0f172a" : "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Clock size={15} color="#38bdf8" />
            {formatTime(seconds)}
          </div>

          {bestScore < 999 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>
              Best: {bestScore} moves
            </div>
          )}

          <button
            onClick={shuffleCards}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: "linear-gradient(135deg, #ff334b, #d90429)",
              border: "none",
              color: "#ffffff",
              boxShadow: "0 2px 8px rgba(255, 51, 75, 0.3)",
            }}
          >
            <RefreshCw size={13} /> Reset Cards
          </button>
        </div>
      </div>

      {/* 4x4 CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 14,
          perspective: 1000,
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.symbolId);
          const isMatched = matchedIds.includes(card.symbolId);

          return (
            <div
              key={card.uniqueId}
              onClick={() => handleCardClick(idx)}
              className={`memory-card ${isFlipped ? "is-flipped" : ""} ${isMatched ? "is-matched" : ""}`}
              style={{
                position: "relative",
                height: 125,
                borderRadius: 12,
                cursor: isMatched ? "default" : "pointer",
                transformStyle: "preserve-3d",
                transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Back Face (Hidden) */}
              <div
                className="memory-card-face"
                style={{
                  background: isLight ? "#ffffff" : "rgba(22, 28, 45, 0.9)",
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px dashed rgba(245, 158, 11, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f59e0b",
                  }}
                >
                  <Brain size={22} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginTop: 8, letterSpacing: "0.5px" }}>
                  ZPBDMS
                </div>
              </div>

              {/* Front Face (Revealed) */}
              <div
                className="memory-card-face memory-card-front"
                style={{
                  background: isMatched
                    ? isLight
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(16, 185, 129, 0.16)"
                    : isLight
                    ? "#ffffff"
                    : "rgba(18, 22, 34, 0.95)",
                  border: isMatched
                    ? "2px solid #10b981"
                    : "2px solid #f59e0b",
                  boxShadow: isMatched
                    ? "0 0 16px rgba(16, 185, 129, 0.4)"
                    : "0 0 14px rgba(245, 158, 11, 0.35)",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 4 }}>{card.icon}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: isLight ? "#0f172a" : "#ffffff",
                    lineHeight: 1.2,
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 9.5, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                  {card.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VICTORY OVERLAY */}
      {isWon && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(8, 10, 18, 0.88)",
            backdropFilter: "blur(12px)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: 20,
          }}
        >
          <div
            className="glass-card-4k"
            style={{
              maxWidth: 400,
              width: "100%",
              padding: 30,
              textAlign: "center",
              border: "2px solid #10b981",
              boxShadow: "0 0 35px rgba(16, 185, 129, 0.5)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                margin: "0 auto 16px",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
              }}
            >
              <Award size={30} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 8px" }}>
              Memory Matrix Cleared!
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 18 }}>
              Completed in <strong style={{ color: "#10b981" }}>{moves} moves</strong> ({formatTime(seconds)}).
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                fontWeight: 800,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              <Sparkles size={16} /> +100 Strategy XP Awarded!
            </div>

            <div>
              <button
                onClick={shuffleCards}
                className="btn-red-gradient"
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 800,
                  borderRadius: 10,
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   GAME 3: COMPLETE THE ZP DAILY TASKS QUEST
   ========================================================================= */
function DailyQuestsGame({ isLight, userStats, onCompleteQuest }) {
  // Quest 1: Headcode Ledger Balance Math
  const [q1Values, setQ1Values] = useState({ itemA: 45, itemB: 35, itemC: 20 });
  const q1Target = 100;
  const q1CurrentSum = q1Values.itemA + q1Values.itemB + q1Values.itemC;

  // Quest 2: Security Token Logic Decryptor
  // Rules: 4 digit number. 1st is 7. Sum is 21. 3rd is 4. Last is 2. (7 8 4 2)
  const [q2Guess, setQ2Guess] = useState("");
  const [q2Status, setQ2Status] = useState("");

  // Quest 3: Speed Audit Sprint (3 out of 6 vouchers are flagged)
  const [q3Vouchers, setQ3Vouchers] = useState([
    { id: 1, no: "VCH-1092", amount: "₹4,50,000", issue: "GSTIN Mismatch", isFraud: true, selected: false },
    { id: 2, no: "VCH-1093", amount: "₹1,20,000", issue: null, isFraud: false, selected: false },
    { id: 3, no: "VCH-1094", amount: "₹8,90,000", issue: "Over-budget allocation", isFraud: true, selected: false },
    { id: 4, no: "VCH-1095", amount: "₹3,15,000", issue: null, isFraud: false, selected: false },
    { id: 5, no: "VCH-1096", amount: "₹6,40,000", issue: "Duplicate Token Stamp", isFraud: true, selected: false },
    { id: 6, no: "VCH-1097", amount: "₹2,80,000", issue: null, isFraud: false, selected: false },
  ]);

  const handleQ1Submit = () => {
    if (q1CurrentSum === q1Target) {
      onCompleteQuest("q1", 80);
    }
  };

  const handleQ2Submit = () => {
    if (q2Guess === "7842") {
      setQ2Status("success");
      onCompleteQuest("q2", 120);
    } else {
      setQ2Status("error");
    }
  };

  const handleToggleVoucher = (id) => {
    if (userStats.questsCompleted.q3) return;
    const updated = q3Vouchers.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v));
    setQ3Vouchers(updated);

    // Check if exactly the 3 frauds are selected
    const selectedFrauds = updated.filter((v) => v.selected && v.isFraud).length;
    const selectedNormal = updated.filter((v) => v.selected && !v.isFraud).length;
    if (selectedFrauds === 3 && selectedNormal === 0) {
      onCompleteQuest("q3", 150);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* QUEST 1 */}
      <TiltCard maxTilt={3} glare={true} hudBrackets={true} style={{ width: "100%" }}>
        <div
          className={isLight ? "glass-card-4k-light" : "glass-card-nano"}
          style={{
            padding: "24px",
            borderLeft: userStats.questsCompleted.q1 ? "4px solid #10b981" : "4px solid #f59e0b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Hash size={18} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff" }}>
                  Quest 1: ZP Headcode Ledger Balance
                </div>
                <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
                  Adjust the 3 department allotment sliders so the combined total precisely matches ₹100 Lakhs.
                </div>
              </div>
            </div>

            {userStats.questsCompleted.q1 ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#10b981", fontWeight: 700, fontSize: 12.5 }}>
                <CheckCircle2 size={16} /> Completed (+80 XP)
              </span>
            ) : (
              <span className="badge-4k-gold">+80 XP</span>
            )}
          </div>

          <div style={{ maxWidth: 560, marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                <span>Gram Panchayat Works:</span>
                <strong style={{ color: "#38bdf8" }}>₹{q1Values.itemA} Lakhs</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={q1Values.itemA}
                disabled={userStats.questsCompleted.q1}
                onChange={(e) => setQ1Values({ ...q1Values, itemA: parseInt(e.target.value, 10) })}
                style={{ width: "100%", accentColor: "#38bdf8" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                <span>Rural Water Scheme:</span>
                <strong style={{ color: "#10b981" }}>₹{q1Values.itemB} Lakhs</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={q1Values.itemB}
                disabled={userStats.questsCompleted.q1}
                onChange={(e) => setQ1Values({ ...q1Values, itemB: parseInt(e.target.value, 10) })}
                style={{ width: "100%", accentColor: "#10b981" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                <span>Health Infrastructure:</span>
                <strong style={{ color: "#f59e0b" }}>₹{q1Values.itemC} Lakhs</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={q1Values.itemC}
                disabled={userStats.questsCompleted.q1}
                onChange={(e) => setQ1Values({ ...q1Values, itemC: parseInt(e.target.value, 10) })}
                style={{ width: "100%", accentColor: "#f59e0b" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                Current Total:{" "}
                <span style={{ color: q1CurrentSum === q1Target ? "#10b981" : "#ef4444" }}>
                  ₹{q1CurrentSum} / ₹{q1Target} Lakhs
                </span>
              </div>

              {!userStats.questsCompleted.q1 && (
                <button
                  onClick={handleQ1Submit}
                  disabled={q1CurrentSum !== q1Target}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: q1CurrentSum === q1Target ? "pointer" : "not-allowed",
                    background: q1CurrentSum === q1Target ? "linear-gradient(135deg, #10b981, #059669)" : "#475569",
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  Submit Balance
                </button>
              )}
            </div>
          </div>
        </div>
      </TiltCard>

      {/* QUEST 2 */}
      <TiltCard maxTilt={3} glare={true} hudBrackets={true} style={{ width: "100%" }}>
        <div
          className={isLight ? "glass-card-4k-light" : "glass-card-nano"}
          style={{
            padding: "24px",
            borderLeft: userStats.questsCompleted.q2 ? "4px solid #10b981" : "4px solid #38bdf8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff" }}>
                  Quest 2: BDMS Security Token Decryption
                </div>
                <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
                  Crack the 4-digit approval passcode using intelligence hints.
                </div>
              </div>
            </div>

            {userStats.questsCompleted.q2 ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#10b981", fontWeight: 700, fontSize: 12.5 }}>
                <CheckCircle2 size={16} /> Decrypted (+120 XP)
              </span>
            ) : (
              <span className="badge-4k-gold">+120 XP</span>
            )}
          </div>

          <div style={{ maxWidth: 520, marginTop: 14 }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.03)",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                fontSize: 12,
                lineHeight: 1.6,
                color: isLight ? "#475569" : "#cbd5e1",
                marginBottom: 14,
              }}
            >
              <div>• Digit 1: The lucky single prime number <strong>7</strong>.</div>
              <div>• Digit 3: Half of 8 (which is <strong>4</strong>).</div>
              <div>• Digit 4: Smallest positive even number (which is <strong>2</strong>).</div>
              <div>• Rule: The sum of all 4 digits equals <strong>21</strong>.</div>
            </div>

            {!userStats.questsCompleted.q2 ? (
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  maxLength={4}
                  value={q2Guess}
                  onChange={(e) => setQ2Guess(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit PIN..."
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "4px",
                    textAlign: "center",
                    width: 180,
                    background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.05)",
                    border:
                      q2Status === "error"
                        ? "1px solid #ef4444"
                        : isLight
                        ? "1px solid #cbd5e1"
                        : "1px solid rgba(255, 255, 255, 0.15)",
                    color: isLight ? "#0f172a" : "#ffffff",
                  }}
                />
                <button
                  onClick={handleQ2Submit}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  Decrypt PIN
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                Decrypted PIN: 7842 (Access Authenticated)
              </div>
            )}
            {q2Status === "error" && !userStats.questsCompleted.q2 && (
              <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>
                Incorrect token sequence. Re-verify the sum of digits!
              </div>
            )}
          </div>
        </div>
      </TiltCard>

      {/* QUEST 3 */}
      <TiltCard maxTilt={3} glare={true} hudBrackets={true} style={{ width: "100%" }}>
        <div
          className={isLight ? "glass-card-4k-light" : "glass-card-nano"}
          style={{
            padding: "24px",
            borderLeft: userStats.questsCompleted.q3 ? "4px solid #10b981" : "4px solid #ff334b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(255, 51, 75, 0.15)",
                  color: "#ff334b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff" }}>
                  Quest 3: Speed Audit Sprint
                </div>
                <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
                  Spot and click the 3 flagged anomaly vouchers from the 6 submitted entries.
                </div>
              </div>
            </div>

            {userStats.questsCompleted.q3 ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#10b981", fontWeight: 700, fontSize: 12.5 }}>
                <CheckCircle2 size={16} /> Audit Verified (+150 XP)
              </span>
            ) : (
              <span className="badge-4k-gold">+150 XP</span>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginTop: 16,
            }}
          >
            {q3Vouchers.map((v) => {
              const isSelected = v.selected;
              return (
                <div
                  key={v.id}
                  onClick={() => handleToggleVoucher(v.id)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    cursor: userStats.questsCompleted.q3 ? "default" : "pointer",
                    background: isSelected
                      ? "rgba(255, 51, 75, 0.15)"
                      : isLight
                      ? "#ffffff"
                      : "rgba(255, 255, 255, 0.03)",
                    border: isSelected
                      ? "2px solid #ff334b"
                      : isLight
                      ? "1px solid #cbd5e1"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: isSelected ? "0 0 14px rgba(255, 51, 75, 0.35)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff" }}>
                      {v.no}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{v.amount}</span>
                  </div>
                  <div style={{ fontSize: 11, color: isSelected ? "#ff334b" : "#94a3b8" }}>
                    {isSelected ? `⚠️ Flagged: ${v.issue || "Audited"}` : "Tap to inspect & flag"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
