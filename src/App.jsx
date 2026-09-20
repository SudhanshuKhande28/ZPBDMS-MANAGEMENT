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
  Landmark,
  Sun,
  Moon,
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
  Receipt,
  TrendingUp,
  BarChart2,
  History,
  UserPlus,
  Users,
  Eye,
  EyeOff,
  Shield,
  Crown,
  ClipboardList,
  Copy,
  Printer,
  Building2,
  CheckSquare,
  FileText,
  ChevronUp,
  Share2,
  GitMerge,
  Workflow,
  ChevronRight,
  ArrowLeft,
  Phone,
  Building,
  HelpCircle,
  Tag,
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
    email: "sudhanshu.khande@zpbdms.gov",
  },
  {
    id: "u2",
    name: "Sankalp",
    username: "sankalp",
    role: "Lead Developer",
    password: "Dev@2026",
    avatar: "#38bdf8",
    email: "sankalp.dev@zpbdms.gov",
  },
  {
    id: "u3",
    name: "Rutuja",
    username: "rutuja",
    role: "Tester",
    password: "Qa@2026",
    avatar: "#a855f7",
    email: "rutuja.qa@zpbdms.gov",
  },
  {
    id: "u4",
    name: "Snehal Jagtap",
    username: "snehal",
    role: "Manager",
    password: "Snehal@123",
    avatar: "#10b981",
    email: "snehal.jagtap@zpbdms.gov",
  },
];

const ROLES_LIST = [
  "CEO",
  "Manager",
  "Business Analyst",
  "Main Admin / Business Analyst",
  "Lead Developer",
  "Developer",
  "Tester",
  "Testing Lead",
];

function mergeUsersWithDefaults(existingUsers = []) {
  const list = Array.isArray(existingUsers) ? [...existingUsers] : [];
  const map = new Map();
  list.forEach((u) => {
    if (u && u.username) map.set(u.username.toLowerCase(), u);
  });

  TEAM_ROSTER.forEach((def) => {
    const key = def.username.toLowerCase();
    if (!map.has(key)) {
      list.push({ ...def });
      map.set(key, def);
    } else {
      const existing = map.get(key);
      if (!existing.password) existing.password = def.password;
      if (!existing.role) existing.role = def.role;
      if (!existing.name) existing.name = def.name;
      if (!existing.avatar) existing.avatar = def.avatar;
      if (!existing.email && def.email) existing.email = def.email;
    }
  });

  return list;
}

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

const BILL_TRACKER_DEFAULT = [
  { id: "bill-1", srNo: 1, district: "Ahilyanagar", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-2", srNo: 2, district: "Akola", gatheringDetails: 0, inProcess: 0, completed: 0, totalBills: 0, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-3", srNo: 3, district: "Amravati", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-4", srNo: 4, district: "Beed", gatheringDetails: 1, inProcess: 4, completed: 1, totalBills: 6, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-5", srNo: 5, district: "Bhandara", gatheringDetails: 0, inProcess: 1, completed: 1, totalBills: 2, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-6", srNo: 6, district: "Buldhana", gatheringDetails: 0, inProcess: 1, completed: 1, totalBills: 2, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-7", srNo: 7, district: "Chandrapur", gatheringDetails: 0, inProcess: 11, completed: 6, totalBills: 17, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-8", srNo: 8, district: "Chhatrapati Sambhajinagar", gatheringDetails: 0, inProcess: 4, completed: 1, totalBills: 5, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-9", srNo: 9, district: "Dharashiv", gatheringDetails: 1, inProcess: 0, completed: 1, totalBills: 2, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-10", srNo: 10, district: "Dhule", gatheringDetails: 0, inProcess: 0, completed: 7, totalBills: 7, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-11", srNo: 11, district: "Gadchiroli", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-12", srNo: 12, district: "Gondia", gatheringDetails: 1, inProcess: 0, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-13", srNo: 13, district: "Hingoli", gatheringDetails: 0, inProcess: 1, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-14", srNo: 14, district: "Jalgaon", gatheringDetails: 0, inProcess: 1, completed: 2, totalBills: 3, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-15", srNo: 15, district: "Jalna", gatheringDetails: 1, inProcess: 0, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-16", srNo: 16, district: "Kolhapur", gatheringDetails: 0, inProcess: 1, completed: 1, totalBills: 2, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-17", srNo: 17, district: "Latur", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-18", srNo: 18, district: "Nagpur", gatheringDetails: 1, inProcess: 4, completed: 2, totalBills: 6, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-19", srNo: 19, district: "Nanded", gatheringDetails: 0, inProcess: 3, completed: 0, totalBills: 3, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-20", srNo: 20, district: "Nandurbar", gatheringDetails: 0, inProcess: 3, completed: 0, totalBills: 3, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-21", srNo: 21, district: "Nashik", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-22", srNo: 22, district: "Palghar", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-23", srNo: 23, district: "Parbhani", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-24", srNo: 24, district: "Pune", gatheringDetails: 0, inProcess: 1, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-25", srNo: 25, district: "Raigad", gatheringDetails: 0, inProcess: 1, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-26", srNo: 26, district: "Ratnagiri", gatheringDetails: 0, inProcess: 1, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-27", srNo: 27, district: "Sangli", gatheringDetails: 0, inProcess: 0, completed: 1, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-28", srNo: 28, district: "Satara", gatheringDetails: 0, inProcess: 0, completed: 6, totalBills: 6, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-29", srNo: 29, district: "Sindhudurg", gatheringDetails: 0, inProcess: 1, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-30", srNo: 30, district: "Solapur", gatheringDetails: 0, inProcess: 1, completed: 0, totalBills: 1, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-31", srNo: 31, district: "Thane", gatheringDetails: 0, inProcess: 2, completed: 1, totalBills: 3, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-32", srNo: 32, district: "Wardha", gatheringDetails: 0, inProcess: 1, completed: 1, totalBills: 2, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-33", srNo: 33, district: "Washim", gatheringDetails: 0, inProcess: 0, completed: 4, totalBills: 4, notes: "", updatedAt: "2026-09-01" },
  { id: "bill-34", srNo: 34, district: "Yavatmal", gatheringDetails: 0, inProcess: 3, completed: 0, totalBills: 3, notes: "", updatedAt: "2026-09-01" },
];

function mergeDistrictBillsWithDefaults(existingBills = []) {
  const existingMap = new Map();
  (existingBills || []).forEach((b) => {
    if (b && b.district) {
      const lower = b.district.trim().toLowerCase();
      const canonical = DISTRICT_ALIASES[lower] ? DISTRICT_ALIASES[lower].toLowerCase() : lower;
      existingMap.set(canonical, b);
      existingMap.set(lower, b);
    }
  });

  return BILL_TRACKER_DEFAULT.map((def) => {
    const key = def.district.trim().toLowerCase();
    const existing = existingMap.get(key);
    if (existing) {
      const gathering = Number(existing.gatheringDetails ?? def.gatheringDetails ?? 0);
      const inProc = Number(existing.inProcess ?? def.inProcess ?? 0);
      const comp = Number(existing.completed ?? def.completed ?? 0);
      const rawNotes = existing.notes !== undefined ? existing.notes : "";
      const isAutoNote =
        typeof rawNotes === "string" &&
        (rawNotes.includes("bill completed") ||
          rawNotes.includes("in process") ||
          rawNotes.includes("gathering details") ||
          rawNotes.includes("100% completed"));
      return {
        ...def,
        ...existing,
        id: existing.id || def.id,
        district: def.district,
        gatheringDetails: gathering,
        inProcess: inProc,
        completed: comp,
        totalBills: gathering + inProc + comp,
        notes: isAutoNote ? "" : rawNotes,
        updatedAt: existing.updatedAt || def.updatedAt || todayISO(),
      };
    }
    return {
      ...def,
    };
  });
}

function seedTestPoints() {
  return [
    {
      id: uid(),
      code: "TP-VPDA-01",
      module: "VPDA",
      scenario: "Verify digital cryptographic signature generation on Namuna 24 PDF",
      assignedDate: todayISO(),
      expectedResult: "PDF generated with valid cryptographic PKCS#7 digital signature and official stamp",
      actualResult: "Signature generation timed out on large datasets (>50 pages)",
      status: "Failed",
      devStatus: "Resolved / Ready for Retest",
      devRemark: "Added chunked stream processing in build v2.1; response time reduced to 1.2s.",
      finalRetestRemarks: "Pending Rutuja verification on staging server.",
      severity: "Critical",
      tester: "Rutuja",
      assignedDev: "Sankalp",
      estimatedTime: "4 Hours",
      updatedAt: todayISO(),
    },
    {
      id: uid(),
      code: "TP-TR-02",
      module: "Treasury",
      scenario: "Validate Treasury bill remittance reconciliation with bank transaction IDs",
      assignedDate: todayISO(),
      expectedResult: "Bank UTR number matches Treasury ledger with automated status updated to Settled",
      actualResult: "Ledger status updated correctly with zero discrepancy",
      status: "Passed",
      devStatus: "Completed",
      devRemark: "Automated cron runner verified against staging bank gateway.",
      finalRetestRemarks: "Verified UTR reconciliation end-to-end. Pass sign-off granted.",
      severity: "Major",
      tester: "Rutuja",
      assignedDev: "Sankalp",
      estimatedTime: "2 Hours",
      updatedAt: todayISO(),
    },
    {
      id: uid(),
      code: "TP-CESS-03",
      module: "CESS",
      scenario: "Test calculation of 2% state infrastructure CESS surcharge on commercial assessment",
      assignedDate: todayISO(),
      expectedResult: "System calculates accurate 2% rate rounded up to nearest whole rupee",
      actualResult: "Awaiting test data batch from Buldhana district office",
      status: "Untested",
      devStatus: "Pending Dev Fix",
      devRemark: "Pending formula confirmation from Treasury officer.",
      finalRetestRemarks: "",
      severity: "Major",
      tester: "Rutuja",
      assignedDev: "Sudhanshu Khande",
      estimatedTime: "1 Day",
      updatedAt: todayISO(),
    },
    {
      id: uid(),
      code: "TP-NAM-04",
      module: "Namuna Reports",
      scenario: "Export Namuna 1 to 33 ledger registers in encrypted Excel/CSV formats",
      assignedDate: todayISO(),
      expectedResult: "Download triggers with UTF-8 Marathi/English bilingual encoding",
      actualResult: "Special Marathi Unicode characters render as question marks in Excel export",
      status: "Failed",
      devStatus: "Dev In Progress",
      devRemark: "Investigating UTF-8 BOM header injection for Excel compatibility.",
      finalRetestRemarks: "Retest queued after PR merge.",
      severity: "Critical",
      tester: "Rutuja",
      assignedDev: "Sankalp",
      estimatedTime: "1.5 Days",
      updatedAt: todayISO(),
    },
  ];
}

function seedMOMs() {
  return [
    {
      id: "mom_1",
      title: "ZP Pune — Revenue Assessment & CESS Calculation Rules Review",
      date: todayISO(),
      time: "11:00 AM",
      duration: "1h 15m",
      clientOrg: "Zilla Parishad Pune (Finance & Accounts)",
      clientAttendees: "Mr. Sachin Patil (Addl. CEO), Mr. Deshmukh (CAO), Smt. Joshi (IT Lead)",
      internalAttendees: ["Sudhanshu Khande", "Snehal Jagtap", "Sankalp"],
      mode: "Client In-Person (ZP Pune HQ)",
      category: "Requirement Alignment",
      status: "Client Approved",
      notes: "1. Detailed walkthrough of property tax assessment formulas across rural and semi-urban panchayats.\n2. Addressed CESS surcharge rounding rules for commercial establishments.\n3. Verified Namuna 9 ledger generation requirements with bilingual Marathi/English headers.",
      decisions: "1. 2% state infrastructure CESS will be computed on base tax and rounded up to nearest whole rupee.\n2. Treasury settlement cron runner will execute daily at 12:00 PM and 6:00 PM.\n3. Final UAT sign-off scheduled for Pune district on coming Friday.",
      actionItems: [
        {
          id: "act_1",
          task: "Implement UTF-8 Marathi character encoding in Namuna bulk Excel export",
          owner: "Sankalp",
          dueDate: "2026-09-24",
          priority: "High",
          status: "In Progress",
          pushedToMatrix: true,
        },
        {
          id: "act_2",
          task: "Verify bank UTR auto-reconciliation on staging bank gateway",
          owner: "Sankalp",
          dueDate: "2026-09-22",
          priority: "Critical",
          status: "Done",
          pushedToMatrix: false,
        },
        {
          id: "act_3",
          task: "Prepare final UAT test sign-off dossier for Addl. CEO review",
          owner: "Sudhanshu Khande",
          dueDate: "2026-09-25",
          priority: "Medium",
          status: "Pending",
          pushedToMatrix: false,
        },
      ],
      createdBy: "Sudhanshu Khande",
      createdAt: todayISO(),
      updatedAt: todayISO(),
    },
    {
      id: "mom_2",
      title: "Ahilyanagar (Ahmednagar) District Deployment & Gateway Verification",
      date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      time: "03:30 PM",
      duration: "45 mins",
      clientOrg: "ZP Ahilyanagar (General Administration)",
      clientAttendees: "Dy. CEO Mr. Shinde, Lead Treasury Auditor, District Informatics Officer",
      internalAttendees: ["Sudhanshu Khande", "Snehal Jagtap"],
      mode: "Google Meet",
      category: "Sprint Review & Demo",
      status: "Shared with Client",
      notes: "1. Demonstrated live bill tracking module and treasury reconciliation dashboard.\n2. Reviewed latency of payment gateway webhook confirmation for bulk gram panchayat collections.\n3. Discussed user role provisioning for district block development officers (BDOs).",
      decisions: "1. Approved payment status polling interval of 30 seconds.\n2. District user roster to be onboarded via Master Module by Monday.",
      actionItems: [
        {
          id: "act_4",
          task: "Add block-level filtering to the District Deployment tab",
          owner: "Sankalp",
          dueDate: "2026-09-26",
          priority: "Medium",
          status: "Pending",
          pushedToMatrix: false,
        },
        {
          id: "act_5",
          task: "Send Ahilyanagar credential onboarding guide to Dy. CEO office",
          owner: "Snehal Jagtap",
          dueDate: "2026-09-23",
          priority: "High",
          status: "In Progress",
          pushedToMatrix: false,
        },
      ],
      createdBy: "Sudhanshu Khande",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    },
  ];
}

const MAHARASHTRA_DIVISIONS = {
  "Pune Division": ["Pune", "Satara", "Solapur", "Kolhapur", "Sangli"],
  "Konkan Division": ["Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
  "Nashik Division": ["Nashik", "Ahilyanagar", "Dhule", "Jalgaon", "Nandurbar"],
  "Chhatrapati Sambhajinagar Division": [
    "Chhatrapati Sambhajinagar",
    "Jalna",
    "Parbhani",
    "Hingoli",
    "Nanded",
    "Beed",
    "Latur",
    "Dharashiv",
  ],
  "Amravati Division": ["Amravati", "Akola", "Buldhana", "Yavatmal", "Washim"],
  "Nagpur Division": ["Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"],
};

function getDistrictDivision(districtName) {
  for (const [div, dists] of Object.entries(MAHARASHTRA_DIVISIONS)) {
    if (dists.some((d) => d.toLowerCase() === (districtName || "").toLowerCase())) {
      return div;
    }
  }
  return "Maharashtra General";
}

const STANDARD_BILLING_STAGES = [
  { step: 1, roleName: "Department Maker", shortRole: "Maker", levelDesc: "Bill preparation, Measurement Book (MB) entry & token generation" },
  { step: 2, roleName: "Department Checker", shortRole: "Checker", levelDesc: "Technical scrutiny, deduction checks (IT/GST/Royalty) & verification" },
  { step: 3, roleName: "Department HOD", shortRole: "HOD", levelDesc: "Executive sanction & departmental forwarding to Finance Department" },
  { step: 4, roleName: "FD Auditor", shortRole: "Auditor", levelDesc: "Primary financial audit, Namuna check & headcode budget validation" },
  { step: 5, roleName: "FD AAO", shortRole: "AAO", levelDesc: "Assistant Accounts Officer review & treasury compliance scrutiny" },
  { step: 6, roleName: "FD AO / DY-CAFO", shortRole: "AO / Dy-CAFO", levelDesc: "Accounts Officer / Deputy CAFO financial concurrence & verification" },
  { step: 7, roleName: "CAFO", shortRole: "CAFO", levelDesc: "Chief Accounts & Finance Officer final sanction & payment approval" },
  { step: 8, roleName: "CASHIER", shortRole: "Cashier", levelDesc: "Disbursement, CMP advice generation, treasury scroll matching & payment" },
];

function createStandardDepartment(deptName, deptCode, headCodes, customOfficialsByStep = {}) {
  const stages = STANDARD_BILLING_STAGES.map((st) => {
    const officials = customOfficialsByStep[st.step] || [
      {
        id: "off_" + Math.random().toString(36).slice(2, 9),
        name: `Officer (${st.shortRole})`,
        designation: `${st.shortRole} - ${deptCode}`,
        username: `${deptCode.toLowerCase()}_${st.shortRole.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        phone: "+91 98000 00000",
        deskLocation: `${deptCode} Office`,
        headCodes: [...headCodes],
        notes: `Responsible for ${st.roleName} in ${deptName}`,
      },
    ];
    return {
      step: st.step,
      roleName: st.roleName,
      shortRole: st.shortRole,
      levelDesc: st.levelDesc,
      officials,
    };
  });

  return {
    id: deptCode.toLowerCase() + "_" + Math.random().toString(36).slice(2, 8),
    name: deptName,
    code: deptCode,
    headCodes,
    stages,
  };
}

function seedDistrictFlows() {
  return DISTRICTS_DEFAULT.map((distName) => {
    const division = getDistrictDivision(distName);
    const distLower = distName.toLowerCase();
    const isPune = distLower === "pune";
    const isAhilya = distLower === "ahilyanagar";

    // 1. Rural Water Supply (RWS)
    const rwsHeads = ["2215-01 (Rural Water Supply Schemes)", "2215-02 (Jal Jeevan Mission - JJM)", "4215-01 (Capital Outlay Water)"];
    const rwsDept = createStandardDepartment(
      "Rural Water Supply (RWS / पाणी पुरवठा)",
      "RWS",
      rwsHeads,
      {
        1: [
          {
            id: "off_rws_m1_" + distLower,
            name: isPune ? "Shri S. R. Patil" : `Shri V. R. Shinde (${distName})`,
            designation: "Junior Engineer / Maker (Desk 1)",
            username: `${distLower}_rws_maker1`,
            phone: "+91 98220 11421",
            deskLocation: "RWS Building, Room 204",
            headCodes: ["2215-01 (Rural Water Supply Schemes)"],
            notes: "Handles rural water supply scheme maintenance vouchers and MB tokens up to ₹25 Lakhs.",
          },
          {
            id: "off_rws_m2_" + distLower,
            name: isPune ? "Smt. P. V. Kulkarni" : `Smt. S. K. Joshi (${distName})`,
            designation: "Junior Engineer / JJM Maker (Desk 2)",
            username: `${distLower}_rws_maker2`,
            phone: "+91 98221 44512",
            deskLocation: "RWS Building, Room 205",
            headCodes: ["2215-02 (Jal Jeevan Mission - JJM)", "4215-01 (Capital Outlay Water)"],
            notes: "Dedicated Maker for Jal Jeevan Mission tap connection works and capital asset contracts.",
          },
        ],
        2: [
          {
            id: "off_rws_chk_" + distLower,
            name: isPune ? "Shri A. N. Joshi" : `Shri R. T. Deshmukh (${distName})`,
            designation: "Sectional Engineer / Technical Checker",
            username: `${distLower}_rws_checker`,
            phone: "+91 94220 33819",
            deskLocation: "RWS Building, Room 206",
            headCodes: [...rwsHeads],
            notes: "Performs rate analysis, GST deduction scrutiny, and royalty certificate checks before HOD signoff.",
          },
        ],
        3: [
          {
            id: "off_rws_hod_" + distLower,
            name: isPune ? "Er. R. D. Shinde" : `Er. M. P. Pawar (${distName})`,
            designation: "Executive Engineer (HOD - RWS)",
            username: `${distLower}_rws_ee_hod`,
            phone: "+91 98230 77120",
            deskLocation: "Executive Engineer Chamber, Room 201",
            headCodes: [...rwsHeads],
            notes: "Departmental sanction authority. Forwards verified bills with digital signature to Finance Department.",
          },
        ],
        4: [
          {
            id: "off_rws_aud1_" + distLower,
            name: isPune ? "Shri M. B. Deshmukh" : `Shri P. L. More (${distName})`,
            designation: "Junior Auditor (Finance Wing - Desk 3)",
            username: `${distLower}_fd_aud_rws1`,
            phone: "+91 98500 22910",
            deskLocation: "Finance Wing, 1st Floor, Table 3",
            headCodes: ["2215-01 (Rural Water Supply Schemes)"],
            notes: "Audits primary scheme bills, verifies budget allotment balance under Head 2215-01.",
          },
          {
            id: "off_rws_aud2_" + distLower,
            name: isPune ? "Smt. K. T. Pawar" : `Smt. M. N. Kale (${distName})`,
            designation: "Senior Auditor (JJM & Capital - Desk 4)",
            username: `${distLower}_fd_aud_rws2`,
            phone: "+91 98600 77182",
            deskLocation: "Finance Wing, 1st Floor, Table 4",
            headCodes: ["2215-02 (Jal Jeevan Mission - JJM)", "4215-01 (Capital Outlay Water)"],
            notes: "Specialized scrutiny for Central/State tied grants under Jal Jeevan Mission.",
          },
        ],
        5: [
          {
            id: "off_rws_aao_" + distLower,
            name: isPune ? "Shri G. K. More" : `Shri D. S. Gaikwad (${distName})`,
            designation: "Assistant Accounts Officer (AAO - Works)",
            username: `${distLower}_fd_aao_works`,
            phone: "+91 94231 99012",
            deskLocation: "Finance Wing, AAO Cabin 105",
            headCodes: [...rwsHeads],
            notes: "Checks treasury classification, statutory TDS deduction, and contract agreement clauses.",
          },
        ],
        6: [
          {
            id: "off_rws_ao_" + distLower,
            name: isPune ? "Shri S. V. Jadhav" : `Shri B. K. Kadam (${distName})`,
            designation: "Accounts Officer (AO / Dy. CAFO)",
            username: `${distLower}_fd_ao_works`,
            phone: "+91 98223 55100",
            deskLocation: "AO Office, Room 108",
            headCodes: [...rwsHeads],
            notes: "Financial concurrence officer. Recommends payment sanction to CAFO.",
          },
        ],
        7: [
          {
            id: "off_rws_cafo_" + distLower,
            name: isPune ? "Smt. Snehal Jagtap" : `Chief Accounts & Finance Officer (${distName})`,
            designation: "Chief Accounts & Finance Officer (CAFO)",
            username: `${distLower}_cafo`,
            phone: "+91 98220 99881",
            deskLocation: "CAFO Chamber, 2nd Floor",
            headCodes: ["ALL HEAD CODES"],
            notes: "Final drawing and disbursing sanction authority for ZP treasury account.",
          },
        ],
        8: [
          {
            id: "off_rws_cash_" + distLower,
            name: isPune ? "Shri N. B. Gaikwad" : `Treasury Cashier (${distName})`,
            designation: "Senior Cashier / Treasury Officer",
            username: `${distLower}_cashier`,
            phone: "+91 98901 22334",
            deskLocation: "Treasury Counter, Ground Floor, Room 12",
            headCodes: ["ALL HEAD CODES"],
            notes: "Disburses approved payments via CMP portal, RTGS advice, or treasury scroll generation.",
          },
        ],
      }
    );

    // 2. Public Works Department (PWD / Works)
    const pwdHeads = ["3054-04 (District Roads & Rural Bridges)", "5054-04 (Capital Works Roads)", "2059-80 (Public Buildings)"];
    const pwdDept = createStandardDepartment(
      "Public Works Department (PWD / सार्वजनिक बांधकाम)",
      "PWD",
      pwdHeads,
      {
        1: [
          {
            id: "off_pwd_m1_" + distLower,
            name: `Shri A. R. Chavan (${distName})`,
            designation: "Junior Engineer / Works Maker",
            username: `${distLower}_pwd_maker1`,
            phone: "+91 98222 33441",
            deskLocation: "PWD Division Office, Table 2",
            headCodes: ["3054-04 (District Roads & Rural Bridges)"],
            notes: "Road repair vouchers and asphalt resurfacing bills.",
          },
          {
            id: "off_pwd_m2_" + distLower,
            name: `Shri T. H. Salunkhe (${distName})`,
            designation: "Junior Engineer / Buildings Maker",
            username: `${distLower}_pwd_maker2`,
            phone: "+91 98222 77889",
            deskLocation: "PWD Division Office, Table 3",
            headCodes: ["5054-04 (Capital Works Roads)", "2059-80 (Public Buildings)"],
            notes: "Bridge construction and ZP administrative building maintenance bills.",
          },
        ],
        3: [
          {
            id: "off_pwd_hod_" + distLower,
            name: `Er. K. S. Jagdale (${distName})`,
            designation: "Executive Engineer (Works / PWD)",
            username: `${distLower}_pwd_ee`,
            phone: "+91 98234 11220",
            deskLocation: "EE PWD Chamber",
            headCodes: [...pwdHeads],
            notes: "PWD technical sanction and forwarding authority.",
          },
        ],
        4: [
          {
            id: "off_pwd_aud_" + distLower,
            name: `Shri S. D. Bhosale (${distName})`,
            designation: "Senior Auditor (PWD Desk)",
            username: `${distLower}_fd_aud_pwd`,
            phone: "+91 98555 44332",
            deskLocation: "Finance Wing, Table 6",
            headCodes: [...pwdHeads],
            notes: "Audits road and infrastructure bill registers.",
          },
        ],
      }
    );

    // 3. Health & Medical Department
    const healthHeads = ["2210-03 (Primary Health Centers - PHC)", "2210-06 (Public Health & Epidemics)", "2211-00 (Family Welfare)"];
    const healthDept = createStandardDepartment(
      "Health & Medical Services (आरोग्य विभाग)",
      "HEALTH",
      healthHeads,
      {
        1: [
          {
            id: "off_health_m_" + distLower,
            name: `Smt. S. P. Thorat (${distName})`,
            designation: "Senior Assistant / Health Bill Maker",
            username: `${distLower}_health_maker`,
            phone: "+91 98111 22334",
            deskLocation: "Health Directorate, Table 1",
            headCodes: [...healthHeads],
            notes: "PHC medicine supply, ambulance fuel, and medical officer salary bills.",
          },
        ],
        3: [
          {
            id: "off_health_hod_" + distLower,
            name: `Dr. B. R. Sonawane (${distName})`,
            designation: "District Health Officer (DHO)",
            username: `${distLower}_dho`,
            phone: "+91 98229 00112",
            deskLocation: "DHO Chamber",
            headCodes: [...healthHeads],
            notes: "District Health Officer executive sanction.",
          },
        ],
        4: [
          {
            id: "off_health_aud_" + distLower,
            name: `Shri Y. N. Mahajan (${distName})`,
            designation: "Auditor (Health & Welfare Desk)",
            username: `${distLower}_fd_aud_health`,
            phone: "+91 98333 44556",
            deskLocation: "Finance Wing, Table 8",
            headCodes: [...healthHeads],
            notes: "Audits medical supplies and NHM scheme payments.",
          },
        ],
      }
    );

    // 4. Panchayat Samiti & Rural Development
    const rdHeads = ["2515-00 (15th Finance Commission Grants)", "2501-00 (Rural Livelihood & NREGS)"];
    const rdDept = createStandardDepartment(
      "Panchayat Samiti & Rural Dev (पंचायत विभाग)",
      "RURAL_DEV",
      rdHeads,
      {
        1: [
          {
            id: "off_rd_m_" + distLower,
            name: `Shri C. M. Wagh (${distName})`,
            designation: "Extension Officer / Panchayat Maker",
            username: `${distLower}_rd_maker`,
            phone: "+91 98444 55667",
            deskLocation: "Panchayat Wing, Desk 4",
            headCodes: [...rdHeads],
            notes: "Gram panchayat developmental grants and 15th FC tied/untied allocations.",
          },
        ],
        3: [
          {
            id: "off_rd_hod_" + distLower,
            name: `Shri V. S. Bhalerao (${distName})`,
            designation: "Deputy CEO (Panchayat)",
            username: `${distLower}_dyceo_panchayat`,
            phone: "+91 98231 66778",
            deskLocation: "Dy. CEO Office",
            headCodes: [...rdHeads],
            notes: "Deputy Chief Executive Officer sanctioning authority for panchayat funds.",
          },
        ],
        4: [
          {
            id: "off_rd_aud_" + distLower,
            name: `Shri L. K. Gaikwad (${distName})`,
            designation: "Auditor (Panchayat Accounts)",
            username: `${distLower}_fd_aud_panchayat`,
            phone: "+91 98777 88990",
            deskLocation: "Finance Wing, Table 2",
            headCodes: [...rdHeads],
            notes: "Audits 15th Finance Commission utilization certificates.",
          },
        ],
      }
    );

    // 5. Finance & Accounts Department
    const finHeads = ["2054-00 (Treasury & Accounts Admin)", "2071-01 (Pension & Gratuity)", "2049-03 (Interest & Loans)"];
    const finDept = createStandardDepartment(
      "Finance & Accounts (वित्त व लेखा विभाग)",
      "FINANCE",
      finHeads
    );

    // 6. Education Department
    const eduHeads = ["2202-01 (Elementary Education - Primary)", "2236-02 (Mid-Day Meal Scheme / पोषण आहार)"];
    const eduDept = createStandardDepartment(
      "Education Department (शिक्षण विभाग)",
      "EDUCATION",
      eduHeads
    );

    return {
      districtId: "dist_flow_" + distLower,
      districtName: distName,
      division: division,
      updatedAt: todayISO(),
      departments: [rwsDept, pwdDept, healthDept, rdDept, finDept, eduDept],
    };
  });
}

function seedData() {
  return {
    issues: [],
    tasks: [],
    notifications: [],
    testPoints: seedTestPoints(),
    districts: mergeDistrictsWithDefaults([]),
    districtBills: mergeDistrictBillsWithDefaults([]),
    users: mergeUsersWithDefaults([]),
    auditLogs: [],
    moms: seedMOMs(),
    districtFlows: seedDistrictFlows(),
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

function TestStatusChip({ value, interactive = false, onClick, compact = false }) {
  const map = {
    Passed: {
      bg: "rgba(34, 197, 94, 0.16)",
      fg: "#4ade80",
      border: "rgba(34, 197, 94, 0.4)",
      glow: "0 0 10px rgba(34, 197, 94, 0.2)",
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
      title={interactive ? `${value || "Untested"} (Click to cycle status)` : (value || "Untested")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        fontFamily: "'Inter', sans-serif",
        fontSize: compact ? 11 : 12,
        fontWeight: 700,
        padding: compact ? "2px 8px" : "3px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        maxWidth: "100%",
        boxSizing: "border-box",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.18s ease",
      }}
    >
      <span
        style={{
          width: compact ? 5 : 6,
          height: compact ? 5 : 6,
          borderRadius: "50%",
          backgroundColor: s.dot,
          boxShadow: `0 0 6px ${s.dot}`,
          flexShrink: 0,
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value || "Untested"}
      </span>
    </span>
  );
}

function DevStatusChip({ value, onClick, compact = false }) {
  const map = {
    "Resolved / Ready for Retest": {
      bg: "rgba(34, 197, 94, 0.16)",
      fg: "#4ade80",
      border: "rgba(34, 197, 94, 0.4)",
      glow: "0 0 10px rgba(34, 197, 94, 0.2)",
      dot: "#22c55e",
      short: "Resolved / Retest",
    },
    "Dev In Progress": {
      bg: "rgba(168, 85, 247, 0.16)",
      fg: "#c084fc",
      border: "rgba(168, 85, 247, 0.4)",
      glow: "0 0 10px rgba(168, 85, 247, 0.2)",
      dot: "#a855f7",
      short: "In Progress",
    },
    "Pending Dev Fix": {
      bg: "rgba(245, 158, 11, 0.16)",
      fg: "#fbbf24",
      border: "rgba(245, 158, 11, 0.4)",
      glow: "0 0 8px rgba(245, 158, 11, 0.15)",
      dot: "#f59e0b",
      short: "Pending Fix",
    },
    "Cannot Reproduce / As Designed": {
      bg: "rgba(148, 163, 184, 0.12)",
      fg: "#94a3b8",
      border: "rgba(148, 163, 184, 0.25)",
      glow: "none",
      dot: "#94a3b8",
      short: "As Designed",
    },
  };
  const s = map[value] || map["Pending Dev Fix"];
  const displayLabel = compact ? (s.short || value) : (value || "Pending Dev Fix");

  return (
    <span
      onClick={onClick}
      title={`${value || "Pending Dev Fix"} (Click to update resolution)`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        boxShadow: s.glow,
        fontSize: compact ? 10.5 : 11.5,
        fontWeight: 600,
        padding: compact ? "2.5px 8px" : "3px 10px",
        borderRadius: 20,
        maxWidth: "100%",
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.18s ease",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: s.dot,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {displayLabel}
      </span>
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
          border: "1px solid var(--border-card)",
          background: "var(--bg-input)",
          color: "var(--text-main)",
          cursor: "pointer",
          outline: "none",
          transition: "border 0.2s ease, box-shadow 0.2s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(255, 51, 75, 0.6)";
          e.target.style.boxShadow = "0 0 0 3px rgba(255, 51, 75, 0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border-card)";
          e.target.style.boxShadow = "none";
        }}
      >
        {options.map((o) => (
          <option key={typeof o === "object" ? o.value : o} value={typeof o === "object" ? o.value : o} style={{ background: "var(--bg-primary)", color: "var(--text-main)" }}>
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
          color: "var(--text-secondary)",
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
  border: "1px solid var(--border-card)",
  background: "var(--bg-input)",
  color: "var(--text-main)",
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
        className="modal-enter modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-glass, linear-gradient(180deg, #131724 0%, #0c0f18 100%))",
          width: 480,
          maxWidth: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          border: "1px solid var(--border-card)",
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
            borderBottom: "1px solid var(--border-subtle)",
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
                color: "var(--text-main)",
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

function ConfirmDeleteModal({ itemType, itemTitle, details, onConfirm, onCancel, isLight }) {
  return (
    <Modal title={`Confirm Deletion: ${itemType}`} icon={AlertTriangle} onClose={onCancel}>
      <div style={{ padding: "4px 0" }}>
        <div
          style={{
            padding: "16px",
            borderRadius: 10,
            background: "rgba(255, 51, 75, 0.08)",
            border: "1px solid rgba(255, 51, 75, 0.3)",
            marginBottom: 16,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "rgba(255, 51, 75, 0.2)",
              color: "#ff334b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff" }}>
              Are you sure you want to delete this {itemType}?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#ff6479",
                fontWeight: 600,
                marginTop: 4,
                wordBreak: "break-word",
              }}
            >
              "{itemTitle}"
            </div>
          </div>
        </div>

        {details && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.03)",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: 12,
              color: isLight ? "#475569" : "#94a3b8",
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600, color: isLight ? "#0f172a" : "#ffffff" }}>Scope: </span>
            {details}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
            color: isLight ? "#64748b" : "#94a3b8",
            marginBottom: 22,
          }}
        >
          <ShieldAlert size={15} color="#f59e0b" />
          <span>This action will be logged in the permanent Admin Audit Trail.</span>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn-ghost-dark"
            onClick={onCancel}
            style={{ padding: "9px 18px", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-red-gradient"
            onClick={onConfirm}
            style={{ padding: "9px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Trash2 size={14} /> Confirm & Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

function UserForm({ initial, onSave, onCancel, isLight }) {
  const [name, setName] = useState(initial?.name || "");
  const [username, setUsername] = useState(initial?.username || "");
  const [role, setRole] = useState(initial?.role || "Developer");
  const [password, setPassword] = useState(initial?.password || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [avatar, setAvatar] = useState(initial?.avatar || "#38bdf8");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const presetColors = [
    "#ff334b",
    "#38bdf8",
    "#a855f7",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#06b6d4",
    "#64748b",
  ];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (!initial) {
      if (newRole === "CEO") setAvatar("#f59e0b");
      else if (newRole?.includes("Manager")) setAvatar("#10b981");
      else if (newRole?.includes("Tester")) setAvatar("#a855f7");
      else if (newRole?.includes("Developer")) setAvatar("#38bdf8");
      else if (newRole?.includes("Analyst")) setAvatar("#ff334b");
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("Please fill in Name, Username, and Password.");
      return;
    }
    const cleanUser = username.trim().toLowerCase().replace(/\s+/g, "");
    onSave({
      id: initial?.id || `u_${uid()}`,
      name: name.trim(),
      username: cleanUser,
      role,
      password: password.trim(),
      email: email.trim(),
      avatar,
      createdAt: initial?.createdAt || todayISO(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#ff6479",
            fontSize: 12,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <FormField label="Full Personnel Name">
        <input
          style={darkInputStyle}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="e.g. Anand Kulkarni"
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Username (Login Handle)">
          <input
            style={darkInputStyle}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            placeholder="e.g. anand"
          />
        </FormField>
        <FormField label="Role / Designation">
          <SelectInput value={role} onChange={handleRoleChange} options={ROLES_LIST} />
        </FormField>
      </div>

      <FormField label="Login Access Password">
        <div style={{ position: "relative" }}>
          <input
            type={showPass ? "text" : "password"}
            style={{ ...darkInputStyle, paddingRight: 40 }}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Enter secure password"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: 4,
            }}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </FormField>

      <FormField label="Official Email Address (Optional)">
        <input
          type="email"
          style={darkInputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. anand.k@zpbdms.gov"
        />
      </FormField>

      <FormField label="Profile Accent Color">
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
          {presetColors.map((color) => (
            <div
              key={color}
              onClick={() => setAvatar(color)}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: color,
                cursor: "pointer",
                border: avatar === color ? "3px solid #ffffff" : "2px solid transparent",
                boxShadow: avatar === color ? `0 0 10px ${color}` : "none",
                transition: "all 0.15s ease",
              }}
            />
          ))}
        </div>
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-red-gradient"
          style={{ padding: "9px 20px", fontSize: 13 }}
        >
          {initial ? "Update Member" : "Register Member"}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------- Forms with Fixed Assignees ---------------------------- */

function IssueForm({ initial, districts, users = TEAM_ROSTER, onSave, onCancel }) {
  const userList = Array.isArray(users) && users.length > 0 ? users : TEAM_ROSTER;
  const [f, setF] = useState(
    initial || {
      title: "",
      module: MODULES[0],
      district: districts[0] || "",
      priority: "Medium",
      status: "Open",
      assignee: userList[0]?.name || TEAM_ROSTER[0].name,
      notes: "",
    }
  );

  const assigneeOptions = userList.map((u) => ({
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
          <SelectInput
            value={f.module}
            onChange={(m) => setF({ ...f, module: m })}
            options={MODULES}
          />
        </FormField>

        <FormField label="District Jurisdiction">
          <SelectInput
            value={f.district}
            onChange={(d) => setF({ ...f, district: d })}
            options={districts}
          />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Severity / Priority">
          <SelectInput
            value={f.priority}
            onChange={(p) => setF({ ...f, priority: p })}
            options={PRIORITIES}
          />
        </FormField>

        <FormField label="Status">
          <SelectInput
            value={f.status}
            onChange={(s) => setF({ ...f, status: s })}
            options={ISSUE_STATUSES}
          />
        </FormField>
      </div>

      <FormField label="Assigned Personnel">
        <SelectInput
          value={f.assignee}
          onChange={(a) => setF({ ...f, assignee: a })}
          options={assigneeOptions}
        />
      </FormField>

      <FormField label="Diagnostic Notes / Logs">
        <textarea
          style={{ ...darkInputStyle, minHeight: 80, resize: "vertical" }}
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          placeholder="Include error stack traces, screenshot URLs, or steps to reproduce..."
        />
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
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

function TaskForm({ initial, users = TEAM_ROSTER, onSave, onCancel }) {
  const userList = Array.isArray(users) && users.length > 0 ? users : TEAM_ROSTER;
  const [f, setF] = useState(
    initial || {
      title: "",
      module: MODULES[0],
      assignee: userList[0]?.name || TEAM_ROSTER[0].name,
      dueDate: "",
      status: "To Do",
    }
  );

  const assigneeOptions = userList.map((u) => ({
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

function DistrictBillForm({ initial, onSave, onCancel, isLight }) {
  const [gathering, setGathering] = useState(initial?.gatheringDetails ?? 0);
  const [inProcess, setInProcess] = useState(initial?.inProcess ?? 0);
  const [completed, setCompleted] = useState(initial?.completed ?? 0);
  const [notes, setNotes] = useState(initial?.notes || "");

  const gVal = Math.max(0, parseInt(gathering, 10) || 0);
  const pVal = Math.max(0, parseInt(inProcess, 10) || 0);
  const cVal = Math.max(0, parseInt(completed, 10) || 0);
  const total = gVal + pVal + cVal;
  const pct = total > 0 ? Math.round((cVal / total) * 100) : 0;

  return (
    <div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.04)",
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
            Maharashtra Zilla Parishad #{initial?.srNo || ""}
          </div>
          <div style={{ fontSize: 16, color: isLight ? "#0f172a" : "#ffffff", fontWeight: 800, marginTop: 2 }}>
            {initial?.district}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
            Total Bills
          </div>
          <div style={{ fontSize: 22, color: "#ff334b", fontWeight: 900 }}>
            {total}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FormField label="Gathering Details">
          <input
            type="number"
            min="0"
            style={{ ...darkInputStyle, textAlign: "center", fontSize: 16, fontWeight: 700 }}
            value={gathering}
            onChange={(e) => setGathering(e.target.value)}
          />
        </FormField>
        <FormField label="In Process">
          <input
            type="number"
            min="0"
            style={{ ...darkInputStyle, textAlign: "center", fontSize: 16, fontWeight: 700 }}
            value={inProcess}
            onChange={(e) => setInProcess(e.target.value)}
          />
        </FormField>
        <FormField label="Completed">
          <input
            type="number"
            min="0"
            style={{ ...darkInputStyle, textAlign: "center", fontSize: 16, fontWeight: 700 }}
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
          />
        </FormField>
      </div>

      {/* Dynamic Completion Rate Bar */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 8,
          background: isLight ? "#f1f5f9" : "rgba(255, 51, 75, 0.06)",
          border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 51, 75, 0.25)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={15} color="#ff334b" />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: isLight ? "#334155" : "#e2e8f0" }}>
            Completion Metric:{" "}
            <strong style={{ color: pct === 100 ? "#22c55e" : pct > 0 ? "#38bdf8" : "#94a3b8" }}>
              {pct}% Completed
            </strong>
          </span>
        </div>
        <span style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
          {cVal} of {total} bills cleared
        </span>
      </div>

      <FormField label="District Remarks / Operational Notes">
        <textarea
          style={{ ...darkInputStyle, minHeight: 65, resize: "vertical" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. 1 bill completed; 4 bills undergoing treasury audit."
        />
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
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
          onClick={() => {
            onSave({
              ...initial,
              gatheringDetails: gVal,
              inProcess: pVal,
              completed: cVal,
              totalBills: total,
              notes,
            });
          }}
        >
          Save Bill Counts
        </button>
      </div>
    </div>
  );
}

function TestPointForm({ initial, users = TEAM_ROSTER, currentUser, onSave, onCancel, isLight }) {
  const userList = Array.isArray(users) && users.length > 0 ? users : TEAM_ROSTER;
  const devOptions = userList.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
  }));

  const [f, setF] = useState(
    initial || {
      code: `TP-${Math.floor(10 + Math.random() * 90)}`,
      module: MODULES[0],
      scenario: "",
      assignedDate: todayISO(),
      assignedBy: currentUser?.name || "Sudhanshu Khande",
      assignedDev: devOptions[1]?.value || devOptions[0]?.value || "Sankalp",
      devStatus: "Pending Dev Fix",
      tester: devOptions[2]?.value || devOptions[0]?.value || "Rutuja",
      status: "Untested",
      actualResult: "",
      devRemark: "",
      finalRetestRemarks: "",
      severity: "Major",
      estimatedTime: "4 Hours",
    }
  );

  const durationPresets = ["30m", "1h", "2h", "4h", "1d", "2d", "3d", "1w"];

  return (
    <div>
      <FormField label="1. Point / Directive Description (BA Specification)">
        <textarea
          style={{ ...darkInputStyle, minHeight: 65, resize: "vertical" }}
          value={f.scenario}
          onChange={(e) => setF({ ...f, scenario: e.target.value })}
          placeholder="Enter the core business requirement, verification directive, or point..."
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="2. Date Assigned (Auto-calculated)">
          <input
            type="date"
            style={darkInputStyle}
            value={f.assignedDate || todayISO()}
            onChange={(e) => setF({ ...f, assignedDate: e.target.value })}
          />
        </FormField>
        <FormField label="Code & Module">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...darkInputStyle, width: "45%" }}
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value })}
              placeholder="Code"
            />
            <SelectInput
              value={f.module}
              onChange={(v) => setF({ ...f, module: v })}
              options={MODULES}
            />
          </div>
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
        <FormField label="3. Assigned Developer (BA Initial Assignment)">
          <SelectInput
            value={f.assignedDev}
            onChange={(v) => setF({ ...f, assignedDev: v })}
            options={devOptions}
          />
        </FormField>
        <FormField label="Estimated Dev Duration / Timer">
          <div style={{ position: "relative" }}>
            <input
              style={{ ...darkInputStyle, paddingLeft: 28, fontSize: 12.5 }}
              value={f.estimatedTime || ""}
              onChange={(e) => setF({ ...f, estimatedTime: e.target.value })}
              placeholder="e.g. 4 Hours, 2 Days"
            />
            <Clock size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#38bdf8" }} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {durationPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setF({ ...f, estimatedTime: preset })}
                style={{
                  padding: "1px 6px",
                  fontSize: 10,
                  borderRadius: 3,
                  border: f.estimatedTime === preset ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
                  background: f.estimatedTime === preset ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.04)",
                  color: f.estimatedTime === preset ? "#38bdf8" : (isLight ? "#475569" : "#94a3b8"),
                  cursor: "pointer",
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="4. Dev Completion Status">
          <SelectInput
            value={f.devStatus}
            onChange={(v) => setF({ ...f, devStatus: v })}
            options={DEV_STATUSES}
          />
        </FormField>
        <FormField label="5. Assigned Tester (Testing Lead Assignment)">
          <SelectInput
            value={f.tester}
            onChange={(v) => setF({ ...f, tester: v })}
            options={devOptions}
          />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="6. Tester Verification Status">
          <SelectInput
            value={f.status}
            onChange={(v) => setF({ ...f, status: v })}
            options={TEST_STATUSES}
          />
        </FormField>
        <FormField label="Defect Severity Level">
          <SelectInput
            value={f.severity || "Major"}
            onChange={(v) => setF({ ...f, severity: v })}
            options={["Minor", "Major", "Critical"]}
          />
        </FormField>
      </div>

      <FormField label="Tester Status / Verification Remarks">
        <textarea
          style={{ ...darkInputStyle, minHeight: 48, resize: "vertical" }}
          value={f.actualResult}
          onChange={(e) => setF({ ...f, actualResult: e.target.value })}
          placeholder="Tester observations, bug specifics, or verification observations..."
        />
      </FormField>

      <FormField label="7. Developer Reassigned Remarks (Fix / Rework Notes)">
        <textarea
          style={{ ...darkInputStyle, minHeight: 48, resize: "vertical" }}
          value={f.devRemark}
          onChange={(e) => setF({ ...f, devRemark: e.target.value })}
          placeholder="Developer notes if issue occurred and needs to be retested..."
        />
      </FormField>

      <FormField label="8. Final Retest Remarks">
        <textarea
          style={{ ...darkInputStyle, minHeight: 48, resize: "vertical" }}
          value={f.finalRetestRemarks || ""}
          onChange={(e) => setF({ ...f, finalRetestRemarks: e.target.value })}
          placeholder="Final QA retest sign-off remarks..."
        />
      </FormField>

      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
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
          Save Matrix Point
        </button>
      </div>
    </div>
  );
}

function DevResolveForm({ initial, users = TEAM_ROSTER, onSave, onCancel, isLight }) {
  const [devStatus, setDevStatus] = useState(initial?.devStatus || "Resolved / Ready for Retest");
  const [devRemark, setDevRemark] = useState(initial?.devRemark || "");
  const [estimatedTime, setEstimatedTime] = useState(initial?.estimatedTime || "4 Hours");
  const userList = Array.isArray(users) && users.length > 0 ? users : TEAM_ROSTER;
  const [assignedDev, setAssignedDev] = useState(initial?.assignedDev || userList[1]?.name || userList[0]?.name);

  const teamOptions = userList.map((u) => ({
    value: u.name,
    label: `${u.name} (${u.role})`,
  }));

  const durationPresets = ["1h", "2h", "4h", "1d", "2d", "3d", "1w"];

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

      <FormField label="Developer Estimated Duration / Time Taken">
        <div style={{ position: "relative" }}>
          <input
            style={{ ...darkInputStyle, paddingLeft: 28 }}
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g. 4 Hours, 1 Day"
          />
          <Clock size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#38bdf8" }} />
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {durationPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setEstimatedTime(preset)}
              style={{
                padding: "1px 6px",
                fontSize: 10,
                borderRadius: 3,
                border: estimatedTime === preset ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
                background: estimatedTime === preset ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.04)",
                color: estimatedTime === preset ? "#38bdf8" : (isLight ? "#475569" : "#94a3b8"),
                cursor: "pointer",
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </FormField>

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
          onClick={() => onSave({ devStatus, devRemark, assignedDev, estimatedTime })}
        >
          Submit Resolution & Notify Tester
        </button>
      </div>
    </div>
  );
}

function QuickTimerForm({ initial, onSave, onCancel }) {
  const [time, setTime] = useState(initial?.estimatedTime || "4 Hours");
  const presets = ["30 Mins", "1 Hour", "2 Hours", "4 Hours", "1 Day", "2 Days", "3 Days", "1 Week"];

  return (
    <div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, textTransform: "uppercase" }}>
          {initial?.code} · Assigned Dev: {initial?.assignedDev || "Unassigned"}
        </div>
        <div style={{ fontSize: 13, color: "#ffffff", fontWeight: 600, marginTop: 3 }}>
          {initial?.scenario}
        </div>
      </div>

      <FormField label="Estimated Time / Completion Duration">
        <div style={{ position: "relative" }}>
          <input
            style={{ ...darkInputStyle, paddingLeft: 30, fontSize: 13 }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 4 Hours, 2 Days"
            autoFocus
          />
          <Clock size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#38bdf8" }} />
        </div>
      </FormField>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>Quick Presets:</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTime(p)}
              style={{
                padding: "3px 10px",
                borderRadius: 14,
                fontSize: 11.5,
                fontWeight: 600,
                border: time === p ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.12)",
                background: time === p ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.04)",
                color: time === p ? "#38bdf8" : "#cbd5e1",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button className="btn-ghost-dark" style={{ padding: "8px 16px", fontSize: 12.5 }} onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn-red-gradient"
          style={{ padding: "8px 20px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 5 }}
          onClick={() => time.trim() && onSave(time.trim())}
        >
          <Clock size={13} /> Update Duration
        </button>
      </div>
    </div>
  );
}

function MOMForm({ initial, users = TEAM_ROSTER, currentUser, onSave, onCancel, isLight }) {
  const userList = Array.isArray(users) && users.length > 0 ? users : TEAM_ROSTER;
  const [title, setTitle] = useState(initial?.title || "");
  const [date, setDate] = useState(initial?.date || todayISO());
  const [time, setTime] = useState(initial?.time || "11:00 AM");
  const [duration, setDuration] = useState(initial?.duration || "1 Hour");
  const [clientOrg, setClientOrg] = useState(initial?.clientOrg || "");
  const [clientAttendees, setClientAttendees] = useState(initial?.clientAttendees || "");
  const [internalAttendees, setInternalAttendees] = useState(
    Array.isArray(initial?.internalAttendees) ? initial.internalAttendees : [currentUser?.name || "Sudhanshu Khande"]
  );
  const [mode, setMode] = useState(initial?.mode || "Client In-Person (ZP HQ)");
  const [category, setCategory] = useState(initial?.category || "Requirement Alignment");
  const [status, setStatus] = useState(initial?.status || "Draft");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [decisions, setDecisions] = useState(initial?.decisions || "");
  const [actionItems, setActionItems] = useState(
    Array.isArray(initial?.actionItems)
      ? initial.actionItems
      : [
          {
            id: `act_${uid()}`,
            task: "",
            owner: userList[1]?.name || userList[0]?.name || "Sankalp",
            dueDate: todayISO(),
            priority: "High",
            status: "Pending",
          },
        ]
  );
  const [error, setError] = useState("");

  const MODES = [
    "Client In-Person (ZP HQ)",
    "Google Meet",
    "Microsoft Teams",
    "Zoom Conference",
    "Phone Discussion",
    "Internal Alignment",
  ];

  const CATEGORIES = [
    "Requirement Alignment",
    "Sprint Review & Demo",
    "UAT Feedback & Sign-off",
    "Production Issue Escalation",
    "Steering Committee / Review",
    "Technical Architecture",
  ];

  const MOM_STATUSES = ["Draft", "Shared with Client", "Client Approved"];

  const toggleAttendee = (userName) => {
    if (internalAttendees.includes(userName)) {
      if (internalAttendees.length === 1) return;
      setInternalAttendees(internalAttendees.filter((u) => u !== userName));
    } else {
      setInternalAttendees([...internalAttendees, userName]);
    }
  };

  const addActionItem = () => {
    setActionItems([
      ...actionItems,
      {
        id: `act_${uid()}`,
        task: "",
        owner: userList[0]?.name || "Sudhanshu Khande",
        dueDate: todayISO(),
        priority: "Medium",
        status: "Pending",
      },
    ]);
  };

  const removeActionItem = (id) => {
    setActionItems(actionItems.filter((a) => a.id !== id));
  };

  const updateActionItem = (id, key, value) => {
    setActionItems(actionItems.map((a) => (a.id === id ? { ...a, [key]: value } : a)));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim() || !clientOrg.trim()) {
      setError("Please provide at least a Meeting Subject/Title and Client Organization.");
      return;
    }
    const cleanActionItems = actionItems.filter((a) => a.task && a.task.trim());
    onSave({
      id: initial?.id || `mom_${uid()}`,
      title: title.trim(),
      date,
      time: time.trim(),
      duration: duration.trim(),
      clientOrg: clientOrg.trim(),
      clientAttendees: clientAttendees.trim(),
      internalAttendees,
      mode,
      category,
      status,
      notes: notes.trim(),
      decisions: decisions.trim(),
      actionItems: cleanActionItems,
      createdBy: initial?.createdBy || currentUser?.name || "Sudhanshu Khande",
      createdAt: initial?.createdAt || todayISO(),
      updatedAt: todayISO(),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxHeight: "78vh", overflowY: "auto", paddingRight: 6 }}>
      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#ff6479",
            fontSize: 12,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Section 1: Meeting Meta */}
      <FormField label="Meeting Subject / Discussion Title *">
        <input
          style={{ ...darkInputStyle, fontSize: 13 }}
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(""); }}
          placeholder="e.g. ZP Pune — Revenue Assessment & CESS Calculation Rules Review"
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
        <FormField label="Meeting Date *">
          <input
            type="date"
            style={darkInputStyle}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
        <FormField label="Start Time">
          <input
            style={darkInputStyle}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 11:00 AM"
          />
        </FormField>
        <FormField label="Duration">
          <input
            style={darkInputStyle}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 1 Hour, 45m"
          />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormField label="Meeting Mode / Channel">
          <SelectInput value={mode} onChange={setMode} options={MODES} />
        </FormField>
        <FormField label="Discussion Category">
          <SelectInput value={category} onChange={setCategory} options={CATEGORIES} />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10 }}>
        <FormField label="Client Organization / Dept *">
          <input
            style={darkInputStyle}
            value={clientOrg}
            onChange={(e) => { setClientOrg(e.target.value); setError(""); }}
            placeholder="e.g. Zilla Parishad Pune (Finance & Accounts)"
          />
        </FormField>
        <FormField label="MOM Approval Status">
          <SelectInput value={status} onChange={setStatus} options={MOM_STATUSES} />
        </FormField>
      </div>

      <FormField label="Client Side Attendees">
        <input
          style={darkInputStyle}
          value={clientAttendees}
          onChange={(e) => setClientAttendees(e.target.value)}
          placeholder="e.g. Mr. Sachin Patil (Addl. CEO), Mr. Deshmukh (CAO), Smt. Joshi (IT Lead)"
        />
      </FormField>

      <FormField label="Internal Team Attendees (Select Present)">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {userList.map((u) => {
            const isSelected = internalAttendees.includes(u.name);
            return (
              <button
                key={u.id || u.username}
                type="button"
                onClick={() => toggleAttendee(u.name)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  border: isSelected ? "1px solid #ff334b" : "1px solid rgba(255,255,255,0.12)",
                  background: isSelected ? "rgba(255, 51, 75, 0.18)" : "rgba(255,255,255,0.04)",
                  color: isSelected ? "#ff6479" : (isLight ? "#475569" : "#cbd5e1"),
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: u.avatar || "#38bdf8", color: "#fff", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {(u.name || "U").charAt(0)}
                </div>
                <span>{u.name}</span>
                {isSelected && <span style={{ fontSize: 9 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Section 2: Discussion Points & Decisions */}
      <FormField label="Key Discussion Points & Discussion Minutes (Bulleted or Numbered)">
        <textarea
          style={{ ...darkInputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.4 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record core business and operational points discussed with the client...&#10;1. Reviewed property tax calculation logic&#10;2. Addressed CESS surcharge rounding rules..."
        />
      </FormField>

      <FormField label="Decisions Taken & Approvals Ratified">
        <textarea
          style={{ ...darkInputStyle, minHeight: 70, resize: "vertical", lineHeight: 1.4, borderLeft: "3px solid #22c55e" }}
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
          placeholder="Explicit agreements, approved formulas, deployment dates, or signed-off policies...&#10;1. 2% CESS will be computed on base tax and rounded up to nearest whole rupee&#10;2. UAT sign-off date set to Friday..."
        />
      </FormField>

      {/* Section 3: Action Items */}
      <div style={{ marginTop: 16, marginBottom: 8, borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckSquare size={15} color="#38bdf8" /> Action Items & Deliverables ({actionItems.length})
          </div>
          <button
            type="button"
            onClick={addActionItem}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              color: "#38bdf8",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Plus size={12} /> Add Action Item
          </button>
        </div>

        {actionItems.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.02)",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: 8,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginTop: 6 }}>#{idx + 1}</span>
              <div style={{ flex: 1 }}>
                <input
                  style={{ ...darkInputStyle, marginBottom: 6, fontSize: 12.5 }}
                  value={item.task}
                  onChange={(e) => updateActionItem(item.id, "task", e.target.value)}
                  placeholder="Action item task description..."
                />
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
                  <div>
                    <SelectInput
                      value={item.owner}
                      onChange={(v) => updateActionItem(item.id, "owner", v)}
                      options={userList.map((u) => u.name)}
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      style={{ ...darkInputStyle, padding: "5px 8px", fontSize: 11 }}
                      value={item.dueDate || todayISO()}
                      onChange={(e) => updateActionItem(item.id, "dueDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <SelectInput
                      value={item.priority || "Medium"}
                      onChange={(v) => updateActionItem(item.id, "priority", v)}
                      options={["Critical", "High", "Medium", "Low"]}
                    />
                  </div>
                  <div>
                    <SelectInput
                      value={item.status || "Pending"}
                      onChange={(v) => updateActionItem(item.id, "status", v)}
                      options={["Pending", "In Progress", "Done"]}
                    />
                  </div>
                  <IconButton onClick={() => removeActionItem(item.id)} variant="danger" title="Remove action item">
                    <Trash2 size={13} />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn-ghost-dark"
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-red-gradient"
          style={{ padding: "9px 24px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <ClipboardList size={14} /> Save Meeting Minutes (MOM)
        </button>
      </div>
    </form>
  );
}

/* ---------------------------- Clean Management Login View ---------------------------- */

function LoginScreen({ onLogin, theme = "dark", toggleTheme, users }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const activeUsers = (() => {
    if (Array.isArray(users) && users.length > 0) return users;
    try {
      const cached = JSON.parse(localStorage.getItem("zpbdms_users") || "[]");
      if (Array.isArray(cached) && cached.length > 0) return mergeUsersWithDefaults(cached);
    } catch (e) {}
    return TEAM_ROSTER;
  })();

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Match either by username, full name, dot-notation, compact, or role (case-insensitive)
    const foundUser = activeUsers.find((u) => {
      const uName = (u.name || "").toLowerCase();
      const uUser = (u.username || "").toLowerCase();
      const uRole = (u.role || "").toLowerCase();
      const uNormalized = uName.replace(/\s+/g, ".");
      const uCompact = uName.replace(/\s+/g, "");
      const matchIdentity =
        uUser === cleanUser ||
        uName === cleanUser ||
        uNormalized === cleanUser ||
        uCompact === cleanUser ||
        uRole === cleanUser;
      return matchIdentity && u.password === cleanPass;
    });

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError("Invalid username or password. Access denied.");
    }
  };

  const isLight = theme === "light";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isLight ? "#f1f5f9" : "#07080c",
        padding: 20,
        position: "relative",
      }}
    >
      <div className="ambient-bg">
        <div className="cyber-grid" />
      </div>

      {/* Floating Theme Toggle (Top-Right Corner) */}
      {toggleTheme && (
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 20,
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
            background: isLight ? "#ffffff" : "rgba(15, 18, 28, 0.85)",
            color: isLight ? "#475569" : "#fbbf24",
            cursor: "pointer",
            padding: "8px 14px",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
            transition: "all 0.15s ease",
          }}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Moon size={15} color="#475569" /> : <Sun size={15} color="#fbbf24" />}
          <span>{isLight ? "Light Theme" : "Dark Theme"}</span>
        </button>
      )}

      {/* Floating Developer Watermark (Bottom-Right Corner) */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: isLight ? "#64748b" : "#94a3b8",
          zIndex: 10,
        }}
      >
        <Sparkles size={13} color="#ff334b" />
        <span>Developed and Architecture by <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>Sudhanshu Khande</strong></span>
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
          boxShadow: isLight
            ? "0 20px 50px rgba(0, 0, 0, 0.08), 0 0 25px rgba(255, 51, 75, 0.08)"
            : "0 25px 65px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 51, 75, 0.15)",
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
            <Landmark size={28} />
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: isLight ? "#0f172a" : "#ffffff",
              letterSpacing: "0.5px",
            }}
          >
            Management
          </div>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: isLight ? "#475569" : "#94a3b8" }}>
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
                placeholder="Enter username (e.g. sudhanshu, snehal, sankalp, rutuja)"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  padding: "11px 14px 11px 38px",
                  borderRadius: 8,
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: isLight ? "#ffffff" : "rgba(11, 14, 23, 0.88)",
                  color: isLight ? "#0f172a" : "#ffffff",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
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
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  padding: "11px 14px 11px 38px",
                  borderRadius: 8,
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: isLight ? "#ffffff" : "rgba(11, 14, 23, 0.88)",
                  color: isLight ? "#0f172a" : "#ffffff",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          </FormField>

          {error && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#ff6479",
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-red-gradient"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 14,
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Access Portal <ArrowRight size={16} />
          </button>
        </form>
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
              <Landmark size={14} color="#ff334b" /> MAHARASHTRA ZILLA PARISHAD BDMS
            </div>

            {/* Massive Glowing Title */}
            <h1
              className="holographic-text"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: "1px",
                margin: "0 0 10px 0",
                textTransform: "uppercase",
                filter: "drop-shadow(0 0 25px rgba(255, 51, 75, 0.7))",
              }}
            >
              WELCOME TO ZPBDMS MANAGEMENT PORTAL
            </h1>

            {/* Sub-banner with smaller architecture credit */}
            <div
              style={{
                fontSize: 13.5,
                color: "#94a3b8",
                fontWeight: 500,
                letterSpacing: "0.5px",
                marginBottom: 22,
              }}
            >
              Developed and Architecture by{" "}
              <strong style={{ color: "#ffffff", fontWeight: 700 }}>Sudhanshu Khande</strong>
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
      const cachedUsers = (() => {
        try {
          const list = JSON.parse(localStorage.getItem("zpbdms_users") || "[]");
          if (Array.isArray(list) && list.length > 0) return mergeUsersWithDefaults(list);
        } catch (e) {}
        return TEAM_ROSTER;
      })();
      const match = cachedUsers.find(
        (u) =>
          (parsed.username && u.username?.toLowerCase() === parsed.username?.toLowerCase()) ||
          (parsed.name && u.name?.toLowerCase() === parsed.name?.toLowerCase())
      );
      return match || (parsed?.username ? parsed : null);
    } catch (e) {
      return null;
    }
  });

  const [confirmDelete, setConfirmDelete] = useState(null);
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
  const [billFilterStatus, setBillFilterStatus] = useState("All Districts");
  const [billSearch, setBillSearch] = useState("");
  const saveTimer = useRef(null);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("zpbdms_theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });
  const isLight = theme === "light";

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("zpbdms_theme", next);
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("zpbdms_theme", theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    let hasAutoMigratedDistricts = false;
    let hasAutoMigratedBills = false;
    let hasAutoMigratedUsers = false;
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

          // Auto-migrate District Bills if not yet stored or incomplete
          const existingBills = Array.isArray(fetched.districtBills) ? fetched.districtBills : [];
          const fullDistrictBills = mergeDistrictBillsWithDefaults(existingBills);
          if (!hasAutoMigratedBills && (!fetched.districtBills || existingBills.length < fullDistrictBills.length)) {
            hasAutoMigratedBills = true;
            setDoc(DOC_REF(), { districtBills: fullDistrictBills }, { merge: true }).catch((err) =>
              console.warn("Auto-sync district bills to Firestore error:", err)
            );
          }

          // Auto-migrate Users if not yet stored or incomplete
          const existingUsers = Array.isArray(fetched.users) ? fetched.users : [];
          const fullUsers = mergeUsersWithDefaults(existingUsers);
          if (!hasAutoMigratedUsers && (!fetched.users || existingUsers.length < fullUsers.length)) {
            hasAutoMigratedUsers = true;
            setDoc(DOC_REF(), { users: fullUsers }, { merge: true }).catch((err) =>
              console.warn("Auto-sync users to Firestore error:", err)
            );
          }

          try {
            localStorage.setItem("zpbdms_users", JSON.stringify(fullUsers));
          } catch (e) {}

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
            districtBills: fullDistrictBills,
            users: fullUsers,
            auditLogs: Array.isArray(fetched.auditLogs) ? fetched.auditLogs : [],
            notifications: Array.isArray(fetched.notifications) ? fetched.notifications : [],
            moms: Array.isArray(fetched.moms) && fetched.moms.length > 0 ? fetched.moms : seedMOMs(),
            districtFlows:
              Array.isArray(fetched.districtFlows) && fetched.districtFlows.length > 0
                ? fetched.districtFlows
                : seedDistrictFlows(),
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
    return <LoginScreen onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} users={data?.users} />;
  }

  if (connected === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isLight ? "#f1f5f9" : "#07080c",
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
    const itemWithReporter = {
      ...item,
      reportedBy: item.reportedBy || currentUser?.name || "Sudhanshu Khande",
    };
    const updatedIssues = addOrUpdate(data?.issues || [], itemWithReporter, modal?.editing?.id);

    const newNotifications = [];

    // Notify assignee if someone else is assigned
    if (item.assignee && item.assignee !== currentUser?.name) {
      newNotifications.push({
        id: uid(),
        recipient: item.assignee,
        sender: currentUser?.name || "Lead",
        title: isNew ? "New Issue Assignment" : "Issue Reassigned",
        message: `${currentUser?.name} assigned issue "${item.title}" to you (${item.priority} Priority).`,
        type: "issue",
        refId: targetId,
        createdAt: formatTimeNow(),
        read: false,
      });
    }

    // If marked Resolved, notify the reporter/creator
    if (item.status === "Resolved") {
      const reporter = item.reportedBy || item.assignedBy || "Sudhanshu Khande";
      if (reporter && reporter !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: reporter,
          sender: currentUser?.name || "Team Member",
          title: `Issue Resolved: ${item.title}`,
          message: `${currentUser?.name} marked this issue as Resolved.`,
          type: "issue",
          refId: targetId,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
    }

    persist({
      ...data,
      issues: updatedIssues,
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
    });
    setModal(null);
  };

  const saveTask = (item) => {
    const isNew = !modal?.editing?.id;
    const targetId = modal?.editing?.id || uid();
    const itemWithAssigner = {
      ...item,
      assignedBy: item.assignedBy || currentUser?.name || "Sudhanshu Khande",
    };
    const updatedTasks = addOrUpdate(data?.tasks || [], itemWithAssigner, modal?.editing?.id);

    const newNotifications = [];

    // Notify assignee if someone else is assigned
    if (item.assignee && item.assignee !== currentUser?.name) {
      newNotifications.push({
        id: uid(),
        recipient: item.assignee,
        sender: currentUser?.name || "Lead",
        title: isNew ? "New Directive Assigned" : "Directive Updated",
        message: `${currentUser?.name} assigned directive "${item.title}" to you. Target: ${item.dueDate || "Immediate"}.`,
        type: "task",
        refId: targetId,
        createdAt: formatTimeNow(),
        read: false,
      });
    }

    // When task is marked Done, notify the one who assigned the task
    if (item.status === "Done") {
      const assigner = item.assignedBy || "Sudhanshu Khande";
      if (assigner && assigner !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: assigner,
          sender: currentUser?.name || "Team Member",
          title: `Task Completed: ${item.title}`,
          message: `${currentUser?.name} marked task directive as Done.`,
          type: "task",
          refId: targetId,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
    }

    persist({
      ...data,
      tasks: updatedTasks,
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
    });
    setModal(null);
  };

  const saveDistrict = (item) => {
    persist({ ...data, districts: addOrUpdate(data?.districts || [], item, modal?.editing?.id) });
    setModal(null);
  };

  const isSudhanshu =
    currentUser?.username?.toLowerCase() === "sudhanshu" ||
    currentUser?.name?.toLowerCase().includes("sudhanshu");

  const logActivity = (action, entityType, entityTitle, details, baseData = null) => {
    const activeData = baseData || data;
    const newLog = {
      id: uid(),
      timestamp: new Date().toISOString(),
      displayTime: formatTimeNow(),
      actorName: currentUser?.name || "System",
      actorRole: currentUser?.role || "Admin",
      action,
      entityType,
      entityTitle: entityTitle || "Entity",
      details: details || "",
    };
    const updatedLogs = [newLog, ...(activeData?.auditLogs || [])].slice(0, 200);
    return updatedLogs;
  };

  const saveTestPoint = (item) => {
    const isEdit = !!modal?.editing?.id;
    const targetId = modal?.editing?.id || uid();
    const pointWithAssigner = {
      ...item,
      assignedBy: item.assignedBy || currentUser?.name || "Sudhanshu Khande",
    };
    const updatedTestPoints = addOrUpdate(data?.testPoints || [], pointWithAssigner, modal?.editing?.id);

    const newNotifications = [];

    // Notify Developer of assigned task
    if (item.assignedDev && item.assignedDev !== currentUser?.name) {
      newNotifications.push({
        id: uid(),
        recipient: item.assignedDev,
        sender: currentUser?.name || "Lead",
        title: `New Task Assigned: ${item.code || "Directive"}`,
        message: `${currentUser?.name} (${currentUser?.role || "Lead"}) assigned ${item.code} (${item.module}) to you. Estimated: ${item.estimatedTime || "4 Hours"}.`,
        type: "test_point",
        refId: targetId,
        createdAt: formatTimeNow(),
        read: false,
      });
    }

    // Also when tester assigns any task to Developers, notify/log for tester as requested!
    const isTester = (currentUser?.role || "").toLowerCase().includes("tester") || currentUser?.name?.toLowerCase().includes("rutuja");
    if (isTester) {
      newNotifications.push({
        id: uid(),
        recipient: currentUser.name,
        sender: "System",
        title: `Directive Dispatched to Developer`,
        message: `You assigned ${item.code || "Test Point"} (${item.module}) to developer ${item.assignedDev || "Developer"}.`,
        type: "test_point",
        refId: targetId,
        createdAt: formatTimeNow(),
        read: false,
      });
    } else if (item.tester && item.tester !== currentUser?.name) {
      // Notify assigned QA tester
      newNotifications.push({
        id: uid(),
        recipient: item.tester,
        sender: currentUser?.name || "BA",
        title: `Assigned QA Tester: ${item.code || "Directive"}`,
        message: `${currentUser?.name} assigned you as QA Tester for ${item.code}. Developer: ${item.assignedDev || "None"}.`,
        type: "test_point",
        refId: targetId,
        createdAt: formatTimeNow(),
        read: false,
      });
    }

    const nextLogs = logActivity(
      isEdit ? "UPDATE" : "CREATE",
      "Dev-Test Matrix Point",
      item.code || item.scenario,
      `Assigned Dev: ${item.assignedDev || "None"} · Dev Status: ${item.devStatus || "Pending"} · Tester: ${item.tester || "None"} · Status: ${item.status || "Untested"}`
    );
    persist({
      ...data,
      testPoints: updatedTestPoints,
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
      auditLogs: nextLogs,
    });
    setModal(null);
  };

  const promptDeleteIssue = (id) => {
    const item = (data?.issues || []).find((x) => x.id === id);
    setConfirmDelete({
      itemType: "Issue Record",
      itemTitle: item?.title || "Issue",
      details: `Module: ${item?.module || "N/A"} · District: ${item?.district || "N/A"} · Assignee: ${item?.assignee || "None"}`,
      onConfirm: () => {
        const nextIssues = (data?.issues || []).filter((x) => x.id !== id);
        const nextLogs = logActivity(
          "DELETE",
          "Issue",
          item?.title || id,
          `Deleted issue [${item?.priority || "Normal"}]. Snapshot: ${JSON.stringify(item || {})}`
        );
        persist({ ...data, issues: nextIssues, auditLogs: nextLogs });
        setConfirmDelete(null);
      },
    });
  };

  const promptDeleteTask = (id) => {
    const item = (data?.tasks || []).find((x) => x.id === id);
    setConfirmDelete({
      itemType: "Task Directive",
      itemTitle: item?.title || "Task",
      details: `Module: ${item?.module || "N/A"} · Assignee: ${item?.assignee || "None"} · Status: ${item?.status || "To Do"}`,
      onConfirm: () => {
        const nextTasks = (data?.tasks || []).filter((x) => x.id !== id);
        const nextLogs = logActivity(
          "DELETE",
          "Task",
          item?.title || id,
          `Deleted task directive. Snapshot: ${JSON.stringify(item || {})}`
        );
        persist({ ...data, tasks: nextTasks, auditLogs: nextLogs });
        setConfirmDelete(null);
      },
    });
  };

  const promptDeleteDistrict = (id) => {
    const item = (data?.districts || []).find((x) => x.id === id);
    setConfirmDelete({
      itemType: "District Jurisdiction",
      itemTitle: item?.name || "District",
      details: `Stage: ${item?.stage || "Planning"} · Bills Done: ${item?.billsDone || 0}`,
      onConfirm: () => {
        const nextDistricts = (data?.districts || []).filter((x) => x.id !== id);
        const nextLogs = logActivity(
          "DELETE",
          "District",
          item?.name || id,
          `Deleted district deployment. Snapshot: ${JSON.stringify(item || {})}`
        );
        persist({ ...data, districts: nextDistricts, auditLogs: nextLogs });
        setConfirmDelete(null);
      },
    });
  };

  const promptDeleteTestPoint = (tp) => {
    setConfirmDelete({
      itemType: "Dev-Test Matrix Point",
      itemTitle: `[${tp.code || "Point"}] ${tp.scenario || ""}`,
      details: `Point: ${tp.scenario || "N/A"}\nAssigned Dev: ${tp.assignedDev || "Unassigned"}\nStatus: ${tp.status || "Untested"}\nTester: ${tp.tester || "Unassigned"}`,
      onConfirm: () => {
        const nextPoints = (data?.testPoints || []).filter((t) => t.id !== tp.id);
        const nextLogs = logActivity(
          "DELETE",
          "Dev-Test Matrix Point",
          tp.code || tp.scenario,
          `Deleted matrix point. Full Data Snapshot: ${JSON.stringify(tp)}`
        );
        persist({ ...data, testPoints: nextPoints, auditLogs: nextLogs });
        setConfirmDelete(null);
      },
    });
  };

  const promptDeleteUser = (u) => {
    if (u.username?.toLowerCase() === "sudhanshu" || u.name?.toLowerCase().includes("sudhanshu")) {
      alert("System Architect 'Sudhanshu' is the primary administrator and cannot be deleted.");
      return;
    }
    setConfirmDelete({
      itemType: "Member Account",
      itemTitle: `${u.name} (@${u.username})`,
      details: `Role: ${u.role} · Email: ${u.email || "None"}`,
      onConfirm: () => {
        const nextUsers = (data?.users || []).filter((x) => x.id !== u.id && x.username !== u.username);
        const nextLogs = logActivity(
          "DELETE",
          "User Account",
          `${u.name} (@${u.username})`,
          `Removed team member account with role: ${u.role}`
        );
        try {
          localStorage.setItem("zpbdms_users", JSON.stringify(nextUsers));
        } catch (e) {}
        persist({ ...data, users: nextUsers, auditLogs: nextLogs });
        setConfirmDelete(null);
      },
    });
  };

  const saveUser = (userItem) => {
    const currentUsers = data?.users || mergeUsersWithDefaults([]);
    const isEdit = !!modal?.editing?.id;
    let updatedUsers;
    if (isEdit) {
      updatedUsers = currentUsers.map((u) => (u.id === modal.editing.id ? { ...u, ...userItem } : u));
    } else {
      const newUser = {
        ...userItem,
        id: userItem.id || `u_${uid()}`,
        createdAt: todayISO(),
      };
      updatedUsers = [...currentUsers, newUser];
    }
    try {
      localStorage.setItem("zpbdms_users", JSON.stringify(updatedUsers));
    } catch (e) {}
    const nextLogs = logActivity(
      isEdit ? "UPDATE" : "CREATE",
      "User Account",
      `${userItem.name} (${userItem.role})`,
      `Username: @${userItem.username} · Role: ${userItem.role}`
    );
    persist({ ...data, users: updatedUsers, auditLogs: nextLogs });
    setModal(null);
  };

  const removeIssue = (id) => promptDeleteIssue(id);
  const removeTask = (id) => promptDeleteTask(id);
  const removeDistrict = (id) => promptDeleteDistrict(id);
  const removeTestPoint = (tpOrId) => {
    if (typeof tpOrId === "object" && tpOrId !== null) {
      promptDeleteTestPoint(tpOrId);
    } else {
      const target = (data?.testPoints || []).find((t) => t.id === tpOrId);
      if (target) promptDeleteTestPoint(target);
      else persist({ ...data, testPoints: (data?.testPoints || []).filter((t) => t.id !== tpOrId) });
    }
  };

  const cycleIssueStatus = (item) => {
    const next = ISSUE_STATUSES[(ISSUE_STATUSES.indexOf(item.status) + 1) % ISSUE_STATUSES.length];
    const newNotifications = [];
    if (next === "Resolved") {
      const reporter = item.reportedBy || item.assignedBy || "Sudhanshu Khande";
      if (reporter && reporter !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: reporter,
          sender: currentUser?.name || "Team Member",
          title: `Issue Resolved: ${item.title}`,
          message: `${currentUser?.name} marked this issue as Resolved.`,
          type: "issue",
          refId: item.id,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
    }
    persist({
      ...data,
      issues: (data?.issues || []).map((x) => (x.id === item.id ? { ...x, status: next } : x)),
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
    });
  };

  const cycleTaskStatus = (item) => {
    const next = TASK_STATUSES[(TASK_STATUSES.indexOf(item.status) + 1) % TASK_STATUSES.length];
    const newNotifications = [];
    if (next === "Done") {
      const assigner = item.assignedBy || "Sudhanshu Khande";
      if (assigner && assigner !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: assigner,
          sender: currentUser?.name || "Team Member",
          title: `Task Completed: ${item.title}`,
          message: `${currentUser?.name} marked task directive as Done.`,
          type: "task",
          refId: item.id,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
    }
    persist({
      ...data,
      tasks: (data?.tasks || []).map((x) => (x.id === item.id ? { ...x, status: next } : x)),
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
    });
  };

  const cycleTestPointStatus = (tp) => {
    const next = TEST_STATUSES[(TEST_STATUSES.indexOf(tp.status) + 1) % TEST_STATUSES.length];
    const nextLogs = logActivity("UPDATE", "Dev-Test Matrix Point", tp.code || tp.scenario, `Cycled test status to ${next}`);
    const newNotifications = [];

    // If marked Failed or Retest:
    if (next === "Failed" || next === "Retest") {
      // 1. Notify Developer that fix / retest is required
      if (tp.assignedDev && tp.assignedDev !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: tp.assignedDev,
          sender: currentUser?.name || "Tester",
          title: `QA Retest Required: ${tp.code}`,
          message: `${currentUser?.name} marked test point as "${next}". Retest remarks: ${tp.actualResult || tp.finalRetestRemarks || "Verification failed, please inspect."}`,
          type: "test_point",
          refId: tp.id,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
      // 2. Confirmation shown to tester as requested
      newNotifications.push({
        id: uid(),
        recipient: currentUser?.name,
        sender: "System",
        title: `Retest Directive Sent: ${tp.code}`,
        message: `Status marked as "${next}". Retest defect alert sent to developer ${tp.assignedDev || "Developer"}.`,
        type: "test_point",
        refId: tp.id,
        createdAt: formatTimeNow(),
        read: false,
      });
      // 3. Notify Assigner (BA)
      const assigner = tp.assignedBy || "Sudhanshu Khande";
      if (assigner && assigner !== currentUser?.name && assigner !== tp.assignedDev) {
        newNotifications.push({
          id: uid(),
          recipient: assigner,
          sender: currentUser?.name || "Tester",
          title: `Defect Flagged on Matrix: ${tp.code}`,
          message: `${currentUser?.name} marked "${next}" on ${tp.code} (Dev: ${tp.assignedDev || "Unassigned"}).`,
          type: "test_point",
          refId: tp.id,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
    } else if (next === "Passed") {
      // 1. Notify Developer
      if (tp.assignedDev && tp.assignedDev !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: tp.assignedDev,
          sender: currentUser?.name || "Tester",
          title: `QA Verified & Passed: ${tp.code}`,
          message: `Great job! ${currentUser?.name} verified and marked ${tp.code} as PASSED.`,
          type: "test_point",
          refId: tp.id,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
      // 2. Notify Assigner (BA)
      const assigner = tp.assignedBy || "Sudhanshu Khande";
      if (assigner && assigner !== currentUser?.name) {
        newNotifications.push({
          id: uid(),
          recipient: assigner,
          sender: currentUser?.name || "Tester",
          title: `Point Passed Verification: ${tp.code}`,
          message: `${currentUser?.name} verified and passed ${tp.code}.`,
          type: "test_point",
          refId: tp.id,
          createdAt: formatTimeNow(),
          read: false,
        });
      }
    }

    persist({
      ...data,
      testPoints: (data?.testPoints || []).map((t) => (t.id === tp.id ? { ...t, status: next, updatedAt: todayISO() } : t)),
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
      auditLogs: nextLogs,
    });
  };

  const resolveTestPoint = (id, resolution) => {
    const target = (data?.testPoints || []).find((t) => t.id === id);
    const updatedPoints = (data?.testPoints || []).map((t) =>
      t.id === id ? { ...t, ...resolution, updatedAt: todayISO() } : t
    );
    const assignerName = target?.assignedBy || "Sudhanshu Khande";
    const testerName = target?.tester || "Rutuja";

    const newNotifications = [];

    // 1. Notify the one who assigned the task (BA / Assigner)
    if (assignerName && assignerName !== currentUser?.name) {
      newNotifications.push({
        id: uid(),
        recipient: assignerName,
        sender: currentUser?.name || "Developer",
        title: `Task Resolved by Developer: ${target?.code || "Test Point"}`,
        message: `${currentUser?.name} marked "${resolution.devStatus || "Resolved / Ready for Retest"}": ${resolution.devRemark || "Ready for QA retest and verification."}`,
        type: "test_point",
        refId: id,
        createdAt: formatTimeNow(),
        read: false,
      });
    }

    // 2. Notify the assigned tester that task is ready for retest
    if (testerName && testerName !== currentUser?.name && testerName !== assignerName) {
      newNotifications.push({
        id: uid(),
        recipient: testerName,
        sender: currentUser?.name || "Developer",
        title: `Ready for Retest: ${target?.code || "Test Point"}`,
        message: `${currentUser?.name} resolved this directive. Ready for QA verification: ${resolution.devRemark || "Please verify on staging."}`,
        type: "test_point",
        refId: id,
        createdAt: formatTimeNow(),
        read: false,
      });
    }

    const nextLogs = logActivity(
      "UPDATE",
      "Dev-Test Matrix Point",
      target?.code || "Test Point",
      `Status updated to: ${resolution.devStatus || "Updated"}. Remarks: ${resolution.devRemark || ""}`
    );
    persist({
      ...data,
      testPoints: updatedPoints,
      notifications: [...newNotifications, ...(data.notifications || [])].slice(0, 150),
      auditLogs: nextLogs,
    });
    setModal(null);
  };

  const updateTestPointTimer = (id, estimatedTime) => {
    const target = (data?.testPoints || []).find((t) => t.id === id);
    const updatedPoints = (data?.testPoints || []).map((t) =>
      t.id === id ? { ...t, estimatedTime, updatedAt: todayISO() } : t
    );
    const nextLogs = logActivity(
      "UPDATE",
      "Dev-Test Matrix Point",
      target?.code || "Test Point",
      `Set Estimated Dev Duration / Timer to: ${estimatedTime}`
    );
    persist({ ...data, testPoints: updatedPoints, auditLogs: nextLogs });
  };

  const promptDeleteMOM = (mom) => {
    setConfirmDelete({
      itemType: "Minutes of Meeting (MOM)",
      itemTitle: mom.title || "Meeting Record",
      details: `Date: ${mom.date || "N/A"} · Client: ${mom.clientOrg || "N/A"}\nAttendees: ${mom.clientAttendees || "N/A"}\nDecisions: ${mom.decisions || "None"}\nAction Items: ${(mom.actionItems || []).length} items`,
      onConfirm: () => {
        const nextMoms = (data?.moms || []).filter((m) => m.id !== mom.id);
        const nextLogs = logActivity(
          "DELETE",
          "MOM Record",
          mom.title || mom.id,
          `Deleted MOM. Full Data Snapshot: ${JSON.stringify(mom)}`
        );
        persist({ ...data, moms: nextMoms, auditLogs: nextLogs });
        setConfirmDelete(null);
      },
    });
  };

  const saveMOM = (item) => {
    const isEdit = !!modal?.editing?.id;
    const updatedMOMs = addOrUpdate(data?.moms || [], item, modal?.editing?.id);
    const nextLogs = logActivity(
      isEdit ? "UPDATE" : "CREATE",
      "MOM Record",
      item.title || "Meeting Minutes",
      `Client: ${item.clientOrg || "N/A"} · Date: ${item.date || "N/A"} · Status: ${item.status || "Draft"} · Action Items: ${(item.actionItems || []).length}`
    );
    persist({ ...data, moms: updatedMOMs, auditLogs: nextLogs });
    setModal(null);
  };

  const handleToggleMOMActionItem = (momId, actionItemId) => {
    const nextMoms = (data?.moms || []).map((m) => {
      if (m.id !== momId) return m;
      const updatedActionItems = (m.actionItems || []).map((ai) => {
        if (ai.id !== actionItemId) return ai;
        const nextStatus = ai.status === "Done" ? "Pending" : ai.status === "Pending" ? "In Progress" : "Done";
        return { ...ai, status: nextStatus };
      });
      return { ...m, actionItems: updatedActionItems, updatedAt: todayISO() };
    });
    persist({ ...data, moms: nextMoms });
  };

  const handlePushActionItemToMatrix = (mom, actionItem) => {
    const newPoint = {
      id: `tp_${uid()}`,
      code: `MOM-${Math.floor(100 + Math.random() * 900)}`,
      module: "MOM Directive",
      scenario: `[MOM Action - ${mom.clientOrg}] ${actionItem.task}`,
      assignedDate: todayISO(),
      assignedDev: actionItem.owner || "Sankalp",
      devStatus: "Pending Dev Fix",
      tester: "Rutuja",
      status: "Untested",
      actualResult: `Originated from client discussion on ${mom.date} (${mom.title}). Due: ${actionItem.dueDate || "TBD"}`,
      devRemark: `Target Due Date: ${actionItem.dueDate || "N/A"} · Priority: ${actionItem.priority || "Medium"}`,
      finalRetestRemarks: "",
      severity: actionItem.priority === "Critical" ? "Critical" : actionItem.priority === "High" ? "Major" : "Normal",
      estimatedTime: "1 Day",
      createdAt: todayISO(),
      updatedAt: todayISO(),
    };

    const nextPoints = [newPoint, ...(data?.testPoints || [])];
    const nextMoms = (data?.moms || []).map((m) => {
      if (m.id !== mom.id) return m;
      return {
        ...m,
        actionItems: (m.actionItems || []).map((ai) => (ai.id === actionItem.id ? { ...ai, pushedToMatrix: true } : ai)),
      };
    });
    const nextLogs = logActivity(
      "CREATE",
      "Dev-Test Matrix Point",
      newPoint.code,
      `Converted from MOM Action Item: "${actionItem.task}" (Client: ${mom.clientOrg})`
    );
    persist({ ...data, testPoints: nextPoints, moms: nextMoms, auditLogs: nextLogs });
    alert(`Action Item successfully pushed to Dev-Test Execution Matrix as ${newPoint.code}!`);
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

  // District Bill Matrix filtering & calculations
  const allDistrictBills = data?.districtBills || BILL_TRACKER_DEFAULT;
  const totalBillsCount = allDistrictBills.reduce(
    (acc, b) => acc + (Number(b.gatheringDetails || 0) + Number(b.inProcess || 0) + Number(b.completed || 0)),
    0
  );
  const gatheringBillsCount = allDistrictBills.reduce((acc, b) => acc + Number(b.gatheringDetails || 0), 0);
  const inProcessBillsCount = allDistrictBills.reduce((acc, b) => acc + Number(b.inProcess || 0), 0);
  const completedBillsCount = allDistrictBills.reduce((acc, b) => acc + Number(b.completed || 0), 0);

  const filteredDistrictBills = allDistrictBills.filter((b) => {
    const total = Number(b.gatheringDetails || 0) + Number(b.inProcess || 0) + Number(b.completed || 0);
    const completed = Number(b.completed || 0);
    const inProc = Number(b.inProcess || 0);
    const gathering = Number(b.gatheringDetails || 0);

    if (billFilterStatus === "100% Completed" && (total === 0 || completed !== total)) return false;
    if (billFilterStatus === "In Process" && inProc === 0) return false;
    if (billFilterStatus === "Gathering Details" && gathering === 0) return false;
    if (billFilterStatus === "Zero Bills" && total > 0) return false;
    if (billFilterStatus === "Active Bills (>0)" && total === 0) return false;

    if (billSearch.trim()) {
      const bq = billSearch.trim().toLowerCase();
      const haystack = [b.district, b.notes || "", String(total), String(completed), String(inProc), String(gathering)]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(bq)) return false;
    }
    return true;
  });

  const saveDistrictBill = (updatedBill) => {
    const gathering = Math.max(0, parseInt(updatedBill.gatheringDetails, 10) || 0);
    const inProcess = Math.max(0, parseInt(updatedBill.inProcess, 10) || 0);
    const completed = Math.max(0, parseInt(updatedBill.completed, 10) || 0);
    const total = gathering + inProcess + completed;

    const withCalc = {
      ...updatedBill,
      gatheringDetails: gathering,
      inProcess: inProcess,
      completed: completed,
      totalBills: total,
      updatedAt: todayISO(),
      lastUpdatedBy: currentUser?.name || "Sudhanshu Khande",
    };
    const currentList = data?.districtBills || BILL_TRACKER_DEFAULT;
    const updatedList = currentList.map((b) => (b.id === updatedBill.id || b.district === updatedBill.district ? withCalc : b));
    persist({ ...data, districtBills: updatedList });
  };

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

  const userRoleLower = (currentUser?.role || "").toLowerCase();
  const isBA =
    isSudhanshu ||
    userRoleLower.includes("analyst") ||
    userRoleLower.includes("ba");
  const isManager = userRoleLower.includes("manager");
  const isCEO = currentUser?.role === "CEO" || userRoleLower.includes("ceo");
  const canAccessMOM = isBA || isManager || isCEO;

  const navItems = [
    { key: "my_desk", label: "My Desk & Tasks", icon: UserCheck, count: myOpenIssues + myPendingTasks, highlight: true },
    { key: "test_hub", label: "Dev-Test Execution Matrix", icon: FileSpreadsheet, count: failedTestPointsCount, isAlert: failedTestPointsCount > 0 },
    ...(canAccessMOM
      ? [
          {
            key: "mom",
            label: "MOM (Minutes of Meeting)",
            icon: ClipboardList,
            count: (data?.moms || []).length,
          },
        ]
      : []),
    { key: "district_flows", label: "District Approval Flows", icon: GitMerge, count: 34, highlight: true },
    { key: "bill_tracker", label: "Bill Tracker Matrix", icon: Receipt, count: totalBillsCount },
    { key: "dashboard", label: "Operations Deck", icon: LayoutGrid },
    { key: "issues", label: "Issues Matrix", icon: AlertTriangle, count: openIssues, isAlert: criticalOpen > 0 },
    { key: "tasks", label: "Task Directives", icon: ListChecks, count: pendingTasks },
    { key: "districts", label: "District Deployments", icon: MapPin, count: (data?.districts || []).length },
  ];

  if (isSudhanshu) {
    navItems.push(
      { key: "master_module", label: "Master Control", icon: Users, count: (data?.users || []).length },
      { key: "audit_logs", label: "Activity Logs", icon: History, count: (data?.auditLogs || []).length }
    );
  }

  return (
    <div
      className={isLight ? "theme-light" : "theme-dark"}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        background: isLight ? "#f1f5f9" : "#08090d",
        color: isLight ? "#0f172a" : "#f1f5f9",
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
          background: isLight
            ? "#ffffff"
            : "linear-gradient(180deg, rgba(13, 16, 26, 0.95) 0%, rgba(8, 10, 17, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          boxShadow: isLight ? "4px 0 24px rgba(0, 0, 0, 0.04)" : "4px 0 24px rgba(0, 0, 0, 0.5)",
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
              <Landmark size={20} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: isLight ? "#0f172a" : "#ffffff",
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
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", fontWeight: 500, letterSpacing: "0.4px", marginTop: 2 }}>
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
            background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.03)",
            border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
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
                  color: isLight ? "#0f172a" : "#ffffff",
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
                  color: isLight ? "#64748b" : "#94a3b8",
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
              Architecture & Development
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1", marginTop: 2 }}>
              Sudhanshu Khande
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
                color: isLight ? "#0f172a" : "#ffffff",
                letterSpacing: "-0.5px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {navItems.find((n) => n.key === tab)?.label}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: isLight ? "#475569" : "#94a3b8" }}>
              {tab === "my_desk"
                ? `Assigned directives and active defects for ${currentUser?.name || "User"}`
                : tab === "test_hub"
                ? "Unified Dev-Test Execution Matrix, lead assignment, developer completion status, and retest log"
                : tab === "mom"
                ? "Minutes of Meeting repository: client discussions, agreed decisions, and date-wise deliverables"
                : tab === "district_flows"
                ? "District-wise department approval hierarchies, headcode routing & stuck bill diagnostics (34 Districts)"
                : tab === "master_module"
                ? "Manage personnel access, register developers, testers, BAs, and managers (Master Admin Only)"
                : tab === "audit_logs"
                ? "Comprehensive tamper-proof audit trail of all matrix edits, deletions, and system actions"
                : tab === "bill_tracker"
                ? "Live district-wise bill progress across all 34 fixed Maharashtra ZP jurisdictions (As of 01-Sep-2026 EOD)"
                : "District rollouts, live defect tracking, and sprint task register"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Theme Switcher Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.04)",
                color: isLight ? "#d97706" : "#fbbf24",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 600,
                boxShadow: isLight ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "none",
                transition: "all 0.15s ease",
              }}
              title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
            >
              {isLight ? <Moon size={14} color="#475569" /> : <Sun size={14} color="#fbbf24" />}
              <span style={{ color: isLight ? "#475569" : "#cbd5e1" }}>
                {isLight ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {/* Live Firestore Sync State Indicator */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: 20,
                background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.04)",
                border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                color: isLight ? "#475569" : "#94a3b8",
                boxShadow: isLight ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "none",
              }}
            >
              <Database size={13} color={saveState === "saving" ? "#f59e0b" : "#ff334b"} />
              {saveState === "saving" && <span style={{ color: "#fbbf24" }}>Syncing to Cloud…</span>}
              {saveState === "saved" && <span style={{ color: "#16a34a" }}>Live Database Synced</span>}
              {saveState === "idle" && <span>Real-time Connected</span>}
            </div>

            {/* In-App Notifications Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                  background: unreadNotifications.length > 0
                    ? "rgba(255, 51, 75, 0.12)"
                    : isLight
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.04)",
                  color: unreadNotifications.length > 0 ? "#ff334b" : isLight ? "#475569" : "#94a3b8",
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  position: "relative",
                  boxShadow: isLight ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "none",
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
                            if (n.type === "test_point") setTab("test_hub");
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
            {tab === "master_module" ? (
              <button
                className="btn-red-gradient"
                onClick={() => setModal({ type: "user" })}
                style={{ padding: "8px 16px" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <UserPlus size={15} /> Add Team Member
                </span>
              </button>
            ) : tab === "audit_logs" ? null : tab === "bill_tracker" ? (
              <button
                className="btn-ghost-dark"
                onClick={() => exportBillsCSV(allDistrictBills)}
                style={{ padding: "8px 16px" }}
                title="Export District Bill Matrix to CSV spreadsheet"
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Download size={14} /> Export CSV
                </span>
              </button>
            ) : tab === "test_hub" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="btn-red-gradient"
                  onClick={() => setModal({ type: "test_point" })}
                  style={{ padding: "8px 16px" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <Plus size={15} /> Add Directive / Point
                  </span>
                </button>
                <button
                  className="btn-ghost-dark"
                  onClick={() => exportTestPointsCSV(allTestPoints)}
                  style={{ padding: "8px 16px" }}
                  title="Export Dev-Test Execution Matrix to CSV spreadsheet"
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
            totalBillsCount={totalBillsCount}
            completedBillsCount={completedBillsCount}
            onGo={setTab}
            onOpenModal={setModal}
          />
        )}

        {tab === "bill_tracker" && (
          <BillTrackerView
            bills={filteredDistrictBills}
            allBills={allDistrictBills}
            onEditBill={(b) => setModal({ type: "edit_bill", editing: b })}
            onExportCSV={() => exportBillsCSV(allDistrictBills)}
            filterStatus={billFilterStatus}
            setFilterStatus={setBillFilterStatus}
            searchQuery={billSearch}
            setSearchQuery={setBillSearch}
            isLight={isLight}
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
            users={data?.users || TEAM_ROSTER}
            onCycleStatus={cycleTestPointStatus}
            onOpenResolve={(tp) => setModal({ type: "dev_resolve", editing: tp })}
            onOpenEdit={(tp) => setModal({ type: "test_point", editing: tp })}
            onQuickTimer={(tp) => setModal({ type: "quick_timer", editing: tp })}
            onDelete={promptDeleteTestPoint}
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
            isLight={isLight}
          />
        )}

        {tab === "mom" && canAccessMOM && (
          <MOMView
            moms={data?.moms || []}
            users={data?.users || TEAM_ROSTER}
            currentUser={currentUser}
            onOpenAdd={() => setModal({ type: "mom" })}
            onOpenEdit={(m) => setModal({ type: "mom", editing: m })}
            onDelete={promptDeleteMOM}
            onToggleActionItem={handleToggleMOMActionItem}
            onPushToTestMatrix={handlePushActionItemToMatrix}
            isLight={isLight}
          />
        )}

        {tab === "district_flows" && (
          <DistrictFlowsView
            flows={data?.districtFlows || []}
            onSaveFlows={(nextFlows, changeMsg) => {
              const nextLogs = logActivity(
                "UPDATE",
                "District Approval Flows",
                "Workflow Hierarchy",
                changeMsg || "Updated department approval flow or headcode mapping"
              );
              persist({ ...data, districtFlows: nextFlows, auditLogs: nextLogs });
            }}
            currentUser={currentUser}
            isSudhanshu={isSudhanshu}
            isManager={isManager}
            isCEO={isCEO}
            isLight={isLight}
          />
        )}

        {tab === "master_module" && isSudhanshu && (
          <MasterModuleView
            users={data?.users || mergeUsersWithDefaults([])}
            onOpenAddUser={() => setModal({ type: "user" })}
            onOpenEditUser={(u) => setModal({ type: "user", editing: u })}
            onDeleteUser={promptDeleteUser}
            currentUser={currentUser}
            isLight={isLight}
          />
        )}

        {tab === "audit_logs" && isSudhanshu && (
          <AuditLogsView
            logs={data?.auditLogs || []}
            isLight={isLight}
          />
        )}

        {/* Corner Branding Footer */}
        <footer
          style={{
            marginTop: 40,
            paddingTop: 16,
            borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            color: isLight ? "#64748b" : "#94a3b8",
            paddingBottom: 10,
          }}
        >
          <div>Maharashtra Zilla Parishad BDMS · Operations & Governance</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} color="#ff334b" />
            Developed and Architecture by <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>Sudhanshu Khande</strong>
          </div>
        </footer>
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
            users={data?.users || TEAM_ROSTER}
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
          <TaskForm
            initial={modal.editing}
            users={data?.users || TEAM_ROSTER}
            onSave={saveTask}
            onCancel={() => setModal(null)}
          />
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
          title={modal.editing ? "Edit Matrix Point" : "Add Dev-Test Matrix Directive"}
          icon={FlaskConical}
          onClose={() => setModal(null)}
        >
          <TestPointForm
            initial={modal.editing}
            users={data?.users || TEAM_ROSTER}
            currentUser={currentUser}
            onSave={saveTestPoint}
            onCancel={() => setModal(null)}
            isLight={isLight}
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
            users={data?.users || TEAM_ROSTER}
            onSave={(resolution) => resolveTestPoint(modal.editing.id, resolution)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.type === "edit_bill" && (
        <Modal
          title={`Update Bill Counts: ${modal.editing?.district || "District"}`}
          icon={Receipt}
          onClose={() => setModal(null)}
        >
          <DistrictBillForm
            initial={modal.editing}
            onSave={(updated) => {
              saveDistrictBill(updated);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
            isLight={isLight}
          />
        </Modal>
      )}

      {modal?.type === "quick_timer" && (
        <Modal
          title={`Set Estimated Duration: ${modal.editing?.code || "Test Point"}`}
          icon={Clock}
          onClose={() => setModal(null)}
        >
          <QuickTimerForm
            initial={modal.editing}
            onSave={(time) => {
              updateTestPointTimer(modal.editing.id, time);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.type === "mom" && (
        <Modal
          title={modal.editing ? "Update Meeting Record (MOM)" : "Record New Client Discussion (MOM)"}
          icon={ClipboardList}
          onClose={() => setModal(null)}
        >
          <MOMForm
            initial={modal.editing}
            users={data?.users || TEAM_ROSTER}
            currentUser={currentUser}
            onSave={saveMOM}
            onCancel={() => setModal(null)}
            isLight={isLight}
          />
        </Modal>
      )}

      {modal?.type === "user" && (
        <Modal
          title={modal.editing ? "Edit Member Account" : "Register Team Member"}
          icon={UserPlus}
          onClose={() => setModal(null)}
        >
          <UserForm
            initial={modal.editing}
            onSave={saveUser}
            onCancel={() => setModal(null)}
            isLight={isLight}
          />
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          itemType={confirmDelete.itemType}
          itemTitle={confirmDelete.itemTitle}
          details={confirmDelete.details}
          onConfirm={confirmDelete.onConfirm}
          onCancel={() => setConfirmDelete(null)}
          isLight={isLight}
        />
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

function Dashboard({
  data,
  openIssues,
  criticalOpen,
  pendingTasks,
  liveDistrictsCount,
  totalBillsCount,
  completedBillsCount,
  onGo,
  onOpenModal,
}) {
  const recentIssues = [...(data?.issues || [])]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 6);

  const totalDistricts = (data?.districts || []).length || 1;
  const rolloutPercentage = Math.round((liveDistrictsCount / totalDistricts) * 100);
  const billsTotal = totalBillsCount ?? (data?.districtBills || BILL_TRACKER_DEFAULT).reduce((acc, b) => acc + (Number(b.gatheringDetails || 0) + Number(b.inProcess || 0) + Number(b.completed || 0)), 0);
  const billsComp = completedBillsCount ?? (data?.districtBills || BILL_TRACKER_DEFAULT).reduce((acc, b) => acc + Number(b.completed || 0), 0);
  const billsPct = billsTotal > 0 ? Math.round((billsComp / billsTotal) * 100) : 0;

  return (
    <div>
      {/* 5 High-Graphic Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
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
        <StatMetricCard
          title="District Bill Tracker"
          value={billsTotal}
          subtitle={`${billsComp} cleared across 34 ZPs (${billsPct}%)`}
          icon={Receipt}
          tone="default"
          onClick={() => onGo("bill_tracker")}
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
    "Point / Directive Description",
    "Date Assigned",
    "Assigned Developer",
    "Dev Completion Status",
    "Assigned Tester",
    "Tester Status",
    "Tester Remarks / Defect",
    "Developer Reassigned Remarks",
    "Final Retest Remarks",
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
    escapeCSV(tp.assignedDate || tp.createdAt || todayISO()),
    escapeCSV(tp.assignedDev || ""),
    escapeCSV(tp.devStatus || ""),
    escapeCSV(tp.tester || ""),
    escapeCSV(tp.status || ""),
    escapeCSV(tp.actualResult || ""),
    escapeCSV(tp.devRemark || ""),
    escapeCSV(tp.finalRetestRemarks || ""),
    escapeCSV(tp.updatedAt || todayISO()),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ZPBDMS_Dev_Test_Execution_Matrix_${todayISO()}.csv`);
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
  onQuickTimer,
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
  isLight,
}) {
  const total = allTestPoints.length;
  const passed = allTestPoints.filter((t) => t.status === "Passed").length;
  const failed = allTestPoints.filter((t) => t.status === "Failed").length;
  const blocked = allTestPoints.filter((t) => t.status === "Blocked").length;
  const retest = allTestPoints.filter((t) => t.status === "Retest").length;
  const untested = allTestPoints.filter((t) => t.status === "Untested").length;
  const devResolved = allTestPoints.filter(
    (t) => t.devStatus === "Resolved / Ready for Retest" || t.devStatus === "Completed"
  ).length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div>
      {/* Top Dev-Test Operational KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div className="glass-card" style={{ padding: "14px 16px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Total Directives
            </span>
            <FileSpreadsheet size={15} color={isLight ? "#475569" : "#cbd5e1"} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 6 }}>
            {total}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Execution matrix points
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#16a34a", textTransform: "uppercase", fontWeight: 700 }}>
              Passed / Cleared
            </span>
            <CheckCircle size={15} color="#22c55e" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{passed}</div>
            <div style={{ fontSize: 11.5, color: isLight ? "#64748b" : "#94a3b8" }}>({passRate}% Pass Rate)</div>
          </div>
          <div style={{ width: "100%", height: 4, background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
            <div style={{ width: `${passRate}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "14px 16px",
            border: failed > 0 ? "1px solid rgba(255, 51, 75, 0.4)" : undefined,
            background: failed > 0 ? (isLight ? "rgba(255, 51, 75, 0.06)" : "rgba(255, 51, 75, 0.08)") : undefined,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#ff6479", textTransform: "uppercase", fontWeight: 700 }}>
              Defects / Retest
            </span>
            <AlertCircle size={15} color="#ff334b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: failed > 0 ? "#ff334b" : (isLight ? "#0f172a" : "#ffffff"), marginTop: 6 }}>
            {failed}
          </div>
          <div style={{ fontSize: 11, color: failed > 0 ? "#ff6479" : (isLight ? "#64748b" : "#94a3b8"), marginTop: 2 }}>
            {failed > 0 ? "Action required: Developer fix needed" : "All tested scenarios passing"}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9333ea", textTransform: "uppercase", fontWeight: 700 }}>
              Dev Resolved / Fixed
            </span>
            <Code2 size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a855f7", marginTop: 6 }}>
            {devResolved}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Ready for QA tester verification
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#d97706", textTransform: "uppercase", fontWeight: 700 }}>
              Pending In Queue
            </span>
            <Clock size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", marginTop: 6 }}>
            {untested + blocked + retest}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Awaiting execution or retest
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: "12px 16px",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ minWidth: 140 }}>
            <SelectInput
              value={selectedModule}
              onChange={setSelectedModule}
              options={["All Modules", ...MODULES]}
            />
          </div>

          <div style={{ minWidth: 140 }}>
            <SelectInput
              value={selectedTestStatus}
              onChange={setSelectedTestStatus}
              options={["All Test Statuses", ...TEST_STATUSES]}
            />
          </div>

          <div style={{ minWidth: 150 }}>
            <SelectInput
              value={selectedDevStatus}
              onChange={setSelectedDevStatus}
              options={["All Dev Statuses", ...DEV_STATUSES]}
            />
          </div>

          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search points, dev, remarks..."
              style={{
                ...darkInputStyle,
                padding: "6px 10px 6px 30px",
                fontSize: 12,
                background: isLight ? "#ffffff" : "rgba(18, 22, 34, 0.8)",
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

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn-ghost-dark"
            onClick={onExportCSV}
            style={{ padding: "6px 12px", fontSize: 12 }}
            title="Export Dev-Test Execution Matrix to CSV"
          >
            <Download size={13} style={{ marginRight: 4 }} /> Export CSV
          </button>
          <button
            className="btn-red-gradient"
            onClick={onOpenAdd}
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            <Plus size={14} style={{ marginRight: 4 }} /> Add Point
          </button>
        </div>
      </div>

      {/* Dev-Test Execution Matrix Table - SINGLE SCREEN WITHOUT HORIZONTAL SCROLLER */}
      <div
        className="glass-card"
        style={{
          width: "100%",
          overflow: "hidden",
          border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 60 }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: 80 }} />
            <col style={{ width: "10.5%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "13.5%" }} />
            <col style={{ width: "11.5%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: 62 }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.04)",
                borderBottom: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: 10.5,
                fontWeight: 700,
                color: isLight ? "#475569" : "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <th style={{ padding: "10px 4px", textAlign: "center" }}>#</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Point / Directive</th>
              <th style={{ padding: "10px 4px", textAlign: "center" }}>Assigned</th>
              <th style={{ padding: "10px 6px", textAlign: "left" }}>Assigned Dev</th>
              <th style={{ padding: "10px 6px", textAlign: "center" }}>Dev Status</th>
              <th style={{ padding: "10px 6px", textAlign: "left" }}>Assigned Tester</th>
              <th style={{ padding: "10px 6px", textAlign: "left" }}>Tester Remarks</th>
              <th style={{ padding: "10px 6px", textAlign: "left" }}>Dev Reassigned</th>
              <th style={{ padding: "10px 6px", textAlign: "left" }}>Final Retest</th>
              <th style={{ padding: "10px 4px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testPoints.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: "40px 20px", textAlign: "center" }}>
                  <FileSpreadsheet size={32} color="#64748b" style={{ margin: "0 auto 10px", display: "block" }} />
                  <div style={{ color: isLight ? "#0f172a" : "#ffffff", fontSize: 13.5, fontWeight: 600 }}>
                    No execution points match current filter
                  </div>
                  <button
                    className="btn-red-gradient"
                    onClick={onOpenAdd}
                    style={{ padding: "6px 14px", fontSize: 12, marginTop: 12 }}
                  >
                    <Plus size={13} style={{ marginRight: 4 }} /> Add New Execution Point
                  </button>
                </td>
              </tr>
            ) : (
              testPoints.map((tp, idx) => (
                <tr
                  key={tp.id}
                  className="custom-table-row"
                  style={{
                    borderBottom: idx === testPoints.length - 1 ? "none" : isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.05)",
                    background: idx % 2 === 1 ? (isLight ? "rgba(241, 245, 249, 0.5)" : "rgba(255, 255, 255, 0.01)") : "transparent",
                  }}
                >
                  {/* 1. Sr. / Code */}
                  <td style={{ padding: "8px 4px", textAlign: "center", verticalAlign: "middle", overflow: "hidden" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff" }}>
                      {tp.code || `TP-${idx + 1}`}
                    </div>
                    <div style={{ fontSize: 9.5, color: isLight ? "#64748b" : "#94a3b8" }}>
                      #{idx + 1}
                    </div>
                  </td>

                  {/* 2. Point / Directive */}
                  <td style={{ padding: "8px 8px", verticalAlign: "middle", overflow: "hidden" }}>
                    <div
                      title={tp.scenario}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: isLight ? "#0f172a" : "#ffffff",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {tp.scenario}
                    </div>
                    {tp.module && (
                      <div style={{ marginTop: 2 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)",
                            color: isLight ? "#475569" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          {tp.module}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* 3. Date Assigned */}
                  <td style={{ padding: "8px 4px", textAlign: "center", verticalAlign: "middle", overflow: "hidden" }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isLight ? "#475569" : "#94a3b8",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tp.assignedDate || tp.createdAt || todayISO()}
                    </span>
                  </td>

                  {/* 4. Assigned Developer & Estimated Time / Timer */}
                  <td style={{ padding: "6px 6px", verticalAlign: "middle", overflow: "hidden" }}>
                    <div
                      title={`Developer: ${tp.assignedDev || "Unassigned"}`}
                      style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", minWidth: 0 }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "rgba(56, 189, 248, 0.18)",
                          border: "1px solid rgba(56, 189, 248, 0.4)",
                          color: "#38bdf8",
                          fontSize: 9,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {(tp.assignedDev || "D").charAt(0)}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isLight ? "#1e293b" : "#f1f5f9",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tp.assignedDev || "Unassigned"}
                      </span>
                    </div>

                    <div style={{ marginTop: 2, display: "flex", alignItems: "center" }}>
                      <span
                        onClick={() => (onQuickTimer ? onQuickTimer(tp) : onOpenEdit(tp))}
                        title={`Estimated Time: ${tp.estimatedTime || "Click to set duration"}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: tp.estimatedTime ? "rgba(56, 189, 248, 0.14)" : "rgba(255, 255, 255, 0.04)",
                          color: tp.estimatedTime ? "#38bdf8" : (isLight ? "#64748b" : "#94a3b8"),
                          border: tp.estimatedTime ? "1px solid rgba(56, 189, 248, 0.3)" : "1px dashed rgba(255, 255, 255, 0.15)",
                          cursor: "pointer",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Clock size={8.5} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tp.estimatedTime || "Set Time"}
                        </span>
                      </span>
                    </div>
                  </td>

                  {/* 5. Dev Completion Status */}
                  <td style={{ padding: "8px 4px", textAlign: "center", verticalAlign: "middle", overflow: "hidden" }}>
                    <DevStatusChip value={tp.devStatus} onClick={() => onOpenResolve(tp)} compact />
                  </td>

                  {/* 6. Assigned Tester */}
                  <td style={{ padding: "8px 6px", verticalAlign: "middle", overflow: "hidden" }}>
                    <div
                      title={`Tester: ${tp.tester || "Unassigned"}`}
                      style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden", minWidth: 0 }}
                    >
                      <div
                        style={{
                          width: 19,
                          height: 19,
                          borderRadius: "50%",
                          background: "rgba(168, 85, 247, 0.18)",
                          border: "1px solid rgba(168, 85, 247, 0.4)",
                          color: "#c084fc",
                          fontSize: 9,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {(tp.tester || "T").charAt(0)}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isLight ? "#1e293b" : "#f1f5f9",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tp.tester || "Rutuja"}
                      </span>
                    </div>
                  </td>

                  {/* 7. Tester Status / Remarks */}
                  <td style={{ padding: "8px 6px", verticalAlign: "middle", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                      <TestStatusChip value={tp.status} interactive onClick={() => onCycleStatus(tp)} compact />
                    </div>
                    {tp.actualResult ? (
                      <div
                        title={tp.actualResult}
                        style={{
                          fontSize: 10.5,
                          color: tp.status === "Failed" ? "#ff6479" : (isLight ? "#475569" : "#cbd5e1"),
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {tp.actualResult}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: isLight ? "#94a3b8" : "#64748b", fontStyle: "italic" }}>
                        No remarks
                      </span>
                    )}
                  </td>

                  {/* 8. Developer Reassigned Remarks */}
                  <td style={{ padding: "8px 6px", verticalAlign: "middle", overflow: "hidden" }}>
                    {tp.devRemark ? (
                      <div
                        title={tp.devRemark}
                        style={{
                          fontSize: 10.5,
                          color: isLight ? "#334155" : "#e2e8f0",
                          borderLeft: "2px solid #ff334b",
                          paddingLeft: 4,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {tp.devRemark}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: isLight ? "#94a3b8" : "#64748b", fontStyle: "italic" }}>
                        None
                      </span>
                    )}
                  </td>

                  {/* 9. Final Retest Remarks */}
                  <td style={{ padding: "8px 6px", verticalAlign: "middle", overflow: "hidden" }}>
                    {tp.finalRetestRemarks ? (
                      <div
                        title={tp.finalRetestRemarks}
                        style={{
                          fontSize: 10.5,
                          color: isLight ? "#15803d" : "#4ade80",
                          borderLeft: "2px solid #22c55e",
                          paddingLeft: 4,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {tp.finalRetestRemarks}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: isLight ? "#94a3b8" : "#64748b", fontStyle: "italic" }}>
                        Pending sign-off
                      </span>
                    )}
                  </td>

                  {/* 10. Actions */}
                  <td style={{ padding: "8px 4px", textAlign: "center", verticalAlign: "middle", overflow: "hidden" }}>
                    <div style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
                      <IconButton onClick={() => onOpenEdit(tp)} title="Edit Matrix Point" style={{ padding: 3 }}>
                        <Pencil size={12} />
                      </IconButton>
                      <IconButton onClick={() => onDelete(tp)} title="Delete Matrix Point" variant="danger" style={{ padding: 3 }}>
                        <Trash2 size={12} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------- Master Control & User Management (Sudhanshu Only) ---------------------------- */

function MasterModuleView({
  users,
  onOpenAddUser,
  onOpenEditUser,
  onDeleteUser,
  currentUser,
  isLight,
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const toggleRevealPassword = (id) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allUsers = Array.isArray(users) ? users : [];
  const totalUsers = allUsers.length;
  const ceoCount = allUsers.filter((u) => u.role === "CEO" || u.role?.toLowerCase().includes("ceo")).length;
  const devCount = allUsers.filter((u) => u.role?.toLowerCase().includes("dev")).length;
  const testerCount = allUsers.filter((u) => u.role?.toLowerCase().includes("test")).length;
  const baCount = allUsers.filter((u) => u.role?.toLowerCase().includes("analyst") || u.role?.toLowerCase().includes("ba")).length;
  const mgrCount = allUsers.filter((u) => u.role?.toLowerCase().includes("manager")).length;

  const filtered = allUsers.filter((u) => {
    if (roleFilter !== "All Roles" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div>
      {/* Top Master KPI Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #ff334b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Total Personnel
            </span>
            <Users size={16} color="#ff334b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 6 }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Registered team members
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#d97706", textTransform: "uppercase", fontWeight: 700 }}>
              CEO & Leadership
            </span>
            <Crown size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", marginTop: 6 }}>
            {ceoCount}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Executive Leadership
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #38bdf8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#0284c7", textTransform: "uppercase", fontWeight: 700 }}>
              Developers
            </span>
            <Code2 size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8", marginTop: 6 }}>
            {devCount}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Development Leads
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #a855f7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9333ea", textTransform: "uppercase", fontWeight: 700 }}>
              QA Testers
            </span>
            <CheckCircle size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a855f7", marginTop: 6 }}>
            {testerCount}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Verification Leads
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #ff6479" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#ff6479", textTransform: "uppercase", fontWeight: 700 }}>
              Business Analysts
            </span>
            <ShieldCheck size={16} color="#ff6479" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ff6479", marginTop: 6 }}>
            {baCount}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            System Architects & BA
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#059669", textTransform: "uppercase", fontWeight: 700 }}>
              Managers
            </span>
            <UserCheck size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", marginTop: 6 }}>
            {mgrCount}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Operational Supervisors
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: "12px 16px",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", width: 260, maxWidth: "100%" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, role..."
              style={{
                ...darkInputStyle,
                padding: "6px 10px 6px 30px",
                fontSize: 12,
                background: isLight ? "#ffffff" : "rgba(18, 22, 34, 0.8)",
                width: "100%",
              }}
            />
          </div>

          <div style={{ minWidth: 150 }}>
            <SelectInput
              value={roleFilter}
              onChange={setRoleFilter}
              options={["All Roles", ...ROLES_LIST]}
            />
          </div>
        </div>

        <button
          className="btn-red-gradient"
          onClick={onOpenAddUser}
          style={{ padding: "7px 16px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
        >
          <UserPlus size={14} /> Register New Member
        </button>
      </div>

      {/* Master Users Roster Table */}
      <div
        className="glass-card"
        style={{
          width: "100%",
          overflow: "hidden",
          border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 55 }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: 90 }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.04)",
                borderBottom: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: 10.5,
                fontWeight: 700,
                color: isLight ? "#475569" : "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <th style={{ padding: "10px 4px", textAlign: "center" }}>Sr.</th>
              <th style={{ padding: "10px 10px", textAlign: "left" }}>Team Member</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Username</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Role / Designation</th>
              <th style={{ padding: "10px 8px", textAlign: "left" }}>Login Password</th>
              <th style={{ padding: "10px 4px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, idx) => {
              const isSelf = u.username?.toLowerCase() === "sudhanshu";
              const isRevealed = !!revealedPasswords[u.id || u.username];
              return (
                <tr
                  key={u.id || u.username}
                  className="custom-table-row"
                  style={{
                    borderBottom: idx === filtered.length - 1 ? "none" : isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.05)",
                    background: idx % 2 === 1 ? (isLight ? "rgba(241, 245, 249, 0.5)" : "rgba(255, 255, 255, 0.01)") : "transparent",
                  }}
                >
                  <td style={{ padding: "8px 4px", textAlign: "center", fontSize: 11, color: isLight ? "#64748b" : "#94a3b8" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: u.avatar || "#ff334b",
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 0 8px ${u.avatar || "#ff334b"}55`,
                        }}
                      >
                        {(u.name || "U").charAt(0)}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {u.name}
                          {isSelf && (
                            <span style={{ marginLeft: 5, fontSize: 9.5, padding: "1px 5px", borderRadius: 3, background: "rgba(255, 51, 75, 0.15)", color: "#ff6479", fontWeight: 700 }}>
                              YOU
                            </span>
                          )}
                        </div>
                        {u.email && (
                          <div style={{ fontSize: 10.5, color: isLight ? "#64748b" : "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {u.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "8px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: isLight ? "#0f172a" : "#38bdf8", fontWeight: 600 }}>
                    @{u.username}
                  </td>
                  <td style={{ padding: "8px 8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 7px",
                        borderRadius: 4,
                        fontSize: 10.5,
                        fontWeight: 600,
                        background: u.role === "CEO" || u.role?.toLowerCase().includes("ceo")
                          ? "rgba(245, 158, 11, 0.18)"
                          : u.role?.includes("Developer")
                          ? "rgba(56, 189, 248, 0.15)"
                          : u.role?.includes("Tester")
                          ? "rgba(168, 85, 247, 0.15)"
                          : u.role?.includes("Manager")
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(255, 51, 75, 0.15)",
                        color: u.role === "CEO" || u.role?.toLowerCase().includes("ceo")
                          ? "#fbbf24"
                          : u.role?.includes("Developer")
                          ? "#38bdf8"
                          : u.role?.includes("Tester")
                          ? "#c084fc"
                          : u.role?.includes("Manager")
                          ? "#34d399"
                          : "#ff6479",
                        border: u.role === "CEO" || u.role?.toLowerCase().includes("ceo")
                          ? "1px solid rgba(245, 158, 11, 0.4)"
                          : `1px solid ${u.avatar || "#ff334b"}44`,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "8px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: isLight ? "#334155" : "#cbd5e1",
                          letterSpacing: isRevealed ? "0.2px" : "2px",
                        }}
                      >
                        {isRevealed ? u.password : "••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRevealPassword(u.id || u.username)}
                        style={{
                          background: "none",
                          border: "none",
                          color: isLight ? "#64748b" : "#94a3b8",
                          cursor: "pointer",
                          padding: 2,
                        }}
                        title={isRevealed ? "Hide Password" : "Show Password"}
                      >
                        {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: 3 }}>
                      <IconButton onClick={() => onOpenEditUser(u)} title="Edit Member Account" style={{ padding: 3 }}>
                        <Pencil size={12} />
                      </IconButton>
                      {!isSelf && (
                        <IconButton onClick={() => onDeleteUser(u)} title="Delete Member Account" variant="danger" style={{ padding: 3 }}>
                          <Trash2 size={12} />
                        </IconButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------- Admin Audit & Activity Logs (Sudhanshu Only) ---------------------------- */

function AuditLogsView({ logs = [], isLight }) {
  const [filterAction, setFilterAction] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  const filteredLogs = (logs || []).filter((l) => {
    if (filterAction !== "ALL" && !l.action?.includes(filterAction)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        (l.actor?.name && l.actor.name.toLowerCase().includes(q)) ||
        (l.entityTitle && l.entityTitle.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.entityType && l.entityType.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div>
      {/* Top Banner */}
      <div
        className="glass-card"
        style={{
          padding: "14px 18px",
          marginBottom: 16,
          borderLeft: "3px solid #ff334b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <History size={17} color="#ff334b" /> Permanent System Audit Trail (BA / Admin Only)
          </div>
          <div style={{ fontSize: 11.5, color: isLight ? "#64748b" : "#94a3b8", marginTop: 3 }}>
            Recorded in real-time. If any tester or developer modifies or deliberately deletes any point, their identity, timestamp, and full deleted snapshot are preserved here.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: isLight ? "#64748b" : "#94a3b8" }}>
            Total Audit Records: <strong style={{ color: "#ff334b" }}>{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: "10px 16px",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ position: "relative", width: 300, maxWidth: "100%" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, item, action..."
            style={{
              ...darkInputStyle,
              padding: "6px 10px 6px 30px",
              fontSize: 12,
              background: isLight ? "#ffffff" : "rgba(18, 22, 34, 0.8)",
              width: "100%",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "All Activity" },
            { id: "DELETE", label: "Deletions Only" },
            { id: "CREATE", label: "Creations" },
            { id: "UPDATE", label: "Updates / Fixes" },
            { id: "USER", label: "Personnel Roster" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                border: filterAction === f.id ? "1px solid #ff334b" : isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                background: filterAction === f.id ? "#ff334b" : isLight ? "#ffffff" : "rgba(255, 255, 255, 0.03)",
                color: filterAction === f.id ? "#ffffff" : isLight ? "#475569" : "#94a3b8",
                transition: "all 0.15s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div
        className="glass-card"
        style={{
          width: "100%",
          overflow: "hidden",
          border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <History size={32} color="#64748b" style={{ margin: "0 auto 10px", display: "block" }} />
            <div style={{ color: isLight ? "#0f172a" : "#ffffff", fontSize: 13.5, fontWeight: 600 }}>No audit logs recorded yet</div>
            <p style={{ color: isLight ? "#64748b" : "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>
              All future deletions, edits, and personnel creations will automatically be logged here with immutable snapshots.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 135 }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: 140 }} />
              <col style={{ width: "44%" }} />
              <col style={{ width: 100 }} />
            </colgroup>
            <thead>
              <tr
                style={{
                  background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.04)",
                  borderBottom: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: isLight ? "#475569" : "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Timestamp</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Actor (User & Role)</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Action Type</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Entity Details / Summary</th>
                <th style={{ padding: "10px 8px", textAlign: "center" }}>Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => {
                const isDel = log.action?.includes("DELETE");
                return (
                  <tr
                    key={log.id || idx}
                    className="custom-table-row"
                    style={{
                      borderBottom: idx === filteredLogs.length - 1 ? "none" : isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.05)",
                      background: isDel
                        ? (isLight ? "rgba(239, 68, 68, 0.04)" : "rgba(255, 51, 75, 0.04)")
                        : (idx % 2 === 1 ? (isLight ? "rgba(241, 245, 249, 0.5)" : "rgba(255, 255, 255, 0.01)") : "transparent"),
                    }}
                  >
                    <td style={{ padding: "8px", fontSize: 10.5, color: isLight ? "#64748b" : "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff" }}>
                        {log.actor?.name || "System"}
                      </div>
                      <div style={{ fontSize: 10.5, color: isLight ? "#64748b" : "#94a3b8" }}>
                        {log.actor?.role || "Authorized User"} (@{log.actor?.username || "unknown"})
                      </div>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          background: isDel
                            ? "rgba(255, 51, 75, 0.15)"
                            : log.action?.includes("CREATE")
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(56, 189, 248, 0.15)",
                          color: isDel
                            ? "#ff6479"
                            : log.action?.includes("CREATE")
                            ? "#4ade80"
                            : "#38bdf8",
                          border: isDel
                            ? "1px solid rgba(255, 51, 75, 0.4)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: isLight ? "#1e293b" : "#f1f5f9", lineHeight: 1.35 }}>
                        {log.entityTitle}
                      </div>
                      <div style={{ fontSize: 10, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                        Scope: <span style={{ fontWeight: 600 }}>{log.entityType}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {log.details && (
                        <button
                          type="button"
                          onClick={() => setSelectedSnapshot(log)}
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: 4,
                            padding: "3px 7px",
                            fontSize: 10,
                            fontWeight: 600,
                            color: isLight ? "#0f172a" : "#ffffff",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Database size={10} /> Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Snapshot Modal */}
      {selectedSnapshot && (
        <Modal
          title={`Snapshot: ${selectedSnapshot.action}`}
          icon={Database}
          onClose={() => setSelectedSnapshot(null)}
        >
          <div>
            <div style={{ marginBottom: 12, fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
              Action performed by <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>{selectedSnapshot.actor?.name}</strong> ({selectedSnapshot.actor?.role}) on {new Date(selectedSnapshot.timestamp).toLocaleString()}.
            </div>
            <pre
              style={{
                background: isLight ? "#f8fafc" : "#0a0c13",
                padding: 12,
                borderRadius: 8,
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                color: isLight ? "#0f172a" : "#4ade80",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                overflowX: "auto",
                maxHeight: 320,
                lineHeight: 1.45,
              }}
            >
              {JSON.stringify(selectedSnapshot.details, null, 2)}
            </pre>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-red-gradient"
                onClick={() => setSelectedSnapshot(null)}
                style={{ padding: "6px 16px", fontSize: 12 }}
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------- MOM (Minutes of Meeting) Module ---------------------------- */

function formatCleanMOMText(mom) {
  const lines = [];
  lines.push("=================================================================");
  lines.push("MINUTES OF MEETING (MOM) — MAHARASHTRA ZPBDMS OPERATIONS");
  lines.push("=================================================================");
  lines.push(`SUBJECT: ${mom.title}`);
  lines.push(`DATE: ${mom.date} | TIME: ${mom.time} (Duration: ${mom.duration || "N/A"})`);
  lines.push(`MODE: ${mom.mode || "In-Person"} | STATUS: ${mom.status || "Draft"}`);
  lines.push(`CLIENT ORG: ${mom.clientOrg || "N/A"}`);
  lines.push(`CLIENT ATTENDEES: ${mom.clientAttendees || "N/A"}`);
  lines.push(`INTERNAL ATTENDEES: ${(mom.internalAttendees || []).join(", ") || "N/A"}`);
  lines.push("-----------------------------------------------------------------");
  lines.push("KEY DISCUSSION POINTS & MINUTES:");
  if (mom.notes) {
    lines.push(mom.notes);
  } else {
    lines.push("None recorded.");
  }
  lines.push("-----------------------------------------------------------------");
  lines.push("DECISIONS TAKEN & APPROVALS RATIFIED:");
  if (mom.decisions) {
    lines.push(mom.decisions);
  } else {
    lines.push("None recorded.");
  }
  lines.push("-----------------------------------------------------------------");
  lines.push(`ACTION ITEMS & DELIVERABLES (${(mom.actionItems || []).length}):`);
  if (Array.isArray(mom.actionItems) && mom.actionItems.length > 0) {
    mom.actionItems.forEach((ai, idx) => {
      lines.push(`${idx + 1}. ${ai.task}`);
      lines.push(`   Owner: ${ai.owner || "Unassigned"} | Due: ${ai.dueDate || "TBD"} | Priority: ${ai.priority || "Normal"} | Status: ${ai.status || "Pending"}`);
    });
  } else {
    lines.push("No specific action items recorded.");
  }
  lines.push("=================================================================");
  lines.push(`Recorded By: ${mom.createdBy || "Sudhanshu Khande"} | ZPBDMS Management Portal`);
  return lines.join("\n");
}

function MOMView({
  moms = [],
  users = TEAM_ROSTER,
  currentUser,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onToggleActionItem,
  onPushToTestMatrix,
  isLight,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [expandedMoms, setExpandedMoms] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedMoms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyMOM = (mom) => {
    const text = formatCleanMOMText(mom);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(mom.id);
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      alert("MOM Text copied to clipboard!");
    }
  };

  const handlePrintMOM = (mom) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MOM: ${mom.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #e11d48; margin-top: 20px; margin-bottom: 6px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; white-space: pre-line; }
            .decisions { border-left: 4px solid #10b981; background: #f0fdf4; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background: #f1f5f9; font-weight: 700; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <h1>${mom.title}</h1>
          <div class="meta">
            <strong>Client:</strong> ${mom.clientOrg} &nbsp;|&nbsp;
            <strong>Date:</strong> ${mom.date} (${mom.time || "N/A"}, ${mom.duration || "N/A"}) &nbsp;|&nbsp;
            <strong>Mode:</strong> ${mom.mode || "In-Person"} &nbsp;|&nbsp;
            <strong>Status:</strong> ${mom.status || "Draft"}
            <br />
            <strong>Client Attendees:</strong> ${mom.clientAttendees || "None specified"}
            <br />
            <strong>Internal Attendees:</strong> ${(mom.internalAttendees || []).join(", ")}
          </div>

          <div class="section-title">Key Discussion Points & Minutes</div>
          <div class="box">${mom.notes || "None"}</div>

          <div class="section-title">Decisions Taken & Approvals</div>
          <div class="box decisions">${mom.decisions || "None"}</div>

          <div class="section-title">Action Items & Next Steps (${(mom.actionItems || []).length})</div>
          <table>
            <thead>
              <tr>
                <th style="width: 35px;">#</th>
                <th>Action Directive / Task</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(mom.actionItems || [])
                .map(
                  (ai, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${ai.task}</td>
                  <td>${ai.owner || "Unassigned"}</td>
                  <td>${ai.dueDate || "TBD"}</td>
                  <td>${ai.priority || "Medium"}</td>
                  <td>${ai.status || "Pending"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 30px; font-size: 11px; color: #94a3b8;">
            Recorded by: ${mom.createdBy || "Sudhanshu Khande"} &nbsp;|&nbsp; Maharashtra ZPBDMS Operations & Governance
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const allMoms = Array.isArray(moms) ? moms : [];
  const totalMoms = allMoms.length;
  const thisMonthMoms = allMoms.filter((m) => m.date && m.date.startsWith(todayISO().slice(0, 7))).length;
  const totalActionItems = allMoms.reduce((acc, m) => acc + (Array.isArray(m.actionItems) ? m.actionItems.length : 0), 0);
  const openActionItems = allMoms.reduce(
    (acc, m) =>
      acc + (Array.isArray(m.actionItems) ? m.actionItems.filter((a) => a.status !== "Done").length : 0),
    0
  );
  const approvedMoms = allMoms.filter((m) => m.status === "Client Approved").length;

  const filtered = allMoms.filter((m) => {
    if (statusFilter !== "All Statuses" && m.status !== statusFilter) return false;
    if (dateFilter === "Today" && m.date !== todayISO()) return false;
    if (dateFilter === "This Month" && (!m.date || !m.date.startsWith(todayISO().slice(0, 7)))) return false;
    if (dateFilter === "Last 7 Days") {
      const d = new Date(m.date).getTime();
      const now = Date.now();
      if (now - d > 7 * 86400000) return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [
        m.title,
        m.clientOrg,
        m.clientAttendees,
        (m.internalAttendees || []).join(" "),
        m.mode,
        m.category,
        m.notes,
        m.decisions,
        (m.actionItems || []).map((a) => `${a.task} ${a.owner}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <div>
      {/* Top MOM Operational KPI Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #ff334b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Total Meetings
            </span>
            <ClipboardList size={16} color="#ff334b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 6 }}>
            {totalMoms}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Client discussions on record
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #38bdf8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#0284c7", textTransform: "uppercase", fontWeight: 700 }}>
              This Month
            </span>
            <Calendar size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8", marginTop: 6 }}>
            {thisMonthMoms}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Conducted in {new Date().toLocaleString("en-US", { month: "short", year: "numeric" })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #a855f7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9333ea", textTransform: "uppercase", fontWeight: 700 }}>
              Open Action Items
            </span>
            <CheckSquare size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a855f7", marginTop: 6 }}>
            {openActionItems}
            <span style={{ fontSize: 13, fontWeight: 500, color: isLight ? "#64748b" : "#94a3b8", marginLeft: 6 }}>
              / {totalActionItems}
            </span>
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Deliverables in progress or pending
          </div>
        </div>

        <div className="glass-card" style={{ padding: "14px 16px", borderTop: "2px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#059669", textTransform: "uppercase", fontWeight: 700 }}>
              Client Approved
            </span>
            <CheckCircle size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", marginTop: 6 }}>
            {approvedMoms}
          </div>
          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
            Formal sign-off received
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 280, maxWidth: "100%" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search MOM by title, client, decisions, action..."
              style={{
                ...darkInputStyle,
                padding: "6px 10px 6px 30px",
                fontSize: 12,
                background: isLight ? "#ffffff" : "rgba(18, 22, 34, 0.8)",
                width: "100%",
              }}
            />
          </div>

          <div style={{ minWidth: 140 }}>
            <SelectInput
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All Statuses", "Draft", "Shared with Client", "Client Approved"]}
            />
          </div>

          <div style={{ minWidth: 130 }}>
            <SelectInput
              value={dateFilter}
              onChange={setDateFilter}
              options={["All Dates", "Today", "Last 7 Days", "This Month"]}
            />
          </div>
        </div>

        <button
          className="btn-red-gradient"
          onClick={onOpenAdd}
          style={{ padding: "7px 16px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={14} /> Record New Discussion (MOM)
        </button>
      </div>

      {/* Date-wise MOM Stream Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <ClipboardList size={34} color="#64748b" style={{ margin: "0 auto 10px", display: "block" }} />
            <div style={{ color: isLight ? "#0f172a" : "#ffffff", fontSize: 14, fontWeight: 700 }}>
              No Minutes of Meeting found
            </div>
            <div style={{ color: isLight ? "#64748b" : "#94a3b8", fontSize: 12, marginTop: 4 }}>
              {search || statusFilter !== "All Statuses" || dateFilter !== "All Dates"
                ? "Try clearing filters to view all recorded discussions."
                : "Start documenting client discussions and requirements."}
            </div>
            <button
              className="btn-red-gradient"
              onClick={onOpenAdd}
              style={{ padding: "7px 16px", fontSize: 12.5, marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> Record First Meeting (MOM)
            </button>
          </div>
        ) : (
          filtered.map((m, idx) => {
            const isExpanded = expandedMoms[m.id] !== undefined ? expandedMoms[m.id] : idx === 0;
            const dateObj = new Date(m.date);
            const formattedDate = isNaN(dateObj.getTime())
              ? m.date
              : dateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
            const openActions = (m.actionItems || []).filter((a) => a.status !== "Done").length;
            const isCopied = copiedId === m.id;

            return (
              <div
                key={m.id}
                className="glass-card"
                style={{
                  padding: "16px 20px",
                  borderLeft:
                    m.status === "Client Approved"
                      ? "4px solid #10b981"
                      : m.status === "Shared with Client"
                      ? "4px solid #38bdf8"
                      : "4px solid #f59e0b",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      {/* Date Badge */}
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)",
                          color: isLight ? "#1e293b" : "#f1f5f9",
                        }}
                      >
                        <Calendar size={11} color="#ff334b" />
                        {formattedDate}
                      </span>

                      {/* Time & Duration */}
                      {(m.time || m.duration) && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.04)",
                            color: isLight ? "#64748b" : "#94a3b8",
                          }}
                        >
                          <Clock size={10.5} color="#38bdf8" />
                          {m.time} {m.duration ? `(${m.duration})` : ""}
                        </span>
                      )}

                      {/* Mode Badge */}
                      {m.mode && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10.5,
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: "rgba(168, 85, 247, 0.12)",
                            color: "#c084fc",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                          }}
                        >
                          <Building2 size={10.5} />
                          {m.mode}
                        </span>
                      )}

                      {/* Status Chip */}
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background:
                            m.status === "Client Approved"
                              ? "rgba(34, 197, 94, 0.16)"
                              : m.status === "Shared with Client"
                              ? "rgba(56, 189, 248, 0.16)"
                              : "rgba(245, 158, 11, 0.16)",
                          color:
                            m.status === "Client Approved"
                              ? "#4ade80"
                              : m.status === "Shared with Client"
                              ? "#38bdf8"
                              : "#fbbf24",
                          border:
                            m.status === "Client Approved"
                              ? "1px solid rgba(34, 197, 94, 0.4)"
                              : m.status === "Shared with Client"
                              ? "1px solid rgba(56, 189, 248, 0.4)"
                              : "1px solid rgba(245, 158, 11, 0.4)",
                        }}
                      >
                        ● {m.status || "Draft"}
                      </span>
                    </div>

                    {/* Title */}
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: isLight ? "#0f172a" : "#ffffff",
                        letterSpacing: "-0.2px",
                        lineHeight: 1.35,
                      }}
                    >
                      {m.title}
                    </div>

                    {/* Client Organization & Category */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6479" }}>
                        🏢 {m.clientOrg}
                      </span>
                      {m.category && (
                        <span style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8" }}>
                          · {m.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => handleCopyMOM(m)}
                      className="btn-ghost-dark"
                      style={{
                        padding: "5px 10px",
                        fontSize: 11.5,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: isCopied ? "rgba(34, 197, 94, 0.2)" : undefined,
                        color: isCopied ? "#4ade80" : undefined,
                        border: isCopied ? "1px solid rgba(34, 197, 94, 0.4)" : undefined,
                      }}
                      title="Copy professional plain text email minutes to clipboard"
                    >
                      <Copy size={12} />
                      <span>{isCopied ? "Copied!" : "Copy Clean MOM"}</span>
                    </button>

                    <button
                      onClick={() => handlePrintMOM(m)}
                      className="btn-ghost-dark"
                      style={{ padding: "5px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}
                      title="Print or export formatted PDF"
                    >
                      <Printer size={12} />
                      <span>Print / PDF</span>
                    </button>

                    <IconButton onClick={() => onOpenEdit(m)} title="Edit Meeting Minutes" style={{ padding: 4 }}>
                      <Pencil size={13} />
                    </IconButton>

                    <IconButton onClick={() => onDelete(m)} title="Delete Meeting Record" variant="danger" style={{ padding: 4 }}>
                      <Trash2 size={13} />
                    </IconButton>

                    <button
                      onClick={() => toggleExpand(m.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: isLight ? "#475569" : "#94a3b8",
                        cursor: "pointer",
                        padding: "4px 6px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title={isExpanded ? "Collapse MOM details" : "Expand MOM details"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Attendees Summary Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: 11.5,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: isLight ? "#475569" : "#94a3b8" }}>Client Attendees:</span>
                    <span style={{ color: isLight ? "#1e293b" : "#e2e8f0" }}>{m.clientAttendees || "None logged"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: isLight ? "#475569" : "#94a3b8" }}>Team Present:</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(m.internalAttendees || []).map((name) => (
                        <span
                          key={name}
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: "rgba(56, 189, 248, 0.12)",
                            color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.25)",
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Discussion, Decisions, Action Items */}
                {isExpanded && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Discussion Points & Decisions 2-Col Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                      {/* Discussion Points */}
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 8,
                          background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.02)",
                          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#ff6479", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                          <FileText size={13} /> Key Discussion Points & Minutes
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: isLight ? "#334155" : "#cbd5e1",
                            lineHeight: 1.5,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {m.notes || "No discussion points documented."}
                        </div>
                      </div>

                      {/* Decisions Taken */}
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 8,
                          background: isLight ? "#f0fdf4" : "rgba(34, 197, 94, 0.04)",
                          border: isLight ? "1px solid #bbf7d0" : "1px solid rgba(34, 197, 94, 0.2)",
                          borderLeft: "3px solid #22c55e",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#22c55e", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                          <CheckCircle2 size={13} /> Decisions Taken & Approvals Ratified
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: isLight ? "#166534" : "#86efac",
                            lineHeight: 1.5,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {m.decisions || "No explicit decisions logged."}
                        </div>
                      </div>
                    </div>

                    {/* Action Items Section */}
                    {Array.isArray(m.actionItems) && m.actionItems.length > 0 && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 8,
                          background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.02)",
                          border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckSquare size={14} color="#38bdf8" /> Action Items & Deliverables ({m.actionItems.length})
                          </div>
                          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8" }}>
                            {openActions === 0 ? "✓ All action items completed" : `${openActions} open items pending`}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {m.actionItems.map((ai, aidx) => {
                            const isDone = ai.status === "Done";
                            return (
                              <div
                                key={ai.id || aidx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 10px",
                                  borderRadius: 6,
                                  background: isDone
                                    ? (isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.02)")
                                    : (isLight ? "#f8fafc" : "rgba(18, 22, 34, 0.6)"),
                                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.05)",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
                                  {/* Interactive Status Pill */}
                                  <button
                                    type="button"
                                    onClick={() => onToggleActionItem(m.id, ai.id)}
                                    title="Click to toggle status (Pending → In Progress → Done)"
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 7px",
                                      borderRadius: 12,
                                      border: isDone
                                        ? "1px solid rgba(34, 197, 94, 0.4)"
                                        : ai.status === "In Progress"
                                        ? "1px solid rgba(168, 85, 247, 0.4)"
                                        : "1px solid rgba(245, 158, 11, 0.4)",
                                      background: isDone
                                        ? "rgba(34, 197, 94, 0.16)"
                                        : ai.status === "In Progress"
                                        ? "rgba(168, 85, 247, 0.16)"
                                        : "rgba(245, 158, 11, 0.16)",
                                      color: isDone
                                        ? "#4ade80"
                                        : ai.status === "In Progress"
                                        ? "#c084fc"
                                        : "#fbbf24",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {isDone ? "✓ Done" : ai.status || "Pending"}
                                  </button>

                                  {/* Task Description */}
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: isDone
                                        ? (isLight ? "#94a3b8" : "#64748b")
                                        : (isLight ? "#0f172a" : "#f1f5f9"),
                                      textDecoration: isDone ? "line-through" : "none",
                                    }}
                                  >
                                    {ai.task}
                                  </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                                  {/* Owner */}
                                  <span style={{ color: isLight ? "#475569" : "#94a3b8", fontWeight: 600 }}>
                                    👤 {ai.owner || "Unassigned"}
                                  </span>

                                  {/* Due Date */}
                                  {ai.dueDate && (
                                    <span style={{ color: isLight ? "#64748b" : "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>
                                      📅 {ai.dueDate}
                                    </span>
                                  )}

                                  {/* Priority */}
                                  <span
                                    style={{
                                      fontSize: 9.5,
                                      fontWeight: 700,
                                      padding: "1px 5px",
                                      borderRadius: 3,
                                      background:
                                        ai.priority === "Critical"
                                          ? "rgba(239, 68, 68, 0.18)"
                                          : ai.priority === "High"
                                          ? "rgba(245, 158, 11, 0.18)"
                                          : "rgba(56, 189, 248, 0.15)",
                                      color:
                                        ai.priority === "Critical"
                                          ? "#ff6479"
                                          : ai.priority === "High"
                                          ? "#fbbf24"
                                          : "#38bdf8",
                                    }}
                                  >
                                    {ai.priority || "Medium"}
                                  </span>

                                  {/* Push to Dev-Test Matrix */}
                                  {ai.pushedToMatrix ? (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#22c55e",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        background: "rgba(34, 197, 94, 0.12)",
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                      }}
                                    >
                                      ✓ In Matrix
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onPushToTestMatrix(m, ai)}
                                      title="Convert this client action item into a directive on the Dev-Test Execution Matrix"
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#38bdf8",
                                        background: "rgba(56, 189, 248, 0.12)",
                                        border: "1px solid rgba(56, 189, 248, 0.3)",
                                        padding: "2px 7px",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        transition: "all 0.15s ease",
                                      }}
                                    >
                                      <FileSpreadsheet size={10} />
                                      + Push to Matrix
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------- District Bill Tracker Matrix ---------------------------- */

function exportBillsCSV(bills = []) {
  const headers = [
    "Sr. No.",
    "District / Location",
    "Total Bills",
    "Gathering Details",
    "In Process",
    "Completed",
    "% Completed",
  ];

  const rows = bills.map((b, idx) => {
    const total =
      Number(b.gatheringDetails || 0) +
      Number(b.inProcess || 0) +
      Number(b.completed || 0);
    const completed = Number(b.completed || 0);
    const pct = total > 0 ? `${Math.round((completed / total) * 100)}%` : "";
    return [
      idx + 1,
      `"${(b.district || "").replace(/"/g, '""')}"`,
      total,
      Number(b.gatheringDetails || 0),
      Number(b.inProcess || 0),
      completed,
      `"${pct}"`,
    ].join(",");
  });

  const totalAll = bills.reduce(
    (acc, b) =>
      acc +
      (Number(b.gatheringDetails || 0) +
        Number(b.inProcess || 0) +
        Number(b.completed || 0)),
    0
  );
  const gatheringAll = bills.reduce((acc, b) => acc + Number(b.gatheringDetails || 0), 0);
  const inProcessAll = bills.reduce((acc, b) => acc + Number(b.inProcess || 0), 0);
  const completedAll = bills.reduce((acc, b) => acc + Number(b.completed || 0), 0);
  const overallPct = totalAll > 0 ? `${Math.round((completedAll / totalAll) * 100)}%` : "0%";

  const totalRow = [
    "",
    "TOTAL",
    totalAll,
    gatheringAll,
    inProcessAll,
    completedAll,
    `"${overallPct}"`,
  ].join(",");

  const csvContent =
    "\uFEFF" +
    [
      "District-wise Summary - Fixed 34 Locations (Auto-calculated from Bill Tracker)",
      `All 34 districts always shown. Counts update automatically from Bill Tracker. Data as of 01-Sep-2026 EOD. Exported: ${new Date().toLocaleDateString("en-IN")}.`,
      "",
      headers.join(","),
      ...rows,
      totalRow,
      "",
      "Tip: Filter Bill Tracker by District to see all bills under one location. Add new bills anytime - this summary updates automatically.",
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ZPBDMS_District_Bill_Tracker_${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function BillTrackerView({
  bills,
  allBills,
  onEditBill,
  onExportCSV,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  isLight,
}) {
  const totalAll = allBills.reduce(
    (acc, b) =>
      acc +
      (Number(b.gatheringDetails || 0) +
        Number(b.inProcess || 0) +
        Number(b.completed || 0)),
    0
  );
  const gatheringAll = allBills.reduce((acc, b) => acc + Number(b.gatheringDetails || 0), 0);
  const inProcessAll = allBills.reduce((acc, b) => acc + Number(b.inProcess || 0), 0);
  const completedAll = allBills.reduce((acc, b) => acc + Number(b.completed || 0), 0);
  const overallPct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  const completedDistrictsCount = allBills.filter((b) => {
    const total = Number(b.gatheringDetails || 0) + Number(b.inProcess || 0) + Number(b.completed || 0);
    return total > 0 && Number(b.completed || 0) === total;
  }).length;

  const filterOptions = [
    { label: "All Districts", count: allBills.length },
    { label: "100% Completed", count: completedDistrictsCount },
    { label: "In Process", count: allBills.filter((b) => Number(b.inProcess || 0) > 0).length },
    { label: "Gathering Details", count: allBills.filter((b) => Number(b.gatheringDetails || 0) > 0).length },
    {
      label: "Zero Bills",
      count: allBills.filter(
        (b) =>
          Number(b.gatheringDetails || 0) +
            Number(b.inProcess || 0) +
            Number(b.completed || 0) ===
          0
      ).length,
    },
    {
      label: "Active Bills (>0)",
      count: allBills.filter(
        (b) =>
          Number(b.gatheringDetails || 0) +
            Number(b.inProcess || 0) +
            Number(b.completed || 0) >
          0
      ).length,
    },
  ];

  return (
    <div>
      {/* 4 High-Graphic Stat KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Total Bills */}
        <div className="glass-card" style={{ padding: "18px 20px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Total Bills Registered
            </span>
            <Receipt size={17} color="#ff334b" />
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: isLight ? "#0f172a" : "#ffffff", marginTop: 8 }}>
            {totalAll}
          </div>
          <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8", marginTop: 4 }}>
            Across all 34 fixed Maharashtra ZPs
          </div>
        </div>

        {/* Gathering Details */}
        <div
          className="glass-card"
          style={{
            padding: "18px 20px",
            background: isLight ? "#fffbeb" : "rgba(245, 158, 11, 0.08)",
            border: isLight ? "1px solid #fde68a" : "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#d97706", textTransform: "uppercase", fontWeight: 700 }}>
              Gathering Details
            </span>
            <AlertCircle size={17} color="#f59e0b" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#d97706" }}>{gatheringAll}</div>
            <div style={{ fontSize: 12, color: isLight ? "#92400e" : "#fbbf24" }}>
              ({totalAll > 0 ? Math.round((gatheringAll / totalAll) * 100) : 0}%)
            </div>
          </div>
          <div style={{ fontSize: 12, color: isLight ? "#78350f" : "#fcd34d", marginTop: 4 }}>
            Pending vendor or field specifications
          </div>
        </div>

        {/* In Process */}
        <div
          className="glass-card"
          style={{
            padding: "18px 20px",
            background: isLight ? "#f0f9ff" : "rgba(56, 189, 248, 0.08)",
            border: isLight ? "1px solid #bae6fd" : "1px solid rgba(56, 189, 248, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#0284c7", textTransform: "uppercase", fontWeight: 700 }}>
              In Process
            </span>
            <TrendingUp size={17} color="#0284c7" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#0284c7" }}>{inProcessAll}</div>
            <div style={{ fontSize: 12, color: isLight ? "#0369a1" : "#7dd3fc" }}>
              ({totalAll > 0 ? Math.round((inProcessAll / totalAll) * 100) : 0}%)
            </div>
          </div>
          <div style={{ fontSize: 12, color: isLight ? "#075985" : "#bae6fd", marginTop: 4 }}>
            Active in treasury & clearance workflow
          </div>
        </div>

        {/* Completed */}
        <div
          className="glass-card"
          style={{
            padding: "18px 20px",
            background: isLight ? "#f0fdf4" : "rgba(34, 197, 94, 0.08)",
            border: isLight ? "1px solid #bbf7d0" : "1px solid rgba(34, 197, 94, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#16a34a", textTransform: "uppercase", fontWeight: 700 }}>
              Completed / Cleared
            </span>
            <CheckCircle size={17} color="#16a34a" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#16a34a" }}>{completedAll}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
              ({overallPct}% Overall)
            </div>
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: 5,
              background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
              marginTop: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${overallPct}%`,
                height: "100%",
                background: "#22c55e",
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div
        className="glass-card"
        style={{
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {filterOptions.map((opt) => {
            const active = filterStatus === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => setFilterStatus(opt.label)}
                style={{
                  border: active
                    ? "1px solid rgba(255, 51, 75, 0.5)"
                    : isLight
                    ? "1px solid #cbd5e1"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  background: active
                    ? isLight
                      ? "rgba(255, 51, 75, 0.12)"
                      : "rgba(255, 51, 75, 0.18)"
                    : isLight
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.03)",
                  color: active ? "#ff334b" : isLight ? "#475569" : "#94a3b8",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{opt.label}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: active
                      ? "#ff334b"
                      : isLight
                      ? "#e2e8f0"
                      : "rgba(255, 255, 255, 0.08)",
                    color: active ? "#ffffff" : isLight ? "#475569" : "#cbd5e1",
                    fontWeight: 700,
                  }}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Export Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 240px", justifyContent: "flex-end" }}>
          <div style={{ position: "relative", minWidth: 200, maxWidth: 300, flex: 1 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: isLight ? "#64748b" : "#94a3b8",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, counts..."
              style={{
                ...darkInputStyle,
                padding: "7px 10px 7px 32px",
                fontSize: 12.5,
                borderRadius: 20,
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
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 2,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            className="btn-ghost-dark"
            onClick={onExportCSV}
            style={{ padding: "7px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            title="Download full 34 district bill register as Excel-compatible CSV"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Main District Matrix Table Container */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1060,
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "70px" }} />   {/* Sr. No. */}
              <col style={{ width: "240px" }} />  {/* District / Location */}
              <col style={{ width: "110px" }} />  {/* Total Bills */}
              <col style={{ width: "135px" }} />  {/* Gathering Details */}
              <col style={{ width: "110px" }} />  {/* In Process */}
              <col style={{ width: "110px" }} />  {/* Completed */}
              <col style={{ width: "130px" }} />  {/* % Completed */}
              <col style={{ width: "140px" }} />  {/* Rollout Status */}
              <col style={{ width: "95px" }} />   {/* Actions */}
            </colgroup>

            <thead>
              <tr
                style={{
                  height: 46,
                  background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.03)",
                  borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  color: isLight ? "#475569" : "#94a3b8",
                }}
              >
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>Sr. No.</th>
                <th style={{ textAlign: "left", padding: "0 16px", verticalAlign: "middle" }}>District / Location</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>Total Bills</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>Gathering Details</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>In Process</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>Completed</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>% Completed</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>Rollout Status</th>
                <th style={{ textAlign: "center", padding: "0 10px", verticalAlign: "middle" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "40px 20px", textAlign: "center", color: isLight ? "#64748b" : "#94a3b8" }}>
                    <Receipt size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No district records match the active filter</div>
                    <button
                      onClick={() => {
                        setFilterStatus("All Districts");
                        setSearchQuery("");
                      }}
                      style={{
                        marginTop: 10,
                        background: "transparent",
                        border: "none",
                        color: "#ff334b",
                        cursor: "pointer",
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                bills.map((b, idx) => {
                  const total =
                    Number(b.gatheringDetails || 0) +
                    Number(b.inProcess || 0) +
                    Number(b.completed || 0);
                  const gathering = Number(b.gatheringDetails || 0);
                  const inProc = Number(b.inProcess || 0);
                  const comp = Number(b.completed || 0);
                  const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
                  const isFinished = total > 0 && comp === total;
                  const isZero = total === 0;

                  return (
                    <tr
                      key={b.id || b.district}
                      className="custom-table-row"
                      style={{
                        height: 52,
                        borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Sr. No. */}
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: isLight ? "#64748b" : "#64748b",
                          fontWeight: 600,
                          padding: "0 10px",
                        }}
                      >
                        #{String(b.srNo || idx + 1).padStart(2, "0")}
                      </td>

                      {/* District Name */}
                      <td style={{ textAlign: "left", verticalAlign: "middle", padding: "0 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: isFinished
                                ? "rgba(34, 197, 94, 0.12)"
                                : isZero
                                ? isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 51, 75, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isFinished ? "#22c55e" : isZero ? "#64748b" : "#ff334b",
                              flexShrink: 0,
                            }}
                          >
                            <Landmark size={14} />
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isLight ? "#0f172a" : "#ffffff",
                              fontSize: 13.5,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={b.district}
                          >
                            {b.district}
                          </span>
                          {b.notes && b.notes.trim() && (
                            <span
                              title={b.notes}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                color: "#ff6479",
                                cursor: "help",
                                flexShrink: 0,
                              }}
                            >
                              <MessageSquare size={13} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Bills */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 38,
                            height: 26,
                            padding: "0 8px",
                            borderRadius: 6,
                            background: isZero
                              ? isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.04)"
                              : isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.08)",
                            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 800,
                            fontSize: 13,
                            color: isZero ? "#94a3b8" : isLight ? "#0f172a" : "#ffffff",
                          }}
                        >
                          {total}
                        </span>
                      </td>

                      {/* Gathering Details */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 38,
                            height: 26,
                            padding: "0 8px",
                            borderRadius: 6,
                            background: gathering > 0 ? "rgba(245, 158, 11, 0.14)" : isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.03)",
                            border: gathering > 0 ? "1px solid rgba(245, 158, 11, 0.35)" : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 800,
                            fontSize: 13,
                            color: gathering > 0 ? "#f59e0b" : isLight ? "#94a3b8" : "#475569",
                          }}
                        >
                          {gathering}
                        </span>
                      </td>

                      {/* In Process */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 38,
                            height: 26,
                            padding: "0 8px",
                            borderRadius: 6,
                            background: inProc > 0 ? "rgba(56, 189, 248, 0.14)" : isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.03)",
                            border: inProc > 0 ? "1px solid rgba(56, 189, 248, 0.35)" : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 800,
                            fontSize: 13,
                            color: inProc > 0 ? "#38bdf8" : isLight ? "#94a3b8" : "#475569",
                          }}
                        >
                          {inProc}
                        </span>
                      </td>

                      {/* Completed */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 38,
                            height: 26,
                            padding: "0 8px",
                            borderRadius: 6,
                            background: comp > 0 ? "rgba(34, 197, 94, 0.14)" : isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.03)",
                            border: comp > 0 ? "1px solid rgba(34, 197, 94, 0.35)" : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 800,
                            fontSize: 13,
                            color: comp > 0 ? "#22c55e" : isLight ? "#94a3b8" : "#475569",
                          }}
                        >
                          {comp}
                        </span>
                      </td>

                      {/* % Completed */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        {total > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: isFinished ? "#22c55e" : pct > 0 ? "#38bdf8" : "#94a3b8",
                              }}
                            >
                              {pct}%
                            </span>
                            <div
                              style={{
                                width: 68,
                                height: 4,
                                background: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: "100%",
                                  background: isFinished ? "#22c55e" : "#38bdf8",
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: isLight ? "#94a3b8" : "#475569", fontWeight: 600 }}>-</span>
                        )}
                      </td>

                      {/* Rollout Status */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        {isZero ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 95,
                              height: 24,
                              padding: "0 10px",
                              borderRadius: 12,
                              background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                              color: isLight ? "#64748b" : "#94a3b8",
                              fontSize: 11,
                              fontWeight: 600,
                              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            Zero Bills
                          </span>
                        ) : isFinished ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 95,
                              height: 24,
                              padding: "0 10px",
                              borderRadius: 12,
                              background: "rgba(34, 197, 94, 0.14)",
                              color: "#22c55e",
                              fontSize: 11,
                              fontWeight: 700,
                              border: "1px solid rgba(34, 197, 94, 0.35)",
                            }}
                          >
                            100% Cleared
                          </span>
                        ) : inProc > 0 && comp > 0 ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 95,
                              height: 24,
                              padding: "0 10px",
                              borderRadius: 12,
                              background: "rgba(168, 85, 247, 0.14)",
                              color: "#a855f7",
                              fontSize: 11,
                              fontWeight: 700,
                              border: "1px solid rgba(168, 85, 247, 0.35)",
                            }}
                          >
                            Partial ({comp}/{total})
                          </span>
                        ) : inProc > 0 ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 95,
                              height: 24,
                              padding: "0 10px",
                              borderRadius: 12,
                              background: "rgba(56, 189, 248, 0.14)",
                              color: "#38bdf8",
                              fontSize: 11,
                              fontWeight: 700,
                              border: "1px solid rgba(56, 189, 248, 0.35)",
                            }}
                          >
                            In Process
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 95,
                              height: 24,
                              padding: "0 10px",
                              borderRadius: 12,
                              background: "rgba(245, 158, 11, 0.14)",
                              color: "#f59e0b",
                              fontSize: 11,
                              fontWeight: 700,
                              border: "1px solid rgba(245, 158, 11, 0.35)",
                            }}
                          >
                            Gathering Info
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                        <button
                          onClick={() => onEditBill(b)}
                          style={{
                            background: "rgba(255, 51, 75, 0.1)",
                            border: "1px solid rgba(255, 51, 75, 0.3)",
                            color: "#ff6479",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            transition: "all 0.15s ease",
                          }}
                          title={`Edit bill count figures for ${b.district}`}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Dedicated TOTAL Summary Row matching exact CSV numbers */}
            <tfoot>
              <tr
                style={{
                  height: 56,
                  background: isLight ? "#f8fafc" : "rgba(255, 51, 75, 0.05)",
                  borderTop: isLight ? "2px solid #e2e8f0" : "2px solid rgba(255, 51, 75, 0.3)",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px", color: "#ff334b" }}>
                  <BarChart2 size={16} style={{ margin: "0 auto" }} />
                </td>
                <td style={{ textAlign: "left", verticalAlign: "middle", padding: "0 16px" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: isLight ? "#0f172a" : "#ffffff", letterSpacing: "0.5px" }}>
                    STATEWIDE TOTAL (34 ZPs)
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 42,
                      height: 28,
                      padding: "0 8px",
                      borderRadius: 6,
                      background: "#ff334b",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {totalAll}
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 42,
                      height: 28,
                      padding: "0 8px",
                      borderRadius: 6,
                      background: "rgba(245, 158, 11, 0.2)",
                      color: "#d97706",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {gatheringAll}
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 42,
                      height: 28,
                      padding: "0 8px",
                      borderRadius: 6,
                      background: "rgba(56, 189, 248, 0.2)",
                      color: "#0284c7",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {inProcessAll}
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 42,
                      height: 28,
                      padding: "0 8px",
                      borderRadius: 6,
                      background: "rgba(34, 197, 94, 0.2)",
                      color: "#16a34a",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {completedAll}
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#16a34a" }}>
                      {overallPct}%
                    </span>
                    <div
                      style={{
                        width: 70,
                        height: 4,
                        background: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.15)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ width: `${overallPct}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 24,
                      padding: "0 10px",
                      borderRadius: 12,
                      background: "rgba(255, 51, 75, 0.12)",
                      color: "#ff334b",
                      fontSize: 11,
                      fontWeight: 700,
                      border: "1px solid rgba(255, 51, 75, 0.3)",
                    }}
                  >
                    Live Synchronized
                  </span>
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "0 10px" }}>
                  <button
                    onClick={onExportCSV}
                    style={{
                      background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.08)",
                      border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                      color: isLight ? "#0f172a" : "#cbd5e1",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title="Export complete table"
                  >
                    <Download size={11} /> CSV
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Official Footnote / Operational Notice matching spreadsheet instructions */}
      <div
        className="glass-card"
        style={{
          marginTop: 16,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderLeft: "3px solid #ff334b",
          fontSize: 12,
          color: isLight ? "#475569" : "#94a3b8",
          lineHeight: 1.5,
        }}
      >
        <Landmark size={18} color="#ff334b" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: isLight ? "#0f172a" : "#ffffff" }}>
            District-wise Summary - Fixed 34 Locations:
          </strong>{" "}
          All 34 Maharashtra ZP districts are permanently registered. Counts synchronize live across team members in real-time via cloud storage. Data baseline established as of 01-Sep-2026 EOD. Use "Edit" to modify numbers anytime.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- District Approval Flows & Headcode Routing Module ---------------------------- */

function FlowOfficialModal({ initial, stageName, deptHeadCodes = [], onSave, onCancel, isLight }) {
  const [name, setName] = useState(initial?.name || "");
  const [designation, setDesignation] = useState(initial?.designation || "");
  const [username, setUsername] = useState(initial?.username || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [deskLocation, setDeskLocation] = useState(initial?.deskLocation || "");
  const [headCodesText, setHeadCodesText] = useState((initial?.headCodes || []).join(", "));
  const [notes, setNotes] = useState(initial?.notes || "");

  const handleAddHeadTag = (tag) => {
    const current = headCodesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!current.includes(tag)) {
      setHeadCodesText([...current, tag].join(", "));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Official Name is required.");
    const codes = headCodesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      id: initial?.id || "off_" + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      designation: designation.trim() || stageName,
      username: username.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      phone: phone.trim() || "+91 98000 00000",
      deskLocation: deskLocation.trim() || "District Office",
      headCodes: codes.length > 0 ? codes : ["ALL HEAD CODES"],
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8", marginBottom: 2 }}>
        Assign or update the official responsible for <strong>{stageName}</strong> and their mapped budget Head Codes.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
            Official Name *
          </label>
          <input
            type="text"
            className="input-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shri S. R. Patil"
            required
            autoFocus
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
            Official Designation *
          </label>
          <input
            type="text"
            className="input-base"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Junior Engineer / Desk Maker"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
            Login Username / Emp Code *
          </label>
          <input
            type="text"
            className="input-base"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. pune_rws_maker1"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
            Contact / Mobile Number *
          </label>
          <input
            type="text"
            className="input-base"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98220 12345"
          />
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
          Office / Desk Location
        </label>
        <input
          type="text"
          className="input-base"
          value={deskLocation}
          onChange={(e) => setDeskLocation(e.target.value)}
          placeholder="e.g. Room 204, RWS Building, Pune ZP"
        />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8" }}>
            Mapped Head Codes (Comma-Separated) *
          </label>
          <span style={{ fontSize: 10, color: "#ff334b", fontWeight: 600 }}>Determines file routing</span>
        </div>
        <input
          type="text"
          className="input-base"
          value={headCodesText}
          onChange={(e) => setHeadCodesText(e.target.value)}
          placeholder="e.g. 2215-01 (Rural Water), 2215-02 (JJM)"
          required
        />
        {deptHeadCodes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: isLight ? "#64748b" : "#94a3b8" }}>Quick Add:</span>
            {deptHeadCodes.map((hc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddHeadTag(hc)}
                style={{
                  background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)",
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.12)",
                  color: isLight ? "#0f172a" : "#f1f5f9",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                + {hc}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleAddHeadTag("ALL HEAD CODES")}
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                borderRadius: 12,
                padding: "2px 8px",
                fontSize: 10,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + ALL HEAD CODES
            </button>
          </div>
        )}
      </div>

      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
          Delegation Powers & Scrutiny Notes
        </label>
        <textarea
          className="input-base"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Scrutinizes bills up to ₹25 Lakhs. Forwarding authority for civil works."
          style={{ resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 10, borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)" }}>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ padding: "8px 16px", fontSize: 12 }}>
          Cancel
        </button>
        <button type="submit" className="btn-red-gradient" style={{ padding: "8px 20px", fontSize: 12 }}>
          Save Official Mapping
        </button>
      </div>
    </form>
  );
}

function AddDepartmentModal({ onSave, onCancel, isLight }) {
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [headCodesText, setHeadCodesText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deptName.trim()) return alert("Department Name is required.");
    const code = (deptCode.trim() || deptName.trim().slice(0, 4)).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const heads = headCodesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newDept = createStandardDepartment(
      deptName.trim(),
      code,
      heads.length > 0 ? heads : [`${code}-01 (General)`]
    );
    onSave(newDept);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
        Add a new department to this district. It will automatically be provisioned with the standard 8-stage billing workflow: 
        <strong> Maker ➔ Checker ➔ HOD ➔ FD Auditor ➔ AAO ➔ AO ➔ CAFO ➔ Cashier</strong>.
      </div>

      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
          Department Name (English & Marathi) *
        </label>
        <input
          type="text"
          className="input-base"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
          placeholder="e.g. Social Welfare Department (समाजकल्याण विभाग)"
          required
          autoFocus
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
            Department Code *
          </label>
          <input
            type="text"
            className="input-base"
            value={deptCode}
            onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
            placeholder="e.g. SWD"
            required
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#475569" : "#94a3b8", marginBottom: 5 }}>
            Primary Head Codes (Comma-Separated)
          </label>
          <input
            type="text"
            className="input-base"
            value={headCodesText}
            onChange={(e) => setHeadCodesText(e.target.value)}
            placeholder="e.g. 2225-01 (Welfare of SC), 2225-02 (Tribal)"
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, paddingTop: 10, borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)" }}>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ padding: "8px 16px", fontSize: 12 }}>
          Cancel
        </button>
        <button type="submit" className="btn-red-gradient" style={{ padding: "8px 20px", fontSize: 12 }}>
          Provision Department Workflow
        </button>
      </div>
    </form>
  );
}

function DistrictFlowsView({ flows = [], onSaveFlows, currentUser, isSudhanshu, isManager, isCEO, isLight }) {
  const [viewLevel, setViewLevel] = useState("districts"); // "districts" | "departments" | "flow"
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState(null);

  // Filters
  const [districtSearch, setDistrictSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [deptSearch, setDeptSearch] = useState("");
  const [headCodeQuery, setHeadCodeQuery] = useState("");
  const [activeStepFilter, setActiveStepFilter] = useState(null);

  // Modals
  const [modalState, setModalState] = useState(null); // { type: "official" | "add_dept", districtId, deptId, step, official }

  const canEdit = isSudhanshu || isManager || isCEO;

  // Derive active district and department
  const activeDistrict = flows.find((d) => d.districtId === selectedDistrictId) || null;
  const activeDepartment = activeDistrict?.departments?.find((dept) => dept.id === selectedDeptId) || null;

  // Filtered districts
  const filteredDistricts = flows.filter((d) => {
    const matchesSearch = !districtSearch.trim() || d.districtName.toLowerCase().includes(districtSearch.toLowerCase().trim());
    const matchesDiv = divisionFilter === "All" || d.division === divisionFilter;
    return matchesSearch && matchesDiv;
  });

  // Filtered departments in active district
  const filteredDepartments = (activeDistrict?.departments || []).filter((dept) => {
    if (!deptSearch.trim()) return true;
    const q = deptSearch.toLowerCase().trim();
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.code.toLowerCase().includes(q) ||
      (dept.headCodes || []).some((h) => h.toLowerCase().includes(q))
    );
  });

  // Diagnostic calculations for Level 3
  const activeHeadQueryClean = headCodeQuery.trim().toLowerCase();

  const diagnosticResults = React.useMemo(() => {
    if (!activeDepartment || !activeHeadQueryClean) return null;
    const stages = activeDepartment.stages || [];
    const results = stages.map((st) => {
      const matchingOfficials = (st.officials || []).filter((off) => {
        const matchesHead = (off.headCodes || []).some((hc) => {
          const lowerHc = hc.toLowerCase();
          return lowerHc.includes(activeHeadQueryClean) || lowerHc.includes("all head codes");
        });
        const matchesName = (off.name || "").toLowerCase().includes(activeHeadQueryClean);
        return matchesHead || matchesName;
      });
      return {
        step: st.step,
        roleName: st.roleName,
        shortRole: st.shortRole,
        hasMatch: matchingOfficials.length > 0,
        matchingOfficials,
      };
    });
    const missingSteps = results.filter((r) => !r.hasMatch);
    return { results, missingSteps };
  }, [activeDepartment, activeHeadQueryClean]);

  // Handler: Update official in stage
  const handleSaveOfficial = (updatedOfficial) => {
    if (!activeDistrict || !activeDepartment || !modalState) return;
    const { step, isAdd } = modalState;

    const nextFlows = flows.map((dist) => {
      if (dist.districtId !== activeDistrict.districtId) return dist;
      const nextDepts = dist.departments.map((dept) => {
        if (dept.id !== activeDepartment.id) return dept;
        const nextStages = dept.stages.map((st) => {
          if (st.step !== step) return st;
          let nextOfficials = [];
          if (isAdd) {
            nextOfficials = [...(st.officials || []), updatedOfficial];
          } else {
            nextOfficials = (st.officials || []).map((off) => (off.id === updatedOfficial.id ? updatedOfficial : off));
          }
          return { ...st, officials: nextOfficials };
        });
        return { ...dept, stages: nextStages };
      });
      return { ...dist, departments: nextDepts, updatedAt: todayISO() };
    });

    onSaveFlows(
      nextFlows,
      `${isAdd ? "Added" : "Updated"} official ${updatedOfficial.name} for ${activeDistrict.districtName} - ${activeDepartment.code} (Step ${step})`
    );
    setModalState(null);
  };

  // Handler: Remove official from stage
  const handleRemoveOfficial = (step, officialId) => {
    if (!confirm("Are you sure you want to remove this official mapping?")) return;
    const nextFlows = flows.map((dist) => {
      if (dist.districtId !== activeDistrict.districtId) return dist;
      const nextDepts = dist.departments.map((dept) => {
        if (dept.id !== activeDepartment.id) return dept;
        const nextStages = dept.stages.map((st) => {
          if (st.step !== step) return st;
          return { ...st, officials: (st.officials || []).filter((off) => off.id !== officialId) };
        });
        return { ...dept, stages: nextStages };
      });
      return { ...dist, departments: nextDepts, updatedAt: todayISO() };
    });

    onSaveFlows(
      nextFlows,
      `Removed official mapping from ${activeDistrict.districtName} - ${activeDepartment.code} (Step ${step})`
    );
  };

  // Handler: Add new department
  const handleSaveNewDepartment = (newDept) => {
    if (!activeDistrict) return;
    const nextFlows = flows.map((dist) => {
      if (dist.districtId !== activeDistrict.districtId) return dist;
      return {
        ...dist,
        departments: [...(dist.departments || []), newDept],
        updatedAt: todayISO(),
      };
    });
    onSaveFlows(nextFlows, `Provisioned new department ${newDept.name} in ${activeDistrict.districtName}`);
    setModalState(null);
  };

  // KPI Calculations
  const totalDistrictsCount = flows.length;
  const totalDeptsCount = flows.reduce((sum, d) => sum + (d.departments || []).length, 0);
  const totalDivisionsCount = Object.keys(MAHARASHTRA_DIVISIONS).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Dynamic Breadcrumbs Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: isLight ? "#64748b" : "#94a3b8",
          flexWrap: "wrap",
          padding: "8px 12px",
          background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.02)",
          borderRadius: 8,
          border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <button
          onClick={() => {
            setViewLevel("districts");
            setSelectedDistrictId(null);
            setSelectedDeptId(null);
            setHeadCodeQuery("");
          }}
          style={{
            background: "none",
            border: "none",
            color: viewLevel === "districts" ? "#ff334b" : isLight ? "#0f172a" : "#f1f5f9",
            fontWeight: viewLevel === "districts" ? 700 : 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          <Landmark size={14} color="#ff334b" />
          All 34 Districts
        </button>

        {activeDistrict && (
          <>
            <ChevronRight size={13} color="#64748b" />
            <button
              onClick={() => {
                setViewLevel("departments");
                setSelectedDeptId(null);
                setHeadCodeQuery("");
              }}
              style={{
                background: "none",
                border: "none",
                color: viewLevel === "departments" ? "#ff334b" : isLight ? "#0f172a" : "#f1f5f9",
                fontWeight: viewLevel === "departments" ? 700 : 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              <Building2 size={13} color="#3b82f6" />
              {activeDistrict.districtName} ({activeDistrict.division})
            </button>
          </>
        )}

        {activeDepartment && (
          <>
            <ChevronRight size={13} color="#64748b" />
            <span
              style={{
                color: "#ff334b",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                padding: "2px 6px",
              }}
            >
              <GitMerge size={13} color="#10b981" />
              {activeDepartment.name} ({activeDepartment.code})
            </span>
          </>
        )}
      </div>

      {/* =========================================================================
          LEVEL 1: DISTRICT SELECTION GRID (34 Fixed Maharashtra Jurisdictions)
          ========================================================================= */}
      {viewLevel === "districts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            <div className="glass-card" style={{ padding: "14px 18px", borderLeft: "4px solid #ff334b" }}>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Total ZP Jurisdictions
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 4 }}>
                {totalDistrictsCount}{" "}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#10b981" }}>• Fixed Maharashtra</span>
              </div>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                Full 34 Zilla Parishad directories
              </div>
            </div>

            <div className="glass-card" style={{ padding: "14px 18px", borderLeft: "4px solid #3b82f6" }}>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Revenue Divisions
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 4 }}>
                {totalDivisionsCount}{" "}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#3b82f6" }}>• Regional Circles</span>
              </div>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                Pune, Konkan, Nashik, Sambhajinagar, Amravati, Nagpur
              </div>
            </div>

            <div className="glass-card" style={{ padding: "14px 18px", borderLeft: "4px solid #10b981" }}>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Configured Departments
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 4 }}>
                {totalDeptsCount}{" "}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#10b981" }}>• Department Flows</span>
              </div>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                RWS, Works, Health, Panchayat, Finance, Education
              </div>
            </div>

            <div className="glass-card" style={{ padding: "14px 18px", borderLeft: "4px solid #f59e0b" }}>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                Standard Approval Pipeline
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", marginTop: 4 }}>
                8 Desks{" "}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#f59e0b" }}>• Maker to Cashier</span>
              </div>
              <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                Headcode-wise user routing & scrutiny checks
              </div>
            </div>
          </div>

          {/* Search & Division Filter Toolbar */}
          <div
            className="glass-card"
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 280px" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: isLight ? "#64748b" : "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="input-base"
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  placeholder="Search district name (e.g. Pune, Ahilyanagar, Nashik, Satara)..."
                  style={{ paddingLeft: 36 }}
                />
              </div>

              {districtSearch && (
                <button
                  className="btn-ghost"
                  onClick={() => setDistrictSearch("")}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  Clear Search
                </button>
              )}
            </div>

            {/* Division Pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#64748b" : "#94a3b8", marginRight: 4 }}>
                Divisions:
              </span>
              {["All", ...Object.keys(MAHARASHTRA_DIVISIONS)].map((divKey) => {
                const isSelected = divisionFilter === divKey;
                const count = divKey === "All" ? 34 : MAHARASHTRA_DIVISIONS[divKey].length;
                return (
                  <button
                    key={divKey}
                    onClick={() => setDivisionFilter(divKey)}
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)"
                        : isLight
                        ? "#f1f5f9"
                        : "rgba(255, 255, 255, 0.04)",
                      border: isSelected
                        ? "1px solid #ff334b"
                        : isLight
                        ? "1px solid #e2e8f0"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isSelected ? "#ffffff" : isLight ? "#334155" : "#cbd5e1",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 11.5,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{divKey === "All" ? "All Divisions" : divKey.replace(" Division", "")}</span>
                    <span
                      style={{
                        background: isSelected ? "rgba(255, 255, 255, 0.25)" : isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)",
                        color: isSelected ? "#ffffff" : isLight ? "#475569" : "#94a3b8",
                        borderRadius: 10,
                        padding: "1px 6px",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Districts Grid (Cards) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {filteredDistricts.map((d) => {
              const deptsCount = (d.departments || []).length;
              const totalHeads = (d.departments || []).reduce((acc, dept) => acc + (dept.headCodes || []).length, 0);
              const isPilot = ["pune", "ahilyanagar", "nashik", "satara", "chhatrapati sambhajinagar"].includes(d.districtName.toLowerCase());

              return (
                <div
                  key={d.districtId}
                  className="glass-card"
                  onClick={() => {
                    setSelectedDistrictId(d.districtId);
                    setViewLevel("departments");
                  }}
                  style={{
                    padding: "16px 18px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                    transition: "all 0.2s ease",
                    border: isPilot ? "1px solid rgba(255, 51, 75, 0.35)" : isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "#ff334b";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 51, 75, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = isPilot ? "rgba(255, 51, 75, 0.35)" : isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 7 }}>
                          <Landmark size={16} color="#ff334b" />
                          {d.districtName}
                        </div>
                        <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                          {d.division}
                        </div>
                      </div>
                      {isPilot && (
                        <span
                          style={{
                            background: "rgba(255, 51, 75, 0.15)",
                            color: "#ff334b",
                            border: "1px solid rgba(255, 51, 75, 0.3)",
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Pilot Config
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 14, fontSize: 11.5, color: isLight ? "#475569" : "#cbd5e1" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Building2 size={13} color="#3b82f6" />
                        <span><strong>{deptsCount}</strong> Departments</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Tag size={13} color="#10b981" />
                        <span><strong>{totalHeads}</strong> Head Codes</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.05)",
                      fontSize: 11.5,
                      color: "#ff334b",
                      fontWeight: 600,
                    }}
                  >
                    <span>View Department Workflows</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          LEVEL 2: DEPARTMENT SELECTION CARDS (Inside Selected District)
          ========================================================================= */}
      {viewLevel === "departments" && activeDistrict && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top Action & Info Banner */}
          <div
            className="glass-card"
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              borderLeft: "4px solid #ff334b",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => {
                    setViewLevel("districts");
                    setSelectedDistrictId(null);
                  }}
                  className="btn-ghost"
                  style={{ padding: "5px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <ArrowLeft size={13} /> All Districts
                </button>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <Landmark size={20} color="#ff334b" />
                  {activeDistrict.districtName} Zilla Parishad
                </h2>
                <span
                  style={{
                    background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)",
                    border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                    color: isLight ? "#475569" : "#cbd5e1",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                  }}
                >
                  {activeDistrict.division}
                </span>
              </div>
              <p style={{ margin: "6px 0 0 0", fontSize: 12.5, color: isLight ? "#64748b" : "#94a3b8" }}>
                Select a department below to view its 8-step billing approval hierarchy, active officials, and headcode routing mappings.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: 230 }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: isLight ? "#64748b" : "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="input-base"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder="Filter department..."
                  style={{ paddingLeft: 30, fontSize: 12, height: 34 }}
                />
              </div>

              {canEdit && (
                <button
                  className="btn-red-gradient"
                  onClick={() => setModalState({ type: "add_dept", districtId: activeDistrict.districtId })}
                  style={{ padding: "7px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={14} /> Add Department
                </button>
              )}
            </div>
          </div>

          {/* Department Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {filteredDepartments.map((dept) => {
              const stagesCount = (dept.stages || []).length;
              const totalOfficials = (dept.stages || []).reduce((sum, s) => sum + (s.officials || []).length, 0);
              const hodStage = (dept.stages || []).find((s) => s.step === 3);
              const hodName = hodStage?.officials?.[0]?.name || "Assigned HOD";

              return (
                <div
                  key={dept.id}
                  className="glass-card"
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    setViewLevel("flow");
                  }}
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 16,
                    transition: "all 0.2s ease",
                    border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "#ff334b";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 51, 75, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: "rgba(255, 51, 75, 0.12)",
                            border: "1px solid rgba(255, 51, 75, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ff334b",
                            fontWeight: 800,
                            fontSize: 12,
                          }}
                        >
                          {dept.code}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff", lineHeight: 1.2 }}>
                            {dept.name}
                          </div>
                          <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 3 }}>
                            HOD: <strong>{hodName}</strong>
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        8 Steps
                      </span>
                    </div>

                    {/* Head Codes Chips */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#64748b" : "#94a3b8", marginBottom: 5 }}>
                        Mapped Budget Head Codes:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {(dept.headCodes || []).map((hc, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.08)",
                              color: isLight ? "#334155" : "#cbd5e1",
                              fontSize: 10,
                              fontWeight: 500,
                              padding: "2px 7px",
                              borderRadius: 4,
                            }}
                          >
                            {hc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mini Flow Pipeline Preview */}
                    <div
                      style={{
                        marginTop: 14,
                        padding: "8px 10px",
                        background: isLight ? "#f8fafc" : "rgba(0, 0, 0, 0.25)",
                        borderRadius: 6,
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.04)",
                        fontSize: 10.5,
                        color: isLight ? "#64748b" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ color: "#ff334b", fontWeight: 700 }}>Flow:</span>
                      <span>Maker ➔ Checker ➔ HOD ➔ Auditor ➔ AAO ➔ AO ➔ CAFO ➔ Cashier</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTop: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.05)",
                      fontSize: 11.5,
                      color: "#ff334b",
                      fontWeight: 600,
                    }}
                  >
                    <span>{totalOfficials} Officials Mapped</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      Open Flow Matrix <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          LEVEL 3: 8-STAGE INTERACTIVE WORKFLOW & STUCK ENTRY DIAGNOSTIC TOOL
          ========================================================================= */}
      {viewLevel === "flow" && activeDistrict && activeDepartment && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Top Header & Department Info */}
          <div
            className="glass-card"
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              borderLeft: "4px solid #ff334b",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => {
                    setViewLevel("departments");
                    setSelectedDeptId(null);
                    setHeadCodeQuery("");
                  }}
                  className="btn-ghost"
                  style={{ padding: "5px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <ArrowLeft size={13} /> All Departments
                </button>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <GitMerge size={20} color="#ff334b" />
                  {activeDepartment.name}
                </h2>
                <span
                  style={{
                    background: "rgba(255, 51, 75, 0.15)",
                    border: "1px solid rgba(255, 51, 75, 0.3)",
                    color: "#ff334b",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {activeDepartment.code}
                </span>
              </div>
              <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8", marginTop: 4 }}>
                <strong>{activeDistrict.districtName} Zilla Parishad</strong> ({activeDistrict.division}) · Standard 8-Stage Sequential Approval Pipeline
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.05)",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: isLight ? "#475569" : "#cbd5e1",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Updated: {activeDistrict.updatedAt || todayISO()}
              </span>
            </div>
          </div>

          {/* 🌟 STUCK ENTRY & HEADCODE DIAGNOSTIC TOOL */}
          <div
            className="glass-card"
            style={{
              padding: "16px 20px",
              background: isLight
                ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)"
                : "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 78, 59, 0.15) 100%)",
              border: isLight ? "1px solid #86efac" : "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff" }}>
                    Stuck Entry & Head Code Route Tracer
                  </div>
                  <div style={{ fontSize: 11.5, color: isLight ? "#475569" : "#94a3b8" }}>
                    Filter by Head Code (e.g. 2215, 2515, 3054) or official name to trace the exact file path and detect missing approvers.
                  </div>
                </div>
              </div>

              {headCodeQuery && (
                <button
                  className="btn-ghost"
                  onClick={() => setHeadCodeQuery("")}
                  style={{ padding: "4px 10px", fontSize: 11, color: "#ff334b" }}
                >
                  Reset Diagnostic Filter
                </button>
              )}
            </div>

            {/* Diagnostic Search Input & Preset Pills */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 320px" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: isLight ? "#64748b" : "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="input-base"
                  value={headCodeQuery}
                  onChange={(e) => setHeadCodeQuery(e.target.value)}
                  placeholder="Type Head Code (e.g. 2215, 4215, 3054) or official name..."
                  style={{
                    paddingLeft: 36,
                    height: 38,
                    fontSize: 13,
                    borderColor: headCodeQuery ? "#10b981" : undefined,
                  }}
                />
              </div>

              {/* Department Head Code Presets */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: isLight ? "#64748b" : "#94a3b8" }}>Presets:</span>
                {(activeDepartment.headCodes || []).map((hc, idx) => {
                  const codeNum = hc.split(" ")[0] || hc;
                  return (
                    <button
                      key={idx}
                      onClick={() => setHeadCodeQuery(codeNum)}
                      style={{
                        background: headCodeQuery === codeNum ? "#10b981" : isLight ? "#ffffff" : "rgba(255, 255, 255, 0.06)",
                        border: headCodeQuery === codeNum ? "1px solid #10b981" : isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: headCodeQuery === codeNum ? "#ffffff" : isLight ? "#334155" : "#f1f5f9",
                        borderRadius: 14,
                        padding: "3px 9px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {codeNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Results Summary & Alerts */}
            {diagnosticResults && (
              <div
                style={{
                  marginTop: 6,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: isLight ? "#ffffff" : "rgba(0, 0, 0, 0.35)",
                  border: diagnosticResults.missingSteps.length > 0
                    ? "1px solid #f59e0b"
                    : "1px solid #10b981",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {diagnosticResults.missingSteps.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "#f59e0b", fontSize: 12 }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <strong>ROUTING GAP IDENTIFIED:</strong> Head Code query <strong>"{headCodeQuery}"</strong> is{" "}
                      <span style={{ textDecoration: "underline" }}>unassigned</span> at{" "}
                      <strong>
                        {diagnosticResults.missingSteps.map((m) => `Step ${m.step} (${m.shortRole})`).join(", ")}
                      </strong>.
                      <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#cbd5e1", marginTop: 2 }}>
                        If a voucher or bill under this head code is forwarded, it will stall and not appear in any approver's login inbox at these stages! Click "+ Add Official" below to map this head code.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 12 }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>COMPLETE ROUTE VERIFIED:</strong> Head Code <strong>"{headCodeQuery}"</strong> has mapped approvers across all 8 sequential stages from Maker to Cashier!
                    </div>
                  </div>
                )}

                {/* Visual Route Pipeline Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    overflowX: "auto",
                    paddingTop: 4,
                    fontSize: 11,
                  }}
                >
                  {diagnosticResults.results.map((res, idx) => (
                    <React.Fragment key={res.step}>
                      <div
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: res.hasMatch
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          border: res.hasMatch
                            ? "1px solid rgba(16, 185, 129, 0.4)"
                            : "1px solid rgba(239, 68, 68, 0.4)",
                          color: res.hasMatch ? "#10b981" : "#ef4444",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 90,
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{res.step}. {res.shortRole}</span>
                        <span style={{ fontSize: 9.5, opacity: 0.9 }}>
                          {res.hasMatch ? res.matchingOfficials[0]?.name.split(" ")[1] || res.matchingOfficials[0]?.name : "UNMAPPED ⚠️"}
                        </span>
                      </div>
                      {idx < diagnosticResults.results.length - 1 && (
                        <ArrowRight size={11} color={isLight ? "#94a3b8" : "#64748b"} style={{ flexShrink: 0 }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visual 8-Step Interactive Stepper Bar */}
          <div
            className="glass-card"
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              overflowX: "auto",
            }}
          >
            {STANDARD_BILLING_STAGES.map((st, idx) => {
              const isActive = activeStepFilter === st.step;
              const officialCount = (activeDepartment.stages?.find((s) => s.step === st.step)?.officials || []).length;

              return (
                <React.Fragment key={st.step}>
                  <button
                    onClick={() => setActiveStepFilter(isActive ? null : st.step)}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)"
                        : isLight
                        ? "#f8fafc"
                        : "rgba(255, 255, 255, 0.04)",
                      border: isActive
                        ? "1px solid #ff334b"
                        : isLight
                        ? "1px solid #e2e8f0"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#ffffff" : isLight ? "#0f172a" : "#f1f5f9",
                      borderRadius: 8,
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      minWidth: 105,
                      flex: "1 1 0",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: 9.5, opacity: 0.8, textTransform: "uppercase", fontWeight: 700 }}>
                      Step {st.step}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {st.shortRole}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.85 }}>
                      {officialCount} {officialCount === 1 ? "Officer" : "Officers"}
                    </span>
                  </button>
                  {idx < STANDARD_BILLING_STAGES.length - 1 && (
                    <ArrowRight size={13} color={isLight ? "#cbd5e1" : "#475569"} style={{ flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Stage by Stage Detailed Breakdown Cards (1 to 8) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(activeDepartment.stages || [])
              .filter((st) => activeStepFilter === null || activeStepFilter === st.step)
              .map((stage) => {
                const officials = stage.officials || [];
                const isMaker = stage.step === 1;
                const isAuditor = stage.step === 4;

                // Stage-specific troubleshooting tip
                const troubleshootingTips = {
                  1: "Maker Verification: Verify token status, Measurement Book (MB) entries, contractor GSTIN status, and fund availability.",
                  2: "Checker Verification: Ensure technical rate verification, GST TDS, IT TDS, royalty deduction, and labor cess are checked.",
                  3: "HOD Verification: Verify departmental technical sanction limit and check if Digital Signature Certificate (DSC) is active.",
                  4: "FD Auditor Verification: In multi-auditor departments, verify that this bill's specific Head Code is mapped to this auditor's table.",
                  5: "AAO Verification: Scrutinize treasury bill register entries (Namuna 9) and verify contract agreement compliance.",
                  6: "AO / Dy. CAFO Verification: Review expenditure sanction compliance with Maharashtra Zilla Parishad Financial Rules.",
                  7: "CAFO Verification: Confirm final drawing limits, Letter of Credit (LOC) allotment, and treasury drawal advice.",
                  8: "Cashier Verification: Verify CMP portal batch generation, RTGS/NEFT transaction status, or physical cheque release.",
                };

                return (
                  <div
                    key={stage.step}
                    className="glass-card"
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      borderLeft: `4px solid ${stage.step <= 3 ? "#3b82f6" : stage.step <= 6 ? "#f59e0b" : "#10b981"}`,
                    }}
                  >
                    {/* Stage Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: stage.step <= 3 ? "rgba(59, 130, 246, 0.15)" : stage.step <= 6 ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: stage.step <= 3 ? "#3b82f6" : stage.step <= 6 ? "#f59e0b" : "#10b981",
                            border: `1px solid ${stage.step <= 3 ? "rgba(59, 130, 246, 0.3)" : stage.step <= 6 ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {stage.step}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                            {stage.roleName}
                            <span style={{ fontSize: 11, fontWeight: 500, color: isLight ? "#64748b" : "#94a3b8" }}>
                              ({stage.shortRole})
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                            {stage.levelDesc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 12,
                            background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)",
                            color: isLight ? "#475569" : "#cbd5e1",
                          }}
                        >
                          {officials.length} {officials.length === 1 ? "Official Mapped" : "Officials Mapped"}
                        </span>
                        {canEdit && (
                          <button
                            className="btn-ghost"
                            onClick={() =>
                              setModalState({
                                type: "official",
                                isAdd: true,
                                step: stage.step,
                                stageName: stage.roleName,
                                deptHeadCodes: activeDepartment.headCodes || [],
                              })
                            }
                            style={{ padding: "4px 10px", fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <Plus size={13} /> Add Official
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Officials Roster Cards for this Stage */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {officials.map((off) => {
                        const isMatched =
                          headCodeQuery &&
                          ((off.headCodes || []).some((hc) => hc.toLowerCase().includes(activeHeadQueryClean) || hc.toLowerCase().includes("all head codes")) ||
                            (off.name || "").toLowerCase().includes(activeHeadQueryClean));

                        return (
                          <div
                            key={off.id}
                            style={{
                              padding: "14px 16px",
                              borderRadius: 8,
                              background: isMatched
                                ? isLight
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "rgba(16, 185, 129, 0.12)"
                                : isLight
                                ? "#ffffff"
                                : "rgba(255, 255, 255, 0.02)",
                              border: isMatched
                                ? "2px solid #10b981"
                                : isLight
                                ? "1px solid #e2e8f0"
                                : "1px solid rgba(255, 255, 255, 0.06)",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 10,
                              boxShadow: isMatched ? "0 0 14px rgba(16, 185, 129, 0.25)" : "none",
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: isLight ? "#0f172a" : "#ffffff", display: "flex", alignItems: "center", gap: 6 }}>
                                    <UserCheck size={14} color={isMatched ? "#10b981" : "#ff334b"} />
                                    {off.name}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: isLight ? "#475569" : "#cbd5e1", fontWeight: 500, marginTop: 2 }}>
                                    {off.designation}
                                  </div>
                                </div>

                                {isMatched && (
                                  <span
                                    style={{
                                      background: "#10b981",
                                      color: "#ffffff",
                                      fontSize: 9.5,
                                      fontWeight: 700,
                                      padding: "2px 7px",
                                      borderRadius: 10,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    <CheckCircle size={10} /> Active Route
                                  </span>
                                )}
                              </div>

                              {/* Contact & Desk Details */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, fontSize: 11, color: isLight ? "#64748b" : "#94a3b8" }}>
                                <div>
                                  Login ID: <strong style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>{off.username}</strong>
                                </div>
                                {off.phone && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Phone size={11} color="#10b981" />
                                    <a
                                      href={`tel:${off.phone}`}
                                      style={{ color: isLight ? "#0f172a" : "#38bdf8", textDecoration: "none", fontWeight: 600 }}
                                    >
                                      {off.phone}
                                    </a>
                                  </div>
                                )}
                                {off.deskLocation && (
                                  <div>
                                    Desk: <strong>{off.deskLocation}</strong>
                                  </div>
                                )}
                              </div>

                              {/* Mapped Head Codes */}
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: isLight ? "#64748b" : "#94a3b8", marginBottom: 4 }}>
                                  Assigned Head Codes:
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {(off.headCodes || []).map((hc, idx) => {
                                    const hcMatches = headCodeQuery && (hc.toLowerCase().includes(activeHeadQueryClean) || hc.toLowerCase().includes("all head codes"));
                                    return (
                                      <span
                                        key={idx}
                                        style={{
                                          background: hcMatches
                                            ? "rgba(16, 185, 129, 0.25)"
                                            : isLight
                                            ? "#f1f5f9"
                                            : "rgba(255, 255, 255, 0.05)",
                                          border: hcMatches
                                            ? "1px solid #10b981"
                                            : isLight
                                            ? "1px solid #cbd5e1"
                                            : "1px solid rgba(255, 255, 255, 0.08)",
                                          color: hcMatches ? "#10b981" : isLight ? "#334155" : "#cbd5e1",
                                          fontSize: 9.5,
                                          fontWeight: hcMatches ? 700 : 500,
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                        }}
                                      >
                                        {hc}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {off.notes && (
                                <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginTop: 8, fontStyle: "italic" }}>
                                  "{off.notes}"
                                </div>
                              )}
                            </div>

                            {/* Actions (If BA / Manager) */}
                            {canEdit && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 6,
                                  paddingTop: 8,
                                  borderTop: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255, 255, 255, 0.04)",
                                }}
                              >
                                <button
                                  className="btn-ghost"
                                  onClick={() =>
                                    setModalState({
                                      type: "official",
                                      isAdd: false,
                                      step: stage.step,
                                      stageName: stage.roleName,
                                      official: off,
                                      deptHeadCodes: activeDepartment.headCodes || [],
                                    })
                                  }
                                  style={{ padding: "3px 8px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 3 }}
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                                {officials.length > 1 && (
                                  <button
                                    className="btn-ghost"
                                    onClick={() => handleRemoveOfficial(stage.step, off.id)}
                                    style={{ padding: "3px 8px", fontSize: 11, color: "#ff334b", display: "inline-flex", alignItems: "center", gap: 3 }}
                                  >
                                    <Trash2 size={11} /> Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Troubleshooting Guide Box */}
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 6,
                        background: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.02)",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11.5,
                        color: isLight ? "#475569" : "#94a3b8",
                      }}
                    >
                      <HelpCircle size={15} color="#3b82f6" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>Why might an entry stall at {stage.shortRole}?</strong>{" "}
                        {troubleshootingTips[stage.step]}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODALS */}
      {modalState?.type === "official" && (
        <Modal
          title={modalState.isAdd ? `Add Official: ${modalState.stageName}` : `Edit Official: ${modalState.official?.name || "Official"}`}
          icon={UserCheck}
          onClose={() => setModalState(null)}
        >
          <FlowOfficialModal
            initial={modalState.official}
            stageName={modalState.stageName}
            deptHeadCodes={modalState.deptHeadCodes}
            onSave={handleSaveOfficial}
            onCancel={() => setModalState(null)}
            isLight={isLight}
          />
        </Modal>
      )}

      {modalState?.type === "add_dept" && (
        <Modal
          title={`Add Department Workflow: ${activeDistrict?.districtName || "District"}`}
          icon={Building2}
          onClose={() => setModalState(null)}
        >
          <AddDepartmentModal
            onSave={handleSaveNewDepartment}
            onCancel={() => setModalState(null)}
            isLight={isLight}
          />
        </Modal>
      )}
    </div>
  );
}

