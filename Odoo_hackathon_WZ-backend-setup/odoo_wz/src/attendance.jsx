// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { NavLink } from "react-router-dom";


// /* =========================
//    Config + fetch helper
// ========================= */
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api`;




// async function api(path, init = {}) {
//     const res = await fetch(`${API}${path}`, {
//         credentials: "include",
//         headers: { "Content-Type": "application/json", ...(init.headers || {}) },
//         ...init,
//     });
//     const data = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
//     return data;
// }

// /* =========================
//    Small helpers
// ========================= */
// const pad = (n) => String(n).padStart(2, "0");
// const ymd = (d) => new Date(d).toISOString().slice(0, 10);
// const addDays = (d, n) => ymd(new Date(new Date(d).getTime() + n * 86400000));
// const toMonthKey = (d) => {
//     const dt = typeof d === "string" ? new Date(`${d}-01`) : new Date(d);
//     return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
// };
// const fmtDate = (d) =>
//     new Date(d).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "long",
//         year: "numeric",
//     });

// function monthOptions(count = 12) {
//     const out = [];
//     const now = new Date();
//     for (let i = 0; i < count; i++) {
//         const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
//         out.push({
//             value: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`,
//             label: dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
//         });
//     }
//     return out;
// }

// function StatusPill({ status }) {
//     const map = {
//         Present: "bg-green-100 text-green-700 border-green-200",
//         Leave: "bg-blue-100 text-blue-700 border-blue-200",
//         Absent: "bg-yellow-100 text-yellow-700 border-yellow-200",
//         Unknown: "bg-rose-100 text-rose-700 border-rose-200",
//     };
//     const cls = map[status] || map.Unknown;
//     return (
//         <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${cls}`}>
//             {status}
//         </span>
//     );
// }

// const Th = ({ children, className = "" }) => (
//     <th className={`px-4 py-3 font-semibold text-left ${className}`}>{children}</th>
// );
// const Td = ({ children, className = "" }) => (
//     <td className={`px-4 py-3 ${className}`}>{children}</td>
// );

// /* =========================
//    Page
// ========================= */
// export default function AttendancePage() {
//     const nav = useNavigate();

//     const [me, setMe] = useState(null); // { id, name, role, email, company }
//     const [toast, setToast] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // quick status filter: all | present | absent | leave
//     const [statusFilter, setStatusFilter] = useState("all");

//     // Admin side
//     const [day, setDay] = useState(ymd(new Date()));
//     const [adminRows, setAdminRows] = useState([]); // from backend
//     const [adminSummary, setAdminSummary] = useState(null);
//     const [search, setSearch] = useState("");

//     // Employee side
//     const [month, setMonth] = useState(toMonthKey(new Date()));
//     const [empSummary, setEmpSummary] = useState(null);
//     const [empRows, setEmpRows] = useState([]);

//     const showToast = (msg, type = "success") => {
//         setToast({ msg, type });
//         setTimeout(() => setToast(null), 2500);
//     };

//     /* 1) Auth -> me */
//     useEffect(() => {
//         (async () => {
//             try {
//                 const r = await api("/auth/isAuth");
//                 const u = r.user;
//                 setMe({
//                     id: u.user_id,
//                     name: u.name,
//                     role: u.role,
//                     email: u.email,
//                     company: u.company_id,
//                 });
//             } catch (e) {
//                 nav("/auth");
//             }
//         })();
//     }, [nav]);

//     /* 2A) Admin/HR/Payroll: by date */
//     useEffect(() => {
//         if (!me || me.role === "Employee") return;

//         (async () => {
//             try {
//                 setLoading(true);
//                 const r = await api(`/attendance/admin/date?date=${day}`);
//                 setAdminRows(r.attendanceList || []);
//                 setAdminSummary(r.summary || null);
//             } catch (e) {
//                 showToast(e.message, "error");
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [me, day]);

//     /* 2B) Employee: monthly */
//     useEffect(() => {
//         if (!me || me.role !== "Employee") return;

//         (async () => {
//             try {
//                 setLoading(true);
//                 const r = await api(`/attendance/employee/${me.id}/${month}`);
//                 setEmpSummary(r.summary || null);
//                 setEmpRows(r.attendanceData || []);
//             } catch (e) {
//                 showToast(e.message, "error");
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [me, month]);

//     const isAdminSide = me && me.role !== "Employee";

//     const adminFiltered = useMemo(() => {
//         const q = search.trim().toLowerCase();
//         if (!q) return adminRows;
//         return (adminRows || []).filter(
//             (r) =>
//                 (r.name || "").toLowerCase().includes(q) ||
//                 (r.role || "").toLowerCase().includes(q) ||
//                 (r.email || "").toLowerCase().includes(q)
//         );
//     }, [adminRows, search]);


//     // helper that checks one status against current filter
//     const statusMatches = (status) => {
//         if (statusFilter === "all") return true;
//         const s = (status || "").toLowerCase();
//         if (statusFilter === "present") return s === "present";
//         if (statusFilter === "absent") return s === "absent";
//         if (statusFilter === "leave") return s === "leave";
//         return true;
//     };

//     // Admin: apply status filter on top of the search filter
//     const adminFilteredByStatus = useMemo(() => {
//         return (adminFiltered || []).filter(r => statusMatches(r.status));
//     }, [adminFiltered, statusFilter]);

//     // Employee: apply status filter to monthly rows
//     const empFilteredByStatus = useMemo(() => {
//         return (empRows || []).filter(r => statusMatches(r.status));
//     }, [empRows, statusFilter]);




//     return (
//         <div className="min-h-screen bg-white">
//             {/* Header */}
//             <header className="h-16 border-b border-gray-200 flex items-center px-6">
//                 <div className="flex items-center gap-3">
//                     <div className="h-9 w-9 rounded-md bg-purple-600" />
//                     <div>
//                         <p className="font-semibold text-gray-900">WorkZen</p>
//                         <p className="text-xs text-gray-500">Attendance</p>
//                     </div>
//                 </div>

//                 <div className="ml-6 flex-1 flex items-center gap-3">
//                     {isAdminSide ? (
//                         <div className="inline-flex items-center gap-2">
//                             <button
//                                 className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
//                                 onClick={() => setDay((d) => addDays(d, -1))}
//                                 title="Previous day"
//                             >
//                                 ←
//                             </button>
//                             <input
//                                 type="date"
//                                 value={day}
//                                 onChange={(e) => setDay(e.target.value)}
//                                 className="rounded-lg border px-3 py-1.5 text-sm"
//                             />
//                             <button
//                                 className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
//                                 onClick={() => setDay((d) => addDays(d, +1))}
//                                 title="Next day"
//                             >
//                                 →
//                             </button>
//                         </div>
//                     ) : (
//                         // <select
//                         //   className="rounded-lg border px-3 py-2 text-sm"
//                         //   value={month}
//                         //   onChange={(e) => setMonth(e.target.value)}
//                         //   title="Select month"
//                         // >
//                         //   {monthOptions().map((m) => (
//                         //     <option key={m.value} value={m.value}>
//                         //       {m.label}
//                         //     </option>
//                         //   ))}
//                         // </select>
//                         // {/* replace the current select with this */}
//                         <input
//                             type="month"
//                             className="rounded-lg border px-3 py-2 text-sm"
//                             value={month}                       // format "YYYY-MM"
//                             onChange={(e) => setMonth(e.target.value)}
//                             title="Select month"
//                         />

//                     )}

//                     {/* Search for admin */}
//                     {isAdminSide && (
//                         <div className="ml-auto w-full max-w-xl">
//                             <input
//                                 value={search}
//                                 onChange={(e) => setSearch(e.target.value)}
//                                 placeholder="Search employees"
//                                 className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//                             />
//                         </div>
//                     )}
//                 </div>
//             </header>


//             {/* Quick status filter */}
//             {isAdminSide && (<div className="ml-3 flex flex-wrap items-center gap-2">
//                 {[
//                     { id: "all", label: "All" },
//                     { id: "present", label: "Present" },
//                     { id: "absent", label: "Absent" },
//                     { id: "leave", label: "Leave" },
//                 ].map((f) => (
//                     <button
//                         key={f.id}
//                         onClick={() => setStatusFilter(f.id)}
//                         className={`rounded-full border px-3 py-1.5 text-sm ${statusFilter === f.id
//                             ? "bg-purple-600 border-purple-600 text-white"
//                             : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
//                             }`}
//                     >
//                         {f.label}
//                     </button>
//                 ))}
//             </div>)}



//             {/* <main className="mx-auto max-w-7xl px-6 py-8">
//                 {loading ? (
//                     <p className="text-sm text-gray-500">Loading attendance…</p>
//                 ) : isAdminSide ? (
//                     <AdminView day={day} rows={adminFiltered} summary={adminSummary} />
//                 ) : (
//                     <EmployeeView month={month} rows={empRows} summary={empSummary} />
//                 )}
//             </main> */}

//             <main className="mx-auto max-w-7xl px-6 py-8">
//                 <div className="grid grid-cols-12 gap-6">
//                     {/* --- LEFT SIDEBAR --- */}
//                     <aside className="col-span-12 md:col-span-2">
//                         <nav className="rounded-xl border border-gray-200 overflow-hidden">
//                             {[
//                                 { label: "Employees", to: "/dashboard" },
//                                 { label: "Attendance", to: "/attendance" },
//                                 { label: "Time Off", to: "/timeoff" },
//                                 { label: "Payroll", to: "/payroll" },
//                                 { label: "Reports", to: "/reports" },
//                                 { label: "Settings", to: "/settings" },
//                             ].map((item) => (
//                                 <NavLink
//                                     key={item.label}
//                                     to={item.to}
//                                     className={({ isActive }) =>
//                                         `block px-3 py-2 text-sm ${isActive
//                                             ? "bg-blue-100 text-blue-700 font-semibold"
//                                             : "hover:bg-gray-50"
//                                         }`
//                                     }
//                                 >
//                                     {item.label}
//                                 </NavLink>
//                             ))}
//                         </nav>
//                     </aside>

//                     {/* --- MAIN ATTENDANCE CONTENT --- */}
//                     <section className="col-span-12 md:col-span-10">
//                         {loading ? (
//                             <p className="text-sm text-gray-500">Loading attendance…</p>
//                         ) : isAdminSide ? (
//                             <AdminView day={day} rows={adminFiltered} summary={adminSummary} />
//                         ) : (
//                             <EmployeeView month={month} rows={empRows} summary={empSummary} />
//                         )}
//                     </section>
//                 </div>
//             </main>

//             {toast && (
//                 <div
//                     className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${toast.type === "error"
//                         ? "bg-rose-50 border-rose-200 text-rose-700"
//                         : "bg-emerald-50 border-emerald-200 text-emerald-700"
//                         }`}
//                 >
//                     {toast.msg}
//                 </div>
//             )}
//         </div>
//     );
// }

// /* =========================
//    Admin/HR/Payroll view
// ========================= */
// function AdminView({ day, rows, summary }) {
//     return (
//         <div className="space-y-6">
//             {/* summary row */}
//             {summary && (
//                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//                     <SummaryTile title="Date" value={fmtDate(day)} />
//                     <SummaryTile title="Total employees" value={summary.totalEmployees} />
//                     <SummaryTile title="Present" value={summary.present} />
//                     <SummaryTile title="Leave / Absent" value={`${summary.leave} / ${summary.absent}`} />
//                 </div>
//             )}

//             {/* big table */}
//             <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//                 <div className="px-5 py-4 border-b">
//                     <p className="font-semibold text-gray-900 text-lg">Attendances — {fmtDate(day)}</p>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm">
//                         <thead className="bg-gray-50 text-gray-700">
//                             <tr>
//                                 <Th>Employee</Th>
//                                 <Th>Email</Th>
//                                 <Th>Role</Th>
//                                 <Th className="text-center">Check In</Th>
//                                 <Th className="text-center">Check Out</Th>
//                                 <Th className="text-center">Work Hours</Th>
//                                 <Th className="text-center">Extra Hours</Th>
//                                 <Th className="text-center">Status</Th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y">
//                             {rows.map((r) => (
//                                 <tr key={r.user_id} className="hover:bg-gray-50">
//                                     <Td className="whitespace-nowrap font-medium text-gray-900">{r.name}</Td>
//                                     <Td className="whitespace-nowrap">{r.email || "-"}</Td>
//                                     <Td className="whitespace-nowrap">{r.role}</Td>
//                                     <Td className="text-center">{r.check_in || "-"}</Td>
//                                     <Td className="text-center">{r.check_out || "-"}</Td>
//                                     <Td className="text-center">{r.work_hours ?? "-"}</Td>
//                                     <Td className="text-center">{r.extra_hours ?? "-"}</Td>
//                                     <Td className="text-center">
//                                         <StatusPill status={r.status || "Unknown"} />
//                                     </Td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// /* =========================
//    Employee(month) view
// ========================= */
// function EmployeeView({ month, rows, summary }) {
//     const niceMonth = fmtDate(`${month}-01`).split(" ").slice(1).join(" "); // "November 2025"

//     return (
//         <div className="space-y-6">
//             {/* tiles */}
//             {summary && (
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <SummaryTile title="Count of days present" value={summary.presentCount} />
//                     <SummaryTile title="Leaves count" value={summary.leaveCount} />
//                     <SummaryTile title="Total working days" value={summary.totalDays} />
//                 </div>
//             )}

//             {/* table */}
//             <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//                 <div className="px-5 py-4 border-b">
//                     <p className="font-semibold text-gray-900 text-lg">Attendance — {niceMonth}</p>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm">
//                         <thead className="bg-gray-50 text-gray-700">
//                             <tr>
//                                 <Th>Date</Th>
//                                 <Th className="text-center">Check In</Th>
//                                 <Th className="text-center">Check Out</Th>
//                                 <Th className="text-center">Work Hours</Th>
//                                 <Th className="text-center">Extra Hours</Th>
//                                 <Th className="text-center">Status</Th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y">
//                             {rows.map((r) => (
//                                 <tr key={`${r.user_id || "me"}-${r.date}`} className="hover:bg-gray-50">
//                                     <Td className="whitespace-nowrap">
//                                         {new Date(r.date).toLocaleDateString("en-GB")}
//                                     </Td>
//                                     <Td className="text-center">{r.check_in || "-"}</Td>
//                                     <Td className="text-center">{r.check_out || "-"}</Td>
//                                     <Td className="text-center">{r.work_hours ?? "-"}</Td>
//                                     <Td className="text-center">{r.extra_hours ?? "-"}</Td>
//                                     <Td className="text-center">
//                                         <StatusPill status={r.status || "Unknown"} />
//                                     </Td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// function SummaryTile({ title, value }) {
//     return (
//         <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//             <p className="text-sm text-gray-600">{title}</p>
//             <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
//         </div>
//     );
// }


import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

/* =========================
   Config + fetch helper
========================= */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const API = `${API_BASE}/api`;

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

/* =========================
   Small helpers
========================= */
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => new Date(d).toISOString().slice(0, 10);
const addDays = (d, n) => ymd(new Date(new Date(d).getTime() + n * 86400000));
const toMonthKey = (d) => {
  const dt = typeof d === "string" ? new Date(`${d}-01`) : new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
};
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function monthOptions(count = 18) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`,
      label: dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
  }
  return out;
}

function StatusPill({ status }) {
  const map = {
    Present: "bg-green-100 text-green-700 border-green-200",
    Leave: "bg-blue-100 text-blue-700 border-blue-200",
    Absent: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Unknown: "bg-rose-100 text-rose-700 border-rose-200",
  };
  const cls = map[status] || map.Unknown;
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${cls}`}>
      {status}
    </span>
  );
}

const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3 font-semibold text-left ${className}`}>{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);

/* =========================
   Page
========================= */
export default function AttendancePage() {
  const nav = useNavigate();

  const [me, setMe] = useState(null); // { id, name, role, email, company }
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin side
  const [day, setDay] = useState(ymd(new Date()));
  const [adminRows, setAdminRows] = useState([]); // from backend
  const [adminSummary, setAdminSummary] = useState(null);
  const [search, setSearch] = useState("");

  // Employee side
  const [month, setMonth] = useState(toMonthKey(new Date()));
  const [empSummary, setEmpSummary] = useState(null);
  const [empRows, setEmpRows] = useState([]);

  // status filter (admin only UI, but keep state here)
  const [statusFilter, setStatusFilter] = useState("all");

  // For admin-only company scoping without backend change:
  const [companyUserIdSet, setCompanyUserIdSet] = useState(null); // Set<number> or null

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* 1) Auth -> me */
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        const u = r.user;
        setMe({
          id: u.user_id,
          name: u.name,
          role: u.role,
          email: u.email,
          company: u.company_id,
        });
      } catch {
        nav("/auth");
      }
    })();
  }, [nav]);

  /* 1b) If Admin, fetch directory once to know which user_ids belong to this company */
  useEffect(() => {
    if (!me || me.role !== "Admin") return;
    (async () => {
      try {
        const r = await api("/employee/directory"); // backend returns only admin's company
        const ids = new Set((r.employees || []).map((e) => e.user_id));
        setCompanyUserIdSet(ids);
      } catch (e) {
        console.warn("Directory fetch failed for company filter:", e.message);
        setCompanyUserIdSet(null);
      }
    })();
  }, [me]);

  /* 2A) Admin/HR/Payroll: by date */
  useEffect(() => {
    if (!me || me.role === "Employee") return;
    (async () => {
      try {
        setLoading(true);
        const r = await api(`/attendance/admin/date?date=${day}`);
        let list = r.attendanceList || [];
        // If Admin and we have a company set, filter to company employees only
        if (me.role === "Admin" && companyUserIdSet instanceof Set) {
          list = list.filter((row) => companyUserIdSet.has(row.user_id));
        }
        setAdminRows(list);
        setAdminSummary(r.summary || null);
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [me, day, companyUserIdSet]);

  /* 2B) Employee: monthly */
  const fetchEmployeeMonth = async () => {
    if (!me || me.role !== "Employee") return;
    setLoading(true);
    try {
      const r = await api(`/attendance/employee/${me.id}/${month}`);
      setEmpSummary(r.summary || null);
      setEmpRows(r.attendanceData || []);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, month]); // re-run when user or month changes

  const isAdminSide = me && me.role !== "Employee";

  const adminFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return adminRows;
    return (adminRows || []).filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
    );
  }, [adminRows, search]);

  // status filter matcher
  const statusMatches = (status) => {
    if (statusFilter === "all") return true;
    const s = (status || "").toLowerCase();
    if (statusFilter === "present") return s === "present";
    if (statusFilter === "absent") return s === "absent";
    if (statusFilter === "leave") return s === "leave";
    return true;
  };

  const adminFilteredByStatus = useMemo(
    () => (adminFiltered || []).filter((r) => statusMatches(r.status)),
    [adminFiltered, statusFilter]
  );

  const empFilteredByStatus = useMemo(
    () => (empRows || []).filter((r) => statusMatches(r.status)),
    [empRows, statusFilter]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-purple-600" />
          <div>
            <p className="font-semibold text-gray-900">WorkZen</p>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
        </div>

        <div className="ml-6 flex-1 flex items-center gap-3">
          {isAdminSide ? (
            <div className="inline-flex items-center gap-2">
              <button
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => setDay((d) => addDays(d, -1))}
                title="Previous day"
              >
                ←
              </button>
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-lg border px-3 py-1.5 text-sm"
              />
              <button
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => setDay((d) => addDays(d, +1))}
                title="Next day"
              >
                →
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Use month input if supported, else dropdown fallback */}
              <input
                type="month"
                className="rounded-lg border px-3 py-2 text-sm"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                title="Select month"
                onInvalid={(e) => e.preventDefault()}
              />
              <button
                type="button"
                onClick={fetchEmployeeMonth}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                title="Reload month"
              >
                Reload
              </button>
            </div>
          )}

          {/* Search for admin */}
          {isAdminSide && (
            <div className="ml-auto w-full max-w-xl">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* --- LEFT SIDEBAR --- */}
          <aside className="col-span-12 md:col-span-2">
            <nav className="rounded-xl border border-gray-200 overflow-hidden">
              {[
                { label: "Employees", to: "/dashboard" },
                { label: "Attendance", to: "/attendance" },
                { label: "Time Off", to: "/timeoff" },
                { label: "Payroll", to: "/payroll" },
                { label: "Reports", to: "/reports" },
                { label: "Settings", to: "/settings" },
              ].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm ${
                      isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* --- MAIN ATTENDANCE CONTENT --- */}
          <section className="col-span-12 md:col-span-10">
            {loading ? (
              <p className="text-sm text-gray-500">Loading attendance…</p>
            ) : isAdminSide ? (
              <AdminView
                day={day}
                rows={adminFilteredByStatus}
                summary={adminSummary}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            ) : (
              <EmployeeView
                month={month}
                rows={empFilteredByStatus}
                summary={empSummary}
              />
            )}
          </section>
        </div>
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${
            toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* =========================
   Admin/HR/Payroll view
========================= */
function AdminView({ day, rows, summary, statusFilter, setStatusFilter }) {
  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SummaryTile title="Date" value={fmtDate(day)} />
          <SummaryTile title="Total employees" value={summary.totalEmployees} />
          <SummaryTile title="Present" value={summary.present} />
          <SummaryTile title="Leave / Absent" value={`${summary.leave} / ${summary.absent}`} />
        </div>
      )}

      {/* 🔻 Filter sits JUST ABOVE the table (admin only) */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All" },
          { id: "present", label: "Present" },
          { id: "absent", label: "Absent" },
          { id: "leave", label: "Leave" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              statusFilter === f.id
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="font-semibold text-gray-900 text-lg">Attendances — {fmtDate(day)}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <Th>Employee</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th className="text-center">Check In</Th>
                <Th className="text-center">Check Out</Th>
                <Th className="text-center">Work Hours</Th>
                <Th className="text-center">Extra Hours</Th>
                <Th className="text-center">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.user_id} className="hover:bg-gray-50">
                  <Td className="whitespace-nowrap font-medium text-gray-900">{r.name}</Td>
                  <Td className="whitespace-nowrap">{r.email || "-"}</Td>
                  <Td className="whitespace-nowrap">{r.role}</Td>
                  <Td className="text-center">{r.check_in || "-"}</Td>
                  <Td className="text-center">{r.check_out || "-"}</Td>
                  <Td className="text-center">{r.work_hours ?? "-"}</Td>
                  <Td className="text-center">{r.extra_hours ?? "-"}</Td>
                  <Td className="text-center">
                    <StatusPill status={r.status || "Unknown"} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="px-5 py-6 text-sm text-gray-500">No records for this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Employee(month) view
========================= */
function EmployeeView({ month, rows, summary }) {
  const niceMonth = new Date(`${month}-01`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryTile title="Count of days present" value={summary.presentCount} />
          <SummaryTile title="Leaves count" value={summary.leaveCount} />
          <SummaryTile title="Total working days" value={summary.totalDays} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="font-semibold text-gray-900 text-lg">Attendance — {niceMonth}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <Th>Date</Th>
                <Th className="text-center">Check In</Th>
                <Th className="text-center">Check Out</Th>
                <Th className="text-center">Work Hours</Th>
                <Th className="text-center">Extra Hours</Th>
                <Th className="text-center">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={`${r.user_id || "me"}-${r.date}`} className="hover:bg-gray-50">
                  <Td className="whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString("en-GB")}
                  </Td>
                  <Td className="text-center">{r.check_in || "-"}</Td>
                  <Td className="text-center">{r.check_out || "-"}</Td>
                  <Td className="text-center">{r.work_hours ?? "-"}</Td>
                  <Td className="text-center">{r.extra_hours ?? "-"}</Td>
                  <Td className="text-center">
                    <StatusPill status={r.status || "Unknown"} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="px-5 py-6 text-sm text-gray-500">
              No attendance found for {niceMonth}. Try another month or reload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
