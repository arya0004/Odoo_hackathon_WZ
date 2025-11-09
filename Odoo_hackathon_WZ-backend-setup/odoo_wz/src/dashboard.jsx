// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // ---- Config ---------------------------------------------------------------
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000"; // e.g. "" (proxy) or "http://localhost:3000"
// const API = `${API_BASE}/api`;

// // Small helper so every request sends cookies
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

// // ---- Page ----------------------------------------------------------------
// export default function Dashboard() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);              // { id, name, role, ... }
//   const [employees, setEmployees] = useState([]);  // directory list
//   const [statuses, setStatuses] = useState({});    // { [user_id]: "Present"|"Leave"|"Absent" }
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [modal, setModal] = useState(null);        // user_id to show in modal (view-only)
//   const [dotOpen, setDotOpen] = useState(null);    // user_id whose dot menu is open
//   const [toast, setToast] = useState(null);

//   // Toast helper
//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   //const myStatus = statuses[me?.id];

//   const toggleMyAttendance = async () => {
//     if (!me) return;
//     const current = statuses[me.id] || "Absent";

//     // optimistic flip
//     setStatuses(s => ({ ...s, [me.id]: current === "Present" ? "Absent" : "Present" }));

//     try {
//       if (current === "Present") {
//         await api("/attendance/checkout", { method: "POST" });
//         showToast("Checked out ✅");
//       } else {
//         await api("/attendance/checkin", { method: "POST" });
//         showToast("Checked in ✅");
//       }
//     } catch (e) {
//       // revert on error
//       setStatuses(s => ({ ...s, [me.id]: current }));
//       showToast(e.message, "error");
//     } finally {
//       // authoritative refresh
//       try {
//         const d = await api(`/attendance/status/${me.id}`);
//         setStatuses(s => ({ ...s, [me.id]: d.status || "Absent" }));
//       } catch { }
//     }
//   };



//   // 1) Check auth -> get me
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         setMe({
//           id: r.user.user_id,
//           name: r.user.name,
//           role: r.user.role,
//           email: r.user.email,
//           company: r.user.company_id,
//         });
//       } catch (e) {
//         // Not authenticated → send to login
//         nav("/auth");
//       }
//     })();
//   }, [nav]);

//   // 2) Fetch directory
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

//   // 3) Fetch today's status for each employee
//   useEffect(() => {
//     if (!employees.length) return;
//     let cancelled = false;

//     (async () => {
//       try {
//         const results = await Promise.allSettled(
//           employees.map((emp) =>
//             api(`/attendance/status/${emp.user_id}`).then((d) => [emp.user_id, d.status || "Absent"])
//           )
//         );
//         if (cancelled) return;
//         const map = {};
//         results.forEach((r) => {
//           if (r.status === "fulfilled") {
//             const [id, st] = r.value;
//             map[id] = st;
//           }
//         });
//         setStatuses(map);
//       } catch {
//         // ignore per-item failures
//       }
//     })();

//     return () => (cancelled = true);
//   }, [employees]);

//   // Search filter
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter((e) => {
//       return (
//         e.name.toLowerCase().includes(q) ||
//         e.email.toLowerCase().includes(q) ||
//         (e.role || "").toLowerCase().includes(q)
//       );
//     });
//   }, [employees, search]);

//   // Check-in / Check-out (only for self)
//   const canToggle = (user_id) => me && me.id === user_id;
//   const myStatus = statuses[me?.id];

//   function HeaderToggle({ status, onToggle }) {
//     // Map status to color + label
//     // Green  = Present (checked-in)
//     // Yellow = Absent  (checked-out)
//     // Red    = Unknown / not updated
//     const colorClass =
//       status === "Present" ? "bg-green-500" :
//         status === "Absent" ? "bg-yellow-400" :
//           "bg-red-500";

//     const label =
//       status === "Present" ? "Checked in" :
//         status === "Absent" ? "Checked out" :
//           "Not updated";

//     return (
//       <button
//         type="button"
//         onClick={onToggle}
//         title={`My status: ${label}. Click to toggle`}
//         aria-label="Toggle my attendance"
//         className="ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
//       >
//         <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
//         <span className="hidden sm:inline text-gray-700">{label}</span>
//       </button>
//     );
//   }


//   const handleCheck = async (type) => {
//     try {
//       if (type === "in") {
//         await api("/attendance/checkin", { method: "POST" });
//         showToast("Checked in ✅");
//       } else {
//         await api("/attendance/checkout", { method: "POST" });
//         showToast("Checked out ✅");
//       }
//       // refresh just my status
//       const d = await api(`/attendance/status/${me.id}`);
//       setStatuses((s) => ({ ...s, [me.id]: d.status || "Absent" }));
//       setDotOpen(null);
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   const logout = async () => {
//     try {
//       await api("/auth/logout", { method: "POST" });
//       nav("/auth");
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         {/* Company / Logo placeholder */}
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Employees</p>
//           </div>
//         </div>

//         {/* NEW button + search */}
//         <div className="ml-4 flex-1 flex items-center gap-3">
//           <button
//             type="button"
//             className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
//           >
//             NEW
//           </button>

//           <div className="ml-auto w-full max-w-md">
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search"
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />
//           </div>

//           {/* Status light (global) */}
//           {/* <div className="ml-3 h-4 w-4 rounded-full bg-red-500" title="System status" /> */}
//           <HeaderToggle status={myStatus || "Absent"} onToggle={toggleMyAttendance} />
//           {/* Avatar menu */}
//           <ProfileMenu me={me} onProfile={() => nav(`/profile/${me?.id}`)} onLogout={logout} />
//         </div>
//       </header>

//       {/* Content */}
//       <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
//         {/* Left sidebar (labels only for visual parity) */}
//         <div className="grid grid-cols-12 gap-6">
//           <aside className="col-span-12 md:col-span-2">
//             <nav className="rounded-xl border border-gray-200 overflow-hidden">
//               {["Employees", "Attendance", "Time Off", "Payroll", "Reports", "Settings"].map((x, i) => (
//                 <div
//                   key={x}
//                   className={`px-3 py-2 text-sm ${i === 0 ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"}`}
//                 >
//                   {x}
//                 </div>
//               ))}
//             </nav>
//           </aside>

//           {/* Grid */}
//           <section className="col-span-12 md:col-span-10">
//             {loading ? (
//               <div className="text-sm text-gray-500">Loading directory…</div>
//             ) : (
//               <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                 {filtered.map((emp) => (
//                   <EmployeeCard
//                     key={emp.user_id}
//                     emp={emp}
//                     status={statuses[emp.user_id] || "Unknown"}
//                     onOpen={() => setModal(emp.user_id)}
//                     canToggle={canToggle(emp.user_id)}
//                     dotOpen={dotOpen === emp.user_id}
//                     setDotOpen={() =>
//                       setDotOpen((prev) => (prev === emp.user_id ? null : emp.user_id))
//                     }
//                     onCheckIn={() => handleCheck("in")}
//                     onCheckOut={() => handleCheck("out")}
//                     myStatus={myStatus}
//                     isMe={me?.id === emp.user_id}
//                     onToggleDot={toggleMyAttendance}

//                   />
//                 ))}
//               </div>
//             )}

//             {/* Legend */}
//             <div className="mt-6 text-sm text-gray-600 space-y-1">
//               <p className="font-medium">Status indicators:</p>
//               <div className="flex flex-wrap gap-4">
//                 <LegendDot className="bg-green-500" label="Present" />
//                 <LegendDot icon="✈️" label="On Leave" />
//                 <LegendDot className="bg-yellow-400" label="Absent" />
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* View-only modal */}
//       {modal && (
//         <ViewModal userId={modal} onClose={() => setModal(null)} />
//       )}

//       {/* Toast */}
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

// // ---- Bits & pieces --------------------------------------------------------

// function ProfileMenu({ me, onProfile, onLogout }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
//         title={me?.name || "Profile"}
//       >
//         <span className="text-xs font-semibold text-gray-700">
//           {initials(me?.name)}
//         </span>
//       </button>
//       {open && (
//         <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
//           <button
//             onClick={() => { setOpen(false); onProfile(); }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
//           >
//             My Profile
//           </button>
//           <button
//             onClick={() => { setOpen(false); onLogout(); }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-rose-600"
//           >
//             Log Out
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


// function EmployeeCard({
//   emp, status, onOpen, canToggle, dotOpen, setDotOpen,
//   onCheckIn, onCheckOut, myStatus, isMe, onToggleDot
// }) {
//   // const indicator = (() => {
//   //     if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
//   //     if (status === "Leave") return <span className="inline-block text-base leading-none">✈️</span>;
//   //     return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />; // 🔴 Absent = red
//   // })();

//   const statusKey = (status || "Unknown"); // "Present" | "Absent" | "Leave" | "Unknown"

//   const indicator = (() => {
//     if (statusKey === "Present") {
//       return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;     // 🟢
//     }
//     if (statusKey === "Absent") {
//       return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;    // 🟡
//     }
//     if (statusKey === "Leave") {
//       return <span className="inline-block text-base leading-none">✈️</span>;
//     }
//     return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />;         // 🔴 Unknown / not updated
//   })();


//   return (
//     <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
//       <div className="p-3 flex items-start justify-between">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
//             <span className="text-sm font-semibold text-blue-700">{initials(emp.name)}</span>
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
//             <p className="text-xs text-gray-500">{emp.role}</p>
//           </div>
//         </div>

//         <div className="relative">
//           <button
//             className="p-1"
//             onClick={(e) => {
//               e.stopPropagation();
//               if (canToggle) {
//                 onToggleDot();           // 👈 one-click toggle
//               }
//             }}
//             title={status}
//           >
//             {indicator}
//           </button>

//           {/* Optional: keep the menu — you can delete this block if you don't want it */}
//           {canToggle && dotOpen && (
//             <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
//               <div className="px-3 py-2 text-xs text-gray-500 border-b">Today: {myStatus || "Absent"}</div>
//               <button
//                 onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
//                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
//               >
//                 Check IN →
//               </button>
//               <button
//                 onClick={(e) => { e.stopPropagation(); onCheckOut(); }}
//                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
//               >
//                 Check OUT →
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <button onClick={onOpen} className="block w-full text-left px-3 pb-3">
//         <div className="text-xs text-gray-600">
//           <div className="flex justify-between">
//             <span>{emp.email}</span>
//             <span className="text-gray-400">Joined: {emp.join_date}</span>
//           </div>
//         </div>
//       </button>
//     </div>
//   );
// }


// // function EmployeeCard({
// //     emp, status, onOpen, canToggle, dotOpen, setDotOpen, onCheckIn, onCheckOut, myStatus, isMe
// // }) {
// //     const indicator = (() => {
// //         if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
// //         if (status === "Leave") return <span className="inline-block text-base leading-none">✈️</span>;
// //         return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;
// //     })();

// //     // For my own card, clicking the dot opens a tiny menu to Check In/Out
// //     return (
// //         <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
// //             <div className="p-3 flex items-start justify-between">
// //                 <div className="flex items-center gap-3">
// //                     <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
// //                         <span className="text-sm font-semibold text-blue-700">{initials(emp.name)}</span>
// //                     </div>
// //                     <div>
// //                         <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
// //                         <p className="text-xs text-gray-500">{emp.role}</p>
// //                     </div>
// //                 </div>

// //                 <div className="relative">
// //                     <button
// //                         className="p-1"
// //                         onClick={(e) => {
// //                             e.stopPropagation();
// //                             if (canToggle) setDotOpen();
// //                         }}
// //                         title={status}
// //                     >
// //                         {indicator}
// //                     </button>

// //                     {canToggle && dotOpen && (
// //                         <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
// //                             <div className="px-3 py-2 text-xs text-gray-500 border-b">Today: {myStatus || "Absent"}</div>
// //                             <button
// //                                 onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
// //                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
// //                             >
// //                                 Check IN →
// //                             </button>
// //                             <button
// //                                 onClick={(e) => { e.stopPropagation(); onCheckOut(); }}
// //                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
// //                             >
// //                                 Check OUT →
// //                             </button>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>

// //             <button onClick={onOpen} className="block w-full text-left px-3 pb-3">
// //                 <div className="text-xs text-gray-600">
// //                     <div className="flex justify-between">
// //                         <span>{emp.email}</span>
// //                         <span className="text-gray-400">Joined: {emp.join_date}</span>
// //                     </div>
// //                 </div>
// //             </button>
// //         </div>
// //     );
// // }

// function LegendDot({ className, icon, label }) {
//   return (
//     <div className="flex items-center gap-2">
//       {icon ? (
//         <span className="inline-block">{icon}</span>
//       ) : (
//         <span className={`inline-block h-3 w-3 rounded-full ${className || ""}`} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// }

// function initials(name = "") {
//   const n = name.trim().split(/\s+/);
//   return (n[0]?.[0] || "") + (n[1]?.[0] || "");
// }

// // Simple view-only modal; fetches full profile on open
// function ViewModal({ userId, onClose }) {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const r = await api(`/auth/profile/${userId}`);
//         if (!cancelled) setProfile(r.profile);
//       } catch (e) {
//         // noop
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => (cancelled = true);
//   }, [userId]);

//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Employee Profile</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>
//         <div className="p-5">
//           {loading ? (
//             <p className="text-sm text-gray-500">Loading…</p>
//           ) : profile ? (
//             <div className="space-y-3 text-sm">
//               <Row k="Name" v={profile.name} />
//               <Row k="Email" v={profile.email} />
//               <Row k="Role" v={profile.role} />
//               <Row k="Login ID" v={profile.login_id} />
//               <Row k="Company" v={profile.company?.company_name} />
//               <Row k="Joined" v={profile.join_date} />
//               <div className="pt-2 text-xs text-gray-500">View-only</div>
//             </div>
//           ) : (
//             <p className="text-sm text-rose-600">Failed to load profile.</p>
//           )}
//         </div>
//         <div className="px-5 py-3 border-t">
//           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ k, v }) {
//   return (
//     <div className="flex justify-between gap-4">
//       <span className="text-gray-500">{k}</span>
//       <span className="font-medium text-gray-900">{v || "-"}</span>
//     </div>
//   );
// }

// //second best code 
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, NavLink } from "react-router-dom";

// /* ================================
//    Config + small fetch helper
// ================================ */
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
//    Page
// ================================ */
// export default function Dashboard() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);                 // { id, name, role, email, companyId }
//   const [myCompanyName, setMyCompanyName] = useState(""); // used by Add modal (hidden)
//   const [employees, setEmployees] = useState([]);     // directory (only Employees)
//   const [allUsers, setAllUsers] = useState([]);       // raw (may include Admin/HR/Payroll)
//   const [statuses, setStatuses] = useState({});       // { [user_id]: "Present"|"Absent"|"Leave"|"Unknown" }
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All"); // All | Present | Absent | Leave | Unknown
//   const [modal, setModal] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [addOpen, setAddOpen] = useState(false);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   const canToggle = me?.role === "Employee";
//   const myStatus = canToggle ? (statuses?.[me?.id] ?? "Unknown") : "Unknown";

//   /* 1) Auth → me */
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         const u = r.user;
//         setMe({
//           id: u.user_id,
//           name: u.name,
//           role: u.role,            // "Admin" | "HR" | "Payroll" | "Employee"
//           email: u.email,
//           companyId: u.company_id,
//         });

//         // fetch company name once (for hidden use by Add modal)
//         try {
//           const p = await api(`/auth/profile/${u.user_id}`);
//           setMyCompanyName(p?.profile?.company?.company_name || "");
//         } catch {
//           // ignore
//         }
//       } catch {
//         nav("/auth");
//       }
//     })();
//   }, [nav]);

//   /* 2) Directory (raw) then filter only Employees for the grid */
//   useEffect(() => {
//     if (!me) return;
//     (async () => {
//       try {
//         const r = await api("/employee/directory");
//         const list = r.employees || [];
//         setAllUsers(list);
//         setEmployees(list.filter((e) => (e.role || "").toLowerCase() === "employee")); // show only employees
//       } catch (e) {
//         showToast(e.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [me]);

//   /* 3) Today’s statuses (for everyone we show on grid) */
//   useEffect(() => {
//     if (!employees.length) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const results = await Promise.allSettled(
//           employees.map((emp) =>
//             api(`/attendance/status/${emp.user_id}`).then((d) => [emp.user_id, d.status ?? "Unknown"])
//           )
//         );
//         if (cancelled) return;
//         const map = {};
//         results.forEach((r) => {
//           if (r.status === "fulfilled") {
//             const [id, st] = r.value;
//             map[id] = st;
//           }
//         });
//         setStatuses(map);
//       } catch {
//         // ignore
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [employees]);

//   /* Header-dot toggle (my attendance) — ONLY employees can toggle */
//   const toggleMyAttendance = async () => {
//     if (!me || !canToggle) return;
//     const current = statuses[me.id] ?? "Unknown";
//     const next = current === "Present" ? "Absent" : "Present";

//     // Optimistic
//     setStatuses((s) => ({ ...s, [me.id]: next }));

//     try {
//       if (next === "Present") {
//         await api("/attendance/checkin", { method: "POST" });
//         showToast("Checked in ✅");
//       } else {
//         await api("/attendance/checkout", { method: "POST" });
//         showToast("Checked out ✅");
//       }
//     } catch (e) {
//       // Revert
//       setStatuses((s) => ({ ...s, [me.id]: current }));
//       showToast(e.message, "error");
//     } finally {
//       // Authoritative refresh
//       try {
//         const d = await api(`/attendance/status/${me.id}`);
//         setStatuses((s) => ({ ...s, [me.id]: d.status ?? "Unknown" }));
//       } catch { }
//     }
//   };

//   const logout = async () => {
//     try {
//       await api("/auth/logout", { method: "POST" });
//       nav("/auth");
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   /* Search + Status filter (applied to Employees list only) */
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     let base = employees;
//     if (q) {
//       base = base.filter(
//         (e) =>
//           e.name.toLowerCase().includes(q) ||
//           e.email.toLowerCase().includes(q) ||
//           (e.role || "").toLowerCase().includes(q)
//       );
//     }

//     if (statusFilter === "All") return base;

//     return base.filter((e) => {
//       const st = statuses[e.user_id] ?? "Unknown";
//       if (statusFilter === "Unknown") return st === "Unknown";
//       return st === statusFilter;
//     });
//   }, [employees, search, statusFilter, statuses]);

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         {/* Logo / brand */}
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Employees</p>
//           </div>
//         </div>

//         {/* Right side */}
//         <div className="ml-4 flex-1 flex items-center gap-3">
//           {me?.role === "Admin" && (
//             <button
//               type="button"
//               className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
//               onClick={() => setAddOpen(true)}
//             >
//               NEW
//             </button>
//           )}

//           {/* Search */}
//           <div className="ml-auto w-full max-w-md">
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search employees"
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />
//           </div>

//           {/* Status filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             title="Filter by status"
//           >
//             <option value="All">All</option>
//             <option value="Present">Present</option>
//             <option value="Absent">Absent</option>
//             <option value="Leave">On Leave</option>
//             <option value="Unknown">Not updated</option>
//           </select>

//           {/* Header status — toggle only for Employees, red read-only dot otherwise */}
//           {canToggle ? (
//             <HeaderToggle status={myStatus} onToggle={toggleMyAttendance} />
//           ) : (
//             <ReadonlyHeaderDot />
//           )}

//           <ProfileMenu
//             me={me}
//             onProfile={() => me && nav(`/profile/${me.id}`)}
//             onLogout={logout}
//           />
//         </div>
//       </header>

//       {/* Content */}
//       <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
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
//                     `block px-3 py-2 text-sm ${isActive
//                       ? "bg-blue-100 text-blue-700 font-semibold"
//                       : "hover:bg-gray-50"
//                     }`
//                   }
//                   end={item.to === "/"}
//                 >
//                   {item.label}
//                 </NavLink>
//               ))}
//             </nav>
//           </aside>

//           {/* Directory grid (Employees only) */}
//           <section className="col-span-12 md:col-span-10">
//             {loading ? (
//               <div className="text-sm text-gray-500">Loading directory…</div>
//             ) : (
//               <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filtered.map((emp) => (
//                   <EmployeeCardLarge
//                     key={emp.user_id}
//                     emp={emp}
//                     status={statuses[emp.user_id] ?? "Unknown"}
//                     onOpen={() => setModal(emp.user_id)}
//                     isMe={me?.id === emp.user_id}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Legend */}
//             <div className="mt-8 text-sm text-gray-600 space-y-1">
//               <p className="font-medium">Status indicators:</p>
//               <div className="flex flex-wrap gap-5">
//                 <LegendDot className="bg-green-500" label="Present" />
//                 <LegendDot className="bg-yellow-400" label="Absent" />
//                 <LegendDot icon="✈️" label="On Leave" />
//                 <LegendDot className="bg-red-500" label="Not updated" />
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* View-only modal */}
//       {modal && <ViewModal userId={modal} onClose={() => setModal(null)} />}

//       {/* Add Employee (company name hidden/automatic) */}
//       {addOpen && me && (
//         <AddEmployeeModal
//           companyName={myCompanyName}
//           onClose={() => setAddOpen(false)}
//           onCreated={(newEmp) => {
//             // Optimistically add if role is Employee (otherwise do nothing on grid)
//             if ((newEmp.role || "").toLowerCase() === "employee") {
//               setEmployees((prev) => [...prev, newEmp]);
//             }
//             setAddOpen(false);
//             showToast(`User created (Login ID: ${newEmp.login_id})`);
//           }}
//         />
//       )}

//       {/* Toast */}
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

// /* ================================
//    Header check-in/out toggle (Employee only)
// ================================ */
// function HeaderToggle({ status, onToggle }) {
//   const colorClass =
//     status === "Present"
//       ? "bg-green-500"
//       : status === "Absent"
//         ? "bg-yellow-400"
//         : "bg-red-500"; // Unknown / not updated

//   const label =
//     status === "Present"
//       ? "Checked in"
//       : status === "Absent"
//         ? "Checked out"
//         : "Not updated";

//   return (
//     <button
//       type="button"
//       onClick={onToggle}
//       title={`My status: ${label}. Click to toggle`}
//       aria-label="Toggle my attendance"
//       className="ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
//     >
//       <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
//       <span className="hidden sm:inline text-gray-700">{label}</span>
//     </button>
//   );
// }

// /* ================================
//    Read-only red header dot (Admin/HR/Payroll)
// ================================ */
// function ReadonlyHeaderDot() {
//   return (
//     <div
//       title="Attendance toggle is for Employees only"
//       className="ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs"
//     >
//       <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
//       <span className="hidden sm:inline text-gray-500">Restricted</span>
//     </div>
//   );
// }

// /* ================================
//    Profile menu
// ================================ */
// function ProfileMenu({ me, onProfile, onLogout }) {
//   const [open, setOpen] = useState(false);
//   const ref = React.useRef(null);

//   useEffect(() => {
//     function onDocClick(e) {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target)) setOpen(false);
//     }
//     if (open) document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [open]);

//   return (
//     <div className="relative z-50" ref={ref}>
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
//         title={me?.name || "Profile"}
//       >
//         <span className="text-xs font-semibold text-gray-700">{initials(me?.name)}</span>
//       </button>

//       {open && (
//         <div
//           className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
//           style={{ zIndex: 50 }}
//         >
//           <button
//             onClick={() => {
//               setOpen(false);
//               onProfile();
//             }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
//           >
//             My Profile
//           </button>
//           <button
//             onClick={() => {
//               setOpen(false);
//               onLogout();
//             }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-rose-600"
//           >
//             Log Out
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ================================
//    Big Employee Card
// ================================ */
// function EmployeeCardLarge({ emp, status, onOpen, isMe }) {
//   const indicator = (() => {
//     if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
//     if (status === "Absent") return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;
//     if (status === "Leave") return <span className="inline-block text-base leading-none">✈️</span>;
//     return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />; // Unknown
//   })();

//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
//       {/* Large image header */}
//       <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="h-20 w-20 rounded-full bg-white shadow-inner border border-gray-200 flex items-center justify-center">
//             <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" fill="currentColor" aria-hidden>
//               <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.67-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.33-2.67-6-8-6z" />
//             </svg>
//           </div>
//         </div>

//         {/* status dot in card top-right */}
//         <div className="absolute top-3 right-3" title={status}>
//           {indicator}
//         </div>
//       </div>

//       {/* Body */}
//       <button onClick={onOpen} className="block text-left w-full">
//         <div className="p-4">
//           <p className="text-base font-semibold text-gray-900">
//             {emp.name} {isMe && <span className="ml-1 text-xs text-purple-600">(You)</span>}
//           </p>
//           <p className="text-sm text-gray-500">{emp.role}</p>

//           <div className="mt-3 text-xs text-gray-600">
//             <div className="flex justify-between">
//               <span>{emp.email}</span>
//               <span className="text-gray-400">Joined: {emp.join_date}</span>
//             </div>
//           </div>
//         </div>
//       </button>
//     </div>
//   );
// }

// /* ================================
//    Small bits
// ================================ */
// function LegendDot({ className, icon, label }) {
//   return (
//     <div className="flex items-center gap-2">
//       {icon ? (
//         <span className="inline-block">{icon}</span>
//       ) : (
//         <span className={`inline-block h-3 w-3 rounded-full ${className || ""}`} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// }

// function initials(name = "") {
//   const n = name?.trim().split(/\s+/) || [];
//   return (n[0]?.[0] || "").toUpperCase() + (n[1]?.[0] || "").toUpperCase();
// }

// /* ================================
//    View-only profile modal
// ================================ */
// function ViewModal({ userId, onClose }) {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const r = await api(`/auth/profile/${userId}`);
//         if (!cancelled) setProfile(r.profile);
//       } catch {
//         // ignore
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [userId]);

//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Employee Profile</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>
//         <div className="p-5">
//           {loading ? (
//             <p className="text-sm text-gray-500">Loading…</p>
//           ) : profile ? (
//             <div className="space-y-3 text-sm">
//               <Row k="Name" v={profile.name} />
//               <Row k="Email" v={profile.email} />
//               <Row k="Role" v={profile.role} />
//               <Row k="Login ID" v={profile.login_id} />
//               <Row k="Company" v={profile.company?.company_name} />
//               <Row k="Joined" v={profile.join_date} />
//               <div className="pt-2 text-xs text-gray-500">View-only</div>
//             </div>
//           ) : (
//             <p className="text-sm text-rose-600">Failed to load profile.</p>
//           )}
//         </div>
//         <div className="px-5 py-3 border-t">
//           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ k, v }) {
//   return (
//     <div className="flex justify-between gap-4">
//       <span className="text-gray-500">{k}</span>
//       <span className="font-medium text-gray-900">{v || "-"}</span>
//     </div>
//   );
// }

// /* ================================
//    Add Employee Modal (no company field; uses hidden companyName)
// ================================ */
// function AddEmployeeModal({ companyName, onClose, onCreated }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [role, setRole] = useState("Employee");
//   const [sendEmail, setSendEmail] = useState(true); // cosmetic; backend sends email

//   const [submitting, setSubmitting] = useState(false);
//   const [err, setErr] = useState("");

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setErr("");

//     if (!name || !email || !role) {
//       setErr("Please fill all required fields.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // Your admin controller expects company_name — we pass the current company automatically
//       const r = await api("/admin/create-user", {
//         method: "POST",
//         body: JSON.stringify({ company_name: companyName, name, email, phone, role }),
//       });

//       const newEmp = {
//         user_id: r.user.id,
//         name,
//         email,
//         role,
//         join_date: new Date().toISOString().slice(0, 10),
//         company: { company_name: companyName },
//         login_id: r.user.login_id,
//       };

//       onCreated?.(newEmp);
//     } catch (e2) {
//       setErr(e2.message || "Failed to create user");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Add Employee</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleCreate} className="p-5 space-y-4">
//           {err && (
//             <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
//               {err}
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Field
//               label="Name*"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Jane Doe"
//               autoFocus
//             />
//             <Field
//               label="Email*"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="jane@company.com"
//             />
//             <Field
//               label="Phone"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="+91 9xxxx xxxxx"
//             />

//             <div className="sm:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//               >
//                 <option value="Employee">Employee</option>
//                 <option value="HR">HR</option>
//                 <option value="Admin">Admin</option>
//                 <option value="Payroll">Payroll</option>
//               </select>
//             </div>

//             <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                 checked={sendEmail}
//                 onChange={(e) => setSendEmail(e.target.checked)}
//               />
//               Send credentials email to this user
//               <span className="text-gray-400">(backend sends)</span>
//             </label>
//           </div>

//           <div className="pt-2 flex items-center justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
//             >
//               {submitting ? "Creating…" : "Create & Send Email"}
//             </button>
//           </div>

//           <p className="text-[11px] text-gray-500 mt-2">
//             The user will receive their <b>Login ID</b> and a temporary password via email.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// function Field({ label, ...props }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <input
//         {...props}
//         className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//       />
//     </div>
//   );
// }

// src/dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

/* ================================
   Config + small fetch helper
================================ */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const API = `${API_BASE}/api`;

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ================================
   Page
================================ */
export default function Dashboard() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);              // { id, name, role, email, company }
  const [brand, setBrand] = useState({             // company display in header
    name: "WorkZen",
    logo: null,                                    // "/uploads/...png"
  });
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [quick, setQuick] = useState("all");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const myStatus = me ? (statuses[me.id] ?? "Unknown") : "Unknown";
  const todayStr = new Date().toISOString().slice(0, 10);

  /* 1) Auth → me + brand (company name & logo) */
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        const nextMe = {
          id: r.user.user_id,
          name: r.user.name,
          role: r.user.role,
          email: r.user.email,
          company: r.user.company_id,
        };
        setMe(nextMe);

        // Pull company name + logo for header brand
        try {
          const prof = await api(`/auth/profile/${nextMe.id}`); // returns { profile: { company: { company_name, company_logo } } }
          const comp = prof?.profile?.company || {};
          console.log("PROFILE RESPONSE:", prof);
          if (comp.company_name || comp.company_logo) {
            setBrand({
              name: comp.company_name || "Company",
              logo: comp.company_logo || null,
            });
          }
        } catch (e) {
          // non-fatal; keep default brand
          console.warn("brand fetch failed:", e?.message || e);
        }
      } catch (e) {
        if (e?.status === 401) nav("/auth");
        else console.warn("isAuth error (not 401):", e);
      }
    })();
  }, [nav]);

  /* --- company helpers --- */
  function readCompanyId(obj) {
    if (!obj) return null;
    // try several shapes
    if (obj.company_id != null) return Number(obj.company_id);
    if (obj.companyId != null) return Number(obj.companyId);
    if (obj.company && obj.company.company_id != null) return Number(obj.company.company_id);
    if (obj.company && obj.company.id != null) return Number(obj.company.id);
    return null;
  }

  function sameCompany(a, b) {
    const ca = readCompanyId(a);
    const cb = readCompanyId(b);
    return ca != null && cb != null && ca === cb;
  }


  /* 2) Directory (Employee-only cards) */
  // useEffect(() => {
  //   if (!me) return;
  //   let cancelled = false;

  //   (async () => {
  //     setLoading(true);
  //     try {
  //       let list = [];
  //       if (["Admin", "HR", "Payroll"].includes(me.role)) {
  //         const r = await api("/employee/directory");
  //         list = r.employees || [];
  //       } else {
  //         const d = await api(`/attendance/admin/date?date=${todayStr}`);
  //         const arr = (d.attendanceList || []);
  //         list = arr.map(u => ({
  //           user_id: u.user_id,
  //           name: u.name,
  //           email: "",
  //           role: u.role,
  //           join_date: "",
  //         }));
  //       }
  //       list = list.filter(e => (e.role || "").toLowerCase() === "employee");
  //       if (!cancelled) setEmployees(list);
  //     } catch (e) {
  //       if (!cancelled) showToast(e.message, "error");
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   })();

  //   return () => { cancelled = true; };
  // }, [me]);

  /* 2) Directory (Employee-only cards, scoped to my company) */
  /* 2) Directory (Employee-only cards, scoped to my company, robust) */
  /* 2) Directory (Employee-only cards, scoped to MY company for all roles) */
  useEffect(() => {
    if (!me) return;
    let cancelled = false;

    // tiny helpers (keep near top of file if you don't already have them)
    const readCompanyId = (obj) => {
      if (!obj) return null;
      if (obj.company_id != null) return Number(obj.company_id);
      if (obj.companyId != null) return Number(obj.companyId);
      if (obj.company?.company_id != null) return Number(obj.company.company_id);
      if (obj.company?.id != null) return Number(obj.company.id);
      return null;
    };

    (async () => {
      setLoading(true);
      try {
        // 1) Prefer server-side scoping for *everyone* (including Employee)
        // Your backend should permit this for Employee and return only same-company users.
        let r;
        try {
          r = await api(`/employee/directory?companyId=${me.company}`);
        } catch {
          // fallback to unscoped, then we’ll filter client-side
          r = await api(`/employee/directory`);
        }

        let list = r.employees || [];

        // 2) HARD client filter to same company (protects against server not filtering)
        const myCo = Number(me.company);
        list = list.filter(emp => {
          const cid = readCompanyId(emp);
          // If a row has no company id, we drop it for Employees to avoid leaking cross-company users.
          // (Admins will still pass because they call the same code and usually have cid in payload.)
          return cid != null && cid === myCo;
        });

        // 3) Only show Employee role
        list = list.filter(e => (e.role || "").toLowerCase() === "employee");

        if (!cancelled) setEmployees(list);
      } catch (e) {
        if (!cancelled) showToast(e.message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [me]);



  /* 3) Today’s statuses */
  useEffect(() => {
    if (!employees.length) return;
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled(
          employees.map((emp) =>
            api(`/attendance/status/${emp.user_id}`).then((d) => [emp.user_id, d.status ?? "Unknown"])
          )
        );
        if (cancelled) return;
        const map = {};
        results.forEach((r) => {
          if (r.status === "fulfilled") {
            const [id, st] = r.value;
            map[id] = st;
          }
        });
        setStatuses(map);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [employees]);

  // /* Header-dot toggle (Employees only) */
  // const toggleMyAttendance = async () => {
  //   if (!me || me.role !== "Employee") return;
  //   const current = statuses[me.id] ?? "Unknown";
  //   const next = current === "Present" ? "Absent" : "Present";
  //   setStatuses((s) => ({ ...s, [me.id]: next }));
  //   try {
  //     if (next === "Present") {
  //       await api("/attendance/checkin", { method: "POST" });
  //       showToast("Checked in ✅");
  //     } else {
  //       await api("/attendance/checkout", { method: "POST" });
  //       showToast("Checked out ✅");
  //     }
  //   } catch (e) {
  //     setStatuses((s) => ({ ...s, [me.id]: current }));
  //     showToast(e.message, "error");
  //   } finally {
  //     try {
  //       const d = await api(`/attendance/status/${me.id}`);
  //       setStatuses((s) => ({ ...s, [me.id]: d.status ?? "Unknown" }));
  //     } catch { }
  //   }
  // };

  const toggleMyAttendance = async () => {
    if (!me || me.role !== "Employee") return;

    // 1) Always fetch the fresh status from the server first
    let current = "Absent";
    try {
      const d = await api(`/attendance/status/${me.id}`);
      current = d.status || "Absent";
    } catch {
      current = statuses[me.id] ?? "Absent";
    }

    // 2) Decide the intended action
    const want = current === "Present" ? "Absent" : "Present";
    setStatuses((s) => ({ ...s, [me.id]: want }));

    try {
      if (want === "Present") {
        await api("/attendance/checkin", { method: "POST" });
        showToast("Checked in ✅");
      } else {
        await api("/attendance/checkout", { method: "POST" });
        showToast("Checked out ✅");
      }
    } catch (e) {
      // If we tried to check in but server says already checked in → gracefully switch to checkout
      if (want === "Present" && (e.status === 400 || /already checked in/i.test(e.message))) {
        try {
          await api("/attendance/checkout", { method: "POST" });
          showToast("Checked out ✅");
        } catch (e2) {
          setStatuses((s) => ({ ...s, [me.id]: current }));
          showToast(e2.message, "error");
        }
      } else {
        setStatuses((s) => ({ ...s, [me.id]: current }));
        showToast(e.message, "error");
      }
    } finally {
      // 3) Re-sync from server so header dot + cards are accurate
      try {
        const d2 = await api(`/attendance/status/${me.id}`);
        setStatuses((s) => ({ ...s, [me.id]: d2.status ?? "Unknown" }));
      } catch { }
    }
  };


  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
      nav("/auth");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  /* Filter */
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.role || "").toLowerCase().includes(q)
    );
  }, [employees, search]);

  const filtered = useMemo(() => {
    if (quick === "all") return searched;
    return searched.filter((e) => {
      const st = (statuses[e.user_id] || "Unknown");
      if (quick === "in") return st === "Present";
      if (quick === "out") return st === "Absent";
      if (quick === "leave") return st === "Leave";
      return true;
    });
  }, [searched, quick, statuses]);

  const headerStatusForMe =
    me && ["Admin", "HR", "Payroll"].includes(me.role)
      ? "Admin"
      : myStatus;

  const brandLogoUrl = brand.logo ? `${API_BASE}${brand.logo}` : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-20 border-b border-gray-200 flex items-center px-4 md:px-6">
        {/* Big company brand */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {brandLogoUrl ? (
              <img
                src={brandLogoUrl}
                alt={brand.name}
                className="h-12 w-12 md:h-14 md:w-14 rounded-2xl object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-lg md:text-xl">
                {initials(brand.name)}
              </div>
            )}
          </div>
          <div className="leading-tight">
            <p className="text-base md:text-xl font-extrabold text-gray-900">
              {brand.name || "Company"}
            </p>
            <p className="text-[11px] md:text-xs text-gray-500">
              {me?.role ? `${me.role} dashboard` : "Employees"}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-4 flex-1 flex items-center gap-3">
          {me?.role === "Admin" && (
            <button
              type="button"
              className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
              onClick={() => setAddOpen(true)}
            >
              NEW
            </button>
          )}

          <div className="ml-auto w-full max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <HeaderToggle status={headerStatusForMe} onToggle={toggleMyAttendance} meRole={me?.role} />

          <ProfileMenu
            me={me}
            onProfile={() => me && nav(`/profile/${me.id}`)}
            onLogout={logout}
          />
        </div>
      </header>

      {/* Content */}
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
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All" },
                { id: "in", label: "Checked-in" },
                { id: "out", label: "Checked-out" },
                { id: "leave", label: "On Leave" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setQuick(f.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${quick === f.id
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">Loading directory…</div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((emp) => (
                  <EmployeeCardLarge
                    key={emp.user_id}
                    emp={emp}
                    status={statuses[emp.user_id] ?? "Unknown"}
                    onOpen={() => setModal(emp.user_id)}
                    isMe={me?.id === emp.user_id}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="text-sm text-gray-500">No employees match the filter.</div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* View-only modal */}
      {modal && (
        <ViewModal
          userId={modal}
          me={me}
          onEdit={() => {
            setModal(null);
            nav(`/profile/${modal}`);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {/* Add employee (Admin only) */}
      {addOpen && me?.role === "Admin" && (
        <AddEmployeeModal
          onClose={() => setAddOpen(false)}
          onCreated={(newEmp) => {
            setEmployees((prev) => [...prev, newEmp]);
            setAddOpen(false);
            showToast(`User created (Login ID: ${newEmp.login_id})`);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${toast.type === "error"
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

/* ================================
   Header check-in/out toggle
================================ */
function HeaderToggle({ status, onToggle, meRole }) {
  const isStaff = ["Admin", "HR", "Payroll"].includes(meRole);
  const colorClass =
    status === "Present" ? "bg-green-500" :
      status === "Absent" ? "bg-yellow-400" :
        status === "Admin" ? "bg-red-500" :
          "bg-red-500";

  const label =
    status === "Present" ? "Checked in" :
      status === "Absent" ? "Checked out" :
        status === "Leave" ? "On leave" :
          status === "Admin" ? "Staff (no toggle)" :
            "Not updated";

  return (
    <button
      type="button"
      onClick={isStaff ? undefined : onToggle}
      title={`My status: ${label}${isStaff ? "" : ". Click to toggle"}`}
      aria-label="Toggle my attendance"
      className={`ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs ${isStaff ? "cursor-not-allowed opacity-70" : "hover:bg-gray-50"
        }`}
    >
      <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
      <span className="hidden sm:inline text-gray-700">{label}</span>
    </button>
  );
}

/* ================================
   Profile menu
================================ */
function ProfileMenu({ me, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="ml-3 inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
        title={me?.name || "Profile"}
      >
        <span className="text-sm font-semibold text-gray-700">{initials(me?.name)}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <button
            onClick={() => { setOpen(false); onProfile(); }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            My Profile
          </button>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-rose-600"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================
   Big Employee Card
================================ */
function EmployeeCardLarge({ emp, status, onOpen, isMe }) {
  const indicator = (() => {
    if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
    if (status === "Absent") return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;
    if (status === "Leave") return <span className="inline-block text-base leading-none">✈️</span>;
    return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />; // Unknown
  })();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white shadow-inner border border-gray-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" fill="currentColor" aria-hidden>
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.67-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.33-2.67-6-8-6z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-3 right-3" title={status}>
          {indicator}
        </div>
      </div>

      <button onClick={onOpen} className="block text-left w-full">
        <div className="p-4">
          <p className="text-base font-semibold text-gray-900">
            {emp.name} {isMe && <span className="ml-1 text-xs text-purple-600">(You)</span>}
          </p>
          <p className="text-sm text-gray-500">{emp.role}</p>
          <div className="mt-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>{emp.email || "-"}</span>
              <span className="text-gray-400">Joined: {emp.join_date || "-"}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ================================
   View-only profile modal
================================ */
function ViewModal({ userId, onClose, onEdit, me }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await api(`/auth/profile/${userId}`);
        if (!cancelled) setProfile(r.profile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const canEdit = me?.role === "Admin";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <p className="font-semibold text-gray-900">Employee Profile</p>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={onEdit}
                title="Edit full profile"
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border hover:bg-gray-50"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-700" fill="currentColor">
                  <path d="M14.7 2.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-9.6 9.6-3.3.7.7-3.3 9.6-9.6zM2 16h16v2H2z" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : profile ? (
            <div className="space-y-3 text-sm">
              <Row k="Name" v={profile.name} />
              <Row k="Email" v={profile.email} />
              <Row k="Role" v={profile.role} />
              <Row k="Login ID" v={profile.login_id} />
              <Row k="Company" v={profile.company?.company_name} />
              <Row k="Joined" v={profile.join_date} />
              {!canEdit && <div className="pt-2 text-xs text-gray-500">View-only</div>}
            </div>
          ) : (
            <p className="text-sm text-rose-600">Failed to load profile.</p>
          )}
        </div>

        <div className="px-5 py-3 border-t">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{k}</span>
      <span className="font-medium text-gray-900">{v || "-"}</span>
    </div>
  );
}

/* ================================
   Add Employee Modal
================================ */
function AddEmployeeModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Employee");
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");
    if (!name || !email || !role) {
      setErr("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await api("/admin/create-user", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, role }),
      });
      const newEmp = {
        user_id: r.user.id,
        name,
        email,
        role,
        join_date: new Date().toISOString().slice(0, 10),
        company: {},
        login_id: r.user.login_id,
      };
      onCreated?.(newEmp);
    } catch (e2) {
      setErr(e2.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <p className="font-semibold text-gray-900">Add Employee</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          {err && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name*" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoFocus />
            <Field label="Email*" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
            <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxx xxxxx" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
                <option value="Payroll">Payroll</option>
              </select>
            </div>

            <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              Send credentials email to this user <span className="text-gray-400">(backend sends)</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
              {submitting ? "Creating…" : "Create & Send Email"}
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mt-2">
            The user will receive their <b>Login ID</b> and a temporary password via email.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...props} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
    </div>
  );
}

/* ================================
   Utils
================================ */
function initials(name = "") {
  const n = name?.trim().split(/\s+/) || [];
  return (n[0]?.[0] || "").toUpperCase() + (n[1]?.[0] || "").toUpperCase();
}

//LAST FINAL
// // src/dashboard.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, NavLink } from "react-router-dom";

// /* ================================
//    Config + small fetch helper
// ================================ */
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api`;

// async function api(path, init = {}) {
//   const res = await fetch(`${API}${path}`, {
//     credentials: "include",
//     headers: { "Content-Type": "application/json", ...(init.headers || {}) },
//     ...init,
//   });
//   const data = await res.json().catch(() => ({}));
//   // if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);

//   if (!res.ok) {
//     const err = new Error(data?.message || `Request failed: ${res.status}`);
//     err.status = res.status; // preserve HTTP status (e.g., 401)
//     throw err;
//   }

//   return data;
// }

// /* ================================
//    Page
// ================================ */
// export default function Dashboard() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);              // { id, name, role, email, company }
//   const [employees, setEmployees] = useState([]);  // directory (Employee roles only)
//   const [statuses, setStatuses] = useState({});    // { [user_id]: "Present"|"Absent"|"Leave"|"Unknown" }
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [modal, setModal] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [addOpen, setAddOpen] = useState(false);

//   // quick filters: all | in | out | leave
//   const [quick, setQuick]   = useState("all");

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   const myStatus = me ? (statuses[me.id] ?? "Unknown") : "Unknown";
//   const todayStr = new Date().toISOString().slice(0, 10);

//   /* 1) Auth → me */
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         setMe({
//           id: r.user.user_id,
//           name: r.user.name,
//           role: r.user.role,          // "Admin" | "HR" | "Payroll" | "Employee"
//           email: r.user.email,
//           company: r.user.company_id,
//         });
//       }
//       // catch {
//       //   nav("/auth");

//       catch (e) {
//         if (e?.status === 401) {
//           nav("/auth");              // truly unauthorized → go to login
//         } else {
//           // network/server hiccup → stay put, don't logout
//           console.warn("isAuth error (not 401):", e);
//         }

//       }
//     })();
//   }, [nav]);

//   /* 2) Directory (Employee-only cards)
//         - Admin/HR/Payroll: use /employee/directory
//         - Employee: fallback to /attendance/admin/date (read-only list) */
//   useEffect(() => {
//     if (!me) return;
//     let cancelled = false;

//     (async () => {
//       setLoading(true);
//       try {
//         let list = [];
//         if (["Admin", "HR", "Payroll"].includes(me.role)) {
//           const r = await api("/employee/directory");
//           list = r.employees || [];
//         } else {
//           // non-admin – get a lightweight list from attendance endpoint
//           const d = await api(`/attendance/admin/date?date=${todayStr}`);
//           const arr = (d.attendanceList || []);
//           list = arr.map(u => ({
//             user_id: u.user_id,
//             name: u.name,
//             email: "",           // not provided by this endpoint
//             role: u.role,
//             join_date: "",       // optional
//           }));
//         }
//         // Always show ONLY employees (hide Admin/HR/Payroll in the grid)
//         list = list.filter(e => (e.role || "").toLowerCase() === "employee");
//         if (!cancelled) setEmployees(list);
//       } catch (e) {
//         if (!cancelled) showToast(e.message, "error");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();

//     return () => { cancelled = true; };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [me]);

//   /* 3) Today’s statuses — fetch for all cards we show */
//   useEffect(() => {
//     if (!employees.length) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const results = await Promise.allSettled(
//           employees.map((emp) =>
//             api(`/attendance/status/${emp.user_id}`).then((d) => [emp.user_id, d.status ?? "Unknown"])
//           )
//         );
//         if (cancelled) return;
//         const map = {};
//         results.forEach((r) => {
//           if (r.status === "fulfilled") {
//             const [id, st] = r.value;
//             map[id] = st;
//           }
//         });
//         setStatuses(map);
//       } catch {
//         // ignore
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [employees]);

//   /* Header-dot toggle (Employees only) */
//   const toggleMyAttendance = async () => {
//     if (!me || me.role !== "Employee") return;
//     const current = statuses[me.id] ?? "Unknown";
//     // toggle between Present/Absent only
//     const next = current === "Present" ? "Absent" : "Present";

//     // Optimistic flip
//     setStatuses((s) => ({ ...s, [me.id]: next }));

//     try {
//       if (next === "Present") {
//         await api("/attendance/checkin", { method: "POST" });
//         showToast("Checked in ✅");
//       } else {
//         await api("/attendance/checkout", { method: "POST" });
//         showToast("Checked out ✅");
//       }
//     } catch (e) {
//       // Revert on error
//       setStatuses((s) => ({ ...s, [me.id]: current }));
//       showToast(e.message, "error");
//     } finally {
//       // Authoritative refresh
//       try {
//         const d = await api(`/attendance/status/${me.id}`);
//         setStatuses((s) => ({ ...s, [me.id]: d.status ?? "Unknown" }));
//       } catch { }
//     }
//   };

//   const logout = async () => {
//     try {
//       await api("/auth/logout", { method: "POST" });
//       nav("/auth");
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   /* Filter */
//   const searched = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter((e) =>
//       e.name.toLowerCase().includes(q) ||
//       (e.email || "").toLowerCase().includes(q) ||
//       (e.role || "").toLowerCase().includes(q)
//     );
//   }, [employees, search]);

//   const filtered = useMemo(() => {
//     if (quick === "all") return searched;
//     return searched.filter((e) => {
//       const st = (statuses[e.user_id] || "Unknown");
//       if (quick === "in") return st === "Present";
//       if (quick === "out") return st === "Absent";
//       if (quick === "leave") return st === "Leave";
//       return true;
//     });
//   }, [searched, quick, statuses]);

//   // header status dot rules
//   const headerStatusForMe =
//     me && ["Admin", "HR", "Payroll"].includes(me.role)
//       ? "Admin"
//       : myStatus;

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         {/* Logo / brand */}
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Employees</p>
//           </div>
//         </div>

//         {/* Right side: NEW + search + header toggle + profile */}
//         <div className="ml-4 flex-1 flex items-center gap-3">
//           {me?.role === "Admin" && (
//             <button
//               type="button"
//               className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
//               onClick={() => setAddOpen(true)}
//             >
//               NEW
//             </button>
//           )}

//           <div className="ml-auto w-full max-w-md">
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search employees"
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />
//           </div>

//           <HeaderToggle status={headerStatusForMe} onToggle={toggleMyAttendance} meRole={me?.role} />

//           <ProfileMenu
//             me={me}
//             onProfile={() => me && nav(`/profile/${me.id}`)}
//             onLogout={logout}
//           />
//         </div>
//       </header>

//       {/* Content */}
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
//                     `block px-3 py-2 text-sm ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
//                     }`
//                   }
//                   end={item.to === "/"}
//                 >
//                   {item.label}
//                 </NavLink>
//               ))}
//             </nav>
//           </aside>

//           {/* Main */}
//           <section className="col-span-12 md:col-span-10">
//             {/* Quick filter bar */}
//             <div className="mb-4 flex flex-wrap items-center gap-2">
//               {[
//                 { id: "all", label: "All" },
//                 { id: "in", label: "Checked-in" },
//                 { id: "out", label: "Checked-out" },
//                 { id: "leave", label: "On Leave" },
//               ].map((f) => (
//                 <button
//                   key={f.id}
//                   onClick={() => setQuick(f.id)}
//                   className={`rounded-full border px-3 py-1.5 text-sm ${quick === f.id
//                     ? "bg-purple-600 border-purple-600 text-white"
//                     : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
//                     }`}
//                 >
//                   {f.label}
//                 </button>
//               ))}
//             </div>

//             {/* Directory grid */}
//             {loading ? (
//               <div className="text-sm text-gray-500">Loading directory…</div>
//             ) : (
//               <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filtered.map((emp) => (
//                   <EmployeeCardLarge
//                     key={emp.user_id}
//                     emp={emp}
//                     status={statuses[emp.user_id] ?? "Unknown"}
//                     onOpen={() => setModal(emp.user_id)}
//                     isMe={me?.id === emp.user_id}
//                   />
//                 ))}
//                 {filtered.length === 0 && (
//                   <div className="text-sm text-gray-500">No employees match the filter.</div>
//                 )}
//               </div>
//             )}

//             {/* Legend */}
//             {/* <div className="mt-8 text-sm text-gray-600 space-y-1">
//               <p className="font-medium">Status indicators:</p>
//               <div className="flex flex-wrap gap-5">
//                 <LegendDot className="bg-green-500" label="Present" />
//                 <LegendDot className="bg-yellow-400" label="Absent" />
//                 <LegendDot icon="✈️" label="On Leave" />
//                 <LegendDot className="bg-red-500" label="Not updated" />
//               </div>
//             </div> */}
//           </section>
//         </div>
//       </div>

//       {/* View-only modal */}
//       {/* {modal && <ViewModal userId={modal} onClose={() => setModal(null)} />} */}
//       {modal && (
//         <ViewModal
//           userId={modal}
//           me={me}                                 // ⬅️ pass current user
//           onEdit={() => {                         // ⬅️ navigate to employee's profile
//             setModal(null);
//             nav(`/profile/${modal}`);
//           }}
//           onClose={() => setModal(null)}
//         />
//       )}

//       {/* Add employee (Admin only) */}
//       {addOpen && me?.role === "Admin" && (
//         <AddEmployeeModal
//           onClose={() => setAddOpen(false)}
//           onCreated={(newEmp) => {
//             setEmployees((prev) => [...prev, newEmp]);
//             setAddOpen(false);
//             showToast(`User created (Login ID: ${newEmp.login_id})`);
//           }}
//         />
//       )}

//       {/* Toast */}
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

// /* ================================
//    Header check-in/out toggle
//    - Admin/HR/Payroll always RED (no toggle)
// ================================ */
// function HeaderToggle({ status, onToggle, meRole }) {
//   const isStaff = ["Admin", "HR", "Payroll"].includes(meRole);
//   const colorClass =
//     status === "Present" ? "bg-green-500" :
//       status === "Absent" ? "bg-yellow-400" :
//         status === "Admin" ? "bg-red-500" :
//           "bg-red-500"; // Unknown / not updated

//   const label =
//     status === "Present" ? "Checked in" :
//       status === "Absent" ? "Checked out" :
//         status === "Admin" ? "Staff (no toggle)" :
//           "Not updated";

//   return (
//     <button
//       type="button"
//       onClick={isStaff ? undefined : onToggle}
//       title={`My status: ${label}${isStaff ? "" : ". Click to toggle"}`}
//       aria-label="Toggle my attendance"
//       className={`ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs ${isStaff ? "cursor-not-allowed opacity-70" : "hover:bg-gray-50"
//         }`}
//     >
//       <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
//       <span className="hidden sm:inline text-gray-700">{label}</span>
//     </button>
//   );
// }

// /* ================================
//    Profile menu
// ================================ */
// function ProfileMenu({ me, onProfile, onLogout }) {
//   const [open, setOpen] = useState(false);
//   const ref = React.useRef(null);

//   useEffect(() => {
//     function onDocClick(e) {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target)) setOpen(false);
//     }
//     if (open) document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [open]);

//   return (
//     <div className="relative z-50" ref={ref}>
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
//         title={me?.name || "Profile"}
//       >
//         <span className="text-xs font-semibold text-gray-700">{initials(me?.name)}</span>
//       </button>

//       {open && (
//         <div
//           className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
//           style={{ zIndex: 50 }}
//         >
//           <button
//             onClick={() => { setOpen(false); onProfile(); }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
//           >
//             My Profile
//           </button>
//           <button
//             onClick={() => { setOpen(false); onLogout(); }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-rose-600"
//           >
//             Log Out
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ================================
//    Big Employee Card
// ================================ */
// function EmployeeCardLarge({ emp, status, onOpen, isMe }) {
//   const indicator = (() => {
//     if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
//     if (status === "Absent") return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;
//     if (status === "Leave") return <span className="inline-block text-base leading-none">✈️</span>;
//     return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />; // Unknown
//   })();

//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
//       {/* Large image header */}
//       <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="h-20 w-20 rounded-full bg-white shadow-inner border border-gray-200 flex items-center justify-center">
//             <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" fill="currentColor" aria-hidden>
//               <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.67-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.33-2.67-6-8-6z" />
//             </svg>
//           </div>
//         </div>

//         {/* status dot in card top-right */}
//         <div className="absolute top-3 right-3" title={status}>
//           {indicator}
//         </div>
//       </div>

//       {/* Body */}
//       <button onClick={onOpen} className="block text-left w-full">
//         <div className="p-4">
//           <p className="text-base font-semibold text-gray-900">
//             {emp.name} {isMe && <span className="ml-1 text-xs text-purple-600">(You)</span>}
//           </p>
//           <p className="text-sm text-gray-500">{emp.role}</p>

//           <div className="mt-3 text-xs text-gray-600">
//             <div className="flex justify-between">
//               <span>{emp.email || "-"}</span>
//               <span className="text-gray-400">Joined: {emp.join_date || "-"}</span>
//             </div>
//           </div>
//         </div>
//       </button>
//     </div>
//   );
// }

// /* ================================
//    Small bits
// ================================ */
// function LegendDot({ className, icon, label }) {
//   return (
//     <div className="flex items-center gap-2">
//       {icon ? (
//         <span className="inline-block">{icon}</span>
//       ) : (
//         <span className={`inline-block h-3 w-3 rounded-full ${className || ""}`} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// }

// function initials(name = "") {
//   const n = name?.trim().split(/\s+/) || [];
//   return (n[0]?.[0] || "").toUpperCase() + (n[1]?.[0] || "").toUpperCase();
// }

// /* ================================
//    View-only profile modal
// ================================ */
// // function ViewModal({ userId, onClose }) {
// //   const [loading, setLoading] = useState(true);
// //   const [profile, setProfile] = useState(null);

// //   useEffect(() => {
// //     let cancelled = false;
// //     (async () => {
// //       try {
// //         const r = await api(`/auth/profile/${userId}`);
// //         if (!cancelled) setProfile(r.profile);
// //       } catch {
// //         // ignore
// //       } finally {
// //         if (!cancelled) setLoading(false);
// //       }
// //     })();
// //     return () => { cancelled = true; };
// //   }, [userId]);

// //   return (
// //     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
// //       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
// //         <div className="px-5 py-3 border-b flex items-center justify-between">
// //           <p className="font-semibold text-gray-900">Employee Profile</p>
// //           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
// //         </div>
// //         <div className="p-5">
// //           {loading ? (
// //             <p className="text-sm text-gray-500">Loading…</p>
// //           ) : profile ? (
// //             <div className="space-y-3 text-sm">
// //               <Row k="Name" v={profile.name} />
// //               <Row k="Email" v={profile.email} />
// //               <Row k="Role" v={profile.role} />
// //               <Row k="Login ID" v={profile.login_id} />
// //               <Row k="Company" v={profile.company?.company_name} />
// //               <Row k="Joined" v={profile.join_date} />
// //               <div className="pt-2 text-xs text-gray-500">View-only</div>
// //             </div>
// //           ) : (
// //             <p className="text-sm text-rose-600">Failed to load profile.</p>
// //           )}
// //         </div>
// //         <div className="px-5 py-3 border-t">
// //           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
// //             Close
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// function ViewModal({ userId, onClose, onEdit, me }) {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const r = await api(`/auth/profile/${userId}`);
//         if (!cancelled) setProfile(r.profile);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [userId]);

//   const canEdit = me?.role === "Admin"; // change to include HR if you want: ["Admin","HR"].includes(me?.role)

//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Employee Profile</p>
//           <div className="flex items-center gap-2">
//             {canEdit && (
//               <button
//                 onClick={onEdit}
//                 title="Edit full profile"
//                 className="inline-flex items-center justify-center h-8 w-8 rounded-full border hover:bg-gray-50"
//               >
//                 {/* pencil icon */}
//                 <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-700" fill="currentColor">
//                   <path d="M14.7 2.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-9.6 9.6-3.3.7.7-3.3 9.6-9.6zM2 16h16v2H2z" />
//                 </svg>
//               </button>
//             )}
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//           </div>
//         </div>

//         {/* body stays the same */}
//         <div className="p-5">
//           {loading ? (
//             <p className="text-sm text-gray-500">Loading…</p>
//           ) : profile ? (
//             <div className="space-y-3 text-sm">
//               <Row k="Name" v={profile.name} />
//               <Row k="Email" v={profile.email} />
//               <Row k="Role" v={profile.role} />
//               <Row k="Login ID" v={profile.login_id} />
//               <Row k="Company" v={profile.company?.company_name} />
//               <Row k="Joined" v={profile.join_date} />
//               {!canEdit && <div className="pt-2 text-xs text-gray-500">View-only</div>}
//             </div>
//           ) : (
//             <p className="text-sm text-rose-600">Failed to load profile.</p>
//           )}
//         </div>

//         <div className="px-5 py-3 border-t">
//           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ k, v }) {
//   return (
//     <div className="flex justify-between gap-4">
//       <span className="text-gray-500">{k}</span>
//       <span className="font-medium text-gray-900">{v || "-"}</span>
//     </div>
//   );
// }

// /* ================================
//    Add Employee Modal
//    - Company name removed
//    - Role sits next to Phone (same row)
// ================================ */
// function AddEmployeeModal({ onClose, onCreated }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [role, setRole] = useState("Employee");

//   // purely UI hint; backend always emails in your controller
//   const [sendEmail, setSendEmail] = useState(true);

//   const [submitting, setSubmitting] = useState(false);
//   const [err, setErr] = useState("");

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setErr("");

//     if (!name || !email || !role) {
//       setErr("Please fill all required fields.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const r = await api("/admin/create-user", {
//         method: "POST",
//         body: JSON.stringify({ name, email, phone, role }),
//       });

//       const newEmp = {
//         user_id: r.user.id,
//         name,
//         email,
//         role,
//         join_date: new Date().toISOString().slice(0, 10),
//         company: {}, // not needed for the grid
//         login_id: r.user.login_id,
//       };

//       onCreated?.(newEmp);
//     } catch (e2) {
//       setErr(e2.message || "Failed to create user");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Add Employee</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>

//         <form onSubmit={handleCreate} className="p-5 space-y-4">
//           {err && (
//             <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
//               {err}
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Field label="Name*" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoFocus />
//             <Field label="Email*" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />

//             <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxx xxxxx" />
//             {/* Role sits NEXT to Phone (same row) */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//               >
//                 <option value="Employee">Employee</option>
//                 <option value="HR">HR</option>
//                 <option value="Admin">Admin</option>
//                 <option value="Payroll">Payroll</option>
//               </select>
//             </div>

//             <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                 checked={sendEmail}
//                 onChange={(e) => setSendEmail(e.target.checked)}
//               />
//               Send credentials email to this user <span className="text-gray-400">(backend sends)</span>
//             </label>
//           </div>

//           <div className="pt-2 flex items-center justify-end gap-2">
//             <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//               Cancel
//             </button>
//             <button type="submit" disabled={submitting} className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
//               {submitting ? "Creating…" : "Create & Send Email"}
//             </button>
//           </div>

//           <p className="text-[11px] text-gray-500 mt-2">
//             The user will receive their <b>Login ID</b> and a temporary password via email.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// function Field({ label, ...props }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <input {...props} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
//     </div>
//   );
// }


//MAIN MAIN CODE
// // src/dashboard.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { NavLink } from "react-router-dom";

// /* ================================
//    Config + small fetch helper
// ================================ */
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
//    Page
// ================================ */
// export default function Dashboard() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);              // { id, name, role, email, company }
//   const [employees, setEmployees] = useState([]);  // directory
//   const [statuses, setStatuses] = useState({});    // { [user_id]: "Present"|"Absent"|"Leave"|"Unknown" }
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [modal, setModal] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [addOpen, setAddOpen] = useState(false);


//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   const myStatus = me ? (statuses[me.id] ?? "Unknown") : "Unknown";

//   /* 1) Auth → me */
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         setMe({
//           id: r.user.user_id,
//           name: r.user.name,
//           role: r.user.role,          // "Admin" | "HR" | "Payroll" | "Employee"
//           email: r.user.email,
//           company: r.user.company_id,
//         });
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

//   /* 3) Today’s statuses (all) */
//   useEffect(() => {
//     if (!employees.length) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const results = await Promise.allSettled(
//           employees.map((emp) =>
//             api(`/attendance/status/${emp.user_id}`).then((d) => [emp.user_id, d.status ?? "Unknown"])
//           )
//         );
//         if (cancelled) return;
//         const map = {};
//         results.forEach((r) => {
//           if (r.status === "fulfilled") {
//             const [id, st] = r.value;
//             map[id] = st;
//           }
//         });
//         setStatuses(map);
//       } catch {
//         // ignore
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [employees]);

//   /* Header-dot toggle (my attendance) */
//   const toggleMyAttendance = async () => {
//     if (!me) return;
//     const current = statuses[me.id] ?? "Unknown";
//     const next = current === "Present" ? "Absent" : "Present";

//     // Optimistic flip
//     setStatuses((s) => ({ ...s, [me.id]: next }));

//     try {
//       if (next === "Present") {
//         await api("/attendance/checkin", { method: "POST" });
//         showToast("Checked in ✅");
//       } else {
//         await api("/attendance/checkout", { method: "POST" });
//         showToast("Checked out ✅");
//       }
//     } catch (e) {
//       // Revert on error
//       setStatuses((s) => ({ ...s, [me.id]: current }));
//       showToast(e.message, "error");
//     } finally {
//       // Authoritative refresh
//       try {
//         const d = await api(`/attendance/status/${me.id}`);
//         setStatuses((s) => ({ ...s, [me.id]: d.status ?? "Unknown" }));
//       } catch { }
//     }
//   };

//   const logout = async () => {
//     try {
//       await api("/auth/logout", { method: "POST" });
//       nav("/auth");
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   /* Filter */
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter((e) =>
//       e.name.toLowerCase().includes(q) ||
//       e.email.toLowerCase().includes(q) ||
//       (e.role || "").toLowerCase().includes(q)
//     );
//   }, [employees, search]);

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         {/* Logo / brand */}
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Employees</p>
//           </div>
//         </div>

//         {/* Right side: NEW (Admin only) + search + header toggle + profile */}
//         <div className="ml-4 flex-1 flex items-center gap-3">
//           {me?.role === "Admin" && (
//             <button
//               type="button"
//               className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
//               onClick={() => setAddOpen(true)}
//             >
//               NEW
//             </button>
//           )}

//           <div className="ml-auto w-full max-w-md">
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search employees"
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />
//           </div>

//           <HeaderToggle status={myStatus} onToggle={toggleMyAttendance} />

//           <ProfileMenu
//             me={me}
//             onProfile={() => me && nav(`/profile/${me.id}`)}
//             onLogout={logout}
//           />
//         </div>
//       </header>

//       {/* Content */}
//       <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           {/* <aside className="col-span-12 md:col-span-2">
//             <nav className="rounded-xl border border-gray-200 overflow-hidden">
//               {["Employees", "Attendance", "Time Off", "Payroll", "Reports", "Settings"].map((x, i) => (
//                 <div
//                   key={x}
//                   className={`px-3 py-2 text-sm ${i === 0 ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
//                     }`}
//                 >
//                   {x}
//                 </div>
//               ))}
//             </nav>
//           </aside> */}

//           <aside className="col-span-12 md:col-span-2">
//             <nav className="rounded-xl border border-gray-200 overflow-hidden">
//               {[
//                 { label: "Employees", to: "/" },
//                 { label: "Attendance", to: "/attendance" },
//                 { label: "Time Off", to: "/timeoff" },       // keep placeholders for now
//                 { label: "Payroll", to: "/payroll" },
//                 { label: "Reports", to: "/reports" },
//                 { label: "Settings", to: "/settings" },
//               ].map((item) => (
//                 <NavLink
//                   key={item.label}
//                   to={item.to}
//                   className={({ isActive }) =>
//                     `block px-3 py-2 text-sm ${isActive
//                       ? "bg-blue-100 text-blue-700 font-semibold"
//                       : "hover:bg-gray-50"
//                     }`
//                   }
//                   end={item.to === "/"} // exact match for home
//                 >
//                   {item.label}
//                 </NavLink>
//               ))}
//             </nav>
//           </aside>

//           {/* Directory grid */}
//           <section className="col-span-12 md:col-span-10">
//             {loading ? (
//               <div className="text-sm text-gray-500">Loading directory…</div>
//             ) : (
//               <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filtered.map((emp) => (
//                   <EmployeeCardLarge
//                     key={emp.user_id}
//                     emp={emp}
//                     status={statuses[emp.user_id] ?? "Unknown"}
//                     onOpen={() => setModal(emp.user_id)}
//                     isMe={me?.id === emp.user_id}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Legend */}
//             <div className="mt-8 text-sm text-gray-600 space-y-1">
//               <p className="font-medium">Status indicators:</p>
//               <div className="flex flex-wrap gap-5">
//                 <LegendDot className="bg-green-500" label="Present" />
//                 <LegendDot className="bg-yellow-400" label="Absent" />
//                 <LegendDot icon="✈️" label="On Leave" />
//                 <LegendDot className="bg-red-500" label="Not updated" />
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* View-only modal */}
//       {modal && <ViewModal userId={modal} onClose={() => setModal(null)} />}



//       {addOpen && (
//         <AddEmployeeModal
//           onClose={() => setAddOpen(false)}
//           onCreated={(newEmp) => {
//             // Optimistically add to list & close
//             setEmployees((prev) => [...prev, newEmp]);
//             setAddOpen(false);
//             showToast(`User created (Login ID: ${newEmp.login_id})`);
//           }}
//         />
//       )}




//       {/* Toast */}
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

// /* ================================
//    Header check-in/out toggle
// ================================ */
// function HeaderToggle({ status, onToggle }) {
//   const colorClass =
//     status === "Present" ? "bg-green-500" :
//       status === "Absent" ? "bg-yellow-400" :
//         "bg-red-500"; // Unknown / not updated

//   const label =
//     status === "Present" ? "Checked in" :
//       status === "Absent" ? "Checked out" :
//         "Not updated";

//   return (
//     <button
//       type="button"
//       onClick={onToggle}
//       title={`My status: ${label}. Click to toggle`}
//       aria-label="Toggle my attendance"
//       className="ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
//     >
//       <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
//       <span className="hidden sm:inline text-gray-700">{label}</span>
//     </button>
//   );
// }

// /* ================================
//    Profile menu
// ================================ */
// // function ProfileMenu({ me, onProfile, onLogout }) {
// //   const [open, setOpen] = useState(false);
// //   return (
// //     <div className="relative">
// //       <button
// //         onClick={() => setOpen((o) => !o)}
// //         className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
// //         title={me?.name || "Profile"}
// //       >
// //         <span className="text-xs font-semibold text-gray-700">{initials(me?.name)}</span>
// //       </button>
// //       {open && (
// //         <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
// //           <button
// //             onClick={() => { setOpen(false); onProfile(); }}
// //             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
// //           >
// //             My Profile
// //           </button>
// //           <button
// //             onClick={() => { setOpen(false); onLogout(); }}
// //             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-rose-600"
// //           >
// //             Log Out
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// function ProfileMenu({ me, onProfile, onLogout }) {
//   const [open, setOpen] = useState(false);
//   const ref = React.useRef(null);

//   // Close on outside click
//   useEffect(() => {
//     function onDocClick(e) {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target)) setOpen(false);
//     }
//     if (open) document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [open]);

//   return (
//     <div className="relative z-50" ref={ref}>
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
//         title={me?.name || "Profile"}
//       >
//         <span className="text-xs font-semibold text-gray-700">{initials(me?.name)}</span>
//       </button>

//       {open && (
//         <div
//           className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
//           style={{ zIndex: 50 }} // extra guard
//         >
//           <button
//             onClick={() => { setOpen(false); onProfile(); }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
//           >
//             My Profile
//           </button>
//           <button
//             onClick={() => { setOpen(false); onLogout(); }}
//             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-rose-600"
//           >
//             Log Out
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


// /* ================================
//    Big Employee Card
// ================================ */
// function EmployeeCardLarge({ emp, status, onOpen, isMe }) {
//   const indicator = (() => {
//     if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
//     if (status === "Absent") return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;
//     if (status === "Leave") return <span className="inline-block text-base leading-none">✈️</span>;
//     return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />; // Unknown
//   })();

//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
//       {/* Large image header */}
//       <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
//         {/* sample image/avatar shape */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="h-20 w-20 rounded-full bg-white shadow-inner border border-gray-200 flex items-center justify-center">
//             <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" fill="currentColor" aria-hidden>
//               <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.67-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.33-2.67-6-8-6z" />
//             </svg>
//           </div>
//         </div>

//         {/* status dot in card top-right */}
//         <div className="absolute top-3 right-3" title={status}>
//           {indicator}
//         </div>
//       </div>

//       {/* Body */}
//       <button onClick={onOpen} className="block text-left w-full">
//         <div className="p-4">
//           <p className="text-base font-semibold text-gray-900">
//             {emp.name} {isMe && <span className="ml-1 text-xs text-purple-600">(You)</span>}
//           </p>
//           <p className="text-sm text-gray-500">{emp.role}</p>

//           <div className="mt-3 text-xs text-gray-600">
//             <div className="flex justify-between">
//               <span>{emp.email}</span>
//               <span className="text-gray-400">Joined: {emp.join_date}</span>
//             </div>
//           </div>
//         </div>
//       </button>
//     </div>
//   );
// }

// /* ================================
//    Small bits
// ================================ */
// function LegendDot({ className, icon, label }) {
//   return (
//     <div className="flex items-center gap-2">
//       {icon ? (
//         <span className="inline-block">{icon}</span>
//       ) : (
//         <span className={`inline-block h-3 w-3 rounded-full ${className || ""}`} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// }

// function initials(name = "") {
//   const n = name?.trim().split(/\s+/) || [];
//   return (n[0]?.[0] || "").toUpperCase() + (n[1]?.[0] || "").toUpperCase();
// }

// /* ================================
//    View-only profile modal
// ================================ */
// function ViewModal({ userId, onClose }) {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const r = await api(`/auth/profile/${userId}`);
//         if (!cancelled) setProfile(r.profile);
//       } catch {
//         // ignore
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [userId]);

//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Employee Profile</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>
//         <div className="p-5">
//           {loading ? (
//             <p className="text-sm text-gray-500">Loading…</p>
//           ) : profile ? (
//             <div className="space-y-3 text-sm">
//               <Row k="Name" v={profile.name} />
//               <Row k="Email" v={profile.email} />
//               <Row k="Role" v={profile.role} />
//               <Row k="Login ID" v={profile.login_id} />
//               <Row k="Company" v={profile.company?.company_name} />
//               <Row k="Joined" v={profile.join_date} />
//               <div className="pt-2 text-xs text-gray-500">View-only</div>
//             </div>
//           ) : (
//             <p className="text-sm text-rose-600">Failed to load profile.</p>
//           )}
//         </div>
//         <div className="px-5 py-3 border-t">
//           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ k, v }) {
//   return (
//     <div className="flex justify-between gap-4">
//       <span className="text-gray-500">{k}</span>
//       <span className="font-medium text-gray-900">{v || "-"}</span>
//     </div>
//   );
// }



//  function AddEmployeeModal({ onClose, onCreated }) {
//   const [company_name, setCompany] = useState("");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [role, setRole] = useState("Employee");

//   // purely UI hint; backend always emails in your controller
//   const [sendEmail, setSendEmail] = useState(true);

//   const [submitting, setSubmitting] = useState(false);
//   const [err, setErr] = useState("");

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setErr("");

//     if (!company_name || !name || !email || !role) {
//       setErr("Please fill all required fields.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // calls: POST /api/admin/create-user  (cookie auth via credentials: 'include')
//       const r = await api("/admin/create-user", {
//         method: "POST",
//         body: JSON.stringify({ company_name, name, email, phone, role }),
//       });

//       // r.user => { id, name, login_id }
//       const newEmp = {
//         user_id: r.user.id,
//         name,
//         email,
//         role,
//         join_date: new Date().toISOString().slice(0, 10),
//         company: { company_name },
//         login_id: r.user.login_id,
//       };

//       onCreated?.(newEmp);
//     } catch (e2) {
//       setErr(e2.message || "Failed to create user");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Add Employee</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>

//         <form onSubmit={handleCreate} className="p-5 space-y-4">
//           {err && (
//             <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
//               {err}
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Field label="Name*" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoFocus />
//             <Field label="Email*" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
//             <Field label="Company Name*" value={company_name} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
//             <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxx xxxxx" />

//             <div className="sm:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//               >
//                 <option value="Employee">Employee</option>
//                 <option value="HR">HR</option>
//                 <option value="Admin">Admin</option>
//                 <option value="Payroll">Payroll</option>
//               </select>
//             </div>

//             <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                 checked={sendEmail}
//                 onChange={(e) => setSendEmail(e.target.checked)}
//               />
//               Send credentials email to this user
//               <span className="text-gray-400">(backend sends)</span>
//             </label>
//           </div>

//           <div className="pt-2 flex items-center justify-end gap-2">
//             <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//               Cancel
//             </button>
//             <button type="submit" disabled={submitting} className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
//               {submitting ? "Creating…" : "Create & Send Email"}
//             </button>
//           </div>

//           <p className="text-[11px] text-gray-500 mt-2">
//             The user will receive their <b>Login ID</b> and a temporary password via email.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// function Field({ label, ...props }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <input {...props} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
//     </div>
//   );
// }


// function AddEmployeeModal({ onClose, onCreated }) {
//   const [company_name, setCompany] = useState("");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [role, setRole] = useState("Employee");

//   // purely UI (backend always emails creds); keep it to match your requirement
//   const [sendEmail, setSendEmail] = useState(true);

//   const [submitting, setSubmitting] = useState(false);
//   const [err, setErr] = useState("");

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setErr("");
//     if (!company_name || !name || !email || !role) {
//       setErr("Please fill all required fields.");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       // Backend route: creates user & emails credentials
//       const r = await api("/admin/create-user", {
//         method: "POST",
//         body: JSON.stringify({ company_name, name, email, phone, role }),
//       });

//       // r.user: { id, name, login_id }
//       // Build a small object to append to directory grid right away
//       const newEmp = {
//         user_id: r.user.id,
//         name,
//         email,
//         role,
//         join_date: new Date().toISOString().slice(0, 10),
//         company: { company_name },
//         login_id: r.user.login_id,
//       };

//       // If you later add a “no-email” flag server side, pass sendEmail here.
//       // For now backend always emails; just reflect that in the success text.
//       onCreated?.(newEmp);
//     } catch (e2) {
//       setErr(e2.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Add Employee</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>

//         <form onSubmit={handleCreate} className="p-5 space-y-4">
//           {err && (
//             <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
//               {err}
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Field
//               label="Name*"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Jane Doe"
//               autoFocus
//             />
//             <Field
//               label="Email*"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="jane@company.com"
//             />
//             <Field
//               label="Company Name*"
//               value={company_name}
//               onChange={(e) => setCompany(e.target.value)}
//               placeholder="Acme Inc."
//             />
//             <Field
//               label="Phone"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="+91 9xxxx xxxxx"
//             />
//             <div className="sm:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Role*
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//               >
//                 <option value="Employee">Employee</option>
//                 <option value="HR">HR</option>
//                 <option value="Admin">Admin</option>
//                 <option value="Payroll">Payroll</option>
//               </select>
//             </div>

//             <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                 checked={sendEmail}
//                 onChange={(e) => setSendEmail(e.target.checked)}
//               />
//               Send credentials email to this user
//               <span className="text-gray-400">(backend will send)</span>
//             </label>
//           </div>

//           <div className="pt-2 flex items-center justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
//             >
//               {submitting ? "Creating…" : "Create & Send Email"}
//             </button>
//           </div>

//           <p className="text-[11px] text-gray-500 mt-2">
//             After creation, the user receives a mail with their <b>Login ID</b> and a temporary password.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// function Field({ label, ...props }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <input
//         {...props}
//         className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//       />
//     </div>
//   );
// }






// // src/dashboard.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// /* ================================
//    Config & tiny fetch helper
// ================================ */
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
//    Dashboard Page
// ================================ */
// export default function Dashboard() {
//   const nav = useNavigate();

//   const [me, setMe] = useState(null);              // { id, name, role, email, company }
//   const [employees, setEmployees] = useState([]);  // directory
//   const [statuses, setStatuses] = useState({});    // { [user_id]: "Present" | "Absent" | "Leave" | "Unknown" }
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [modal, setModal] = useState(null);
//   const [toast, setToast] = useState(null);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 2500);
//   };

//   // Convenience accessor for MY status (drives header-dot + my card)
//   const myStatus = me ? (statuses[me.id] ?? "Unknown") : "Unknown";

//   /* -------------------------------
//      1) Auth → me
//   -------------------------------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await api("/auth/isAuth");
//         setMe({
//           id: r.user.user_id,
//           name: r.user.name,
//           role: r.user.role,
//           email: r.user.email,
//           company: r.user.company_id,
//         });
//       } catch {
//         nav("/auth");
//       }
//     })();
//   }, [nav]);

//   /* -------------------------------
//      2) Directory
//   -------------------------------- */
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

//   /* -------------------------------
//      3) Today’s statuses (all)
//   -------------------------------- */
//   useEffect(() => {
//     if (!employees.length) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const results = await Promise.allSettled(
//           employees.map((emp) =>
//             api(`/attendance/status/${emp.user_id}`).then((d) => [emp.user_id, d.status ?? "Unknown"])
//           )
//         );
//         if (cancelled) return;
//         const map = {};
//         results.forEach((r) => {
//           if (r.status === "fulfilled") {
//             const [id, st] = r.value;
//             map[id] = st;
//           }
//         });
//         setStatuses(map);
//       } catch {
//         // ignore batch errors; cards will show Unknown
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [employees]);

//   /* -------------------------------
//      Header-dot toggle (ONLY for me)
//      - Click red/yellow/green dot in header to toggle
//      - Reflect instantly on my card
//   -------------------------------- */
//   const toggleMyAttendance = async () => {
//     if (!me) return;
//     const current = statuses[me.id] ?? "Unknown";
//     const next = current === "Present" ? "Absent" : "Present";

//     // Optimistic flip
//     setStatuses((s) => ({ ...s, [me.id]: next }));

//     try {
//       if (next === "Present") {
//         await api("/attendance/checkin", { method: "POST" });
//         showToast("Checked in ✅");
//       } else {
//         await api("/attendance/checkout", { method: "POST" });
//         showToast("Checked out ✅");
//       }
//     } catch (e) {
//       // Revert on failure
//       setStatuses((s) => ({ ...s, [me.id]: current }));
//       showToast(e.message, "error");
//     } finally {
//       // Authoritative refresh
//       try {
//         const d = await api(`/attendance/status/${me.id}`);
//         setStatuses((s) => ({ ...s, [me.id]: d.status ?? "Unknown" }));
//       } catch { /* ignore */ }
//     }
//   };

//   const logout = async () => {
//     try {
//       await api("/auth/logout", { method: "POST" });
//       nav("/auth");
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   /* -------------------------------
//      Filtering
//   -------------------------------- */
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter((e) =>
//       e.name.toLowerCase().includes(q) ||
//       e.email.toLowerCase().includes(q) ||
//       (e.role || "").toLowerCase().includes(q)
//     );
//   }, [employees, search]);

//   /* -------------------------------
//      Render
//   -------------------------------- */
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top bar */}
//       <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//         {/* Logo / brand */}
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded-md bg-purple-600" />
//           <div className="text-sm">
//             <p className="font-semibold text-gray-900">WorkZen</p>
//             <p className="text-gray-500 text-xs">Employees</p>
//           </div>
//         </div>

//         {/* Right side: search + header-dot toggle + profile */}
//         <div className="ml-4 flex-1 flex items-center gap-3">
//           {/* (Optional) NEW */}
//           <button
//             type="button"
//             className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
//           >
//             NEW
//           </button>

//           <div className="ml-auto w-full max-w-md">
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search"
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//             />
//           </div>

//           {/* ===== Header Status/Toggler (MY attendance) ===== */}
//           <HeaderDot status={myStatus} onToggle={toggleMyAttendance} />

//           {/* Profile menu */}
//           <ProfileMenu me={me} onProfile={() => me && nav(`/profile/${me.id}`)} onLogout={logout} />
//         </div>
//       </header>

//       {/* Content */}
//       <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
//         <div className="grid grid-cols-12 gap-6">
//           {/* Sidebar */}
//           <aside className="col-span-12 md:col-span-2">
//             <nav className="rounded-xl border border-gray-200 overflow-hidden">
//               {["Employees", "Attendance", "Time Off", "Payroll", "Reports", "Settings"].map((x, i) => (
//                 <div
//                   key={x}
//                   className={`px-3 py-2 text-sm ${i === 0 ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"}`}
//                 >
//                   {x}
//                 </div>
//               ))}
//             </nav>
//           </aside>

//           {/* Grid */}
//           <section className="col-span-12 md:col-span-10">
//             {loading ? (
//               <div className="text-sm text-gray-500">Loading directory…</div>
//             ) : (
//               <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                 {filtered.map((emp) => (
//                   <EmployeeCard
//                     key={emp.user_id}
//                     emp={emp}
//                     // Show Unknown (🔴) if we have no status yet
//                     status={statuses[emp.user_id] ?? "Unknown"}
//                     onOpen={() => setModal(emp.user_id)}
//                     isMe={me?.id === emp.user_id}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Legend */}
//             <div className="mt-6 text-sm text-gray-600 space-y-1">
//               <p className="font-medium">Status indicators:</p>
//               <div className="flex flex-wrap gap-4">
//                 <LegendDot className="bg-green-500" label="Present" />
//                 <LegendDot className="bg-yellow-400" label="Absent" />
//                 <LegendDot icon="✈️" label="On Leave" />
//                 <LegendDot className="bg-red-500" label="Not updated" />
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* View-only modal */}
//       {modal && <ViewModal userId={modal} onClose={() => setModal(null)} />}

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

// /* ================================
//    Header-dot (toggle control)
//    - Drives MY status only
// ================================ */
// function HeaderDot({ status, onToggle }) {
//   const colorClass =
//     status === "Present" ? "bg-green-500" :
//     status === "Absent"  ? "bg-yellow-400" :
//     status === "Leave"   ? "" : // plane icon
//     "bg-red-500"; // Unknown / not updated

//   return (
//     <button
//       type="button"
//       onClick={onToggle}
//       className="ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
//       title={`My status: ${status}. Click to toggle.`}
//       aria-label="Toggle my attendance status"
//     >
//       {status === "Leave" ? (
//         <span className="inline-block text-base leading-none">✈️</span>
//       ) : (
//         <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
//       )}
//       <span className="text-gray-700 hidden sm:inline">
//         {status === "Present" ? "Checked in" :
//          status === "Absent"  ? "Checked out" :
//          status === "Leave"   ? "On leave" :
//          "Not updated"}
//       </span>
//     </button>
//   );
// }

// /* ================================
//    Employee Card (no toggle UI here)
//    - Reflects status live when header-dot is used
// ================================ */
// function EmployeeCard({ emp, status, onOpen, isMe }) {
//   const indicator = (() => {
//     if (status === "Present") return <span className="h-4 w-4 rounded-full bg-green-500 inline-block" />;
//     if (status === "Absent")  return <span className="h-4 w-4 rounded-full bg-yellow-400 inline-block" />;
//     if (status === "Leave")   return <span className="inline-block text-base leading-none">✈️</span>;
//     return <span className="h-4 w-4 rounded-full bg-red-500 inline-block" />; // Unknown
//   })();

//   return (
//     <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
//       <div className="p-3 flex items-start justify-between">
//         <div className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
//             <span className="text-sm font-semibold text-blue-700">{initials(emp.name)}</span>
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-gray-900">
//               {emp.name} {isMe && <span className="ml-1 text-xs text-purple-600">(You)</span>}
//             </p>
//             <p className="text-xs text-gray-500">{emp.role}</p>
//           </div>
//         </div>

//         <div className="p-1" title={status}>
//           {indicator}
//         </div>
//       </div>

//       <button onClick={onOpen} className="block w-full text-left px-3 pb-3">
//         <div className="text-xs text-gray-600">
//           <div className="flex justify-between">
//             <span>{emp.email}</span>
//             <span className="text-gray-400">Joined: {emp.join_date}</span>
//           </div>
//         </div>
//       </button>
//     </div>
//   );
// }

// /* ================================
//    Small bits
// ================================ */
// function LegendDot({ className, icon, label }) {
//   return (
//     <div className="flex items-center gap-2">
//       {icon ? (
//         <span className="inline-block">{icon}</span>
//       ) : (
//         <span className={`inline-block h-3 w-3 rounded-full ${className || ""}`} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// }

// function initials(name = "") {
//   const n = name.trim().split(/\s+/);
//   return (n[0]?.[0] || "") + (n[1]?.[0] || "");
// }

// /* ================================
//    View-only profile modal
// ================================ */
// function ViewModal({ userId, onClose }) {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const r = await api(`/auth/profile/${userId}`);
//         if (!cancelled) setProfile(r.profile);
//       } catch {
//         // ignore
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [userId]);

//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-3 border-b flex items-center justify-between">
//           <p className="font-semibold text-gray-900">Employee Profile</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>
//         <div className="p-5">
//           {loading ? (
//             <p className="text-sm text-gray-500">Loading…</p>
//           ) : profile ? (
//             <div className="space-y-3 text-sm">
//               <Row k="Name" v={profile.name} />
//               <Row k="Email" v={profile.email} />
//               <Row k="Role" v={profile.role} />
//               <Row k="Login ID" v={profile.login_id} />
//               <Row k="Company" v={profile.company?.company_name} />
//               <Row k="Joined" v={profile.join_date} />
//               <div className="pt-2 text-xs text-gray-500">View-only</div>
//             </div>
//           ) : (
//             <p className="text-sm text-rose-600">Failed to load profile.</p>
//           )}
//         </div>
//         <div className="px-5 py-3 border-t">
//           <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Row({ k, v }) {
//   return (
//     <div className="flex justify-between gap-4">
//       <span className="text-gray-500">{k}</span>
//       <span className="font-medium text-gray-900">{v || "-"}</span>
//     </div>
//   );
// }
