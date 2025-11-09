// // src/timeoff.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, NavLink } from "react-router-dom";

// /* =========================
//    Config + fetch helper
// ========================= */
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api`;

// async function api(path, init = {}) {
//   const isForm = init.body instanceof FormData;
//   const headers = isForm ? (init.headers || {}) : { "Content-Type": "application/json", ...(init.headers || {}) };

//   const res = await fetch(`${API}${path}`, {
//     credentials: "include",
//     headers,
//     ...init,
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
//   return data;
// }

// const pad = (n) => String(n).padStart(2, "0");
// const ymd = (d) => new Date(d).toISOString().slice(0, 10);
// const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// /* =========================
//    Page
// ========================= */
// export default function TimeOffPage() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);            // { id, name, role, ... }
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState(null);

//   // employee view
//   const [myLeaves, setMyLeaves] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [openNew, setOpenNew] = useState(false);

//   // admin/hr view
//   const [allLeaves, setAllLeaves] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All"); // ⬅️ NEW


//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   /* 1) Auth → me */
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         const u = r.user;
//         const meObj = { id: u.user_id, name: u.name, role: u.role, email: u.email, company: u.company_id };
//         setMe(meObj);
//       } catch {
//         nav("/auth");
//       }
//     })();
//   }, [nav]);

//   /* 2) Load data depending on role */
//   useEffect(() => {
//     if (!me) return;
//     (async () => {
//       try {
//         setLoading(true);
//         if (me.role === "Employee") {
//           const [sum, mine] = await Promise.all([
//             api(`/leave/summary/${me.id}`),
//             api(`/leave/my/${me.id}`),
//           ]);
//           setSummary(sum.summary || null);
//           setMyLeaves(mine.leaves || []);
//         } else {
//           const all = await api(`/leave/all`);
//           setAllLeaves(all.leaves || []);
//         }
//       } catch (e) {
//         showToast(e.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [me]);

//   const isAdminSide = me && me.role !== "Employee";
//   const filtered = useMemo(() => {
//     if (!isAdminSide) return allLeaves;

//     const q = search.trim().toLowerCase();
//     let rows = allLeaves;

//     // search filter
//     if (q) {
//       rows = rows.filter((l) =>
//         (l.user?.name || "").toLowerCase().includes(q) ||
//         (l.user?.email || "").toLowerCase().includes(q) ||
//         (l.time_off_type || l.leave_type || "").toLowerCase().includes(q) ||
//         (l.status || "").toLowerCase().includes(q)
//       );
//     }

//     // status filter
//     if (statusFilter !== "All") {
//       rows = rows.filter(
//         (l) => (l.status || "Pending").toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     return rows;
//   }, [allLeaves, search, isAdminSide, statusFilter]);



//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Time Off</p>
//           </div>
//         </div>

//         <div className="ml-6 flex-1 flex items-center gap-3">
//           {me?.role === "Employee" && (
//             <button
//               onClick={() => setOpenNew(true)}
//               className="inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
//             >
//               NEW
//             </button>
//           )}
//         </div>



//       </header>

//       {/* Content with left panel (same style as Dashboard) */}
//       <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           <aside className="col-span-12 md:col-span-2">
//             <nav className="rounded-xl border border-gray-200 overflow-hidden">
//               {[
//                 { label: "Employees", to: "/dashboard" },
//                 { label: "Attendance", to: "/attendance" },
//                 { label: "Time Off", to: "/timeoff" },
//                 { label: "Payroll", to: "/payroll" },
//                 { label: "Reports", to: "/reports" },
//                 { label: "Settings", to: "/settings" },
//               ].map((item) => (
//                 <NavLink
//                   key={item.label}
//                   to={item.to}
//                   className={({ isActive }) =>
//                     `block px-3 py-2 text-sm ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"}`
//                   }
//                   end={item.to === "/dashboard"}
//                 >
//                   {item.label}
//                 </NavLink>
//               ))}
//             </nav>
//           </aside>

//           {/* Main */}
//           <section className="col-span-12 md:col-span-10">
//             {loading ? (
//               <div className="text-sm text-gray-500">Loading time off…</div>
//             ) : isAdminSide ? (
//               // <AdminLeaves
//               //   rows={filtered}
//               //   onAct={async (id, status) => {
//               //     try {
//               //       await api(`/leave/status/${id}`, {
//               //         method: "PUT",
//               //         body: JSON.stringify({ status }),
//               //       });
//               //       showToast(`Leave ${status.toLowerCase()} ✅`);
//               //       setAllLeaves((rows) =>
//               //         rows.map((r) => (r.leave_id === id ? { ...r, status } : r))
//               //       );
//               //     } catch (e) {
//               //       showToast(e.message, "error");
//               //     }
//               //   }}
//               // />

//               <AdminLeaves
//                 rows={filtered}
//                 search={search}
//                 setSearch={setSearch}
//                 statusFilter={statusFilter}
//                 setStatusFilter={setStatusFilter}
//                 onAct={async (id, status) => {
//                   try {
//                     await api(`/leave/status/${id}`, {
//                       method: "PUT",
//                       body: JSON.stringify({ status }),
//                     });
//                     showToast(`Leave ${status.toLowerCase()} ✅`);
//                     setAllLeaves((rows) =>
//                       rows.map((r) => (r.leave_id === id ? { ...r, status } : r))
//                     );
//                   } catch (e) {
//                     showToast(e.message, "error");
//                   }
//                 }}
//               />

//             ) : (
//               <EmployeeLeaves
//                 summary={summary}
//                 rows={myLeaves}
//                 onRefresh={async () => {
//                   if (!me) return;
//                   const mine = await api(`/leave/my/${me.id}`);
//                   setMyLeaves(mine.leaves || []);
//                   const sum = await api(`/leave/summary/${me.id}`);
//                   setSummary(sum.summary || null);
//                 }}
//                 openNew={openNew}
//                 onCloseNew={() => setOpenNew(false)}
//                 onCreated={(newRow) => setMyLeaves((r) => [newRow, ...r])}
//               />
//             )}
//           </section>
//         </div>
//       </div>

//       {toast && (
//         <div
//           className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${toast.type === "error"
//             ? "bg-rose-50 border-rose-200 text-rose-700"
//             : "bg-emerald-50 border-emerald-200 text-emerald-700"
//             }`}
//         >
//           {toast.msg}
//         </div>
//       )}
//     </div>
//   );
// }

// /* =========================
//    Admin/HR view
// ========================= */
// // function AdminLeaves({ rows, onAct }) {
// //   return (
// //     <div className="space-y-6">
// //       <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
// //         <div className="px-5 py-4 border-b">
// //           <p className="font-semibold text-gray-900 text-lg">All Time-Off Requests</p>
// //         </div>

// //         <div className="overflow-x-auto">
// //           <table className="min-w-full text-sm">
// //             <thead className="bg-gray-50 text-gray-700">
// //               <tr>
// //                 <Th>Employee</Th>
// //                 <Th>Email</Th>
// //                 <Th>Type</Th>
// //                 <Th className="text-center">Start</Th>
// //                 <Th className="text-center">End</Th>
// //                 <Th className="text-center">Status</Th>
// //                 <Th className="text-center">Action</Th>
// //               </tr>
// //             </thead>
// //             <tbody className="divide-y">
// //               {rows.map((r) => (
// //                 <tr key={r.leave_id} className="hover:bg-gray-50">
// //                   <Td className="whitespace-nowrap font-medium text-gray-900">{r.user?.name}</Td>
// //                   <Td className="whitespace-nowrap">{r.user?.email || "-"}</Td>
// //                   <Td className="whitespace-nowrap">{r.time_off_type || r.leave_type}</Td>
// //                   <Td className="text-center">{fmt(r.start_date)}</Td>
// //                   <Td className="text-center">{fmt(r.end_date)}</Td>
// //                   <Td className="text-center">
// //                     <StatusPill status={r.status} />
// //                   </Td>
// //                   <Td className="text-center">
// //                     <div className="inline-flex gap-2">
// //                       <button
// //                         disabled={r.status === "Approved"}
// //                         onClick={() => onAct(r.leave_id, "Approved")}
// //                         className={`h-7 w-7 rounded-full border ${r.status === "Approved" ? "opacity-40 cursor-not-allowed" : "hover:bg-green-50"
// //                           } flex items-center justify-center`}
// //                         title="Approve"
// //                       >
// //                         <span className="h-3 w-3 rounded-full bg-green-500 inline-block" />
// //                       </button>
// //                       <button
// //                         disabled={r.status === "Rejected"}
// //                         onClick={() => onAct(r.leave_id, "Rejected")}
// //                         className={`h-7 w-7 rounded-full border ${r.status === "Rejected" ? "opacity-40 cursor-not-allowed" : "hover:bg-rose-50"
// //                           } flex items-center justify-center`}
// //                         title="Reject"
// //                       >
// //                         <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
// //                       </button>
// //                     </div>
// //                   </Td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// function AdminLeaves({ rows, onAct, search, setSearch, statusFilter, setStatusFilter }) {
//   return (
//     <div className="space-y-6">
//       <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//         {/* Card header with title + filters */}
//         <div className="px-5 py-4 border-b">
//           <div className="flex items-center justify-between gap-3">
//             <p className="font-semibold text-gray-900 text-lg">
//               All Time-Off Requests
//             </p>
//             <p className="text-xs text-gray-500">
//               {rows.length} result{rows.length === 1 ? "" : "s"}
//             </p>
//           </div>

//           {/* Filters row */}
//           <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
//             {/* Search input */}
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by name, email, type, status"
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />

//             {/* Status chips */}
//             <div className="md:col-span-2 flex flex-wrap items-center gap-2">
//               {["All", "Pending", "Approved", "Rejected"].map((s) => {
//                 const active = statusFilter === s;
//                 return (
//                   <button
//                     key={s}
//                     onClick={() => setStatusFilter(s)}
//                     className={`px-3 py-1.5 text-xs rounded-full border transition
//                       ${active
//                         ? "bg-purple-600 text-white border-purple-600"
//                         : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
//                   >
//                     {s}
//                   </button>
//                 );
//               })}
//               {/* Optional: quick clear */}
//               {(search || statusFilter !== "All") && (
//                 <button
//                   onClick={() => { setSearch(""); setStatusFilter("All"); }}
//                   className="ml-1 px-3 py-1.5 text-xs rounded-full border bg-white text-gray-600 hover:bg-gray-50"
//                   title="Clear filters"
//                 >
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50 text-gray-700">
//               <tr>
//                 <Th>Employee</Th>
//                 <Th>Email</Th>
//                 <Th>Type</Th>
//                 <Th className="text-center">Start</Th>
//                 <Th className="text-center">End</Th>
//                 <Th className="text-center">Status</Th>
//                 <Th>Reason</Th>
//                 <Th className="text-center">Action</Th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {rows.map((r) => (
//                 <tr key={r.leave_id} className="hover:bg-gray-50">
//                   <Td className="whitespace-nowrap font-medium text-gray-900">{r.user?.name}</Td>
//                   <Td className="whitespace-nowrap">{r.user?.email || "-"}</Td>
//                   <Td className="whitespace-nowrap">{r.time_off_type || r.leave_type}</Td>
//                   <Td className="text-center">{fmt(r.start_date)}</Td>
//                   <Td className="text-center">{fmt(r.end_date)}</Td>
//                   <Td className="text-center">
//                     <StatusPill status={r.status} />
//                   </Td>
//                   <Td title={r.description || ""}>
//                     {(r.description || "-").length > 60
//                       ? `${(r.description || "").slice(0, 60)}…`
//                       : (r.description || "-")}
//                   </Td>
//                   <Td className="text-center">
//                     <div className="inline-flex gap-2">
//                       <button
//                         disabled={r.status === "Approved"}
//                         onClick={() => onAct(r.leave_id, "Approved")}
//                         className={`h-7 w-7 rounded-full border ${r.status === "Approved" ? "opacity-40 cursor-not-allowed" : "hover:bg-green-50"
//                           } flex items-center justify-center`}
//                         title="Approve"
//                       >
//                         <span className="h-3 w-3 rounded-full bg-green-500 inline-block" />
//                       </button>
//                       <button
//                         disabled={r.status === "Rejected"}
//                         onClick={() => onAct(r.leave_id, "Rejected")}
//                         className={`h-7 w-7 rounded-full border ${r.status === "Rejected" ? "opacity-40 cursor-not-allowed" : "hover:bg-rose-50"
//                           } flex items-center justify-center`}
//                         title="Reject"
//                       >
//                         <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
//                       </button>
//                     </div>
//                   </Td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Employee view
// ========================= */
// function EmployeeLeaves({ summary, rows, onRefresh, openNew, onCloseNew, onCreated }) {
//   return (
//     <div className="space-y-6">
//       {summary && (
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <SummaryTile title="Paid Time Off Left" value={summary.PaidTimeOff} />
//           <SummaryTile title="Sick Time Off Left" value={summary.SickTimeOff} />
//           <SummaryTile title="Unpaid Used" value={summary.UnpaidTimeOff} />
//         </div>
//       )}

//       <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//         <div className="px-5 py-4 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900 text-lg">My Time-Off Requests</p>
//           <button
//             onClick={onRefresh}
//             className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
//             title="Refresh"
//           >
//             Refresh
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50 text-gray-700">
//               <tr>
//                 <Th>Type</Th>
//                 <Th className="text-center">Start</Th>
//                 <Th className="text-center">End</Th>
//                 <Th>Reason</Th>
//                 <Th className="text-center">Status</Th>
//                 <Th>Attachment</Th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {rows.map((r) => (
//                 <tr key={r.leave_id} className="hover:bg-gray-50">
//                   <Td className="whitespace-nowrap">{r.time_off_type || r.leave_type}</Td>
//                   <Td className="text-center">{fmt(r.start_date)}</Td>
//                   <Td className="text-center">{fmt(r.end_date)}</Td>
//                   <Td className="whitespace-nowrap" title={r.description || ""}>
//                     {(r.description || "-").length > 60
//                       ? `${(r.description || "").slice(0, 60)}…`
//                       : (r.description || "-")}
//                   </Td>
//                   <Td className="text-center"><StatusPill status={r.status} /></Td>
//                   <Td className="whitespace-nowrap">
//                     {r.attachment ? (
//                       <a href={`${API_BASE}${r.attachment}`} target="_blank" rel="noreferrer" className="text-purple-700 underline">View</a>
//                     ) : (
//                       "-"
//                     )}
//                   </Td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {openNew && (
//         <NewLeaveModal
//           onClose={onCloseNew}
//           onCreated={onCreated}
//         />
//       )}
//     </div>
//   );
// }

// /* =========================
//    New Leave Modal (employee)
// ========================= */
// function NewLeaveModal({ onClose, onCreated }) {
//   const [timeOffType, setTimeOffType] = useState("Paid Time Off");
//   const [start, setStart] = useState(ymd(new Date()));
//   const [end, setEnd] = useState(ymd(new Date()));
//   const [file, setFile] = useState(null);
//   const [desc, setDesc] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [err, setErr] = useState("");

//   const submit = async () => {
//     try {
//       setSubmitting(true);
//       setErr("");

//       // backend expects both `time_off_type` and `leave_type` (string)
//       const fd = new FormData();
//       fd.append("time_off_type", timeOffType);
//       fd.append("leave_type", timeOffType); // mirror
//       fd.append("start_date", start);
//       fd.append("end_date", end);
//       if (desc.trim()) fd.append("description", desc.trim());
//       if (file) fd.append("attachment", file);

//       const r = await api("/leave/apply", { method: "POST", body: fd });
//       onCreated(r.leave);
//       onClose();
//     } catch (e) {
//       setErr(e.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Time Off Request</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>

//         <div className="p-5 space-y-4 text-sm">



//           <div>
//             <label className="block text-gray-600 mb-1">Time-Off Type</label>
//             <select
//               className="w-full rounded-lg border px-3 py-2"
//               value={timeOffType}
//               onChange={(e) => setTimeOffType(e.target.value)}
//             >
//               <option>Paid Time Off</option>
//               <option>Sick Time Off</option>
//               <option>Unpaid Time Off</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-gray-600 mb-1">Start</label>
//               <input type="date" className="w-full rounded-lg border px-3 py-2" value={start} onChange={(e) => setStart(e.target.value)} />
//             </div>
//             <div>
//               <label className="block text-gray-600 mb-1">End</label>
//               <input type="date" className="w-full rounded-lg border px-3 py-2" value={end} onChange={(e) => setEnd(e.target.value)} />
//             </div>
//           </div>

//           {/* Reason / Notes */}
//           <div>
//             <label className="block text-gray-600 mb-1">Reason / Notes (optional)</label>
//             <textarea
//               value={desc}
//               onChange={(e) => setDesc(e.target.value)}
//               placeholder="Briefly describe why you're taking time off…"
//               rows={3}
//               maxLength={500}
//               className="w-full rounded-lg border px-3 py-2"
//             />
//             <p className="text-[11px] text-gray-500 mt-1">
//               Up to 500 characters.
//             </p>
//           </div>

//           <div>
//             <label className="block text-gray-600 mb-1">Attachment (optional)</label>
//             <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
//             <p className="text-xs text-gray-500 mt-1">Upload a doctor’s note for sick leave if needed.</p>
//           </div>

//           {err && <p className="text-rose-600 text-sm">{err}</p>}
//         </div>

//         <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
//           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//             Discard
//           </button>
//           <button
//             onClick={submit}
//             disabled={submitting}
//             className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm hover:bg-purple-700 disabled:opacity-60"
//           >
//             {submitting ? "Submitting…" : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Bits
// ========================= */
// function Th({ children, className = "" }) {
//   return <th className={`px-4 py-3 font-semibold text-left ${className}`}>{children}</th>;
// }
// function Td({ children, className = "" }) {
//   return <td className={`px-4 py-3 ${className}`}>{children}</td>;
// }
// function SummaryTile({ title, value }) {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//       <p className="text-sm text-gray-600">{title}</p>
//       <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
//     </div>
//   );
// }
// function StatusPill({ status = "Pending" }) {
//   const map = {
//     Approved: "bg-green-100 text-green-700 border-green-200",
//     Rejected: "bg-rose-100 text-rose-700 border-rose-200",
//     Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
//   };
//   const cls = map[status] || map.Pending;
//   return <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${cls}`}>{status}</span>;
// }
// src/timeoff.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

/* =========================
   Config + fetch helper
========================= */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const API = `${API_BASE}/api`;

async function api(path, init = {}) {
  const isForm = init.body instanceof FormData;
  const headers = isForm ? (init.headers || {}) : { "Content-Type": "application/json", ...(init.headers || {}) };

  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers,
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => new Date(d).toISOString().slice(0, 10);
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* =========================
   Page
========================= */
export default function TimeOffPage() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);            // { id, name, role, email, company }
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // employee view
  const [myLeaves, setMyLeaves] = useState([]);
  const [summary, setSummary] = useState(null);
  const [openNew, setOpenNew] = useState(false);

  // admin/hr/payroll view
  const [allLeaves, setAllLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 🔒 Company scoping for admin-side
  const [companyUserIdSet, setCompanyUserIdSet] = useState(null); // Set<number> or null

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* 1) Auth → me */
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        const u = r.user;
        setMe({ id: u.user_id, name: u.name, role: u.role, email: u.email, company: u.company_id });
      } catch {
        nav("/auth");
      }
    })();
  }, [nav]);

  /* 1b) If Admin/HR/Payroll, fetch directory once to know which user_ids belong to this company */
  useEffect(() => {
    if (!me || !["Admin", "HR", "Payroll"].includes(me.role)) return;
    (async () => {
      try {
        const r = await api("/employee/directory"); // backend returns only current admin company
        const ids = new Set((r.employees || []).map((e) => e.user_id));
        setCompanyUserIdSet(ids);
      } catch (e) {
        // if directory fails, we won't filter (but better to be strict and show none)
        console.warn("Directory fetch failed for company filter:", e.message);
        setCompanyUserIdSet(new Set()); // strict: show none if we can't confirm company members
      }
    })();
  }, [me]);

  /* 2) Load data depending on role */
  useEffect(() => {
    if (!me) return;

    (async () => {
      try {
        setLoading(true);
        if (me.role === "Employee") {
          const [sum, mine] = await Promise.all([
            api(`/leave/summary/${me.id}`),
            api(`/leave/my/${me.id}`),
          ]);
          setSummary(sum.summary || null);
          setMyLeaves(mine.leaves || []);
        } else {
          // Admin/HR/Payroll: fetch all once, then filter by companyUserIdSet if available
          const all = await api(`/leave/all`);
          let leaves = all.leaves || [];

          // ✅ Company scoping (only users in this admin's company)
          if (companyUserIdSet instanceof Set) {
            leaves = leaves.filter((row) =>
              companyUserIdSet.has(row.user_id || row.user?.user_id)
            );
          }

          setAllLeaves(leaves);
        }
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
    // Important: for admin-side, refetch/filter once companyUserIdSet is known
  }, [me, companyUserIdSet]);

  const isAdminSide = me && me.role !== "Employee";

  const filtered = useMemo(() => {
    if (!isAdminSide) return allLeaves;

    const q = search.trim().toLowerCase();
    let rows = allLeaves;

    // search filter
    if (q) {
      rows = rows.filter((l) =>
        (l.user?.name || "").toLowerCase().includes(q) ||
        (l.user?.email || "").toLowerCase().includes(q) ||
        (l.time_off_type || l.leave_type || "").toLowerCase().includes(q) ||
        (l.status || "").toLowerCase().includes(q)
      );
    }

    // status filter
    if (statusFilter !== "All") {
      rows = rows.filter(
        (l) => (l.status || "Pending").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return rows;
  }, [allLeaves, search, isAdminSide, statusFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-purple-600" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">WorkZen</p>
            <p className="text-gray-500 text-xs">Time Off</p>
          </div>
        </div>

        <div className="ml-6 flex-1 flex items-center gap-3">
          {me?.role === "Employee" && (
            <button
              onClick={() => setOpenNew(true)}
              className="inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
            >
              NEW
            </button>
          )}
        </div>
      </header>

      {/* Content with left panel */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
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
                    `block px-3 py-2 text-sm ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"}`
                  }
                  end={item.to === "/dashboard"}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <section className="col-span-12 md:col-span-10">
            {loading ? (
              <div className="text-sm text-gray-500">Loading time off…</div>
            ) : isAdminSide ? (
              <AdminLeaves
                rows={filtered}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onAct={async (id, status) => {
                  try {
                    await api(`/leave/status/${id}`, {
                      method: "PUT",
                      body: JSON.stringify({ status }),
                    });
                    showToast(`Leave ${status.toLowerCase()} ✅`);
                    setAllLeaves((rows) =>
                      rows.map((r) => (r.leave_id === id ? { ...r, status } : r))
                    );
                  } catch (e) {
                    showToast(e.message, "error");
                  }
                }}
              />
            ) : (
              <EmployeeLeaves
                summary={summary}
                rows={myLeaves}
                onRefresh={async () => {
                  if (!me) return;
                  const mine = await api(`/leave/my/${me.id}`);
                  setMyLeaves(mine.leaves || []);
                  const sum = await api(`/leave/summary/${me.id}`);
                  setSummary(sum.summary || null);
                }}
                openNew={openNew}
                onCloseNew={() => setOpenNew(false)}
                onCreated={(newRow) => setMyLeaves((r) => [newRow, ...r])}
              />
            )}
          </section>
        </div>
      </div>

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
function AdminLeaves({ rows, onAct, search, setSearch, statusFilter, setStatusFilter }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Card header with title + filters */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-gray-900 text-lg">All Time-Off Requests</p>
            <p className="text-xs text-gray-500">
              {rows.length} result{rows.length === 1 ? "" : "s"}
            </p>
          </div>

          {/* Filters row */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search input */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, type, status"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* Status chips */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              {["All", "Pending", "Approved", "Rejected"].map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition
                      ${active
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  >
                    {s}
                  </button>
                );
              })}
              {(search || statusFilter !== "All") && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("All"); }}
                  className="ml-1 px-3 py-1.5 text-xs rounded-full border bg-white text-gray-600 hover:bg-gray-50"
                  title="Clear filters"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <Th>Employee</Th>
                <Th>Email</Th>
                <Th>Type</Th>
                <Th className="text-center">Start</Th>
                <Th className="text-center">End</Th>
                <Th className="text-center">Status</Th>
                <Th>Reason</Th>
                <Th className="text-center">Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.leave_id} className="hover:bg-gray-50">
                  <Td className="whitespace-nowrap font-medium text-gray-900">{r.user?.name}</Td>
                  <Td className="whitespace-nowrap">{r.user?.email || "-"}</Td>
                  <Td className="whitespace-nowrap">{r.time_off_type || r.leave_type}</Td>
                  <Td className="text-center">{fmt(r.start_date)}</Td>
                  <Td className="text-center">{fmt(r.end_date)}</Td>
                  <Td className="text-center"><StatusPill status={r.status} /></Td>
                  <Td title={r.description || ""}>
                    {(r.description || "-").length > 60
                      ? `${(r.description || "").slice(0, 60)}…`
                      : (r.description || "-")}
                  </Td>
                  <Td className="text-center">
                    <div className="inline-flex gap-2">
                      <button
                        disabled={r.status === "Approved"}
                        onClick={() => onAct(r.leave_id, "Approved")}
                        className={`h-7 w-7 rounded-full border ${
                          r.status === "Approved" ? "opacity-40 cursor-not-allowed" : "hover:bg-green-50"
                        } flex items-center justify-center`}
                        title="Approve"
                      >
                        <span className="h-3 w-3 rounded-full bg-green-500 inline-block" />
                      </button>
                      <button
                        disabled={r.status === "Rejected"}
                        onClick={() => onAct(r.leave_id, "Rejected")}
                        className={`h-7 w-7 rounded-full border ${
                          r.status === "Rejected" ? "opacity-40 cursor-not-allowed" : "hover:bg-rose-50"
                        } flex items-center justify-center`}
                        title="Reject"
                      >
                        <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="px-5 py-6 text-sm text-gray-500">No requests found for your company.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Employee view
========================= */
function EmployeeLeaves({ summary, rows, onRefresh, openNew, onCloseNew, onCreated }) {
  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryTile title="Paid Time Off Left" value={summary.PaidTimeOff} />
          <SummaryTile title="Sick Time Off Left" value={summary.SickTimeOff} />
          <SummaryTile title="Unpaid Used" value={summary.UnpaidTimeOff} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="font-semibold text-gray-900 text-lg">My Time-Off Requests</p>
          <button
            onClick={onRefresh}
            className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
            title="Refresh"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <Th>Type</Th>
                <Th className="text-center">Start</Th>
                <Th className="text-center">End</Th>
                <Th>Reason</Th>
                <Th className="text-center">Status</Th>
                <Th>Attachment</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.leave_id} className="hover:bg-gray-50">
                  <Td className="whitespace-nowrap">{r.time_off_type || r.leave_type}</Td>
                  <Td className="text-center">{fmt(r.start_date)}</Td>
                  <Td className="text-center">{fmt(r.end_date)}</Td>
                  <Td className="whitespace-nowrap" title={r.description || ""}>
                    {(r.description || "-").length > 60
                      ? `${(r.description || "").slice(0, 60)}…`
                      : (r.description || "-")}
                  </Td>
                  <Td className="text-center"><StatusPill status={r.status} /></Td>
                  <Td className="whitespace-nowrap">
                    {r.attachment ? (
                      <a href={`${API_BASE}${r.attachment}`} target="_blank" rel="noreferrer" className="text-purple-700 underline">View</a>
                    ) : (
                      "-"
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openNew && (
        <NewLeaveModal
          onClose={onCloseNew}
          onCreated={onCreated}
        />
      )}
    </div>
  );
}

/* =========================
   New Leave Modal (employee)
========================= */
function NewLeaveModal({ onClose, onCreated }) {
  const [timeOffType, setTimeOffType] = useState("Paid Time Off");
  const [start, setStart] = useState(ymd(new Date()));
  const [end, setEnd] = useState(ymd(new Date()));
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    try {
      setSubmitting(true);
      setErr("");

      const fd = new FormData();
      fd.append("time_off_type", timeOffType);
      fd.append("leave_type", timeOffType);
      fd.append("start_date", start);
      fd.append("end_date", end);
      if (desc.trim()) fd.append("description", desc.trim());
      if (file) fd.append("attachment", file);

      const r = await api("/leave/apply", { method: "POST", body: fd });
      onCreated(r.leave);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <p className="font-semibold text-gray-900">Time Off Request</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">Time-Off Type</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={timeOffType}
              onChange={(e) => setTimeOffType(e.target.value)}
            >
              <option>Paid Time Off</option>
              <option>Sick Time Off</option>
              <option>Unpaid Time Off</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-1">Start</label>
              <input type="date" className="w-full rounded-lg border px-3 py-2" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">End</label>
              <input type="date" className="w-full rounded-lg border px-3 py-2" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-gray-600 mb-1">Reason / Notes (optional)</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Briefly describe why you're taking time off…"
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border px-3 py-2"
            />
            <p className="text-[11px] text-gray-500 mt-1">Up to 500 characters.</p>
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Attachment (optional)</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-gray-500 mt-1">Upload a doctor’s note for sick leave if needed.</p>
          </div>

          {err && <p className="text-rose-600 text-sm">{err}</p>}
        </div>

        <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Discard
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm hover:bg-purple-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Bits
========================= */
function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 font-semibold text-left ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function SummaryTile({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
function StatusPill({ status = "Pending" }) {
  const map = {
    Approved: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  const cls = map[status] || map.Pending;
  return <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${cls}`}>{status}</span>;
}
