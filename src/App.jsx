import React, { useState, useEffect, useRef, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import {
  AlertTriangle,
  Plus,
  X,
  Search,
  MapPin,
  ListChecks,
  LayoutGrid,
  Trash2,
  Pencil,
  ChevronDown,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Layers,
  Sparkles,
  Calendar,
  User,
  Filter,
  ArrowRight,
  Database,
  Bell,
  LogOut,
  UserCheck,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCheck,
  Inbox,
  Code2,
  Cpu,
  FileSpreadsheet,
  FlaskConical,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

/* ---------------------------------------------------------------
   Management Portal — ZPBDMS Operations & Command System
   Red & White Fusion · High Graphics · Developed by Sudhanshu Khande
----------------------------------------------------------------*/

const TEAM_ROSTER = [
  {
    id: "u1",
    name: "Sudhanshu Khande",
    username: "sudhanshu",
    role: "Main Admin / Business Analyst",
    password: "Admin@2026",
    avatar: "#ff334b",
  },
  {
    id: "u2",
    name: "Sankalp",
    username: "sankalp",
    role: "Lead Developer",
    password: "Dev@2026",
    avatar: "#38bdf8",
  },
  {
    id: "u3",
    name: "Rutuja",
    username: "rutuja",
    role: "Tester",
    password: "Qa@2026",
    avatar: "#a855f7",
  },
];

const MODULES = [
  "VPDA",
  "CESS",
  "Treasury",
  "Remittance",
  "Outward Tracking",
  "Namuna Reports",
  "Credentials",
  "Other",
];

const DISTRICTS_DEFAULT = [
  "Ahilyanagar",
  "Akola",
  "Amravati",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Chhatrapati Sambhajinagar",
  "Dharashiv",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Palghar",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const ISSUE_STATUSES = ["Open", "In Progress", "Resolved"];
const TASK_STATUSES = ["To Do", "In Progress", "Done"];
const ROLLOUT_STAGES = ["Not Started", "Requirements", "UAT", "Live", "Stabilizing"];

// QA Matrix Constants
const TEST_STATUSES = ["Untested", "Passed", "Failed", "Blocked", "Retest"];
const DEV_STATUSES = [
  "Pending Dev Fix",
  "Dev In Progress",
  "Resolved / Ready for Retest",
  "Cannot Reproduce / As Designed",
];
const SEVERITIES = ["Blocker", "Critical", "Major", "Minor", "Low"];

const DOC_REF = () => doc(db, "trackerData", "main");

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatTimeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const DISTRICT_ALIASES = {
  ahmednagar: "Ahilyanagar",
  aurangabad: "Chhatrapati Sambhajinagar",
  osmanabad: "Dharashiv",
};

function mergeDistrictsWithDefaults(existingDistricts = []) {
  const existingMap = new Map();
  const matchedNames = new Set();

  (existingDistricts || []).forEach((d) => {
    if (d && d.name) {
      const lower = d.name.trim().toLowerCase();
      const canonical = DISTRICT_ALIASES[lower] ? DISTRICT_ALIASES[lower].toLowerCase() : lower;
      existingMap.set(canonical, {
        ...d,
        name: DISTRICT_ALIASES[lower] || d.name,
      });
      matchedNames.add(lower);
      matchedNames.add(canonical);
    }
  });

  const merged = DISTRICTS_DEFAULT.map((name) => {
    const key = name.trim().toLowerCase();
    const existing = existingMap.get(key);
    if (existing) {
      matchedNames.add(key);
      return {
        ...existing,
        name, // Standardized official casing
      };
    }
    const isPilot = ["Satara", "Nashik", "Buldhana"].includes(name);
    return {
      id: uid(),
      name,
      stage: isPilot ? "Live" : "Requirements",
      notes: isPilot
        ? "Primary pilot ZP jurisdiction active on live system"
        : "ZP rollout scheduled / system onboarding in progress",
      updatedAt: todayISO(),
    };
  });

  // Retain any custom district added by users
  (existingDistricts || []).forEach((d) => {
    if (d && d.name && !matchedNames.has(d.name.trim().toLowerCase())) {
      merged.push(d);
    }
  });

  return merged;
}

function seedTestPoints() {
  return [
    {
      id: uid(),
      code: "TP-VPDA-01",
      module: "VPDA",
      scenario: "Verify digital cryptographic signature generation on Namuna 24 PDF",
      expectedResult: "PDF generated with valid cryptographic PKCS#7 digital signature and official stamp",
      actualResult: "Signature generation timed out on large datasets (>50 pages)",
      status: "Failed",
      devStatus: "Resolved / Ready for Retest",
      devRemark: "Added chunked stream processing in build v2.1; response time reduced to 1.2s.",
      severity: "Critical",
      tester: "Rutuja",
      assignedDev: "Sankalp",
      updatedAt: todayISO(),
    },
    {
      id: uid(),
      code: "TP-TR-02",
      module: "Treasury",
      scenario: "Validate Treasury bill remittance reconciliation with bank transaction IDs",
      expectedResult: "Bank UTR number matches Treasury ledger with automated status updated to Settled",
      actualResult: "Ledger status updated correctly with zero discrepancy",
      status: "Passed",
      devStatus: "Resolved / Ready for Retest",
      devRemark: "Automated cron runner verified against staging bank gateway.",
      severity: "Major",
      tester: "Rutuja",
      assignedDev: "Sankalp",
      updatedAt: todayISO(),
    },
    {
      id: uid(),
      code: "TP-CESS-03",
      module: "CESS",
      scenario: "Test calculation of 2% state infrastructure CESS surcharge on commercial assessment",
      expectedResult: "System calculates accurate 2% rate rounded up to nearest whole rupee",
      actualResult: "Awaiting test data batch from Buldhana district office",
      status: "Untested",
      devStatus: "Pending Dev Fix",
      devRemark: "",
      severity: "Major",
      tester: "Rutuja",
      assignedDev: "Sudhanshu Khande",
      updatedAt: todayISO(),
    },
    {
      id: uid(),
      code: "TP-NAM-04",
      module: "Namuna Reports",
      scenario: "Export Namuna 1 to 33 ledger registers in encrypted Excel/CSV formats",
      expectedResult: "Download triggers with UTF-8 Marathi/English bilingual encoding",
      actualResult: "Special Marathi Unicode characters render as question marks in Excel export",
      status: "Failed",
      devStatus: "Dev In Progress",
      devRemark: "Investigating UTF-8 BOM header injection for Excel compatibility.",
      severity: "Critical",
      tester: "Rutuja",
      assignedDev: "Sankalp",
      updatedAt: todayISO(),
    },
  ];
}

function seedData() {
  return {
    issues: [],
    tasks: [],
    notifications: [],
    testPoints: seedTestPoints(),
    districts: mergeDistrictsWithDefaults([]),
  };
}

/* ---------------------------- UI Atoms ---------------------------- */

function StatusChip({ value, interactive = false }) {
  const configs = {
    Open: {
      bg: "rgba(239, 68, 68, 0.15)",
      fg: "#ff6479",
      border: "rgba(239, 68, 68, 0.35)",
      glow: "0 0 10px rgba(239, 68, 68, 0.25)",
      dot: "#ff334b",
    },
    "In Progress": {
      bg: "rgba(245, 158, 11, 0.14)",
      fg: "#fbbf24",
      border: "rgba(245, 158, 11, 0.3)",
      glow: "0 0 8px rgba(245, 158, 11, 0.15)",
      dot: "#f59e0b",
    },
    Resolved: {
      bg: "rgba(34, 197, 94, 0.14)",
      fg: "#4ade80",
      border: "rgba(34, 197, 94, 0.3)",
      glow: "0 0 8px rgba(34, 197, 94, 0.15)",
      dot: "#22c55e",
    },
    "To Do": {
      bg: "rgba(148, 163, 184, 0.12)",
      fg: "#cbd5e1",
      border: "rgba(148, 163, 184, 0.25)",
      glow: "none",
      dot: "#94a3b8",
    },
    Done: {
      bg: "rgba(34, 197, 94, 0.14)",
      fg: "#4ade80",
      border: "rgba(34, 197, 94, 0.3)",
      glow: "0 0 8px rgba(34, 197, 94, 0.15)",
      dot: "#22c55e",
    },
    "Not Started": {
      bg: "rgba(100, 116, 139, 0.14)",
      fg: "#94a3b8",
      border: "rgba(100, 116, 139, 0.25)",
      glow: "none",
      dot: "#64748b",
    },
    Requirements: {
      bg: "rgba(168, 85, 247, 0.14)",
      fg: "#c084fc",
      border: "rgba(168, 85, 247, 0.3)",
      glow: "0 0 8px rgba(168, 85, 247, 0.15)",
      dot: "#a855f7",
    },
    UAT: {
      bg: "rgba(245, 158, 11, 0.14)",
      fg: "#fbbf24",
      border: "rgba(245, 158, 11, 0.3)",
      glow: "0 0 8px rgba(245, 158, 11, 0.15)",
      dot: "#f59e0b",
    },
    Live: {
      bg: "rgba(239, 68, 68, 0.18)",
      fg: "#ffffff",
      border: "rgba(255, 51, 75, 0.45)",
      glow: "0 0 12px rgba(255, 51, 75, 0.3)",
      dot: "#ff334b",
    },
    Stabilizing: {
      bg: "rgba(56, 189, 248, 0.14)",
      fg: "#38bdf8",
      border: "rgba(56, 189, 248, 0.3)",
      glow: "0 0 8px rgba(56, 189, 248, 0.15)",
      dot: "#38bdf8",
    },
  };

  const s = configs[value] || {
    bg: "rgba(148, 163, 184, 0.1)",
    fg: "#e2e8f0",
    border: "rgba(148, 163, 184, 0.2)",
    dot: "#94a3b8",
    glow: "none",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: s.dot,
          boxShadow: `0 0 6px ${s.dot}`,
        }}
      />
      {value}
    </span>
  );
}

function TestStatusChip({ value, interactive = false, onClick }) {
  const map = {
    Passed: {
      bg: "rgba(34, 197, 94, 0.16)",
      fg: "#4ade80",
      border: "rgba(34, 197, 94, 0.4)",
      glow: "0 0 10px rgba(34, 197, 94, 0.25)",
      dot: "#22c55e",
    },
    Failed: {
      bg: "rgba(255, 51, 75, 0.2)",
      fg: "#ffffff",
      border: "rgba(255, 51, 75, 0.55)",
      glow: "0 0 12px rgba(255, 51, 75, 0.4)",
      dot: "#ff334b",
    },
    Blocked: {
      bg: "rgba(245, 158, 11, 0.16)",
      fg: "#fbbf24",
      border: "rgba(245, 158, 11, 0.4)",
      glow: "0 0 10px rgba(245, 158, 11, 0.2)",
      dot: "#f59e0b",
    },
    Retest: {
      bg: "rgba(56, 189, 248, 0.16)",
      fg: "#38bdf8",
      border: "rgba(56, 189, 248, 0.4)",
      glow: "0 0 10px rgba(56, 189, 248, 0.2)",
      dot: "#38bdf8",
    },
    Untested: {
      bg: "rgba(148, 163, 184, 0.12)",
      fg: "#cbd5e1",
      border: "rgba(148, 163, 184, 0.25)",
      glow: "none",
      dot: "#94a3b8",
    },
  };
  const s = map[value] || map.Untested;

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.18s ease",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: s.dot,
          boxShadow: `0 0 6px ${s.dot}`,
        }}
      />
      {value}
    </span>
  );
}

function DevStatusChip({ value, onClick }) {
  const map = {
    "Resolved / Ready for Retest": {
      bg: "rgba(34, 197, 94, 0.16)",
      fg: "#4ade80",
      border: "rgba(34, 197, 94, 0.4)",
      glow: "0 0 10px rgba(34, 197, 94, 0.2)",
      dot: "#22c55e",
    },
    "Dev In Progress": {
      bg: "rgba(168, 85, 247, 0.16)",
      fg: "#c084fc",
      border: "rgba(168, 85, 247, 0.4)",
      glow: "0 0 10px rgba(168, 85, 247, 0.2)",
      dot: "#a855f7",
    },
    "Pending Dev Fix": {
      bg: "rgba(245, 158, 11, 0.16)",
      fg: "#fbbf24",
      border: "rgba(245, 158, 11, 0.4)",
      glow: "0 0 8px rgba(245, 158, 11, 0.15)",
      dot: "#f59e0b",
    },
    "Cannot Reproduce / As Designed": {
      bg: "rgba(148, 163, 184, 0.12)",
      fg: "#94a3b8",
      border: "rgba(148, 163, 184, 0.25)",
      glow: "none",
      dot: "#94a3b8",
    },
  };
  const s = map[value] || map["Pending Dev Fix"];

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        fontSize: 11.5,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.18s ease",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: s.dot,
        }}
      />
      {value || "Pending Dev Fix"}
    </span>
  );
}

function PriorityBadge({ value }) {
  const isCritical = value === "Critical";

  const colorMap = {
    Critical: {
      bg: "rgba(255, 51, 75, 0.18)",
      fg: "#ffffff",
      border: "rgba(255, 51, 75, 0.5)",
      glow: "0 0 10px rgba(255, 51, 75, 0.35)",
    },
    High: {
      bg: "rgba(249, 115, 22, 0.14)",
      fg: "#fb923c",
      border: "rgba(249, 115, 22, 0.35)",
      glow: "none",
    },
    Medium: {
      bg: "rgba(234, 179, 8, 0.12)",
      fg: "#fde047",
      border: "rgba(234, 179, 8, 0.25)",
      glow: "none",
    },
    Low: {
      bg: "rgba(148, 163, 184, 0.1)",
      fg: "#94a3b8",
      border: "rgba(148, 163, 184, 0.2)",
      glow: "none",
    },
  };

  const style = colorMap[value] || colorMap.Low;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: style.bg,
        color: style.fg,
        border: `1px solid ${style.border}`,
        boxShadow: style.glow,
        fontSize: 11.5,
        fontWeight: isCritical ? 700 : 500,
        padding: "2px 8px",
        borderRadius: 4,
        letterSpacing: "0.3px",
      }}
    >
      {isCritical && <span className="pulse-radar-red" style={{ width: 6, height: 6 }} />}
      {value}
    </span>
  );
}

function ModuleTag({ name }) {
  return (
    <span
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#f1f5f9",
        fontSize: 11.5,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 4,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {name}
    </span>
  );
}

function IconButton({ onClick, title, children, variant = "default" }) {
  const isRed = variant === "danger";
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(255, 255, 255, 0.04)",
        color: "#94a3b8",
        cursor: "pointer",
        padding: "6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (isRed) {
          e.currentTarget.style.color = "#ff334b";
          e.currentTarget.style.borderColor = "rgba(255, 51, 75, 0.4)";
          e.currentTarget.style.background = "rgba(255, 51, 75, 0.12)";
        } else {
          e.currentTarget.style.color = "#ffffff";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#94a3b8";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
      }}
    >
      {children}
    </button>
  );
}

function SelectInput({ value, onChange, options, style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          appearance: "none",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          padding: "9px 30px 9px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(15, 18, 28, 0.95)",
          color: "#f8fafc",
          cursor: "pointer",
          outline: "none",
          transition: "border 0.2s ease, box-shadow 0.2s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(255, 51, 75, 0.6)";
          e.target.style.boxShadow = "0 0 0 3px rgba(255, 51, 75, 0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
          e.target.style.boxShadow = "none";
        }}
      >
        {options.map((o) => (
          <option key={typeof o === "object" ? o.value : o} value={typeof o === "object" ? o.value : o} style={{ background: "#0e111a", color: "#f8fafc" }}>
            {typeof o === "object" ? o.label : o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#94a3b8",
        }}
      />
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#cbd5e1",
          marginBottom: 6,
          letterSpacing: "0.2px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

const darkInputStyle = {
  width: "100%",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13.5,
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(12, 15, 24, 0.9)",
  color: "#ffffff",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.2s ease",
};

function Modal({ title, icon: Icon, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4, 5, 8, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="modal-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #131724 0%, #0c0f18 100%)",
          width: 480,
          maxWidth: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderTop: "2px solid #ff334b",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(255, 51, 75, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Icon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255, 51, 75, 0.15)",
                  border: "1px solid rgba(255, 51, 75, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff334b",
                }}
              >
                <Icon size={16} />
              </div>
            )}
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.3px",
              }}
            >
              {title}
            </div>
          </div>
          <IconButton onClick={onClose} title="Close">
            <X size={16} />
          </IconButton>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------- Forms with Fixed Assignees ---------------------------- */

function IssueForm({ initial, districts, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      title: "",
      module: MODULES[0],
      district: districts[0] || "",
      priority: "Medium",
      status: "Open",
      assignee: TEAM_ROSTER[0].name,
      notes: "",
    }
  );

  const assigneeOptions = TEAM_ROSTER.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
  }));

  return (
    <div>
      <FormField label="Issue Description">
        <input
          style={darkInputStyle}
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          placeholder="e.g. Namuna 24 PDF signature validation error"
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Module">
          <SelectInput value={f.module} onChange={(v) => setF({ ...f, module: v })} options={MODULES} />
        </FormField>
        <FormField label="District">
          <SelectInput value={f.district} onChange={(v) => setF({ ...f, district: v })} options={districts} />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Priority">
          <SelectInput value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={PRIORITIES} />
        </FormField>
        <FormField label="Status">
          <SelectInput value={f.status} onChange={(v) => setF({ ...f, status: v })} options={ISSUE_STATUSES} />
        </FormField>
      </div>

      <FormField label="Fixed Assigned Lead (Role Owner)">
        <SelectInput
          value={f.assignee}
          onChange={(v) => setF({ ...f, assignee: v })}
          options={assigneeOptions}
        />
      </FormField>

      <FormField label="Investigation Notes / Reproduction Steps">
        <textarea
          style={{ ...darkInputStyle, minHeight: 70, resize: "vertical" }}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          placeholder="Add error codes, root cause, or reproduction steps..."
        />
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn-red-gradient"
          style={{ padding: "9px 20px", fontSize: 13 }}
          onClick={() => f.title.trim() && onSave(f)}
        >
          Save Issue
        </button>
      </div>
    </div>
  );
}

function TaskForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      title: "",
      module: MODULES[0],
      assignee: TEAM_ROSTER[0].name,
      dueDate: "",
      status: "To Do",
    }
  );

  const assigneeOptions = TEAM_ROSTER.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
  }));

  return (
    <div>
      <FormField label="Task Directive">
        <input
          style={darkInputStyle}
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          placeholder="e.g. Deploy patch for Treasury disbursement queue"
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Module">
          <SelectInput value={f.module} onChange={(v) => setF({ ...f, module: v })} options={MODULES} />
        </FormField>
        <FormField label="Status">
          <SelectInput value={f.status} onChange={(v) => setF({ ...f, status: v })} options={TASK_STATUSES} />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Fixed Assigned Lead">
          <SelectInput
            value={f.assignee}
            onChange={(v) => setF({ ...f, assignee: v })}
            options={assigneeOptions}
          />
        </FormField>
        <FormField label="Target Due Date">
          <input
            type="date"
            style={darkInputStyle}
            value={f.dueDate}
            onChange={(e) => setF({ ...f, dueDate: e.target.value })}
          />
        </FormField>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn-red-gradient"
          style={{ padding: "9px 20px", fontSize: 13 }}
          onClick={() => f.title.trim() && onSave(f)}
        >
          Save Task
        </button>
      </div>
    </div>
  );
}

function DistrictForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      name: "",
      stage: "Not Started",
      notes: "",
    }
  );

  return (
    <div>
      <FormField label="District Jurisdiction">
        <input
          style={darkInputStyle}
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          placeholder="e.g. Pune, Solapur, Aurangabad"
        />
      </FormField>

      <FormField label="Rollout Stage">
        <SelectInput value={f.stage} onChange={(v) => setF({ ...f, stage: v })} options={ROLLOUT_STAGES} />
      </FormField>

      <FormField label="Operations Notes / Blockers">
        <textarea
          style={{ ...darkInputStyle, minHeight: 70, resize: "vertical" }}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          placeholder="e.g. Training completed; awaiting VPDA cert signoff."
        />
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn-red-gradient"
          style={{ padding: "9px 20px", fontSize: 13 }}
          onClick={() => f.name.trim() && onSave(f)}
        >
          Save District
        </button>
      </div>
    </div>
  );
}

function TestPointForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      code: `TP-${MODULES[0]}-${Math.floor(10 + Math.random() * 90)}`,
      module: MODULES[0],
      scenario: "",
      expectedResult: "",
      actualResult: "",
      status: "Untested",
      devStatus: "Pending Dev Fix",
      devRemark: "",
      severity: "Major",
      tester: "Rutuja",
      assignedDev: "Sankalp",
    }
  );

  const teamOptions = TEAM_ROSTER.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Test Point Code">
          <input
            style={darkInputStyle}
            value={f.code}
            onChange={(e) => setF({ ...f, code: e.target.value })}
            placeholder="e.g. TP-VPDA-05"
          />
        </FormField>
        <FormField label="Module">
          <SelectInput value={f.module} onChange={(v) => setF({ ...f, module: v })} options={MODULES} />
        </FormField>
      </div>

      <FormField label="Test Scenario / Verification Point">
        <input
          style={darkInputStyle}
          value={f.scenario}
          onChange={(e) => setF({ ...f, scenario: e.target.value })}
          placeholder="e.g. Test OTP validation during cash remittance disbursement"
        />
      </FormField>

      <FormField label="Expected Result">
        <textarea
          style={{ ...darkInputStyle, minHeight: 60, resize: "vertical" }}
          value={f.expectedResult}
          onChange={(e) => setF({ ...f, expectedResult: e.target.value })}
          placeholder="What the system should do under normal conditions..."
        />
      </FormField>

      <FormField label="Actual Result / Defect Observations">
        <textarea
          style={{ ...darkInputStyle, minHeight: 60, resize: "vertical" }}
          value={f.actualResult}
          onChange={(e) => setF({ ...f, actualResult: e.target.value })}
          placeholder="What actually occurred during the test run..."
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Test Status">
          <SelectInput value={f.status} onChange={(v) => setF({ ...f, status: v })} options={TEST_STATUSES} />
        </FormField>
        <FormField label="Severity">
          <SelectInput value={f.severity} onChange={(v) => setF({ ...f, severity: v })} options={SEVERITIES} />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Tester Lead">
          <SelectInput value={f.tester} onChange={(v) => setF({ ...f, tester: v })} options={teamOptions} />
        </FormField>
        <FormField label="Assigned Developer">
          <SelectInput value={f.assignedDev} onChange={(v) => setF({ ...f, assignedDev: v })} options={teamOptions} />
        </FormField>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn-red-gradient"
          style={{ padding: "9px 20px", fontSize: 13 }}
          onClick={() => f.scenario.trim() && onSave(f)}
        >
          Save Test Point
        </button>
      </div>
    </div>
  );
}

function DevResolveForm({ initial, onSave, onCancel }) {
  const [devStatus, setDevStatus] = useState(initial?.devStatus || "Resolved / Ready for Retest");
  const [devRemark, setDevRemark] = useState(initial?.devRemark || "");
  const [assignedDev, setAssignedDev] = useState(initial?.assignedDev || TEAM_ROSTER[1].name);

  const teamOptions = TEAM_ROSTER.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
  }));

  return (
    <div>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 8,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
          {initial?.code} · {initial?.module}
        </div>
        <div style={{ fontSize: 13.5, color: "#ffffff", fontWeight: 600, marginTop: 2 }}>
          {initial?.scenario}
        </div>
        {initial?.actualResult && (
          <div style={{ fontSize: 12, color: "#ff6479", marginTop: 6 }}>
            <strong>Tester Defect Note:</strong> {initial.actualResult}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Developer Status">
          <SelectInput value={devStatus} onChange={(v) => setDevStatus(v)} options={DEV_STATUSES} />
        </FormField>
        <FormField label="Resolving Engineer">
          <SelectInput value={assignedDev} onChange={(v) => setAssignedDev(v)} options={teamOptions} />
        </FormField>
      </div>

      <FormField label="Developer Fix Remarks & Notes">
        <textarea
          style={{ ...darkInputStyle, minHeight: 80, resize: "vertical" }}
          value={devRemark}
          onChange={(e) => setDevRemark(e.target.value)}
          placeholder="Explain the root cause fix, commit hash, build patch version, or re-testing steps..."
        />
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn-red-gradient"
          style={{ padding: "9px 20px", fontSize: 13 }}
          onClick={() => onSave({ devStatus, devRemark, assignedDev })}
        >
          Submit Resolution & Notify Tester
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- Clean Management Login View ---------------------------- */

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Match either by username or full name (case-insensitive)
    const foundUser = TEAM_ROSTER.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser) &&
        u.password === cleanPass
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError("Invalid username or password. Access denied.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#07080c",
        padding: 20,
        position: "relative",
      }}
    >
      <div className="ambient-bg">
        <div className="cyber-grid" />
      </div>

      <div
        className="glass-card modal-enter"
        style={{
          width: 420,
          maxWidth: "100%",
          padding: "40px 34px",
          position: "relative",
          zIndex: 10,
          borderTop: "2px solid #ff334b",
          boxShadow: "0 25px 65px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 51, 75, 0.15)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)",
              boxShadow: "0 0 30px rgba(255, 51, 75, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              margin: "0 auto 16px",
            }}
          >
            <Activity size={28} />
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "0.5px",
            }}
          >
            Management
          </div>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#94a3b8" }}>
            ZPBDMS Operations & Command System
          </p>
        </div>

        {/* Clean Username & Password Form */}
        <form onSubmit={handleLoginSubmit}>
          <FormField label="Username">
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter authorized username"
                style={{ ...darkInputStyle, paddingLeft: 38 }}
                autoFocus
              />
            </div>
          </FormField>

          <FormField label="Password">
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                style={{ ...darkInputStyle, paddingLeft: 38 }}
              />
            </div>
          </FormField>

          {error && (
            <div
              style={{
                color: "#ff6479",
                fontSize: 12,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                background: "rgba(255, 51, 75, 0.1)",
                border: "1px solid rgba(255, 51, 75, 0.25)",
                borderRadius: 6,
              }}
            >
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-red-gradient"
            style={{
              width: "100%",
              padding: "12px 0",
              fontSize: 14.5,
              fontWeight: 700,
              marginTop: 10,
              letterSpacing: "0.4px",
            }}
          >
            Access Management Portal →
          </button>
        </form>

        {/* Developer Credit Footer Badge */}
        <div
          className="developer-badge"
          style={{
            marginTop: 26,
            padding: "12px 14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              fontWeight: 700,
            }}
          >
            System Architecture
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#ffffff",
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Sparkles size={14} color="#ff334b" /> Developed by{" "}
            <span style={{ color: "#ff334b", fontWeight: 800 }}>Sudhanshu Khande</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Dynamic Cybernetic Canvas Landing ---------------------------- */

function DynamicCyberLanding({ user, onEnter }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("scan"); // 'scan' -> 'branding' -> 'exit'
  const [progress, setProgress] = useState(15);
  const [terminalLog, setTerminalLog] = useState([
    "INITIALIZING CORE SYSTEM PROTOCOLS...",
    "VERIFYING ENCRYPTED CREDENTIALS...",
  ]);

  // Terminal logs sequence & phase shifts
  useEffect(() => {
    const uName = (user?.name || "Sudhanshu Khande").toUpperCase();
    const uRole = (user?.role || "Main Admin / Business Analyst").toUpperCase();

    const t1 = setTimeout(() => {
      setTerminalLog((prev) => [...prev, `IDENTITY CONFIRMED: ${uName}`]);
      setProgress(55);
    }, 500);

    const t2 = setTimeout(() => {
      setTerminalLog((prev) => [...prev, `SECURITY CLEARANCE: ${uRole}`]);
      setProgress(85);
    }, 900);

    const t3 = setTimeout(() => {
      setPhase("branding"); // Show the dynamic developer branding card
      setProgress(100);
    }, 1300);

    const t4 = setTimeout(() => {
      setPhase("exit");
    }, 3800);

    const t5 = setTimeout(() => {
      if (onEnter) onEnter();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Canvas 60fps particle and 3D perspective cyber-grid animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate 75 autonomous particles
    const particleCount = 75;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        size: Math.random() * 2.5 + 1.2,
        color: Math.random() > 0.4 ? "#ff334b" : Math.random() > 0.5 ? "#ffffff" : "#38bdf8",
      });
    }

    let radarAngle = 0;
    let gridOffset = 0;

    const render = () => {
      ctx.fillStyle = "rgba(7, 8, 12, 0.3)";
      ctx.fillRect(0, 0, w, h);

      // --- 1. 3D Perspective Cyber-Grid on the floor ---
      const horizonY = h * 0.55;
      const fov = 300;
      gridOffset = (gridOffset + 1.2) % 36;

      ctx.save();
      ctx.strokeStyle = "rgba(255, 51, 75, 0.15)";
      ctx.lineWidth = 1;

      // Perspective vertical rays emanating from vanishing point
      const vanishingX = w / 2;
      for (let x = -w; x <= w * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Moving horizontal lines accelerating downward
      for (let z = 10; z < 500; z += 30) {
        const adjustedZ = (z + gridOffset) % 500;
        const lineY = horizonY + (fov * (h - horizonY)) / (adjustedZ + fov);
        const alpha = Math.min(1, (lineY - horizonY) / (h - horizonY)) * 0.28;
        ctx.strokeStyle = `rgba(255, 51, 75, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }
      ctx.restore();

      // --- 2. Sweeping Radar Beam ---
      radarAngle += 0.035;
      const radarRadius = Math.min(w, h) * 0.38;
      ctx.save();
      const sweepGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, radarRadius);
      sweepGrad.addColorStop(0, "rgba(255, 51, 75, 0.15)");
      sweepGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.arc(w / 2, h / 2, radarRadius, radarAngle, radarAngle + 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // --- 3. Dynamic Interactive Particle Constellation ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect proximity lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.28;
            ctx.strokeStyle = p.color === "#ffffff" ? `rgba(255, 255, 255, ${alpha})` : `rgba(255, 51, 75, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#06070a",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* 60FPS Interactive Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />

      {/* Skip Button in Top Right */}
      <button
        onClick={onEnter}
        className="btn-ghost-dark"
        style={{
          position: "absolute",
          top: 24,
          right: 28,
          zIndex: 50,
          padding: "8px 16px",
          fontSize: 12.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          backdropFilter: "blur(10px)",
        }}
      >
        Skip Sequence <ArrowRight size={14} />
      </button>

      {/* Main Animated Sequence Stage */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          textAlign: "center",
          maxWidth: 680,
          padding: 24,
          width: "100%",
        }}
      >
        {/* Phase 0 & 1: Scanning HUD & Terminal */}
        {phase === "scan" && (
          <div className="modal-enter">
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 18,
                background: "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 0 40px rgba(255, 51, 75, 0.8)",
                margin: "0 auto 20px",
              }}
            >
              <Cpu size={36} />
            </div>

            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "1px",
                marginBottom: 12,
              }}
            >
              INITIALIZING COMMAND CORE
            </div>

            {/* Terminal Telemetry Feed */}
            <div
              className="glass-card"
              style={{
                padding: "16px 20px",
                background: "rgba(10, 13, 20, 0.85)",
                border: "1px solid rgba(255, 51, 75, 0.3)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                textAlign: "left",
                color: "#4ade80",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxWidth: 480,
                margin: "0 auto 20px",
              }}
            >
              {terminalLog.map((log, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#ff334b" }}>▶</span> {log}
                </div>
              ))}
            </div>

            {/* Percentage Bar */}
            <div style={{ maxWidth: 360, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
                <span>Core Telemetry Buffer</span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ width: "100%", height: 5, background: "rgba(255, 255, 255, 0.1)", borderRadius: 10, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #ff334b, #ffffff)",
                    boxShadow: "0 0 12px rgba(255, 51, 75, 0.9)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase 1 & 2: Holographic Developer Branding Reveal ("Comes and Goes") */}
        {(phase === "branding" || phase === "exit") && (
          <div className="branding-animation-card">
            {/* Holographic Glowing Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 20,
                background: "rgba(255, 51, 75, 0.15)",
                border: "1px solid rgba(255, 51, 75, 0.45)",
                boxShadow: "0 0 20px rgba(255, 51, 75, 0.35)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              <Sparkles size={14} color="#ff334b" /> SYSTEM ARCHITECT & MASTER LEAD
            </div>

            {/* Massive Glowing Title */}
            <h1
              className="holographic-text"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "1.5px",
                margin: "0 0 10px 0",
                textTransform: "uppercase",
                filter: "drop-shadow(0 0 25px rgba(255, 51, 75, 0.7))",
              }}
            >
              DEVELOPED BY SUDHANSHU KHANDE
            </h1>

            {/* Sub-banner with dynamic role and project name */}
            <div
              style={{
                fontSize: 16,
                color: "#f8fafc",
                fontWeight: 600,
                letterSpacing: "0.8px",
                marginBottom: 24,
              }}
            >
              Main Admin / Business Analyst · <span style={{ color: "#ff6479" }}>ZPBDMS Management Tool</span>
            </div>

            {/* Equalizer Audio / Data Pulsing Bars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                height: 36,
                marginBottom: 24,
              }}
            >
              <div className="eq-bar-1" style={{ width: 4, background: "#ff334b", borderRadius: 4 }} />
              <div className="eq-bar-2" style={{ width: 4, background: "#ffffff", borderRadius: 4 }} />
              <div className="eq-bar-3" style={{ width: 4, background: "#ff334b", borderRadius: 4 }} />
              <div className="eq-bar-1" style={{ width: 4, background: "#38bdf8", borderRadius: 4 }} />
              <div className="eq-bar-2" style={{ width: 4, background: "#ffffff", borderRadius: 4 }} />
              <div className="eq-bar-3" style={{ width: 4, background: "#ff334b", borderRadius: 4 }} />
              <div className="eq-bar-1" style={{ width: 4, background: "#ffffff", borderRadius: 4 }} />
            </div>

            {/* Welcome Personnel Card */}
            <div
              className="glass-card"
              style={{
                padding: "14px 22px",
                background: "rgba(15, 18, 28, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: user?.avatar || "#ff334b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {(user?.name || "S").charAt(0)}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#ffffff" }}>
                  Authorized: {user?.name || "Sudhanshu Khande"}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.role || "Main Admin / Business Analyst"}</div>
              </div>
              <span
                style={{
                  marginLeft: 12,
                  padding: "3px 10px",
                  borderRadius: 12,
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#4ade80",
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }}
              >
                ONLINE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Main App Component ---------------------------- */

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("zpbdms_auth_user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Validate that saved session belongs to a valid team member
      const match = TEAM_ROSTER.find(
        (u) =>
          (parsed.username && u.username.toLowerCase() === parsed.username.toLowerCase()) ||
          (parsed.name && u.name.toLowerCase() === parsed.name.toLowerCase())
      );
      return match || null;
    } catch (e) {
      return null;
    }
  });

  const [showLanding, setShowLanding] = useState(false);
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [tab, setTab] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [qaModule, setQaModule] = useState("All Modules");
  const [qaTestStatus, setQaTestStatus] = useState("All Test Statuses");
  const [qaDevStatus, setQaDevStatus] = useState("All Dev Statuses");
  const [qaSearch, setQaSearch] = useState("");
  const saveTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    let hasAutoMigratedDistricts = false;
    const unsub = onSnapshot(
      DOC_REF(),
      (snap) => {
        if (!mounted) return;
        setConnected(true);
        if (snap.exists()) {
          const fetched = snap.data() || {};
          const existingDistricts = Array.isArray(fetched.districts) ? fetched.districts : [];
          const fullDistricts = mergeDistrictsWithDefaults(existingDistricts);

          const hasOldDistrictName = existingDistricts.some(
            (d) => d && d.name && (d.name.toLowerCase() === "ahmednagar" || d.name.toLowerCase() === "aurangabad" || d.name.toLowerCase() === "osmanabad")
          );

          // Auto-migrate Firestore if fewer districts are stored than full 34 ZP list or if renaming is needed
          if (!hasAutoMigratedDistricts && (existingDistricts.length < fullDistricts.length || hasOldDistrictName)) {
            hasAutoMigratedDistricts = true;
            setDoc(DOC_REF(), { districts: fullDistricts }, { merge: true }).catch((err) =>
              console.warn("Auto-sync districts to Firestore error:", err)
            );
          }

          const rawIssues = Array.isArray(fetched.issues) ? fetched.issues : [];
          const normalizedIssues = rawIssues.map((i) =>
            i && i.district && i.district.toLowerCase() === "ahmednagar"
              ? { ...i, district: "Ahilyanagar" }
              : i
          );

          setData({
            issues: normalizedIssues,
            tasks: Array.isArray(fetched.tasks) ? fetched.tasks : [],
            districts: fullDistricts,
            notifications: Array.isArray(fetched.notifications) ? fetched.notifications : [],
            testPoints:
              Array.isArray(fetched.testPoints) && fetched.testPoints.length > 0
                ? fetched.testPoints
                : seedTestPoints(),
          });
        } else {
          const seed = seedData();
          setDoc(DOC_REF(), seed);
          setData(seed);
        }
      },
      (err) => {
        console.error("Firestore sync notice, using local offline state:", err);
        if (mounted) {
          setConnected(true);
          setData((prev) => prev || seedData());
        }
      }
    );

    // Timeout safety: if Firestore takes longer than 2.0s, fall back immediately to seedData so page is never blocked
    const fallbackTimer = setTimeout(() => {
      if (mounted) {
        setData((prev) => {
          if (!prev) {
            console.warn("Firestore connection slow, loaded seed fallback for immediate responsiveness.");
            setConnected(true);
            return seedData();
          }
          return prev;
        });
      }
    }, 2000);

    return () => {
      mounted = false;
      unsub();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem("zpbdms_auth_user", JSON.stringify(user));
    setCurrentUser(user);
    setShowLanding(true); // Trigger graphical landing animation!
    setTab("my_desk");
  };

  const handleLogout = () => {
    localStorage.removeItem("zpbdms_auth_user");
    setCurrentUser(null);
    setShowLanding(false);
  };

  const persist = useCallback((next) => {
    setData(next);
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await setDoc(DOC_REF(), next);
        setSaveState("saved");
      } catch (e) {
        console.error(e);
        setSaveState("idle");
      }
      setTimeout(() => setSaveState("idle"), 1800);
    }, 400);
  }, []);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (connected === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07080c",
          padding: 24,
        }}
      >
        <div className="glass-card-accent" style={{ maxWidth: 480, padding: 32, textAlign: "center" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "rgba(255, 51, 75, 0.15)",
              border: "1px solid rgba(255, 51, 75, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#ff334b",
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", color: "#ffffff", margin: "0 0 8px 0" }}>
            Database Disconnected
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 20px 0" }}>
            Unable to connect to Cloud Firestore. Verify your credentials in{" "}
            <code style={{ color: "#ff6479" }}>src/firebase.js</code>.
          </p>
          <button className="btn-red-gradient" onClick={() => window.location.reload()} style={{ padding: "10px 24px" }}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!connected || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090d",
          gap: 16,
        }}
      >
        <div className="ambient-bg">
          <div className="cyber-grid" />
        </div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)",
              boxShadow: "0 0 30px rgba(255, 51, 75, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              margin: "0 auto 18px",
            }}
          >
            <Sparkles size={24} />
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "1px",
            }}
          >
            MANAGEMENT COMMAND CENTER
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="pulse-radar-red" />
            Initializing live secure session for {currentUser?.name || "User"}...
          </div>
        </div>
      </div>
    );
  }

  const districtNames = (data?.districts || []).map((d) => d.name);

  // Notification helper
  const notifyAssignee = (targetAssignee, title, message, type, refId) => {
    if (!targetAssignee || targetAssignee === currentUser?.name) return [];
    return [
      {
        id: uid(),
        recipient: targetAssignee,
        sender: currentUser?.name || "System",
        title,
        message,
        type,
        refId,
        createdAt: formatTimeNow(),
        read: false,
      },
    ];
  };

  function addOrUpdate(list, item, editingId) {
    if (editingId) return list.map((x) => (x.id === editingId ? { ...x, ...item } : x));
    return [{ id: uid(), createdAt: todayISO(), ...item }, ...list];
  }

  const saveIssue = (item) => {
    const isNew = !modal?.editing?.id;
    const targetId = modal?.editing?.id || uid();
    const updatedIssues = addOrUpdate(data?.issues || [], item, modal?.editing?.id);

    const newNotifications = [
      ...notifyAssignee(
        item.assignee,
        isNew ? "New Issue Assignment" : "Issue Reassigned",
        item.title,
        "issue",
        targetId
      ),
      ...(data.notifications || []),
    ];

    persist({ ...data, issues: updatedIssues, notifications: newNotifications });
    setModal(null);
  };

  const saveTask = (item) => {
    const isNew = !modal?.editing?.id;
    const targetId = modal?.editing?.id || uid();
    const updatedTasks = addOrUpdate(data?.tasks || [], item, modal?.editing?.id);

    const newNotifications = [
      ...notifyAssignee(
        item.assignee,
        isNew ? "New Directive Assigned" : "Directive Updated",
        item.title,
        "task",
        targetId
      ),
      ...(data.notifications || []),
    ];

    persist({ ...data, tasks: updatedTasks, notifications: newNotifications });
    setModal(null);
  };

  const saveDistrict = (item) => {
    persist({ ...data, districts: addOrUpdate(data?.districts || [], item, modal?.editing?.id) });
    setModal(null);
  };

  const saveTestPoint = (item) => {
    persist({ ...data, testPoints: addOrUpdate(data?.testPoints || [], item, modal?.editing?.id) });
    setModal(null);
  };

  const removeIssue = (id) => persist({ ...data, issues: (data?.issues || []).filter((x) => x.id !== id) });
  const removeTask = (id) => persist({ ...data, tasks: (data?.tasks || []).filter((x) => x.id !== id) });
  const removeDistrict = (id) => persist({ ...data, districts: (data?.districts || []).filter((x) => x.id !== id) });
  const removeTestPoint = (id) => persist({ ...data, testPoints: (data?.testPoints || []).filter((t) => t.id !== id) });

  const cycleIssueStatus = (item) => {
    const next = ISSUE_STATUSES[(ISSUE_STATUSES.indexOf(item.status) + 1) % ISSUE_STATUSES.length];
    persist({ ...data, issues: (data?.issues || []).map((x) => (x.id === item.id ? { ...x, status: next } : x)) });
  };
  const cycleTaskStatus = (item) => {
    const next = TASK_STATUSES[(TASK_STATUSES.indexOf(item.status) + 1) % TASK_STATUSES.length];
    persist({ ...data, tasks: (data?.tasks || []).map((x) => (x.id === item.id ? { ...x, status: next } : x)) });
  };

  const cycleTestPointStatus = (tp) => {
    const next = TEST_STATUSES[(TEST_STATUSES.indexOf(tp.status) + 1) % TEST_STATUSES.length];
    persist({
      ...data,
      testPoints: (data?.testPoints || []).map((t) => (t.id === tp.id ? { ...t, status: next, updatedAt: todayISO() } : t)),
    });
  };

  const resolveTestPoint = (id, resolution) => {
    const target = (data?.testPoints || []).find((t) => t.id === id);
    const updatedPoints = (data?.testPoints || []).map((t) =>
      t.id === id ? { ...t, ...resolution, updatedAt: todayISO() } : t
    );
    const testerName = target?.tester || "Rutuja";
    const newNotifications = [
      ...notifyAssignee(
        testerName,
        `QA Point Resolved: ${target?.code || "Test Point"}`,
        `${currentUser.name} marked "${resolution.devStatus}": ${resolution.devRemark || "No remark provided."}`,
        "test_point",
        id
      ),
      ...(data.notifications || []),
    ];
    persist({ ...data, testPoints: updatedPoints, notifications: newNotifications });
    setModal(null);
  };

  const dispatchTestPointToIssue = (tp) => {
    setModal({
      type: "issue",
      editing: {
        title: `[QA Defect - ${tp.code}] ${tp.scenario}`,
        module: tp.module,
        priority: tp.severity === "Blocker" || tp.severity === "Critical" ? "Critical" : "High",
        status: "Open",
        district: DISTRICTS_DEFAULT[0],
        assignee: tp.assignedDev || TEAM_ROSTER[1].name,
        notes: `Expected: ${tp.expectedResult}\nActual: ${tp.actualResult}\nDeveloper Remark: ${tp.devRemark || "None"}`,
      },
    });
  };

  // Notification actions
  const myNotifications = (data?.notifications || []).filter((n) => n.recipient === currentUser?.name);
  const unreadNotifications = myNotifications.filter((n) => !n.read);

  const markAllNotificationsRead = () => {
    const updated = (data?.notifications || []).map((n) =>
      n.recipient === currentUser?.name ? { ...n, read: true } : n
    );
    persist({ ...data, notifications: updated });
  };

  const markNotificationRead = (id) => {
    const updated = (data?.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n));
    persist({ ...data, notifications: updated });
  };

  const clearMyNotifications = () => {
    const updated = (data?.notifications || []).filter((n) => n.recipient !== currentUser?.name);
    persist({ ...data, notifications: updated });
  };

  const q = query.trim().toLowerCase();
  const filteredIssues = (data?.issues || []).filter(
    (i) => !q || [i.title, i.module, i.district, i.assignee].join(" ").toLowerCase().includes(q)
  );
  const filteredTasks = (data?.tasks || []).filter(
    (t) => !q || [t.title, t.module, t.assignee].join(" ").toLowerCase().includes(q)
  );
  const filteredDistricts = (data?.districts || []).filter(
    (d) => !q || [d.name, d.stage, d.notes].join(" ").toLowerCase().includes(q)
  );

  // QA Spreadsheet filtering
  const allTestPoints = data?.testPoints || [];
  const failedTestPointsCount = allTestPoints.filter((t) => t.status === "Failed").length;
  const filteredTestPoints = allTestPoints.filter((tp) => {
    if (qaModule !== "All Modules" && tp.module !== qaModule) return false;
    if (qaTestStatus !== "All Test Statuses" && tp.status !== qaTestStatus) return false;
    if (qaDevStatus !== "All Dev Statuses" && tp.devStatus !== qaDevStatus) return false;
    if (qaSearch.trim()) {
      const sq = qaSearch.trim().toLowerCase();
      const haystack = [
        tp.code,
        tp.module,
        tp.scenario,
        tp.expectedResult,
        tp.actualResult,
        tp.devRemark,
        tp.tester,
        tp.assignedDev,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(sq)) return false;
    }
    return true;
  });

  // My Personal Desk filtering
  const myIssues = (data?.issues || []).filter((i) => i.assignee === currentUser?.name);
  const myOpenIssues = myIssues.filter((i) => i.status !== "Resolved").length;
  const myCriticalIssues = myIssues.filter((i) => i.status !== "Resolved" && i.priority === "Critical").length;
  const myTasks = (data?.tasks || []).filter((t) => t.assignee === currentUser?.name);
  const myPendingTasks = myTasks.filter((t) => t.status !== "Done").length;

  const openIssues = (data?.issues || []).filter((i) => i.status !== "Resolved").length;
  const criticalOpen = (data?.issues || []).filter((i) => i.status !== "Resolved" && i.priority === "Critical").length;
  const pendingTasks = (data?.tasks || []).filter((t) => t.status !== "Done").length;
  const liveDistrictsCount = (data?.districts || []).filter((d) => d.stage === "Live").length;

  const navItems = [
    { key: "my_desk", label: "My Desk & Tasks", icon: UserCheck, count: myOpenIssues + myPendingTasks, highlight: true },
    { key: "test_hub", label: "QA Test Matrix", icon: FileSpreadsheet, count: failedTestPointsCount, isAlert: failedTestPointsCount > 0 },
    { key: "dashboard", label: "Operations Deck", icon: LayoutGrid },
    { key: "issues", label: "Issues Matrix", icon: AlertTriangle, count: openIssues, isAlert: criticalOpen > 0 },
    { key: "tasks", label: "Task Directives", icon: ListChecks, count: pendingTasks },
    { key: "districts", label: "District Deployments", icon: MapPin, count: (data?.districts || []).length },
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        background: "#08090d",
        color: "#f1f5f9",
        overflowX: "hidden",
      }}
    >
      {/* Dynamic Cybernetic Canvas Landing Screen Animation */}
      {showLanding && currentUser && <DynamicCyberLanding user={currentUser} onEnter={() => setShowLanding(false)} />}

      {/* Visual Ambient Atmosphere */}
      <div className="ambient-bg">
        <div className="cyber-grid" />
      </div>

      {/* Futuristic Command Sidebar */}
      <aside
        style={{
          width: 250,
          flexShrink: 0,
          background: "linear-gradient(180deg, rgba(13, 16, 26, 0.95) 0%, rgba(8, 10, 17, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Brand Banner */}
        <div style={{ marginBottom: 24, padding: "0 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(255, 51, 75, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
                color: "#ffffff",
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#ffffff",
                  letterSpacing: "0.5px",
                  lineHeight: 1.1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ZPBDMS
                <span
                  style={{
                    background: "rgba(255, 51, 75, 0.2)",
                    border: "1px solid rgba(255, 51, 75, 0.4)",
                    color: "#ff334b",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: 4,
                  }}
                >
                  v2.0
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.4px", marginTop: 2 }}>
                MANAGEMENT SYSTEM
              </div>
            </div>
          </div>
        </div>

        {/* Current Logged In Profile Badge */}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: currentUser?.avatar || "#ff334b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                boxShadow: `0 0 10px ${currentUser?.avatar || "#ff334b"}66`,
              }}
            >
              {(currentUser?.name || "U").charAt(0)}
            </div>
            <div style={{ maxWidth: 135 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentUser?.name || "User"}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentUser?.role || "Authorized Access"}
              </div>
            </div>
          </div>
          <IconButton onClick={handleLogout} title="Sign Out">
            <LogOut size={14} />
          </IconButton>
        </div>

        {/* Navigation Items */}
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "1px",
            padding: "0 10px 8px",
          }}
        >
          Control Navigation
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ key, label, icon: Icon, count, isAlert, highlight }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  border: active
                    ? "1px solid rgba(255, 51, 75, 0.35)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  background: active
                    ? "linear-gradient(90deg, rgba(255, 51, 75, 0.16) 0%, rgba(255, 51, 75, 0.04) 100%)"
                    : "transparent",
                  color: active ? "#ffffff" : highlight ? "#cbd5e1" : "#94a3b8",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  transition: "all 0.18s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#f8fafc";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = highlight ? "#cbd5e1" : "#94a3b8";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: "0 4px 4px 0",
                      background: "#ff334b",
                      boxShadow: "0 0 10px #ff334b",
                    }}
                  />
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon
                    size={16}
                    color={active ? "#ff334b" : highlight ? "#ff6479" : "currentColor"}
                    style={{
                      filter: active ? "drop-shadow(0 0 6px rgba(255, 51, 75, 0.5))" : "none",
                    }}
                  />
                  {label}
                </span>

                {typeof count === "number" && count > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: isAlert
                        ? "#ff334b"
                        : highlight
                        ? "rgba(255, 51, 75, 0.25)"
                        : active
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(255, 255, 255, 0.08)",
                      color: "#ffffff",
                      borderRadius: 12,
                      padding: "1px 7px",
                      border: highlight ? "1px solid rgba(255, 51, 75, 0.4)" : "none",
                      boxShadow: isAlert ? "0 0 10px rgba(255, 51, 75, 0.6)" : "none",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live System Diagnostics Box */}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <div
            className="glass-card"
            style={{
              padding: 12,
              border: criticalOpen > 0 ? "1px solid rgba(255, 51, 75, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              background: criticalOpen > 0 ? "rgba(255, 51, 75, 0.07)" : "rgba(18, 22, 34, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.8px" }}>
                System Telemetry
              </span>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: criticalOpen > 0 ? "#ff334b" : "#22c55e",
                  boxShadow: criticalOpen > 0 ? "0 0 8px #ff334b" : "0 0 8px #22c55e",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5 }}>
              <span style={{ color: "#94a3b8" }}>Health Status</span>
              <span style={{ color: criticalOpen > 0 ? "#ff6479" : "#4ade80", fontWeight: 600 }}>
                {criticalOpen > 0 ? "Defects Pending" : "Operational Normal"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, marginTop: 4 }}>
              <span style={{ color: "#94a3b8" }}>Active Directives</span>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>{pendingTasks} sprint items</span>
            </div>

            {failedTestPointsCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, marginTop: 4 }}>
                <span style={{ color: "#ff6479" }}>QA Defects</span>
                <span style={{ color: "#ff334b", fontWeight: 700 }}>{failedTestPointsCount} failed</span>
              </div>
            )}

            {/* Rollout Progress Indicator */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>
                <span>Rollout Live</span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>
                  {liveDistrictsCount}/{(data?.districts || []).length}
                </span>
              </div>
              <div style={{ width: "100%", height: 4, background: "rgba(255, 255, 255, 0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(data?.districts || []).length ? (liveDistrictsCount / (data?.districts || []).length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #ff334b, #22c55e)",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Developer Badge */}
          <div
            className="developer-badge"
            style={{
              padding: "9px 10px",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700 }}>
              System Architect
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>
              Developed by <span style={{ color: "#ff334b" }}>Sudhanshu Khande</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Command Operations Viewport */}
      <main
        style={{
          flex: 1,
          padding: "26px 36px",
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Top Control Bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 26,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.5px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {navItems.find((n) => n.key === tab)?.label}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#94a3b8" }}>
              {tab === "my_desk"
                ? `Assigned directives and active defects for ${currentUser?.name || "User"}`
                : tab === "test_hub"
                ? "Unified QA Test Matrix, Google Sheet sync, and developer defect resolution log"
                : "District rollouts, live defect tracking, and sprint task register"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Developer Credit Top Badge */}
            <div
              className="developer-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 11.5,
                color: "#cbd5e1",
              }}
            >
              <Sparkles size={12} color="#ff334b" />
              <span>Developed by <strong style={{ color: "#ffffff" }}>Sudhanshu Khande</strong></span>
            </div>

            {/* Live Firestore Sync State Indicator */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: 20,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
              }}
            >
              <Database size={13} color={saveState === "saving" ? "#f59e0b" : "#ff334b"} />
              {saveState === "saving" && <span style={{ color: "#fbbf24" }}>Syncing to Cloud…</span>}
              {saveState === "saved" && <span style={{ color: "#4ade80" }}>Live Database Synced</span>}
              {saveState === "idle" && <span>Real-time Connected</span>}
            </div>

            {/* In-App Notifications Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: unreadNotifications.length > 0 ? "rgba(255, 51, 75, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  color: unreadNotifications.length > 0 ? "#ff334b" : "#94a3b8",
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  position: "relative",
                  transition: "all 0.15s ease",
                }}
              >
                <Bell size={16} />
                {unreadNotifications.length > 0 && (
                  <span
                    style={{
                      background: "#ff334b",
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: "10px",
                      padding: "1px 6px",
                      boxShadow: "0 0 10px rgba(255, 51, 75, 0.8)",
                    }}
                  >
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div
                  className="glass-card dropdown-enter"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "120%",
                    width: 360,
                    zIndex: 100,
                    padding: 16,
                    borderTop: "2px solid #ff334b",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 51, 75, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff", display: "flex", alignItems: "center", gap: 6 }}>
                      <Bell size={14} color="#ff334b" /> Notifications ({myNotifications.length})
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ff6479",
                            fontSize: 11,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                      {myNotifications.length > 0 && (
                        <button
                          onClick={clearMyNotifications}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                    {myNotifications.length === 0 ? (
                      <div style={{ padding: "24px 0", textAlign: "center", color: "#64748b", fontSize: 12.5 }}>
                        No assignments or alerts for you yet.
                      </div>
                    ) : (
                      myNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.type === "issue" || n.type === "task") setTab("my_desk");
                            setShowNotifications(false);
                          }}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: n.read ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 51, 75, 0.08)",
                            border: n.read
                              ? "1px solid rgba(255, 255, 255, 0.05)"
                              : "1px solid rgba(255, 51, 75, 0.3)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: n.read ? "#cbd5e1" : "#ffffff" }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{n.createdAt}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                            {n.sender && <strong style={{ color: "#ff6479" }}>{n.sender}: </strong>}
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search */}
            {tab !== "dashboard" && tab !== "my_desk" && tab !== "test_hub" && (
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter records..."
                  style={{
                    ...darkInputStyle,
                    width: 200,
                    padding: "8px 12px 8px 32px",
                    fontSize: 12.5,
                    borderRadius: 20,
                    background: "rgba(18, 22, 34, 0.7)",
                  }}
                />
              </div>
            )}

            {/* View Actions */}
            {tab === "test_hub" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="btn-red-gradient"
                  onClick={() => setModal({ type: "test_point" })}
                  style={{ padding: "8px 16px" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <Plus size={15} /> Add Test Point
                  </span>
                </button>
                <button
                  className="btn-ghost-dark"
                  onClick={() => exportTestPointsCSV(allTestPoints)}
                  style={{ padding: "8px 16px" }}
                  title="Export QA Matrix to CSV spreadsheet"
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <Download size={14} /> Export CSV
                  </span>
                </button>
              </div>
            ) : tab === "districts" ? (
              <button
                className="btn-red-gradient"
                onClick={() => setModal({ type: "district" })}
                style={{ padding: "8px 16px" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Plus size={15} /> Add District
                </span>
              </button>
            ) : (
              <>
                <button className="btn-red-gradient" onClick={() => setModal({ type: "issue" })} style={{ padding: "8px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <Plus size={15} /> Log Issue
                  </span>
                </button>
                <button className="btn-ghost-dark" onClick={() => setModal({ type: "task" })} style={{ padding: "8px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <Plus size={15} /> Create Task
                  </span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* View Switches */}
        {tab === "my_desk" && (
          <MyDeskView
            currentUser={currentUser}
            issues={myIssues}
            tasks={myTasks}
            onCycleIssue={cycleIssueStatus}
            onCycleTask={cycleTaskStatus}
            onEditIssue={(i) => setModal({ type: "issue", editing: i })}
            onEditTask={(t) => setModal({ type: "task", editing: t })}
            onDeleteIssue={removeIssue}
            onDeleteTask={removeTask}
            onOpenIssueModal={() => setModal({ type: "issue" })}
            onOpenTaskModal={() => setModal({ type: "task" })}
          />
        )}

        {tab === "dashboard" && (
          <Dashboard
            data={data}
            openIssues={openIssues}
            criticalOpen={criticalOpen}
            pendingTasks={pendingTasks}
            liveDistrictsCount={liveDistrictsCount}
            onGo={setTab}
            onOpenModal={setModal}
          />
        )}

        {tab === "issues" && (
          <IssueTable
            issues={filteredIssues}
            onCycle={cycleIssueStatus}
            onEdit={(i) => setModal({ type: "issue", editing: i })}
            onDelete={removeIssue}
          />
        )}

        {tab === "tasks" && (
          <TaskTable
            tasks={filteredTasks}
            onCycle={cycleTaskStatus}
            onEdit={(t) => setModal({ type: "task", editing: t })}
            onDelete={removeTask}
          />
        )}

        {tab === "districts" && (
          <DistrictTable
            districts={filteredDistricts}
            onEdit={(d) => setModal({ type: "district", editing: d })}
            onDelete={removeDistrict}
          />
        )}

        {tab === "test_hub" && (
          <TestHubView
            testPoints={filteredTestPoints}
            allTestPoints={allTestPoints}
            onCycleStatus={cycleTestPointStatus}
            onOpenResolve={(tp) => setModal({ type: "dev_resolve", editing: tp })}
            onOpenEdit={(tp) => setModal({ type: "test_point", editing: tp })}
            onDelete={removeTestPoint}
            onDispatchIssue={dispatchTestPointToIssue}
            onOpenAdd={() => setModal({ type: "test_point" })}
            onExportCSV={() => exportTestPointsCSV(allTestPoints)}
            selectedModule={qaModule}
            setSelectedModule={setQaModule}
            selectedTestStatus={qaTestStatus}
            setSelectedTestStatus={setQaTestStatus}
            selectedDevStatus={qaDevStatus}
            setSelectedDevStatus={setQaDevStatus}
            searchQuery={qaSearch}
            setSearchQuery={setQaSearch}
          />
        )}
      </main>

      {/* Modern High-Graphic Modals */}
      {modal?.type === "issue" && (
        <Modal
          title={modal.editing ? "Update Issue Record" : "Log New Incident"}
          icon={AlertTriangle}
          onClose={() => setModal(null)}
        >
          <IssueForm
            initial={modal.editing}
            districts={districtNames}
            onSave={saveIssue}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.type === "task" && (
        <Modal
          title={modal.editing ? "Update Directive" : "New Task Directive"}
          icon={ListChecks}
          onClose={() => setModal(null)}
        >
          <TaskForm initial={modal.editing} onSave={saveTask} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === "district" && (
        <Modal
          title={modal.editing ? "Edit Jurisdiction" : "Register District Deployment"}
          icon={MapPin}
          onClose={() => setModal(null)}
        >
          <DistrictForm initial={modal.editing} onSave={saveDistrict} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === "test_point" && (
        <Modal
          title={modal.editing ? "Edit QA Test Point" : "Add QA Test Point"}
          icon={FlaskConical}
          onClose={() => setModal(null)}
        >
          <TestPointForm
            initial={modal.editing}
            onSave={saveTestPoint}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.type === "dev_resolve" && (
        <Modal
          title={`Developer Resolution: ${modal.editing?.code || "Test Point"}`}
          icon={Code2}
          onClose={() => setModal(null)}
        >
          <DevResolveForm
            initial={modal.editing}
            onSave={(resolution) => resolveTestPoint(modal.editing.id, resolution)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------- Personalized "My Desk" View ---------------------------- */

function MyDeskView({
  currentUser,
  issues,
  tasks,
  onCycleIssue,
  onCycleTask,
  onEditIssue,
  onEditTask,
  onDeleteIssue,
  onDeleteTask,
  onOpenIssueModal,
  onOpenTaskModal,
}) {
  const safeIssues = issues || [];
  const safeTasks = tasks || [];
  const openIssues = safeIssues.filter((i) => i.status !== "Resolved").length;
  const criticalOpen = safeIssues.filter((i) => i.status !== "Resolved" && i.priority === "Critical").length;
  const pendingTasks = safeTasks.filter((t) => t.status !== "Done").length;

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div
        className="glass-card-accent"
        style={{
          padding: "22px 26px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: currentUser?.avatar || "#ff334b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 18,
              boxShadow: `0 0 20px ${currentUser?.avatar || "#ff334b"}88`,
            }}
          >
            {(currentUser?.name || "U").charAt(0)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "#ffffff" }}>
                Welcome back, {currentUser?.name || "User"}
              </div>
              <span
                style={{
                  background: "rgba(255, 51, 75, 0.2)",
                  border: "1px solid rgba(255, 51, 75, 0.4)",
                  color: "#ff334b",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: 12,
                }}
              >
                {currentUser?.role || "Authorized Access"}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 3 }}>
              Here are the active incidents and directives specifically assigned to your docket.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-red-gradient" onClick={onOpenIssueModal} style={{ fontSize: 12.5, padding: "7px 14px" }}>
            + Assign Issue
          </button>
          <button className="btn-ghost-dark" onClick={onOpenTaskModal} style={{ fontSize: 12.5, padding: "7px 14px" }}>
            + Assign Task
          </button>
        </div>
      </div>

      {/* 3 Personal Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatMetricCard
          title="My Open Issues"
          value={openIssues}
          subtitle={`${safeIssues.filter((i) => i.status === "In Progress").length} currently in progress`}
          icon={AlertTriangle}
          tone={criticalOpen > 0 ? "warn" : "default"}
        />
        <StatMetricCard
          title="My Critical Alerts"
          value={criticalOpen}
          subtitle={criticalOpen > 0 ? "Requires urgent attention" : "All clean, no blockers"}
          icon={ShieldAlert}
          tone={criticalOpen > 0 ? "warn" : "default"}
        />
        <StatMetricCard
          title="My Pending Tasks"
          value={pendingTasks}
          subtitle={`${safeTasks.filter((t) => t.status === "Done").length} completed directives`}
          icon={ListChecks}
        />
      </div>

      {/* Assigned Issues Section */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={17} color="#ff334b" /> Incidents Assigned to You ({safeIssues.length})
          </div>
        </div>
        <IssueTable
          issues={safeIssues}
          onCycle={onCycleIssue}
          onEdit={onEditIssue}
          onDelete={onDeleteIssue}
        />
      </div>

      {/* Assigned Tasks Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <ListChecks size={17} color="#38bdf8" /> Directives & Tasks Assigned to You ({safeTasks.length})
          </div>
        </div>
        <TaskTable
          tasks={safeTasks}
          onCycle={onCycleTask}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      </div>
    </div>
  );
}

/* ---------------------------- Overview / Dashboard ---------------------------- */

function StatMetricCard({ title, value, subtitle, icon: Icon, tone = "default", onClick }) {
  const isRed = tone === "warn";
  const isGreen = tone === "success";

  return (
    <div
      className={isRed ? "glass-card-accent" : "glass-card"}
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 200,
        padding: "20px 22px",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: isRed
              ? "rgba(255, 51, 75, 0.2)"
              : isGreen
              ? "rgba(34, 197, 94, 0.15)"
              : "rgba(255, 255, 255, 0.07)",
            border: isRed
              ? "1px solid rgba(255, 51, 75, 0.4)"
              : isGreen
              ? "1px solid rgba(34, 197, 94, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isRed ? "#ff334b" : isGreen ? "#4ade80" : "#ffffff",
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 34,
          fontWeight: 800,
          color: isRed ? "#ff334b" : "#ffffff",
          letterSpacing: "-0.5px",
          lineHeight: 1,
          marginBottom: 6,
          textShadow: isRed ? "0 0 20px rgba(255, 51, 75, 0.4)" : "none",
        }}
      >
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, openIssues, criticalOpen, pendingTasks, liveDistrictsCount, onGo, onOpenModal }) {
  const recentIssues = [...(data?.issues || [])]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 6);

  const totalDistricts = (data?.districts || []).length || 1;
  const rolloutPercentage = Math.round((liveDistrictsCount / totalDistricts) * 100);

  return (
    <div>
      {/* 4 High-Graphic Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatMetricCard
          title="Open Issues"
          value={openIssues}
          subtitle={`${(data?.issues || []).filter((i) => i.status === "In Progress").length} currently in resolution`}
          icon={AlertTriangle}
          tone={criticalOpen > 0 ? "warn" : "default"}
          onClick={() => onGo("issues")}
        />
        <StatMetricCard
          title="Critical Alerts"
          value={criticalOpen}
          subtitle={criticalOpen > 0 ? "Requires emergency resolution" : "Operational zero blocker"}
          icon={ShieldAlert}
          tone={criticalOpen > 0 ? "warn" : "default"}
          onClick={() => onGo("issues")}
        />
        <StatMetricCard
          title="Active Directives"
          value={pendingTasks}
          subtitle={`${(data?.tasks || []).filter((t) => t.status === "Done").length} completed sprints`}
          icon={ListChecks}
          onClick={() => onGo("tasks")}
        />
        <StatMetricCard
          title="Rollout Deployment"
          value={`${rolloutPercentage}%`}
          subtitle={`${liveDistrictsCount} of ${(data?.districts || []).length} jurisdictions live`}
          icon={MapPin}
          tone={liveDistrictsCount === totalDistricts ? "success" : "default"}
          onClick={() => onGo("districts")}
        />
      </div>

      {/* Operational Grids */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Recent Incidents Stream */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
                Active Incident Stream
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Latest reported defects across modules</div>
            </div>
            <button
              className="btn-ghost-dark"
              style={{ fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}
              onClick={() => onGo("issues")}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentIssues.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                No active issues recorded in the system.
              </div>
            ) : (
              recentIssues.map((i) => (
                <div
                  key={i.id}
                  className="custom-table-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <PriorityBadge value={i.priority} />
                      <ModuleTag name={i.module} />
                      <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={11} /> {i.district}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#f8fafc",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {i.title}
                    </div>
                  </div>

                  <StatusChip value={i.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* District Deployment Radar */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
                District Rollout Status
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Jurisdiction implementation pipeline</div>
            </div>
            <button
              className="btn-ghost-dark"
              style={{ fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}
              onClick={() => onGo("districts")}
            >
              Details <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
            {(data?.districts || []).map((d) => (
              <div
                key={d.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 3 }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    {d.notes || "No pending blockers"}
                  </div>
                </div>
                <StatusChip value={d.stage} />
              </div>
            ))}
          </div>

          {/* Quick System Action */}
          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              borderRadius: 8,
              background: "rgba(255, 51, 75, 0.08)",
              border: "1px dashed rgba(255, 51, 75, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 12, color: "#f8fafc" }}>
              <strong style={{ color: "#ff334b" }}>Quick Dispatch:</strong> Need to report a new defect?
            </div>
            <button
              className="btn-red-gradient"
              style={{ fontSize: 11.5, padding: "5px 12px" }}
              onClick={() => onOpenModal({ type: "issue" })}
            >
              + Log Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Issue Table View ---------------------------- */

function IssueTable({ issues, onCycle, onEdit, onDelete }) {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 2.2fr 130px 120px 110px 130px 80px",
          padding: "12px 18px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          alignItems: "center",
        }}
      >
        <span>#</span>
        <span>Issue & Assignee</span>
        <span>Module</span>
        <span>District</span>
        <span>Priority</span>
        <span>Status (Click to toggle)</span>
        <span style={{ textAlign: "right" }}>Actions</span>
      </div>

      {issues.length === 0 ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748b", fontSize: 13.5 }}>
          No issues found matching your criteria.
        </div>
      ) : (
        issues.map((i, idx) => (
          <div
            key={i.id}
            className="custom-table-row"
            style={{
              display: "grid",
              gridTemplateColumns: "36px 2.2fr 130px 120px 110px 130px 80px",
              padding: "14px 18px",
              borderBottom: idx === issues.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748b", fontSize: 12 }}>
              {idx + 1}
            </span>

            <div style={{ paddingRight: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#ffffff" }}>{i.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 11.5, color: "#94a3b8" }}>
                {i.assignee ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <User size={12} color="#ff334b" /> {i.assignee}
                  </span>
                ) : (
                  <span style={{ color: "#64748b" }}>Unassigned</span>
                )}
                {i.notes && <span style={{ color: "#64748b" }}>• {i.notes}</span>}
              </div>
            </div>

            <div>
              <ModuleTag name={i.module} />
            </div>

            <div style={{ fontSize: 12.5, color: "#cbd5e1" }}>{i.district}</div>

            <div>
              <PriorityBadge value={i.priority} />
            </div>

            <div onClick={() => onCycle(i)} title="Click to advance status">
              <StatusChip value={i.status} interactive />
            </div>

            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <IconButton onClick={() => onEdit(i)} title="Edit Issue">
                <Pencil size={13} />
              </IconButton>
              <IconButton onClick={() => onDelete(i.id)} title="Delete Issue" variant="danger">
                <Trash2 size={13} />
              </IconButton>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------------------- Task Table View ---------------------------- */

function TaskTable({ tasks, onCycle, onEdit, onDelete }) {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 2.2fr 130px 160px 120px 130px 80px",
          padding: "12px 18px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          alignItems: "center",
        }}
      >
        <span>#</span>
        <span>Directive Objective</span>
        <span>Module</span>
        <span>Assigned Lead</span>
        <span>Due Date</span>
        <span>Status (Click to toggle)</span>
        <span style={{ textAlign: "right" }}>Actions</span>
      </div>

      {tasks.length === 0 ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748b", fontSize: 13.5 }}>
          No tasks recorded. Log directives using "Create Task".
        </div>
      ) : (
        tasks.map((t, idx) => (
          <div
            key={t.id}
            className="custom-table-row"
            style={{
              display: "grid",
              gridTemplateColumns: "36px 2.2fr 130px 160px 120px 130px 80px",
              padding: "14px 18px",
              borderBottom: idx === tasks.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748b", fontSize: 12 }}>
              {idx + 1}
            </span>

            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#ffffff", paddingRight: 16 }}>
              {t.title}
            </div>

            <div>
              <ModuleTag name={t.module} />
            </div>

            <div style={{ fontSize: 12.5, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 5 }}>
              {t.assignee ? (
                <>
                  <User size={12} color="#ff334b" /> {t.assignee}
                </>
              ) : (
                <span style={{ color: "#64748b" }}>—</span>
              )}
            </div>

            <div style={{ fontSize: 12.5, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 5 }}>
              {t.dueDate ? (
                <>
                  <Calendar size={12} color="#94a3b8" /> {t.dueDate}
                </>
              ) : (
                <span style={{ color: "#64748b" }}>—</span>
              )}
            </div>

            <div onClick={() => onCycle(t)} title="Click to advance status">
              <StatusChip value={t.status} interactive />
            </div>

            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <IconButton onClick={() => onEdit(t)} title="Edit Task">
                <Pencil size={13} />
              </IconButton>
              <IconButton onClick={() => onDelete(t.id)} title="Delete Task" variant="danger">
                <Trash2 size={13} />
              </IconButton>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------------------- District Table View ---------------------------- */

function DistrictTable({ districts, onEdit, onDelete }) {
  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 1.5fr 150px 2fr 80px",
          padding: "12px 18px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          alignItems: "center",
        }}
      >
        <span>#</span>
        <span>Jurisdiction / District</span>
        <span>Implementation Stage</span>
        <span>Operations Field Notes</span>
        <span style={{ textAlign: "right" }}>Actions</span>
      </div>

      {districts.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
          No districts found matching your criteria.
        </div>
      ) : (
        districts.map((d, idx) => (
          <div
            key={d.id}
            className="custom-table-row"
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1.5fr 150px 2fr 80px",
              padding: "14px 18px",
              borderBottom: idx === districts.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748b", fontSize: 12 }}>
              {idx + 1}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "rgba(255, 51, 75, 0.12)",
                  border: "1px solid rgba(255, 51, 75, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff334b",
                }}
              >
                <MapPin size={14} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{d.name}</span>
            </div>

            <div>
              <StatusChip value={d.stage} />
            </div>

            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{d.notes || "—"}</div>

            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <IconButton onClick={() => onEdit(d)} title="Edit District">
                <Pencil size={13} />
              </IconButton>
              <IconButton onClick={() => onDelete(d.id)} title="Delete District" variant="danger">
                <Trash2 size={13} />
              </IconButton>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------------------- QA Test Matrix & Spreadsheet Hub ---------------------------- */

function SeverityBadge({ value }) {
  const isBlocker = value === "Blocker";
  const isCritical = value === "Critical";

  const colorMap = {
    Blocker: {
      bg: "rgba(255, 51, 75, 0.25)",
      fg: "#ffffff",
      border: "rgba(255, 51, 75, 0.7)",
      glow: "0 0 14px rgba(255, 51, 75, 0.5)",
    },
    Critical: {
      bg: "rgba(255, 51, 75, 0.16)",
      fg: "#ff6479",
      border: "rgba(255, 51, 75, 0.45)",
      glow: "0 0 10px rgba(255, 51, 75, 0.3)",
    },
    Major: {
      bg: "rgba(249, 115, 22, 0.14)",
      fg: "#fb923c",
      border: "rgba(249, 115, 22, 0.35)",
      glow: "none",
    },
    Minor: {
      bg: "rgba(56, 189, 248, 0.14)",
      fg: "#38bdf8",
      border: "rgba(56, 189, 248, 0.3)",
      glow: "none",
    },
    Low: {
      bg: "rgba(148, 163, 184, 0.1)",
      fg: "#94a3b8",
      border: "rgba(148, 163, 184, 0.2)",
      glow: "none",
    },
  };

  const style = colorMap[value] || colorMap.Low;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: style.bg,
        color: style.fg,
        border: `1px solid ${style.border}`,
        boxShadow: style.glow,
        fontSize: 11,
        fontWeight: isBlocker || isCritical ? 700 : 500,
        padding: "2px 8px",
        borderRadius: 4,
        letterSpacing: "0.2px",
      }}
    >
      {(isBlocker || isCritical) && (
        <span className="pulse-radar-red" style={{ width: 6, height: 6 }} />
      )}
      {value}
    </span>
  );
}

function exportTestPointsCSV(testPoints = []) {
  const headers = [
    "Code",
    "Module",
    "Test Scenario",
    "Expected Result",
    "Actual Result / Bug",
    "Test Status",
    "Severity",
    "Tester Lead",
    "Assigned Developer",
    "Developer Status",
    "Developer Remark",
    "Last Updated",
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = testPoints.map((tp) => [
    escapeCSV(tp.code),
    escapeCSV(tp.module),
    escapeCSV(tp.scenario),
    escapeCSV(tp.expectedResult),
    escapeCSV(tp.actualResult),
    escapeCSV(tp.status),
    escapeCSV(tp.severity),
    escapeCSV(tp.tester),
    escapeCSV(tp.assignedDev),
    escapeCSV(tp.devStatus),
    escapeCSV(tp.devRemark),
    escapeCSV(tp.updatedAt || todayISO()),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ZPBDMS_QA_Test_Matrix_${todayISO()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function TestHubView({
  testPoints,
  allTestPoints,
  onCycleStatus,
  onOpenResolve,
  onOpenEdit,
  onDelete,
  onDispatchIssue,
  onOpenAdd,
  onExportCSV,
  selectedModule,
  setSelectedModule,
  selectedTestStatus,
  setSelectedTestStatus,
  selectedDevStatus,
  setSelectedDevStatus,
  searchQuery,
  setSearchQuery,
}) {
  const total = allTestPoints.length;
  const passed = allTestPoints.filter((t) => t.status === "Passed").length;
  const failed = allTestPoints.filter((t) => t.status === "Failed").length;
  const blocked = allTestPoints.filter((t) => t.status === "Blocked").length;
  const retest = allTestPoints.filter((t) => t.status === "Retest").length;
  const untested = allTestPoints.filter((t) => t.status === "Untested").length;
  const devResolved = allTestPoints.filter(
    (t) => t.devStatus === "Resolved / Ready for Retest"
  ).length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div>
      {/* Top QA Operational KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="glass-card" style={{ padding: "16px 18px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Total Test Scenarios
            </span>
            <FileSpreadsheet size={15} color="#cbd5e1" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", marginTop: 8 }}>
            {total}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
            Spreadsheet matrix records
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#4ade80", textTransform: "uppercase", fontWeight: 700 }}>
              Passed / Verification
            </span>
            <CheckCircle size={15} color="#22c55e" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#4ade80" }}>{passed}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>({passRate}% Pass Rate)</div>
          </div>
          <div style={{ width: "100%", height: 4, background: "rgba(255, 255, 255, 0.08)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
            <div style={{ width: `${passRate}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "16px 18px",
            border: failed > 0 ? "1px solid rgba(255, 51, 75, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
            background: failed > 0 ? "rgba(255, 51, 75, 0.08)" : "rgba(18, 22, 34, 0.6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#ff6479", textTransform: "uppercase", fontWeight: 700 }}>
              Defects / Failed
            </span>
            <AlertCircle size={15} color="#ff334b" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: failed > 0 ? "#ff334b" : "#ffffff", marginTop: 8 }}>
            {failed}
          </div>
          <div style={{ fontSize: 11.5, color: failed > 0 ? "#ff8093" : "#64748b", marginTop: 4 }}>
            {failed > 0 ? "Action required: Developer fix needed" : "All tested scenarios passing"}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#c084fc", textTransform: "uppercase", fontWeight: 700 }}>
              Developer Resolved
            </span>
            <Code2 size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#c084fc", marginTop: 8 }}>
            {devResolved}
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>
            Ready for Tester Rutuja retest
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#fbbf24", textTransform: "uppercase", fontWeight: 700 }}>
              Pending / In Queue
            </span>
            <Clock size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fbbf24", marginTop: 8 }}>
            {untested + blocked + retest}
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>
            {untested} Untested · {blocked} Blocked · {retest} Retest
          </div>
        </div>
      </div>

      {/* Spreadsheet Control Toolbar & Filter Deck */}
      <div
        className="glass-card"
        style={{
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1 }}>
          {/* Module Filter */}
          <div style={{ minWidth: 140 }}>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              style={{
                ...darkInputStyle,
                padding: "7px 12px",
                fontSize: 12,
                cursor: "pointer",
                background: "rgba(18, 22, 34, 0.8)",
              }}
            >
              <option value="All Modules">All Modules</option>
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Test Status Filter */}
          <div style={{ minWidth: 140 }}>
            <select
              value={selectedTestStatus}
              onChange={(e) => setSelectedTestStatus(e.target.value)}
              style={{
                ...darkInputStyle,
                padding: "7px 12px",
                fontSize: 12,
                cursor: "pointer",
                background: "rgba(18, 22, 34, 0.8)",
              }}
            >
              <option value="All Test Statuses">All Test Statuses</option>
              {TEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Dev Status Filter */}
          <div style={{ minWidth: 160 }}>
            <select
              value={selectedDevStatus}
              onChange={(e) => setSelectedDevStatus(e.target.value)}
              style={{
                ...darkInputStyle,
                padding: "7px 12px",
                fontSize: 12,
                cursor: "pointer",
                background: "rgba(18, 22, 34, 0.8)",
              }}
            >
              <option value="All Dev Statuses">All Dev Statuses</option>
              {DEV_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search points, scenario, remarks, devs..."
              style={{
                ...darkInputStyle,
                padding: "7px 10px 7px 30px",
                fontSize: 12,
                background: "rgba(18, 22, 34, 0.8)",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Right Info & Quick Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            Showing <strong>{testPoints.length}</strong> of {total} test points
          </span>
          <button
            className="btn-red-gradient"
            onClick={onOpenAdd}
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Plus size={14} /> New Point
            </span>
          </button>
        </div>
      </div>

      {/* High-Density Spreadsheet Matrix Grid */}
      <div className="glass-card" style={{ overflowX: "auto", overflowY: "hidden" }}>
        {/* Table Column Headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "110px 100px minmax(260px, 2.2fr) 130px 100px 110px minmax(260px, 2.2fr) 110px",
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.03)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: 11,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            alignItems: "center",
            minWidth: 1180,
          }}
        >
          <span># & Code</span>
          <span>Module</span>
          <span>Test Scenario & Evidence</span>
          <span>Test Status</span>
          <span>Severity</span>
          <span>Tester Lead</span>
          <span>Developer Resolution & Remark</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {/* Table Body Rows */}
        {testPoints.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center" }}>
            <FileSpreadsheet size={36} color="#64748b" style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ color: "#ffffff", fontSize: 14, fontWeight: 600 }}>No QA test points found</div>
            <p style={{ color: "#64748b", fontSize: 12.5, margin: "6px 0 16px" }}>
              No test scenarios match the current filters or search term.
            </p>
            <button
              className="btn-red-gradient"
              onClick={onOpenAdd}
              style={{ padding: "8px 16px", fontSize: 12.5 }}
            >
              <Plus size={13} style={{ marginRight: 6 }} /> Create New Test Point
            </button>
          </div>
        ) : (
          testPoints.map((tp, idx) => (
            <div
              key={tp.id}
              className="custom-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "110px 100px minmax(260px, 2.2fr) 130px 100px 110px minmax(260px, 2.2fr) 110px",
                padding: "14px 16px",
                borderBottom: idx === testPoints.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                alignItems: "center",
                minWidth: 1180,
              }}
            >
              {/* Code */}
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "0.2px",
                  }}
                >
                  {tp.code || `TP-${idx + 1}`}
                </div>
                <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>
                  Row #{idx + 1}
                </div>
              </div>

              {/* Module */}
              <div>
                <ModuleTag name={tp.module} />
              </div>

              {/* Test Scenario & Specification */}
              <div style={{ paddingRight: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", lineHeight: 1.4 }}>
                  {tp.scenario}
                </div>

                {tp.expectedResult && (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "#94a3b8",
                      marginTop: 4,
                      lineHeight: 1.35,
                      display: "flex",
                      gap: 4,
                    }}
                  >
                    <span style={{ color: "#4ade80", fontWeight: 600, flexShrink: 0 }}>Expected:</span>
                    <span>{tp.expectedResult}</span>
                  </div>
                )}

                {tp.actualResult && (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: tp.status === "Failed" ? "#ff8093" : "#cbd5e1",
                      marginTop: 4,
                      lineHeight: 1.35,
                      display: "flex",
                      gap: 4,
                      background: tp.status === "Failed" ? "rgba(255, 51, 75, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: tp.status === "Failed" ? "1px solid rgba(255, 51, 75, 0.25)" : "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <span style={{ color: tp.status === "Failed" ? "#ff334b" : "#94a3b8", fontWeight: 700, flexShrink: 0 }}>
                      {tp.status === "Failed" ? "Defect:" : "Actual:"}
                    </span>
                    <span>{tp.actualResult}</span>
                  </div>
                )}
              </div>

              {/* Test Status (Click to advance) */}
              <div
                onClick={() => onCycleStatus(tp)}
                title="Click to advance: Untested → Passed → Failed → Blocked → Retest"
              >
                <TestStatusChip value={tp.status} interactive />
              </div>

              {/* Severity */}
              <div>
                <SeverityBadge value={tp.severity || "Major"} />
              </div>

              {/* Tester Lead */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(255, 51, 75, 0.15)",
                      border: "1px solid rgba(255, 51, 75, 0.35)",
                      color: "#ff334b",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(tp.tester || "R").charAt(0)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#ffffff" }}>
                    {tp.tester || "Rutuja"}
                  </span>
                </div>
              </div>

              {/* Developer Resolution & Remarks */}
              <div style={{ paddingRight: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <DevStatusChip value={tp.devStatus} onClick={() => onOpenResolve(tp)} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {tp.assignedDev ? `(${tp.assignedDev})` : ""}
                  </span>
                </div>

                {tp.devRemark ? (
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "#e2e8f0",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderLeft: "2px solid #ff334b",
                      padding: "4px 8px",
                      borderRadius: "0 4px 4px 0",
                      marginTop: 6,
                      lineHeight: 1.35,
                    }}
                  >
                    <span style={{ color: "#ff6479", fontWeight: 700 }}>Dev Fix Note: </span>
                    {tp.devRemark}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>
                    No developer remarks recorded yet.
                  </div>
                )}

                <button
                  onClick={() => onOpenResolve(tp)}
                  style={{
                    marginTop: 6,
                    background: "rgba(255, 51, 75, 0.1)",
                    border: "1px solid rgba(255, 51, 75, 0.3)",
                    color: "#ff6479",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: 10.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s ease",
                  }}
                  title="Update developer resolution status and fix remark"
                >
                  <Code2 size={11} /> {tp.devRemark ? "Edit Resolution / Remark" : "+ Add Fix Remark / Resolve"}
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                {tp.status === "Failed" && (
                  <button
                    onClick={() => onDispatchIssue(tp)}
                    className="btn-red-gradient"
                    style={{
                      padding: "4px 8px",
                      fontSize: 10.5,
                      borderRadius: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      whiteSpace: "nowrap",
                    }}
                    title="Dispatch bug directly to central Issues Matrix"
                  >
                    <ExternalLink size={10} /> Dispatch Bug
                  </button>
                )}

                <div style={{ display: "flex", gap: 4 }}>
                  <IconButton onClick={() => onOpenEdit(tp)} title="Edit Test Point">
                    <Pencil size={13} />
                  </IconButton>
                  <IconButton onClick={() => onDelete(tp.id)} title="Delete Test Point" variant="danger">
                    <Trash2 size={13} />
                  </IconButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

