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
} from "lucide-react";

/* ---------------------------------------------------------------
   ZPBDMS Management Tool — High-Graphic Dark Command Center
   Red & White Fusion Aesthetics · Glassmorphism · Real-time Firestore
----------------------------------------------------------------*/

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

const DISTRICTS_DEFAULT = ["Satara", "Buldhana", "Nashik"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const ISSUE_STATUSES = ["Open", "In Progress", "Resolved"];
const TASK_STATUSES = ["To Do", "In Progress", "Done"];
const ROLLOUT_STAGES = ["Not Started", "Requirements", "UAT", "Live", "Stabilizing"];

const DOC_REF = () => doc(db, "trackerData", "main");

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function seedData() {
  return {
    issues: [],
    tasks: [],
    districts: DISTRICTS_DEFAULT.map((name) => ({
      id: uid(),
      name,
      stage: "UAT",
      notes: "",
      updatedAt: todayISO(),
    })),
  };
}

/* ---------------------------- UI Atoms ---------------------------- */

function StatusChip({ value, interactive = false }) {
  const configs = {
    // Issues
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
    // Tasks
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
    // Districts
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

function PriorityBadge({ value }) {
  const isCritical = value === "Critical";
  const isHigh = value === "High";

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
          <option key={o} value={o} style={{ background: "#0e111a", color: "#f8fafc" }}>
            {o}
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
  padding: "9px 12px",
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

/* ---------------------------- Forms ---------------------------- */

function IssueForm({ initial, districts, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      title: "",
      module: MODULES[0],
      district: districts[0] || "",
      priority: "Medium",
      status: "Open",
      assignee: "",
      notes: "",
    }
  );

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

      <FormField label="Assignee">
        <input
          style={darkInputStyle}
          value={f.assignee}
          onChange={(e) => setF({ ...f, assignee: e.target.value })}
          placeholder="Responsible team member"
        />
      </FormField>

      <FormField label="Investigation Notes / Logs">
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
      assignee: "",
      dueDate: "",
      status: "To Do",
    }
  );

  return (
    <div>
      <FormField label="Task Objective">
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
        <FormField label="Assigned Lead">
          <input
            style={darkInputStyle}
            value={f.assignee}
            onChange={(e) => setF({ ...f, assignee: e.target.value })}
            placeholder="Owner name"
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

/* ---------------------------- Main App Component ---------------------------- */

export default function App() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [tab, setTab] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(
      DOC_REF(),
      (snap) => {
        setConnected(true);
        if (snap.exists()) {
          setData(snap.data());
        } else {
          const seed = seedData();
          setDoc(DOC_REF(), seed);
          setData(seed);
        }
      },
      (err) => {
        console.error("Firestore error", err);
        setConnected("error");
      }
    );
    return () => unsub();
  }, []);

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
        <div
          className="glass-card-accent"
          style={{
            maxWidth: 480,
            padding: 32,
            textAlign: "center",
          }}
        >
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
            Unable to connect to Cloud Firestore. Please verify that your credentials in{" "}
            <code style={{ color: "#ff6479" }}>src/firebase.js</code> are configured and Firestore is active.
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
            ZPBDMS COMMAND CENTER
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="pulse-radar-red" />
            Initializing live secure sync...
          </div>
        </div>
      </div>
    );
  }

  const districtNames = data.districts.map((d) => d.name);

  function addOrUpdate(list, item, editingId) {
    if (editingId) return list.map((x) => (x.id === editingId ? { ...x, ...item } : x));
    return [{ id: uid(), createdAt: todayISO(), ...item }, ...list];
  }

  const saveIssue = (item) => {
    persist({ ...data, issues: addOrUpdate(data.issues, item, modal?.editing?.id) });
    setModal(null);
  };
  const saveTask = (item) => {
    persist({ ...data, tasks: addOrUpdate(data.tasks, item, modal?.editing?.id) });
    setModal(null);
  };
  const saveDistrict = (item) => {
    persist({ ...data, districts: addOrUpdate(data.districts, item, modal?.editing?.id) });
    setModal(null);
  };

  const removeIssue = (id) => persist({ ...data, issues: data.issues.filter((x) => x.id !== id) });
  const removeTask = (id) => persist({ ...data, tasks: data.tasks.filter((x) => x.id !== id) });
  const removeDistrict = (id) => persist({ ...data, districts: data.districts.filter((x) => x.id !== id) });

  const cycleIssueStatus = (item) => {
    const next = ISSUE_STATUSES[(ISSUE_STATUSES.indexOf(item.status) + 1) % ISSUE_STATUSES.length];
    persist({ ...data, issues: data.issues.map((x) => (x.id === item.id ? { ...x, status: next } : x)) });
  };
  const cycleTaskStatus = (item) => {
    const next = TASK_STATUSES[(TASK_STATUSES.indexOf(item.status) + 1) % TASK_STATUSES.length];
    persist({ ...data, tasks: data.tasks.map((x) => (x.id === item.id ? { ...x, status: next } : x)) });
  };

  const q = query.trim().toLowerCase();
  const filteredIssues = data.issues.filter(
    (i) => !q || [i.title, i.module, i.district, i.assignee].join(" ").toLowerCase().includes(q)
  );
  const filteredTasks = data.tasks.filter(
    (t) => !q || [t.title, t.module, t.assignee].join(" ").toLowerCase().includes(q)
  );

  const openIssues = data.issues.filter((i) => i.status !== "Resolved").length;
  const criticalOpen = data.issues.filter((i) => i.status !== "Resolved" && i.priority === "Critical").length;
  const pendingTasks = data.tasks.filter((t) => t.status !== "Done").length;
  const liveDistrictsCount = data.districts.filter((d) => d.stage === "Live").length;

  const navItems = [
    { key: "dashboard", label: "Operations Deck", icon: LayoutGrid },
    { key: "issues", label: "Issues Matrix", icon: AlertTriangle, count: openIssues, isAlert: criticalOpen > 0 },
    { key: "tasks", label: "Task Directives", icon: ListChecks, count: pendingTasks },
    { key: "districts", label: "District Deployments", icon: MapPin, count: data.districts.length },
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
      {/* Visual Ambient Atmosphere */}
      <div className="ambient-bg">
        <div className="cyber-grid" />
      </div>

      {/* Futuristic Command Sidebar */}
      <aside
        style={{
          width: 240,
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
        <div style={{ marginBottom: 28, padding: "0 6px" }}>
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
                    letterSpacing: "0.5px",
                  }}
                >
                  v2.0
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 500,
                  letterSpacing: "0.4px",
                  marginTop: 2,
                }}
              >
                MANAGEMENT TOOL
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", padding: "0 10px 8px" }}>
          Control Navigation
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ key, label, icon: Icon, count, isAlert }) => {
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
                  color: active ? "#ffffff" : "#94a3b8",
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
                    e.currentTarget.style.color = "#94a3b8";
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
                    color={active ? "#ff334b" : "currentColor"}
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
                        : active
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(255, 255, 255, 0.08)",
                      color: "#ffffff",
                      borderRadius: 12,
                      padding: "1px 7px",
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
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <div
            className="glass-card"
            style={{
              padding: 14,
              border: criticalOpen > 0 ? "1px solid rgba(255, 51, 75, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              background: criticalOpen > 0 ? "rgba(255, 51, 75, 0.07)" : "rgba(18, 22, 34, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.5px" }}>
                TELEMETRY
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className={criticalOpen > 0 ? "pulse-radar-red" : "pulse-radar-green"} />
                <span style={{ fontSize: 10, color: criticalOpen > 0 ? "#ff6479" : "#4ade80", fontWeight: 600 }}>
                  {criticalOpen > 0 ? "ALERT" : "ONLINE"}
                </span>
              </span>
            </div>

            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
              {criticalOpen > 0 ? (
                <span style={{ color: "#ff6479", fontWeight: 600 }}>
                  {criticalOpen} critical incident{criticalOpen > 1 ? "s" : ""} active
                </span>
              ) : (
                <span style={{ color: "#f8fafc" }}>Zero critical alerts</span>
              )}
            </div>

            {/* Rollout Progress Indicator */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#94a3b8", marginBottom: 4 }}>
                <span>Rollout Live</span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>
                  {liveDistrictsCount}/{data.districts.length}
                </span>
              </div>
              <div style={{ width: "100%", height: 5, background: "rgba(255, 255, 255, 0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${data.districts.length ? (liveDistrictsCount / data.districts.length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #ff334b, #22c55e)",
                    borderRadius: 4,
                    boxShadow: "0 0 8px rgba(255, 51, 75, 0.5)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
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
              District rollouts, live defect tracking, and sprint task register
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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

            {/* Quick Search */}
            {tab !== "dashboard" && (
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
                    width: 220,
                    padding: "8px 12px 8px 32px",
                    fontSize: 12.5,
                    borderRadius: 20,
                    background: "rgba(18, 22, 34, 0.7)",
                  }}
                />
              </div>
            )}

            {/* View Actions */}
            {tab === "issues" && (
              <button className="btn-red-gradient" onClick={() => setModal({ type: "issue" })} style={{ padding: "8px 16px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Plus size={15} /> Log Issue
                </span>
              </button>
            )}
            {tab === "tasks" && (
              <button className="btn-red-gradient" onClick={() => setModal({ type: "task" })} style={{ padding: "8px 16px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Plus size={15} /> Create Task
                </span>
              </button>
            )}
            {tab === "districts" && (
              <button className="btn-red-gradient" onClick={() => setModal({ type: "district" })} style={{ padding: "8px 16px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Plus size={15} /> Add District
                </span>
              </button>
            )}
          </div>
        </header>

        {/* View Switches */}
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
            districts={data.districts}
            onEdit={(d) => setModal({ type: "district", editing: d })}
            onDelete={removeDistrict}
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
  const recentIssues = [...data.issues]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 6);

  const totalDistricts = data.districts.length || 1;
  const rolloutPercentage = Math.round((liveDistrictsCount / totalDistricts) * 100);

  return (
    <div>
      {/* 4 High-Graphic Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatMetricCard
          title="Open Issues"
          value={openIssues}
          subtitle={`${data.issues.filter((i) => i.status === "In Progress").length} currently in resolution`}
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
          subtitle={`${data.tasks.filter((t) => t.status === "Done").length} completed sprints`}
          icon={ListChecks}
          onClick={() => onGo("tasks")}
        />
        <StatMetricCard
          title="Rollout Deployment"
          value={`${rolloutPercentage}%`}
          subtitle={`${liveDistrictsCount} of ${data.districts.length} jurisdictions live`}
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

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.districts.map((d) => (
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
              <strong style={{ color: "#ff334b" }}>Quick Dispatch:</strong> Need to report a new bug?
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
          gridTemplateColumns: "36px 2.2fr 130px 130px 120px 130px 80px",
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
              gridTemplateColumns: "36px 2.2fr 130px 130px 120px 130px 80px",
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

      {districts.map((d, idx) => (
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
      ))}
    </div>
  );
}
