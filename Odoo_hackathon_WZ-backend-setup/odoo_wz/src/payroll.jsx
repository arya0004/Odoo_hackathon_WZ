// // // src/payroll.jsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import { NavLink, useNavigate } from "react-router-dom";

// // /* -----------------------------
// //    API helper (same shape as dashboard)
// // ------------------------------ */
// // const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// // const API = `${API_BASE}/api`;

// // async function api(path, init = {}) {
// //   const res = await fetch(`${API}${path}`, {
// //     credentials: "include",
// //     headers: { "Content-Type": "application/json", ...(init.headers || {}) },
// //     ...init,
// //   });
// //   const data = await res.json().catch(() => ({}));
// //   if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
// //   return data;
// // }

// // /* ================================
// //    Payroll Page (Admin/Payroll only)
// // ================================ */
// // export default function PayrollPage() {
// //   const nav = useNavigate();

// //   const [me, setMe] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const [tab, setTab] = useState("payrun"); // "dashboard" | "payrun"
// //   const [employees, setEmployees] = useState([]);
// //   const [search, setSearch] = useState("");

// //   // month selector (YYYY-MM)
// //   const now = new Date();
// //   const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
// //   const [month, setMonth] = useState(defaultMonth);

// //   // results from payrun (map by user_id)
// //   const [results, setResults] = useState({}); // { [uid]: { status, gross, net, basic, employerCost, breakdown } }
// //   const [running, setRunning] = useState(false);
// //   const [selected, setSelected] = useState(null); // user_id
// //   const [toast, setToast] = useState(null);

// //   const showToast = (msg, type = "success") => {
// //     setToast({ msg, type });
// //     setTimeout(() => setToast(null), 2200);
// //   };

// //   /* 1) Auth */
// //   useEffect(() => {
// //     (async () => {
// //       try {
// //         const r = await api("/auth/isAuth");
// //         const u = r.user;
// //         // Only Admin and Payroll can see this
// //         if (!["Admin", "Payroll"].includes(u.role)) {
// //           showToast("Access restricted to Admin/Payroll", "error");
// //           nav("/");
// //           return;
// //         }
// //         setMe(u);
// //       } catch {
// //         nav("/auth");
// //       }
// //     })();
// //   }, [nav]);

// //   /* 2) Directory */
// //   useEffect(() => {
// //     if (!me) return;
// //     (async () => {
// //       try {
// //         const r = await api("/employee/directory");
// //         setEmployees(r.employees || []);
// //       } catch (e) {
// //         showToast(e.message, "error");
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //   }, [me]);

// //   const filtered = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     if (!q) return employees;
// //     return employees.filter(
// //       (e) =>
// //         e.name.toLowerCase().includes(q) ||
// //         e.email.toLowerCase().includes(q) ||
// //         (e.role || "").toLowerCase().includes(q)
// //     );
// //   }, [employees, search]);

// //   /* Run payrun for ALL employees (save=true) */
// //   const runPayrunAll = async () => {
// //     if (running) return;
// //     setRunning(true);
// //     const map = { ...results };

// //     try {
// //       const jobs = filtered.map(async (emp) => {
// //         try {
// //           const r = await api("/admin/payslip/compute", {
// //             method: "POST",
// //             body: JSON.stringify({ user_id: emp.user_id, month, save: true }),
// //           });
// //           const br = r.breakdown || r.payroll?.breakdown || {};
// //           map[emp.user_id] = {
// //             status: "Done",
// //             basic: br.basic ?? 0,
// //             gross: br.gross ?? 0,
// //             net: br.net ?? 0,
// //             employerCost: br.wage ?? (br.basic ?? 0), // label from your sketch
// //             breakdown: br,
// //           };
// //         } catch (err) {
// //           map[emp.user_id] = { status: "Error", error: err.message };
// //         }
// //       });

// //       await Promise.allSettled(jobs);
// //       setResults(map);
// //       showToast("Payrun completed");
// //     } catch (e) {
// //       showToast(e.message, "error");
// //     } finally {
// //       setRunning(false);
// //     }
// //   };

// //   /* Select row -> ensure we have a fresh breakdown (save=false) */
// //   const openDetails = async (emp) => {
// //     setSelected(emp.user_id);
// //     // if we already have breakdown for this month, reuse
// //     const have = results[emp.user_id]?.breakdown;
// //     if (have) return;

// //     try {
// //       const r = await api("/admin/payslip/compute", {
// //         method: "POST",
// //         body: JSON.stringify({ user_id: emp.user_id, month, save: false }),
// //       });
// //       setResults((s) => ({
// //         ...s,
// //         [emp.user_id]: {
// //           ...(s[emp.user_id] || {}),
// //           status: s[emp.user_id]?.status || "Preview",
// //           basic: r.breakdown?.basic ?? 0,
// //           gross: r.breakdown?.gross ?? 0,
// //           net: r.breakdown?.net ?? 0,
// //           employerCost: r.breakdown?.wage ?? 0,
// //           breakdown: r.breakdown,
// //         },
// //       }));
// //     } catch (e) {
// //       showToast(e.message, "error");
// //     }
// //   };

// //   /* UI helpers */
// //   const selEmp = employees.find((e) => e.user_id === selected);
// //   const breakdown = results[selected]?.breakdown;

// //   if (loading) return <div className="p-6 text-sm text-gray-500">Loading payroll…</div>;

// //   return (
// //     <div className="min-h-screen bg-white">
// //       {/* Top bar */}
// //       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
// //         {/* Brand */}
// //         <div className="flex items-center gap-3">
// //           <div className="h-8 w-8 rounded-md bg-purple-600" />
// //           <div className="text-sm">
// //             <p className="font-semibold text-gray-900">WorkZen</p>
// //             <p className="text-gray-500 text-xs">Payroll</p>
// //           </div>
// //         </div>

// //         <div className="ml-auto flex items-center gap-3">
// //           <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs px-3 py-1">
// //             {me?.role}
// //           </span>
// //         </div>
// //       </header>

// //       {/* Content */}
// //       <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
// //         <div className="grid grid-cols-12 gap-6">
// //           {/* Sidebar (same style as dashboard) */}
// //           <aside className="col-span-12 md:col-span-2">
// //             <nav className="rounded-xl border border-gray-200 overflow-hidden">
// //               {[
// //                 { label: "Employees", to: "/" },
// //                 { label: "Attendance", to: "/attendance" },
// //                 { label: "Time Off", to: "/timeoff" },
// //                 { label: "Payroll", to: "/payroll" },
// //                 { label: "Reports", to: "/reports" },
// //                 { label: "Settings", to: "/settings" },
// //               ].map((item) => (
// //                 <NavLink
// //                   key={item.label}
// //                   to={item.to}
// //                   className={({ isActive }) =>
// //                     `block px-3 py-2 text-sm ${
// //                       isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
// //                     }`
// //                   }
// //                   end={item.to === "/"}
// //                 >
// //                   {item.label}
// //                 </NavLink>
// //               ))}
// //             </nav>
// //           </aside>

// //           {/* Main */}
// //           <section className="col-span-12 md:col-span-10">
// //             {/* Top tabs */}
// //             <div className="flex items-center gap-2">
// //               <button
// //                 onClick={() => setTab("dashboard")}
// //                 className={`rounded-lg px-3 py-1.5 text-sm border ${
// //                   tab === "dashboard"
// //                     ? "bg-purple-600 text-white border-purple-600"
// //                     : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
// //                 }`}
// //               >
// //                 Dashboard
// //               </button>
// //               <button
// //                 onClick={() => setTab("payrun")}
// //                 className={`rounded-lg px-3 py-1.5 text-sm border ${
// //                   tab === "payrun"
// //                     ? "bg-purple-600 text-white border-purple-600"
// //                     : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
// //                 }`}
// //               >
// //                 Payrun
// //               </button>

// //               <div className="ml-auto flex items-center gap-2">
// //                 <input
// //                   type="month"
// //                   value={month}
// //                   onChange={(e) => {
// //                     setMonth(e.target.value);
// //                     setResults({});
// //                     setSelected(null);
// //                   }}
// //                   className="rounded-xl border border-purple-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
// //                 />
// //                 <button
// //                   onClick={runPayrunAll}
// //                   disabled={running || filtered.length === 0}
// //                   className="rounded-lg bg-purple-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
// //                 >
// //                   {running ? "Computing…" : "Payrun"}
// //                 </button>
// //                 <button
// //                   onClick={() => showToast("Validated payrun")}
// //                   className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
// //                 >
// //                   Validate
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Search */}
// //             <div className="mt-4">
// //               <input
// //                 value={search}
// //                 onChange={(e) => setSearch(e.target.value)}
// //                 placeholder="Search employees"
// //                 className="w-full max-w-md rounded-xl border border-purple-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
// //               />
// //             </div>

// //             {/* Three-pane layout */}
// //             <div className="mt-5 grid grid-cols-12 gap-6">
// //               {/* Left: Payrun list */}
// //               <div className="col-span-12 lg:col-span-6">
// //                 <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden shadow-sm">
// //                   <div className="border-b border-purple-100 bg-purple-50/60 px-4 py-2.5">
// //                     <div className="grid grid-cols-12 text-xs font-semibold text-purple-800">
// //                       <div className="col-span-4">Pay Period</div>
// //                       <div className="col-span-3">Employee</div>
// //                       <div className="col-span-2 text-right">Basic</div>
// //                       <div className="col-span-2 text-right">Net</div>
// //                       <div className="col-span-1 text-center">Status</div>
// //                     </div>
// //                   </div>

// //                   <ul className="divide-y divide-purple-100">
// //                     {filtered.map((emp) => {
// //                       const r = results[emp.user_id];
// //                       const status = r?.status || "-";
// //                       const badge =
// //                         status === "Done"
// //                           ? "bg-emerald-100 text-emerald-700 border-emerald-200"
// //                           : status === "Error"
// //                           ? "bg-rose-100 text-rose-700 border-rose-200"
// //                           : "bg-gray-100 text-gray-700 border-gray-200";

// //                       return (
// //                         <li
// //                           key={emp.user_id}
// //                           className="px-4 py-3 cursor-pointer hover:bg-purple-50/40"
// //                           onClick={() => openDetails(emp)}
// //                         >
// //                           <div className="grid grid-cols-12 items-center">
// //                             <div className="col-span-4 text-sm text-gray-700">
// //                               {month} {/* Pay period */}
// //                             </div>
// //                             <div className="col-span-3 flex items-center gap-2">
// //                               <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
// //                                 {initials(emp.name)}
// //                               </div>
// //                               <div className="text-sm font-medium text-gray-900 truncate">
// //                                 {emp.name}
// //                               </div>
// //                             </div>
// //                             <div className="col-span-2 text-right text-sm tabular-nums text-gray-700">
// //                               ₹ {fmt(results[emp.user_id]?.basic)}
// //                             </div>
// //                             <div className="col-span-2 text-right text-sm tabular-nums text-gray-900 font-semibold">
// //                               ₹ {fmt(results[emp.user_id]?.net)}
// //                             </div>
// //                             <div className="col-span-1 flex justify-center">
// //                               <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badge}`}>
// //                                 {status}
// //                               </span>
// //                             </div>
// //                           </div>
// //                         </li>
// //                       );
// //                     })}

// //                     {filtered.length === 0 && (
// //                       <li className="px-4 py-8 text-center text-sm text-gray-500">
// //                         No employees found.
// //                       </li>
// //                     )}
// //                   </ul>
// //                 </div>

// //                 {/* legend */}
// //                 <div className="mt-3 text-xs text-gray-500 space-y-0.5">
// //                   <p>Employer cost = employee monthly wage.</p>
// //                   <p>Gross = basic + allowances. Net = gross − deductions.</p>
// //                 </div>
// //               </div>

// //               {/* Middle: Worked Days */}
// //               <div className="col-span-12 lg:col-span-3">
// //                 <Card title={selEmp ? `[${selEmp.name}]` : "[Employee]"} subtitle="Worked Days">
// //                   {breakdown ? (
// //                     <table className="w-full text-sm">
// //                       <thead>
// //                         <tr className="text-left text-gray-500">
// //                           <th className="py-1.5">Type</th>
// //                           <th className="py-1.5">Days</th>
// //                           <th className="py-1.5 text-right">Amount</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody className="[&>tr>*]:py-1.5">
// //                         <tr>
// //                           <td>Attendance</td>
// //                           <td>{Number(breakdown.present).toFixed(2)} ({Math.ceil(breakdown.workingDays/5)} working days in week)</td>
// //                           <td className="text-right">₹ {fmt(breakdown.gross - (breakdown.deductionComponents?.reduce((s,d)=>s+d.amount,0)||0))}</td>
// //                         </tr>
// //                         <tr>
// //                           <td>Paid Time off</td>
// //                           <td>{Number(breakdown.leave).toFixed(2)} (Paid leaves/Month)</td>
// //                           <td className="text-right">₹ {fmt((breakdown.grossComponents||[]).reduce((s,g)=>s+g.amount,0) - (breakdown.basic||0))}</td>
// //                         </tr>
// //                         <tr className="border-t">
// //                           <td className="font-medium">Total</td>
// //                           <td className="font-medium">{Number(breakdown.paidDays).toFixed(2)}</td>
// //                           <td className="text-right font-semibold">₹ {fmt(breakdown.gross)}</td>
// //                         </tr>
// //                       </tbody>
// //                     </table>
// //                   ) : (
// //                     <Placeholder />
// //                   )}
// //                 </Card>
// //               </div>

// //               {/* Right: Salary Computation */}
// //               <div className="col-span-12 lg:col-span-3">
// //                 <Card title={selEmp ? `[${selEmp.name}]` : "[Employee]"} subtitle="Salary Computation">
// //                   {breakdown ? (
// //                     <div className="space-y-3">
// //                       <table className="w-full text-sm">
// //                         <thead>
// //                           <tr className="text-left text-gray-500">
// //                             <th className="py-1.5">Rule Name</th>
// //                             <th className="py-1.5 text-right">Amount</th>
// //                           </tr>
// //                         </thead>
// //                         <tbody className="[&>tr>*]:py-1.5">
// //                           {(breakdown.grossComponents || []).map((c) => (
// //                             <tr key={`g-${c.name}`}>
// //                               <td>{c.name}</td>
// //                               <td className="text-right">₹ {fmt(c.amount)}</td>
// //                             </tr>
// //                           ))}
// //                           <tr className="border-t">
// //                             <td className="font-semibold">Gross</td>
// //                             <td className="text-right font-semibold">₹ {fmt(breakdown.gross)}</td>
// //                           </tr>
// //                           {(breakdown.deductionComponents || []).map((c) => (
// //                             <tr key={`d-${c.name}`}>
// //                               <td>{c.name}</td>
// //                               <td className="text-right">- ₹ {fmt(c.amount)}</td>
// //                             </tr>
// //                           ))}
// //                           <tr className="border-t">
// //                             <td className="font-semibold">Net Amount</td>
// //                             <td className="text-right font-bold text-gray-900">₹ {fmt(breakdown.net)}</td>
// //                           </tr>
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   ) : (
// //                     <Placeholder />
// //                   )}
// //                 </Card>
// //               </div>
// //             </div>
// //           </section>
// //         </div>
// //       </div>

// //       {/* Toast */}
// //       {toast && (
// //         <div
// //           className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${
// //             toast.type === "error"
// //               ? "bg-rose-50 border-rose-200 text-rose-700"
// //               : "bg-emerald-50 border-emerald-200 text-emerald-700"
// //           }`}
// //         >
// //           {toast.msg}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* ===== Small UI bits ===== */
// // function Card({ title, subtitle, children }) {
// //   return (
// //     <div className="rounded-2xl border border-purple-200 bg-white shadow-sm overflow-hidden">
// //       <div className="px-4 py-2.5 border-b border-purple-100 bg-purple-50/60">
// //         <h3 className="text-purple-800 text-sm font-semibold">{title}</h3>
// //         <p className="text-[11px] text-purple-700 mt-0.5">{subtitle}</p>
// //       </div>
// //       <div className="p-4">{children}</div>
// //     </div>
// //   );
// // }

// // function Placeholder() {
// //   return <p className="text-sm text-gray-500">Select an employee to view details.</p>;
// // }

// // function initials(name = "") {
// //   const n = (name || "").trim().split(/\s+/);
// //   return ((n[0]?.[0] || "") + (n[1]?.[0] || "")).toUpperCase();
// // }

// // function fmt(n) {
// //   if (n === undefined || n === null || isNaN(Number(n))) return "0.00";
// //   return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// // }
// // src/payroll.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";

// /* ------------- API helper ------------- */
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api`;

// async function api(path, init = {}) {
//   const res = await fetch(`${API}${path}`, {
//     credentials: "include",
//     headers: { "Content-Type": "application/json", ...(init.headers || {}) },
//     ...init,
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
//   return data;
// }

// /* ================================
//    Payroll (Admin + Payroll only)
// ================================ */
// export default function PayrollPage() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Tabs at top (Dashboard/Payrun)
//   const [tab, setTab] = useState("payrun");

//   // Month (YYYY-MM)
//   const now = new Date();
//   const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//   const [month, setMonth] = useState(defaultMonth);

//   // Directory + filters
//   const [employees, setEmployees] = useState([]);
//   const [search, setSearch] = useState("");

//   // Payrun results cache by user_id
//   const [results, setResults] = useState({});
//   const [running, setRunning] = useState(false);

//   // Detail page selection (null => list page)
//   const [selectedId, setSelectedId] = useState(null);

//   const [toast, setToast] = useState(null);
//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2200);
//   };

//   /* 1) Auth */
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         const u = r.user;
//         if (!["Admin", "Payroll"].includes(u.role)) {
//           showToast("Access restricted to Admin/Payroll", "error");
//           nav("/");
//           return;
//         }
//         setMe(u);
//       } catch {
//         nav("/auth");
//       }
//     })();
//   }, [nav]);

//   /* 2) Directory */
//   useEffect(() => {
//     if (!me) return;
//     (async () => {
//       try {
//         const r = await api("/employee/directory");
//         setEmployees(r.employees || []);
//       } catch (e) {
//         showToast(e.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [me]);

//   // Filter
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter(
//       (e) =>
//         e.name.toLowerCase().includes(q) ||
//         e.email.toLowerCase().includes(q) ||
//         (e.role || "").toLowerCase().includes(q)
//     );
//   }, [employees, search]);

//   /* ========== List actions ========== */
//   const runPayrunAll = async () => {
//     if (running) return;
//     setRunning(true);
//     const map = { ...results };

//     try {
//       const jobs = filtered.map(async (emp) => {
//         try {
//           const r = await api("/admin/payslip/compute", {
//             method: "POST",
//             body: JSON.stringify({ user_id: emp.user_id, month, save: true }),
//           });
//           const br = r.breakdown || r.payroll?.breakdown || {};
//           map[emp.user_id] = {
//             status: "Done",
//             employerCost: br.wage ?? 0,
//             basic: br.basic ?? 0,
//             gross: br.gross ?? 0,
//             net: br.net ?? 0,
//             breakdown: br,
//           };
//         } catch (err) {
//           map[emp.user_id] = { status: "Error", error: err.message };
//         }
//       });

//       await Promise.allSettled(jobs);
//       setResults(map);
//       showToast("Payrun completed");
//     } catch (e) {
//       showToast(e.message, "error");
//     } finally {
//       setRunning(false);
//     }
//   };

//   const openDetail = async (emp) => {
//     setSelectedId(emp.user_id);
//     if (results[emp.user_id]?.breakdown) return; // already cached

//     try {
//       const r = await api("/admin/payslip/compute", {
//         method: "POST",
//         body: JSON.stringify({ user_id: emp.user_id, month, save: false }),
//       });
//       const br = r.breakdown || {};
//       setResults((s) => ({
//         ...s,
//         [emp.user_id]: {
//           status: "Preview",
//           employerCost: br.wage ?? 0,
//           basic: br.basic ?? 0,
//           gross: br.gross ?? 0,
//           net: br.net ?? 0,
//           breakdown: br,
//         },
//       }));
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   const goBackToList = () => setSelectedId(null);

//   /* ========== Selections ========== */
//   const selEmp = employees.find((e) => e.user_id === selectedId);
//   const br = results[selectedId]?.breakdown;

//   /* ========== UI ========== */
//   if (loading) return <div className="p-6 text-sm text-gray-500">Loading payroll…</div>;

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Payroll</p>
//           </div>
//         </div>

//         <div className="ml-auto flex items-center gap-2">
//           <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs px-3 py-1">
//             {me?.role}
//           </span>
//         </div>
//       </header>

//       <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Left app nav (same as dashboard) */}
//           <aside className="col-span-12 md:col-span-2">
//             <nav className="rounded-xl border border-gray-200 overflow-hidden">
//               {[
//                 { label: "Employees", to: "/" },
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
//                     `block px-3 py-2 text-sm ${
//                       isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
//                     }`
//                   }
//                   end={item.to === "/dashboard"}
//                 >
//                   {item.label}
//                 </NavLink>
//               ))}
//             </nav>
//           </aside>

//           {/* Right content */}
//           <section className="col-span-12 md:col-span-10">
//             {/* Top mini tabs + actions */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setTab("dashboard")}
//                 className={`rounded-lg px-3 py-1.5 text-sm border ${
//                   tab === "dashboard"
//                     ? "bg-purple-600 text-white border-purple-600"
//                     : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
//                 }`}
//               >
//                 Dashboard
//               </button>
//               <button
//                 onClick={() => setTab("payrun")}
//                 className={`rounded-lg px-3 py-1.5 text-sm border ${
//                   tab === "payrun"
//                     ? "bg-purple-600 text-white border-purple-600"
//                     : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
//                 }`}
//               >
//                 Payrun
//               </button>

//               <div className="ml-auto flex items-center gap-2">
//                 <input
//                   type="month"
//                   value={month}
//                   onChange={(e) => {
//                     setMonth(e.target.value);
//                     setResults({});
//                     setSelectedId(null);
//                   }}
//                   className="rounded-xl border border-purple-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//                 />

//                 {/* Header actions like in the sketch */}
//                 {!selectedId ? (
//                   <>
//                     <button
//                       onClick={() => showToast("New payslip draft")}
//                       className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
//                     >
//                       New
//                     </button>
//                     <button
//                       onClick={runPayrunAll}
//                       disabled={running || filtered.length === 0}
//                       className="rounded-lg bg-purple-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
//                     >
//                       {running ? "Computing…" : "Compute"}
//                     </button>
//                     <button
//                       onClick={() => showToast("Validated")}
//                       className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
//                     >
//                       Validate
//                     </button>
//                     <button
//                       onClick={() => showToast("Nothing to cancel")}
//                       className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
//                     >
//                       Print
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={() => setSelectedId(null)}
//                       className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
//                     >
//                       Print
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* ===== PAGE 1: LIST ===== */}
//             {!selectedId && (
//               <>
//                 <div className="mt-4">
//                   <input
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search employees"
//                     className="w-full max-w-md rounded-xl border border-purple-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//                   />
//                 </div>

//                 <div className="mt-5 rounded-2xl border border-purple-200 bg-white overflow-hidden shadow-sm">
//                   <div className="border-b border-purple-100 bg-purple-50/60 px-4 py-2.5">
//                     <div className="grid grid-cols-12 text-xs font-semibold text-purple-800">
//                       <div className="col-span-3">Pay Period</div>
//                       <div className="col-span-3">Employee</div>
//                       <div className="col-span-2 text-right">Employer Cost</div>
//                       <div className="col-span-1 text-right">Basic</div>
//                       <div className="col-span-1 text-right">Gross</div>
//                       <div className="col-span-1 text-right">Net</div>
//                       <div className="col-span-1 text-center">Status</div>
//                     </div>
//                   </div>

//                   <ul className="divide-y divide-purple-100">
//                     {filtered.map((emp) => {
//                       const r = results[emp.user_id] || {};
//                       const status = r.status || "-";
//                       const badge =
//                         status === "Done"
//                           ? "bg-emerald-100 text-emerald-700 border-emerald-200"
//                           : status === "Error"
//                           ? "bg-rose-100 text-rose-700 border-rose-200"
//                           : "bg-gray-100 text-gray-700 border-gray-200";
//                       return (
//                         <li
//                           key={emp.user_id}
//                           className="px-4 py-3 cursor-pointer hover:bg-purple-50/40"
//                           onClick={() => openDetail(emp)}
//                         >
//                           <div className="grid grid-cols-12 items-center">
//                             <div className="col-span-3 text-sm text-gray-700">{month}</div>
//                             <div className="col-span-3 flex items-center gap-2">
//                               <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
//                                 {initials(emp.name)}
//                               </div>
//                               <div className="text-sm font-medium text-gray-900 truncate">{emp.name}</div>
//                             </div>
//                             <div className="col-span-2 text-right text-sm tabular-nums text-gray-700">
//                               ₹ {fmt(r.employerCost)}
//                             </div>
//                             <div className="col-span-1 text-right text-sm tabular-nums text-gray-700">
//                               ₹ {fmt(r.basic)}
//                             </div>
//                             <div className="col-span-1 text-right text-sm tabular-nums text-gray-700">
//                               ₹ {fmt(r.gross)}
//                             </div>
//                             <div className="col-span-1 text-right text-sm tabular-nums font-semibold text-gray-900">
//                               ₹ {fmt(r.net)}
//                             </div>
//                             <div className="col-span-1 flex justify-center">
//                               <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badge}`}>
//                                 {status}
//                               </span>
//                             </div>
//                           </div>
//                         </li>
//                       );
//                     })}

//                     {filtered.length === 0 && (
//                       <li className="px-4 py-8 text-center text-sm text-gray-500">No employees found.</li>
//                     )}
//                   </ul>
//                 </div>

//                 <div className="mt-3 text-xs text-gray-500 space-y-0.5">
//                   <p>Employer cost = employee monthly wage.</p>
//                   <p>Basic wage = employee’s basic salary.</p>
//                   <p>Gross = basic + allowances. Net = gross − deductions.</p>
//                 </div>
//               </>
//             )}

//             {/* ===== PAGE 2: DETAIL (two panels) ===== */}
//             {selectedId && (
//               <div className="mt-5 grid grid-cols-12 gap-6">
//                 {/* Panel: Worked Days */}
//                 <div className="col-span-12 lg:col-span-6">
//                   <Card title={selEmp ? `[${selEmp.name}]` : "[Employee]"} subtitle="Worked Days">
//                     {br ? (
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="text-left text-gray-500">
//                             <th className="py-1.5">Type</th>
//                             <th className="py-1.5">Days</th>
//                             <th className="py-1.5 text-right">Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody className="[&>tr>*]:py-1.5">
//                           <tr>
//                             <td>Attendance</td>
//                             <td>
//                               {Number(br.present || 0).toFixed(2)}{" "}
//                               <span className="text-gray-400">
//                                 (approx {Math.ceil((br.workingDays || 0) / 5)} working days/week)
//                               </span>
//                             </td>
//                             <td className="text-right">₹ {fmt((br.gross || 0) - (br.totalDeductions || 0))}</td>
//                           </tr>
//                           <tr>
//                             <td>Paid Time off</td>
//                             <td>{Number(br.leave || 0).toFixed(2)} (Paid leaves/Month)</td>
//                             <td className="text-right">
//                               ₹ {fmt(Math.max(0, (br.grossComponents || []).reduce((s, x) => s + (x.amount || 0), 0) - (br.basic || 0)))}
//                             </td>
//                           </tr>
//                           <tr className="border-t">
//                             <td className="font-medium">Total</td>
//                             <td className="font-medium">{Number(br.paidDays || 0).toFixed(2)}</td>
//                             <td className="text-right font-semibold">₹ {fmt(br.gross)}</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                       ) : (
//                       <Placeholder />
//                     )}
//                   </Card>
//                 </div>

//                 {/* Panel: Salary Computation */}
//                 <div className="col-span-12 lg:col-span-6">
//                   <Card title={selEmp ? `[${selEmp.name}]` : "[Employee]"} subtitle="Salary Computation">
//                     {br ? (
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="text-left text-gray-500">
//                             <th className="py-1.5">Rule Name</th>
//                             <th className="py-1.5 text-right">Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody className="[&>tr>*]:py-1.5">
//                           {(br.grossComponents || []).map((c) => (
//                             <tr key={`g-${c.name}`}>
//                               <td>{c.name}</td>
//                               <td className="text-right">₹ {fmt(c.amount)}</td>
//                             </tr>
//                           ))}
//                           <tr className="border-t">
//                             <td className="font-semibold">Gross</td>
//                             <td className="text-right font-semibold">₹ {fmt(br.gross)}</td>
//                           </tr>

//                           {(br.deductionComponents || []).map((c) => (
//                             <tr key={`d-${c.name}`}>
//                               <td>{c.name}</td>
//                               <td className="text-right">- ₹ {fmt(c.amount)}</td>
//                             </tr>
//                           ))}
//                           <tr className="border-t">
//                             <td className="font-semibold">Net Amount</td>
//                             <td className="text-right font-bold text-gray-900">₹ {fmt(br.net)}</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     ) : (
//                       <Placeholder />
//                     )}
//                   </Card>
//                 </div>
//               </div>
//             )}
//           </section>
//         </div>
//       </div>

//       {/* Toast */}
//       {toast && (
//         <div
//           className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${
//             toast.type === "error"
//               ? "bg-rose-50 border-rose-200 text-rose-700"
//               : "bg-emerald-50 border-emerald-200 text-emerald-700"
//           }`}
//         >
//           {toast.msg}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ===== UI bits ===== */
// function Card({ title, subtitle, children }) {
//   return (
//     <div className="rounded-2xl border border-purple-200 bg-white shadow-sm overflow-hidden">
//       <div className="px-4 py-2.5 border-b border-purple-100 bg-purple-50/60">
//         <h3 className="text-purple-800 text-sm font-semibold">{title}</h3>
//         <p className="text-[11px] text-purple-700 mt-0.5">{subtitle}</p>
//       </div>
//       <div className="p-4">{children}</div>
//     </div>
//   );
// }

// function Placeholder() {
//   return <p className="text-sm text-gray-500">Select an employee to view details.</p>;
// }

// function initials(name = "") {
//   const n = (name || "").trim().split(/\s+/);
//   return ((n[0]?.[0] || "") + (n[1]?.[0] || "")).toUpperCase();
// }
// function fmt(n) {
//   if (n === undefined || n === null || isNaN(Number(n))) return "0.00";
//   return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }


// src/payroll.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

/* -------------------- API helper -------------------- */
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

/* ================================
   Payroll (Admin + Payroll only)
================================ */
export default function PayrollPage() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Outer tabs
  const [tab, setTab] = useState("dashboard"); // "dashboard" | "payrun"

  // Month (YYYY-MM)
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);

  // Directory + filters
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  // Payrun results cache by user_id
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);

  // Detail selection
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState("worked"); // "worked" | "salary"

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };


  // ===== Dashboard analytics =====
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState([]); // [{key:'2025-10', label:'Oct 2025', employerTotal, computedCount}]

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  function monthLabel(date) {
    return date.toLocaleString("en-US", { month: "short" }) + " " + String(date.getFullYear()).slice(2);
  }
  function lastNMonths(n, fromYYYYMM) {
    const base = fromYYYYMM
      ? new Date(Number(fromYYYYMM.slice(0,4)), Number(fromYYYYMM.slice(5))-1, 1)
      : new Date();
    const arr = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      arr.push({ key: monthKey(d), label: monthLabel(d) });
    }
    return arr;
  }

  async function loadAnalytics() {
    if (!employees.length) return;
    setAnalyticsLoading(true);
    try {
      const months = lastNMonths(3, month); // prev 2 + current
      const rows = [];
      for (const m of months) {
        let employerTotal = 0;
        let computedCount = 0;

        // compute each employee for month m (preview mode)
        const jobs = employees.map(async (emp) => {
          try {
            const r = await api("/admin/payslip/compute", {
              method: "POST",
              body: JSON.stringify({ user_id: emp.user_id, month: m.key, save: false }),
            });
            const br = r.breakdown || {};
            employerTotal += Number(br.wage || 0);
            computedCount += 1;
          } catch {
            /* ignore failures per-employee to keep totals going */
          }
        });
        await Promise.allSettled(jobs);

        rows.push({ ...m, employerTotal, computedCount });
      }
      setAnalytics(rows);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setAnalyticsLoading(false);
    }
  }

  // Auto-load analytics when you land on the Dashboard tab or when month changes
  useEffect(() => {
    if (tab === "dashboard" && me) loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, month, employees.length, me]);

  
  /* 1) Auth */
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        const u = r.user;
        if (!["Admin", "Payroll"].includes(u.role)) {
          showToast("Access restricted to Admin/Payroll", "error");
          nav("/");
          return;
        }
        setMe(u);
      } catch {
        nav("/auth");
      }
    })();
  }, [nav]);

  /* 2) Directory */
  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        const r = await api("/employee/directory");
        setEmployees(r.employees || []);
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [me]);

  // --------- Derived data ---------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.role || "").toLowerCase().includes(q)
    );
  }, [employees, search]);

  // Dashboard: warnings + tiny stats
  const warnings = useMemo(() => {
    const noBank = employees.filter((e) => !e.bank_name || !e.account_number || !e.ifsc_code);
    const noManager = employees.filter((e) => e.role === "Employee" && !e.manager_id);
    return {
      noBank,
      noManager,
      labels: [
        { label: `${noBank.length} employee(s) without Bank A/c`, type: "bank" },
        { label: `${noManager.length} employee(s) without Manager`, type: "manager" },
      ],
    };
  }, [employees]);

  const payrunAgg = useMemo(() => {
    const ids = Object.keys(results);
    let totalGross = 0;
    let totalNet = 0;
    let done = 0;
    ids.forEach((id) => {
      const r = results[id];
      if (!r) return;
      totalGross += Number(r.gross || 0);
      totalNet += Number(r.net || 0);
      if (r.status === "Done") done++;
    });
    return { count: ids.length, done, totalGross, totalNet };
  }, [results]);

  /* ---------- Actions ---------- */
  const runPayrunAll = async () => {
    if (running) return;
    setRunning(true);
    const map = { ...results };

    try {
      const jobs = filtered.map(async (emp) => {
        try {
          const r = await api("/admin/payslip/compute", {
            method: "POST",
            body: JSON.stringify({ user_id: emp.user_id, month, save: true }),
          });
          const br = r.breakdown || r.payroll?.breakdown || {};
          map[emp.user_id] = {
            status: "Done",
            employerCost: br.wage ?? 0,
            basic: br.basic ?? 0,
            gross: br.gross ?? 0,
            net: br.net ?? 0,
            breakdown: br,
          };
        } catch (err) {
          map[emp.user_id] = { status: "Error", error: err.message };
        }
      });

      await Promise.allSettled(jobs);
      setResults(map);
      showToast("Payrun completed");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setRunning(false);
    }
  };

  const openDetail = async (emp) => {
    setSelectedId(emp.user_id);
    setDetailTab("worked");
    if (results[emp.user_id]?.breakdown) return; // cached

    try {
      const r = await api("/admin/payslip/compute", {
        method: "POST",
        body: JSON.stringify({ user_id: emp.user_id, month, save: false }),
      });
      const br = r.breakdown || {};
      setResults((s) => ({
        ...s,
        [emp.user_id]: {
          status: "Preview",
          employerCost: br.wage ?? 0,
          basic: br.basic ?? 0,
          gross: br.gross ?? 0,
          net: br.net ?? 0,
          breakdown: br,
        },
      }));
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const goBackToList = () => setSelectedId(null);

  const selEmp = employees.find((e) => e.user_id === selectedId);
  const br = results[selectedId]?.breakdown;

  /* ---------- UI ---------- */
  if (loading) return <div className="p-6 text-sm text-gray-500">Loading payroll…</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-purple-600" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">WorkZen</p>
            <p className="text-gray-500 text-xs">Payroll</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs px-3 py-1">
            {me?.role}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* App nav */}
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
                  end={item.to === "/dashboard"}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <section className="col-span-12 md:col-span-10">
            {/* Top mini tabs + actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setTab("dashboard"); setSelectedId(null); }}
                className={`rounded-lg px-3 py-1.5 text-sm border ${
                  tab === "dashboard"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setTab("payrun")}
                className={`rounded-lg px-3 py-1.5 text-sm border ${
                  tab === "payrun"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                }`}
              >
                Payrun
              </button>

              <div className="ml-auto flex items-center gap-2">
                <input
                  type="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setResults({});
                    setSelectedId(null);
                  }}
                  className="rounded-xl border border-purple-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />

                {!selectedId ? (
                  <>
                    <button
                      onClick={() => showToast("New payslip draft")}
                      className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
                    >
                      New
                    </button>
                    <button
                      onClick={runPayrunAll}
                      disabled={running || filtered.length === 0}
                      className="rounded-lg bg-purple-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
                    >
                      {running ? "Computing…" : "Compute"}
                    </button>
                    <button
                      onClick={() => showToast("Validated")}
                      className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
                    >
                      Validate
                    </button>
                    <button
                      onClick={() => showToast("Nothing to cancel")}
                      className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
                    >
                      Print
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={goBackToList}
                      className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-1.5 text-sm hover:bg-purple-50"
                    >
                      Print
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ================= DASHBOARD ================= */}
                       {/* ================= DASHBOARD ================= */}
            {tab === "dashboard" && !selectedId && (
              <div className="mt-5 space-y-6">
                {/* Top summary cards */}
                <div className="grid grid-cols-12 gap-4">
                  <SummaryCard title="Employees" value={employees.length} hint="in your company" />
                  <SummaryCard title="Computed (this session)" value={Object.keys(results).length} hint="previewed or saved" />
                  <SummaryCard title="Total Gross (cache)" value={`₹ ${fmt(Object.values(results).reduce((s,r)=>s+Number(r.gross||0),0))}`} hint="from current cache" />
                  <SummaryCard title="Total Net (cache)" value={`₹ ${fmt(Object.values(results).reduce((s,r)=>s+Number(r.net||0),0))}`} hint="from current cache" />
                </div>

                {/* Warnings + Quick payrun */}
                <div className="grid grid-cols-12 gap-6">
                  <Card className="col-span-12 lg:col-span-5" title="Warnings" subtitle="Data issues that affect payroll">
                    <ul className="text-sm space-y-2">
                      {/* simple examples (same as before) */}
                      <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
                          Check missing bank accounts & managers
                        </span>
                        <span className="text-xs text-gray-500">Fix in Settings → Users</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="col-span-12 lg:col-span-7" title="Quick Payrun" subtitle="Run for the selected month">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={runPayrunAll}
                        disabled={running || filtered.length === 0}
                        className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
                      >
                        {running ? "Computing…" : `Compute for ${month}`}
                      </button>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter employees"
                        className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={loadAnalytics}
                        className="rounded-lg border border-purple-200 bg-white text-purple-700 px-3 py-2 text-sm hover:bg-purple-50"
                      >
                        {analyticsLoading ? "Refreshing…" : "Refresh analytics"}
                      </button>
                    </div>
                  </Card>
                </div>

                {/* ===== Analytics like the sketch (two mini bar groups) ===== */}
                <div className="grid grid-cols-12 gap-6">
                  <Card className="col-span-12 lg:col-span-6" title="Employer cost" subtitle="Annually  |  Quarterly  |  Monthly">
                    <MiniBarGroup
                      items={analytics}
                      valueKey="employerTotal"
                      valueFmt={(v) => `₹ ${fmt(v)}`}
                      emptyText={analyticsLoading ? "Computing…" : "No data yet"}
                    />
                  </Card>

                  <Card className="col-span-12 lg:col-span-6" title="Employee count" subtitle="Annually  |  Quarterly  |  Monthly">
                    <MiniBarGroup
                      items={analytics}
                      valueKey="computedCount"
                      valueFmt={(v) => `${v}`}
                      emptyText={analyticsLoading ? "Computing…" : "No data yet"}
                    />
                  </Card>
                </div>
              </div>
            )}


            {/* ================= PAYRUN LIST ================= */}
            {tab === "payrun" && !selectedId && (
              <>
                <div className="mt-4">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employees"
                    className="w-full max-w-md rounded-xl border border-purple-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-purple-200 bg-white overflow-hidden shadow-sm">
                  <div className="border-b border-purple-100 bg-purple-50/60 px-4 py-2.5">
                    <div className="grid grid-cols-12 text-xs font-semibold text-purple-800">
                      <div className="col-span-3">Pay Period</div>
                      <div className="col-span-3">Employee</div>
                      <div className="col-span-2 text-right">Employer Cost</div>
                      <div className="col-span-1 text-right">Basic</div>
                      <div className="col-span-1 text-right">Gross</div>
                      <div className="col-span-1 text-right">Net</div>
                      <div className="col-span-1 text-center">Status</div>
                    </div>
                  </div>

                  <ul className="divide-y divide-purple-100">
                    {filtered.map((emp) => {
                      const r = results[emp.user_id] || {};
                      const status = r.status || "-";
                      const badge =
                        status === "Done"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : status === "Error"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-gray-100 text-gray-700 border-gray-200";
                      return (
                        <li
                          key={emp.user_id}
                          className="px-4 py-3 cursor-pointer hover:bg-purple-50/40"
                          onClick={() => openDetail(emp)}
                        >
                          <div className="grid grid-cols-12 items-center">
                            <div className="col-span-3 text-sm text-gray-700">{month}</div>
                            <div className="col-span-3 flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                                {initials(emp.name)}
                              </div>
                              <div className="text-sm font-medium text-gray-900 truncate">{emp.name}</div>
                            </div>
                            <div className="col-span-2 text-right text-sm tabular-nums text-gray-700">
                              ₹ {fmt(r.employerCost)}
                            </div>
                            <div className="col-span-1 text-right text-sm tabular-nums text-gray-700">
                              ₹ {fmt(r.basic)}
                            </div>
                            <div className="col-span-1 text-right text-sm tabular-nums text-gray-700">
                              ₹ {fmt(r.gross)}
                            </div>
                            <div className="col-span-1 text-right text-sm tabular-nums font-semibold text-gray-900">
                              ₹ {fmt(r.net)}
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badge}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    {filtered.length === 0 && (
                      <li className="px-4 py-8 text-center text-sm text-gray-500">No employees found.</li>
                    )}
                  </ul>
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                  <p>Employer cost = employee monthly wage.</p>
                  <p>Basic wage = employee’s basic salary.</p>
                  <p>Gross = basic + allowances. Net = gross − deductions.</p>
                </div>
              </>
            )}

            {/* ================= DETAIL VIEW ================= */}
            {selectedId && (
              <div className="mt-5 space-y-4">
                {/* mini header like sketch */}
                <div className="rounded-xl border border-purple-200 bg-white px-4 py-3 flex items-center gap-3">
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">
                      {selEmp ? selEmp.name : "Employee"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Payrun {month} • Salary Structure: Regular Pay
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setDetailTab("worked")}
                      className={`rounded-lg px-3 py-1.5 text-sm border ${
                        detailTab === "worked"
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                      }`}
                    >
                      Worked Days
                    </button>
                    <button
                      onClick={() => setDetailTab("salary")}
                      className={`rounded-lg px-3 py-1.5 text-sm border ${
                        detailTab === "salary"
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                      }`}
                    >
                      Salary Computation
                    </button>
                  </div>
                </div>

                {/* Panels (one visible at a time) */}
                {detailTab === "worked" && (
                  <Card title="[Employee]" subtitle="Worked Days">
                    {br ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1.5">Type</th>
                            <th className="py-1.5">Days</th>
                            <th className="py-1.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="[&>tr>*]:py-1.5">
                          <tr>
                            <td>Attendance</td>
                            <td>
                              {Number(br.present || 0)}{" "}
                              <span className="text-gray-400">
                                ({br.workingDays || 0} working days in month)
                              </span>
                            </td>
                            <td className="text-right">₹ {fmt((br.gross || 0) - (br.totalDeductions || 0))}</td>
                          </tr>
                          <tr>
                            <td>Paid Time off</td>
                            <td>{Number(br.leave || 0)} (Paid leaves/Month)</td>
                            <td className="text-right">
                              ₹ {fmt(Math.max(0, (br.grossComponents || []).reduce((s, x) => s + (x.amount || 0), 0) - (br.basic || 0)))}
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="font-medium">Total</td>
                            <td className="font-medium">{Number(br.paidDays || 0)}</td>
                            <td className="text-right font-semibold">₹ {fmt(br.gross)}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <Placeholder />
                    )}
                  </Card>
                )}

                {detailTab === "salary" && (
                  <Card title="[Employee]" subtitle="Salary Computation">
                    {br ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1.5">Rule Name</th>
                            <th className="py-1.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="[&>tr>*]:py-1.5">
                          {(br.grossComponents || []).map((c) => (
                            <tr key={`g-${c.name}`}>
                              <td>{c.name}</td>
                              <td className="text-right">₹ {fmt(c.amount)}</td>
                            </tr>
                          ))}
                          <tr className="border-t">
                            <td className="font-semibold">Gross</td>
                            <td className="text-right font-semibold">₹ {fmt(br.gross)}</td>
                          </tr>

                          {(br.deductionComponents || []).map((c) => (
                            <tr key={`d-${c.name}`}>
                              <td>{c.name}</td>
                              <td className="text-right">- ₹ {fmt(c.amount)}</td>
                            </tr>
                          ))}
                          <tr className="border-t">
                            <td className="font-semibold">Net Amount</td>
                            <td className="text-right font-bold text-gray-900">₹ {fmt(br.net)}</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <Placeholder />
                    )}
                  </Card>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Toast */}
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

/* ===== UI bits ===== */
function Card({ title, subtitle, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-purple-200 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="px-4 py-2.5 border-b border-purple-100 bg-purple-50/60">
        <h3 className="text-purple-800 text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-[11px] text-purple-700 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SummaryCard({ title, value, hint }) {
  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-3">
      <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        <div className="mt-1 text-[11px] text-gray-500">{hint}</div>
      </div>
    </div>
  );
}

function MiniBarGroup({ items = [], valueKey, valueFmt, emptyText = "No data" }) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }
  const max = Math.max(...items.map((i) => Number(i[valueKey] || 0)), 1);
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((m) => {
        const v = Number(m[valueKey] || 0);
        const h = Math.max(8, Math.round((v / max) * 84)); // 8–84px bar height
        return (
          <div key={m.key} className="flex flex-col items-center">
            <div className="h-24 w-10 rounded-md bg-purple-100 overflow-hidden flex items-end">
              <div className="w-full bg-purple-600" style={{ height: `${h}px` }} />
            </div>
            <div className="mt-1 text-[11px] text-gray-600">{m.label}</div>
            <div className="text-xs font-medium text-gray-900">{valueFmt(v)}</div>
          </div>
        );
      })}
    </div>
  );
}


function Placeholder() {
  return <p className="text-sm text-gray-500">Select an employee to view details.</p>;
}

function initials(name = "") {
  const n = (name || "").trim().split(/\s+/);
  return ((n[0]?.[0] || "") + (n[1]?.[0] || "")).toUpperCase();
}
function fmt(n) {
  if (n === undefined || n === null || isNaN(Number(n))) return "0.00";
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
