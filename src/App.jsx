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
} from "lucide-react";

/* ---------------------------------------------------------------
   ZPBDMS Team Register — standalone web app
   Same visual system as the in-chat version: navy register / parchment
   ledger, Spectral for headings, Inter for UI. Data now lives in
   Firestore (doc: trackerData/main) instead of the artifact storage
   API, so it works as a normal deployed website with no Claude
   dependency, and updates live for everyone with the link.
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

/* ---------------------------- UI atoms ---------------------------- */

function StatusChip({ value }) {
  const map = {
    Open: { bg: "#F3E4E1", fg: "#A6453D" },
    "In Progress": { bg: "#F3E9D4", fg: "#8A661F" },
    Resolved: { bg: "#E2EBE4", fg: "#3F6B4E" },
    "To Do": { bg: "#EBE8E0", fg: "#4B5563" },
    Done: { bg: "#E2EBE4", fg: "#3F6B4E" },
    "Not Started": { bg: "#EBE8E0", fg: "#4B5563" },
    Requirements: { bg: "#F3E9D4", fg: "#8A661F" },
    UAT: { bg: "#F3E9D4", fg: "#8A661F" },
    Live: { bg: "#E2EBE4", fg: "#3F6B4E" },
    Stabilizing: { bg: "#E4E8F0", fg: "#3B5384" },
  };
  const s = map[value] || { bg: "#EBE8E0", fg: "#4B5563" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        fontFamily: "Inter, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 3,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function PriorityMark({ value }) {
  const colors = { Critical: "#A6453D", High: "#B4842A", Medium: "#8A8560", Low: "#9AA0A6" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#4B5563", fontWeight: 500 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors[value] || "#9AA0A6", display: "inline-block" }} />
      {value}
    </span>
  );
}

function IconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ border: "none", background: "transparent", color: "#8A8272", cursor: "pointer", padding: 5, display: "inline-flex", borderRadius: 3 }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#1B2A44")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8272")}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, options, style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", appearance: "none", fontFamily: "Inter, sans-serif", fontSize: 13, padding: "7px 26px 7px 10px", borderRadius: 3, border: "1px solid #D9D2C2", background: "#FFFEFB", color: "#1B2A44", cursor: "pointer" }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#8A8272" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 5 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  fontFamily: "Inter, sans-serif",
  fontSize: 13.5,
  padding: "8px 10px",
  borderRadius: 3,
  border: "1px solid #D9D2C2",
  background: "#FFFEFB",
  color: "#1B2A44",
  boxSizing: "border-box",
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,42,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#F6F3EC", width: 440, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", borderRadius: 5, border: "1px solid #D9D2C2", boxShadow: "0 12px 32px rgba(27,42,68,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #D9D2C2" }}>
          <div style={{ fontFamily: "Spectral, serif", fontSize: 18, fontWeight: 600, color: "#1B2A44" }}>{title}</div>
          <IconBtn onClick={onClose} title="Close"><X size={18} /></IconBtn>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function PrimaryButton({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{ background: "#1B2A44", color: "#F6F3EC", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 600, padding: "9px 16px", borderRadius: 3, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

/* ---------------------------- Forms ---------------------------- */

function IssueForm({ initial, districts, onSave, onCancel }) {
  const [f, setF] = useState(initial || { title: "", module: MODULES[0], district: districts[0] || "", priority: "Medium", status: "Open", assignee: "", notes: "" });
  return (
    <div>
      <Field label="Issue"><input style={inputStyle} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="What's broken?" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Module"><Select value={f.module} onChange={(v) => setF({ ...f, module: v })} options={MODULES} /></Field>
        <Field label="District"><Select value={f.district} onChange={(v) => setF({ ...f, district: v })} options={districts} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Priority"><Select value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={PRIORITIES} /></Field>
        <Field label="Status"><Select value={f.status} onChange={(v) => setF({ ...f, status: v })} options={ISSUE_STATUSES} /></Field>
      </div>
      <Field label="Assignee"><input style={inputStyle} value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} placeholder="Who's on it" /></Field>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
        <PrimaryButton style={{ background: "transparent", color: "#4B5563" }} onClick={onCancel}>Cancel</PrimaryButton>
        <PrimaryButton onClick={() => f.title.trim() && onSave(f)}>Save issue</PrimaryButton>
      </div>
    </div>
  );
}

function TaskForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { title: "", module: MODULES[0], assignee: "", dueDate: "", status: "To Do" });
  return (
    <div>
      <Field label="Task"><input style={inputStyle} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="What needs doing?" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Module"><Select value={f.module} onChange={(v) => setF({ ...f, module: v })} options={MODULES} /></Field>
        <Field label="Status"><Select value={f.status} onChange={(v) => setF({ ...f, status: v })} options={TASK_STATUSES} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Assignee"><input style={inputStyle} value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} placeholder="Who owns this" /></Field>
        <Field label="Due date"><input type="date" style={inputStyle} value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
        <PrimaryButton style={{ background: "transparent", color: "#4B5563" }} onClick={onCancel}>Cancel</PrimaryButton>
        <PrimaryButton onClick={() => f.title.trim() && onSave(f)}>Save task</PrimaryButton>
      </div>
    </div>
  );
}

function DistrictForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name: "", stage: "Not Started", notes: "" });
  return (
    <div>
      <Field label="District"><input style={inputStyle} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="District name" /></Field>
      <Field label="Rollout stage"><Select value={f.stage} onChange={(v) => setF({ ...f, stage: v })} options={ROLLOUT_STAGES} /></Field>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
        <PrimaryButton style={{ background: "transparent", color: "#4B5563" }} onClick={onCancel}>Cancel</PrimaryButton>
        <PrimaryButton onClick={() => f.name.trim() && onSave(f)}>Save district</PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------- Main App ---------------------------- */

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
      setTimeout(() => setSaveState("idle"), 1600);
    }, 400);
  }, []);

  if (connected === "error") {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", padding: 40, color: "#A6453D", maxWidth: 520 }}>
        <strong>Can't reach the database.</strong> Check that the Firebase config in{" "}
        <code>src/firebase.js</code> is filled in and that Firestore is enabled for your project
        (see README.md).
      </div>
    );
  }

  if (!connected || !data) {
    return <div style={{ fontFamily: "Inter, sans-serif", padding: 40, color: "#6B7280" }}>Loading register…</div>;
  }

  const districtNames = data.districts.map((d) => d.name);

  function addOrUpdate(list, item, editingId) {
    if (editingId) return list.map((x) => (x.id === editingId ? { ...x, ...item } : x));
    return [{ id: uid(), createdAt: todayISO(), ...item }, ...list];
  }

  const saveIssue = (item) => { persist({ ...data, issues: addOrUpdate(data.issues, item, modal?.editing?.id) }); setModal(null); };
  const saveTask = (item) => { persist({ ...data, tasks: addOrUpdate(data.tasks, item, modal?.editing?.id) }); setModal(null); };
  const saveDistrict = (item) => { persist({ ...data, districts: addOrUpdate(data.districts, item, modal?.editing?.id) }); setModal(null); };

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
  const filteredIssues = data.issues.filter((i) => !q || [i.title, i.module, i.district, i.assignee].join(" ").toLowerCase().includes(q));
  const filteredTasks = data.tasks.filter((t) => !q || [t.title, t.module, t.assignee].join(" ").toLowerCase().includes(q));

  const openIssues = data.issues.filter((i) => i.status !== "Resolved").length;
  const criticalOpen = data.issues.filter((i) => i.status !== "Resolved" && i.priority === "Critical").length;
  const pendingTasks = data.tasks.filter((t) => t.status !== "Done").length;

  const navItems = [
    { key: "dashboard", label: "Overview", icon: LayoutGrid },
    { key: "issues", label: "Issues", icon: AlertTriangle, count: openIssues },
    { key: "tasks", label: "Tasks", icon: ListChecks, count: pendingTasks },
    { key: "districts", label: "Districts", icon: MapPin },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", display: "flex", minHeight: 640, background: "#F6F3EC", color: "#1B2A44", borderRadius: 6, overflow: "hidden", border: "1px solid #D9D2C2" }}>
      <div style={{ width: 208, flexShrink: 0, background: "#1B2A44", color: "#DCE2EE", padding: "22px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 26, paddingLeft: 2 }}>
          <div style={{ fontFamily: "Spectral, serif", fontWeight: 700, fontSize: 19, color: "#F6F3EC", lineHeight: 1.15 }}>ZPBDMS</div>
          <div style={{ fontSize: 11.5, color: "#8FA0C2", marginTop: 2 }}>Team Register</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ key, label, icon: Icon, count }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "none", cursor: "pointer", background: active ? "#2E4165" : "transparent", color: active ? "#F6F3EC" : "#B7C2DA", padding: "9px 10px", borderRadius: 4, fontSize: 13.5, fontWeight: 500, textAlign: "left" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Icon size={15} />{label}</span>
                {typeof count === "number" && count > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, background: active ? "#A9812F" : "#3B4E75", color: "#F6F3EC", borderRadius: 10, padding: "1px 7px" }}>{count}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <div style={{ borderTop: "1px solid #33456A", paddingTop: 14, fontSize: 11.5, color: "#8FA0C2", lineHeight: 1.6 }}>
            {criticalOpen > 0 ? <span style={{ color: "#E3A79E" }}>{criticalOpen} critical issue{criticalOpen > 1 ? "s" : ""} open</span> : "No critical issues open"}
            <br />
            {data.districts.filter((d) => d.stage === "Live").length} of {data.districts.length} districts live
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "22px 28px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "Spectral, serif", fontSize: 23, fontWeight: 600, color: "#1B2A44" }}>{navItems.find((n) => n.key === tab)?.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 11.5, color: "#9AA0A6", minWidth: 90, textAlign: "right" }}>
              {saveState === "saving" && "Saving…"}
              {saveState === "saved" && "Saved · live for team"}
            </div>
            {tab !== "dashboard" && (
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9AA0A6" }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" style={{ ...inputStyle, width: 180, padding: "7px 10px 7px 28px" }} />
              </div>
            )}
            {tab === "issues" && <PrimaryButton onClick={() => setModal({ type: "issue" })}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> New issue</span></PrimaryButton>}
            {tab === "tasks" && <PrimaryButton onClick={() => setModal({ type: "task" })}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> New task</span></PrimaryButton>}
            {tab === "districts" && <PrimaryButton onClick={() => setModal({ type: "district" })}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Add district</span></PrimaryButton>}
          </div>
        </div>

        {tab === "dashboard" && <Dashboard data={data} openIssues={openIssues} criticalOpen={criticalOpen} pendingTasks={pendingTasks} onGo={setTab} />}
        {tab === "issues" && <IssueTable issues={filteredIssues} onCycle={cycleIssueStatus} onEdit={(i) => setModal({ type: "issue", editing: i })} onDelete={removeIssue} />}
        {tab === "tasks" && <TaskTable tasks={filteredTasks} onCycle={cycleTaskStatus} onEdit={(t) => setModal({ type: "task", editing: t })} onDelete={removeTask} />}
        {tab === "districts" && <DistrictTable districts={data.districts} onEdit={(d) => setModal({ type: "district", editing: d })} onDelete={removeDistrict} />}
      </div>

      {modal?.type === "issue" && (
        <Modal title={modal.editing ? "Edit issue" : "New issue"} onClose={() => setModal(null)}>
          <IssueForm initial={modal.editing} districts={districtNames} onSave={saveIssue} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "task" && (
        <Modal title={modal.editing ? "Edit task" : "New task"} onClose={() => setModal(null)}>
          <TaskForm initial={modal.editing} onSave={saveTask} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "district" && (
        <Modal title={modal.editing ? "Edit district" : "Add district"} onClose={() => setModal(null)}>
          <DistrictForm initial={modal.editing} onSave={saveDistrict} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------- Views ---------------------------- */

function StatCard({ label, value, tone }) {
  const tones = { default: "#1B2A44", warn: "#A6453D", brass: "#8A661F" };
  return (
    <div style={{ flex: 1, border: "1px solid #D9D2C2", borderRadius: 4, padding: "16px 18px", background: "#FFFEFB" }}>
      <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "Spectral, serif", fontSize: 30, fontWeight: 600, color: tones[tone] || tones.default }}>{value}</div>
    </div>
  );
}

function Dashboard({ data, openIssues, criticalOpen, pendingTasks, onGo }) {
  const recentIssues = [...data.issues].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5);
  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>
        <StatCard label="Open issues" value={openIssues} tone={criticalOpen ? "warn" : "default"} />
        <StatCard label="Critical" value={criticalOpen} tone="warn" />
        <StatCard label="Pending tasks" value={pendingTasks} tone="brass" />
        <StatCard label="Districts live" value={`${data.districts.filter((d) => d.stage === "Live").length}/${data.districts.length}`} />
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1.3 }}>
          <SectionHeading label="Recent issues" onClick={() => onGo("issues")} />
          <div style={{ border: "1px solid #D9D2C2", borderRadius: 4, background: "#FFFEFB" }}>
            {recentIssues.length === 0 && <EmptyRow text="No issues logged yet." />}
            {recentIssues.map((i, idx) => (
              <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderBottom: idx < recentIssues.length - 1 ? "1px solid #EDE8DC" : "none" }}>
                <span style={{ fontFamily: "Spectral, serif", color: "#9AA0A6", fontSize: 13, width: 18 }}>{idx + 1}</span>
                <span style={{ flex: 1, fontSize: 13.5 }}>{i.title}</span>
                <span style={{ fontSize: 12, color: "#6B7280" }}>{i.district}</span>
                <StatusChip value={i.status} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <SectionHeading label="District rollout" onClick={() => onGo("districts")} />
          <div style={{ border: "1px solid #D9D2C2", borderRadius: 4, background: "#FFFEFB" }}>
            {data.districts.map((d, idx) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderBottom: idx < data.districts.length - 1 ? "1px solid #EDE8DC" : "none" }}>
                <span style={{ fontSize: 13.5 }}>{d.name}</span>
                <StatusChip value={d.stage} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ label, onClick }) {
  return <div onClick={onClick} style={{ fontSize: 12.5, fontWeight: 600, color: "#6B7280", marginBottom: 8, cursor: onClick ? "pointer" : "default" }}>{label}</div>;
}
function EmptyRow({ text }) {
  return <div style={{ padding: "24px 14px", fontSize: 13, color: "#9AA0A6", textAlign: "center" }}>{text}</div>;
}

function IssueTable({ issues, onCycle, onEdit, onDelete }) {
  return (
    <div style={{ border: "1px solid #D9D2C2", borderRadius: 4, background: "#FFFEFB" }}>
      <Row header cells={["", "Issue", "Module", "District", "Priority", "Status", ""]} />
      {issues.length === 0 && <EmptyRow text='No issues match. Log one with "New issue."' />}
      {issues.map((i, idx) => (
        <Row key={i.id} last={idx === issues.length - 1} cells={[
          <span style={{ fontFamily: "Spectral, serif", color: "#9AA0A6" }}>{idx + 1}</span>,
          <div><div style={{ fontSize: 13.5 }}>{i.title}</div>{i.assignee && <div style={{ fontSize: 11.5, color: "#9AA0A6", marginTop: 2 }}>{i.assignee}</div>}</div>,
          <span style={{ fontSize: 12.5, color: "#4B5563" }}>{i.module}</span>,
          <span style={{ fontSize: 12.5, color: "#4B5563" }}>{i.district}</span>,
          <PriorityMark value={i.priority} />,
          <div onClick={() => onCycle(i)} style={{ cursor: "pointer" }}><StatusChip value={i.status} /></div>,
          <div style={{ display: "flex", gap: 2 }}><IconBtn onClick={() => onEdit(i)} title="Edit"><Pencil size={14} /></IconBtn><IconBtn onClick={() => onDelete(i.id)} title="Delete"><Trash2 size={14} /></IconBtn></div>,
        ]} />
      ))}
    </div>
  );
}

function TaskTable({ tasks, onCycle, onEdit, onDelete }) {
  return (
    <div style={{ border: "1px solid #D9D2C2", borderRadius: 4, background: "#FFFEFB" }}>
      <Row header cells={["", "Task", "Module", "Assignee", "Due", "Status", ""]} />
      {tasks.length === 0 && <EmptyRow text='No tasks match. Add one with "New task."' />}
      {tasks.map((t, idx) => (
        <Row key={t.id} last={idx === tasks.length - 1} cells={[
          <span style={{ fontFamily: "Spectral, serif", color: "#9AA0A6" }}>{idx + 1}</span>,
          <span style={{ fontSize: 13.5 }}>{t.title}</span>,
          <span style={{ fontSize: 12.5, color: "#4B5563" }}>{t.module}</span>,
          <span style={{ fontSize: 12.5, color: "#4B5563" }}>{t.assignee || "—"}</span>,
          <span style={{ fontSize: 12.5, color: "#4B5563" }}>{t.dueDate || "—"}</span>,
          <div onClick={() => onCycle(t)} style={{ cursor: "pointer" }}><StatusChip value={t.status} /></div>,
          <div style={{ display: "flex", gap: 2 }}><IconBtn onClick={() => onEdit(t)} title="Edit"><Pencil size={14} /></IconBtn><IconBtn onClick={() => onDelete(t.id)} title="Delete"><Trash2 size={14} /></IconBtn></div>,
        ]} />
      ))}
    </div>
  );
}

function DistrictTable({ districts, onEdit, onDelete }) {
  return (
    <div style={{ border: "1px solid #D9D2C2", borderRadius: 4, background: "#FFFEFB" }}>
      <Row header cells={["", "District", "Stage", "Notes", ""]} />
      {districts.map((d, idx) => (
        <Row key={d.id} last={idx === districts.length - 1} cells={[
          <span style={{ fontFamily: "Spectral, serif", color: "#9AA0A6" }}>{idx + 1}</span>,
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{d.name}</span>,
          <StatusChip value={d.stage} />,
          <span style={{ fontSize: 12.5, color: "#6B7280" }}>{d.notes || "—"}</span>,
          <div style={{ display: "flex", gap: 2 }}><IconBtn onClick={() => onEdit(d)} title="Edit"><Pencil size={14} /></IconBtn><IconBtn onClick={() => onDelete(d.id)} title="Delete"><Trash2 size={14} /></IconBtn></div>,
        ]} />
      ))}
    </div>
  );
}

function Row({ cells, header, last }) {
  const widths = cells.length === 7 ? [24, "auto", 110, 100, 90, 110, 60] : [24, 140, 110, "auto", 60];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: header ? "9px 14px" : "12px 14px", borderBottom: last ? "none" : "1px solid #EDE8DC", background: header ? "#FAF8F2" : "transparent" }}>
      {cells.map((c, i) => (
        <div key={i} style={{ width: widths[i] === "auto" ? undefined : widths[i], flex: widths[i] === "auto" ? 1 : "none", fontSize: 11.5, fontWeight: header ? 600 : 400, color: header ? "#9AA0A6" : "#1B2A44" }}>
          {c}
        </div>
      ))}
    </div>
  );
}
