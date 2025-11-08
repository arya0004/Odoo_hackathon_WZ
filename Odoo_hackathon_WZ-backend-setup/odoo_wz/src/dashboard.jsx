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



// src/dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

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
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

/* ================================
   Page
================================ */
export default function Dashboard() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);              // { id, name, role, email, company }
  const [employees, setEmployees] = useState([]);  // directory
  const [statuses, setStatuses] = useState({});    // { [user_id]: "Present"|"Absent"|"Leave"|"Unknown" }
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const myStatus = me ? (statuses[me.id] ?? "Unknown") : "Unknown";

  /* 1) Auth → me */
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        setMe({
          id: r.user.user_id,
          name: r.user.name,
          role: r.user.role,          // "Admin" | "HR" | "Payroll" | "Employee"
          email: r.user.email,
          company: r.user.company_id,
        });
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

  /* 3) Today’s statuses (all) */
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
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [employees]);

  /* Header-dot toggle (my attendance) */
  const toggleMyAttendance = async () => {
    if (!me) return;
    const current = statuses[me.id] ?? "Unknown";
    const next = current === "Present" ? "Absent" : "Present";

    // Optimistic flip
    setStatuses((s) => ({ ...s, [me.id]: next }));

    try {
      if (next === "Present") {
        await api("/attendance/checkin", { method: "POST" });
        showToast("Checked in ✅");
      } else {
        await api("/attendance/checkout", { method: "POST" });
        showToast("Checked out ✅");
      }
    } catch (e) {
      // Revert on error
      setStatuses((s) => ({ ...s, [me.id]: current }));
      showToast(e.message, "error");
    } finally {
      // Authoritative refresh
      try {
        const d = await api(`/attendance/status/${me.id}`);
        setStatuses((s) => ({ ...s, [me.id]: d.status ?? "Unknown" }));
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
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.role || "").toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
        {/* Logo / brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-purple-600" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">WorkZen</p>
            <p className="text-gray-500 text-xs">Employees</p>
          </div>
        </div>

        {/* Right side: NEW (Admin only) + search + header toggle + profile */}
        <div className="ml-4 flex-1 flex items-center gap-3">
          {me?.role === "Admin" && (
            <button
              type="button"
              className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium px-3 py-2 hover:bg-purple-700"
              onClick={() => showToast("New employee form coming soon")}
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

          <HeaderToggle status={myStatus} onToggle={toggleMyAttendance} />

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
          {/* <aside className="col-span-12 md:col-span-2">
            <nav className="rounded-xl border border-gray-200 overflow-hidden">
              {["Employees", "Attendance", "Time Off", "Payroll", "Reports", "Settings"].map((x, i) => (
                <div
                  key={x}
                  className={`px-3 py-2 text-sm ${i === 0 ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
                    }`}
                >
                  {x}
                </div>
              ))}
            </nav>
          </aside> */}

          <aside className="col-span-12 md:col-span-2">
            <nav className="rounded-xl border border-gray-200 overflow-hidden">
              {[
                { label: "Employees", to: "/" },
                { label: "Attendance", to: "/attendance" },
                { label: "Time Off", to: "/timeoff" },       // keep placeholders for now
                { label: "Payroll", to: "/payroll" },
                { label: "Reports", to: "/reports" },
                { label: "Settings", to: "/settings" },
              ].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm ${isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-50"
                    }`
                  }
                  end={item.to === "/"} // exact match for home
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Directory grid */}
          <section className="col-span-12 md:col-span-10">
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
              </div>
            )}

            {/* Legend */}
            <div className="mt-8 text-sm text-gray-600 space-y-1">
              <p className="font-medium">Status indicators:</p>
              <div className="flex flex-wrap gap-5">
                <LegendDot className="bg-green-500" label="Present" />
                <LegendDot className="bg-yellow-400" label="Absent" />
                <LegendDot icon="✈️" label="On Leave" />
                <LegendDot className="bg-red-500" label="Not updated" />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* View-only modal */}
      {modal && <ViewModal userId={modal} onClose={() => setModal(null)} />}

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
function HeaderToggle({ status, onToggle }) {
  const colorClass =
    status === "Present" ? "bg-green-500" :
      status === "Absent" ? "bg-yellow-400" :
        "bg-red-500"; // Unknown / not updated

  const label =
    status === "Present" ? "Checked in" :
      status === "Absent" ? "Checked out" :
        "Not updated";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={`My status: ${label}. Click to toggle`}
      aria-label="Toggle my attendance"
      className="ml-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50"
    >
      <span className={`h-3.5 w-3.5 rounded-full ${colorClass}`} />
      <span className="hidden sm:inline text-gray-700">{label}</span>
    </button>
  );
}

/* ================================
   Profile menu
================================ */
// function ProfileMenu({ me, onProfile, onLogout }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
//         title={me?.name || "Profile"}
//       >
//         <span className="text-xs font-semibold text-gray-700">{initials(me?.name)}</span>
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

function ProfileMenu({ me, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  // Close on outside click
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
        className="ml-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
        title={me?.name || "Profile"}
      >
        <span className="text-xs font-semibold text-gray-700">{initials(me?.name)}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
          style={{ zIndex: 50 }} // extra guard
        >
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
      {/* Large image header */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
        {/* sample image/avatar shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white shadow-inner border border-gray-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400" fill="currentColor" aria-hidden>
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.67-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.33-2.67-6-8-6z" />
            </svg>
          </div>
        </div>

        {/* status dot in card top-right */}
        <div className="absolute top-3 right-3" title={status}>
          {indicator}
        </div>
      </div>

      {/* Body */}
      <button onClick={onOpen} className="block text-left w-full">
        <div className="p-4">
          <p className="text-base font-semibold text-gray-900">
            {emp.name} {isMe && <span className="ml-1 text-xs text-purple-600">(You)</span>}
          </p>
          <p className="text-sm text-gray-500">{emp.role}</p>

          <div className="mt-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>{emp.email}</span>
              <span className="text-gray-400">Joined: {emp.join_date}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ================================
   Small bits
================================ */
function LegendDot({ className, icon, label }) {
  return (
    <div className="flex items-center gap-2">
      {icon ? (
        <span className="inline-block">{icon}</span>
      ) : (
        <span className={`inline-block h-3 w-3 rounded-full ${className || ""}`} />
      )}
      <span>{label}</span>
    </div>
  );
}

function initials(name = "") {
  const n = name?.trim().split(/\s+/) || [];
  return (n[0]?.[0] || "").toUpperCase() + (n[1]?.[0] || "").toUpperCase();
}

/* ================================
   View-only profile modal
================================ */
function ViewModal({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await api(`/auth/profile/${userId}`);
        if (!cancelled) setProfile(r.profile);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <p className="font-semibold text-gray-900">Employee Profile</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
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
              <div className="pt-2 text-xs text-gray-500">View-only</div>
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
