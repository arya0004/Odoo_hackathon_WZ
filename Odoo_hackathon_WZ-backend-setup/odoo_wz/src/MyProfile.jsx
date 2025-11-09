// // src/MyProfile.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { NavLink, useNavigate, useParams } from "react-router-dom";

// /* ================================
//    Config + small fetch helper
// ================================ */
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api`;

// async function api(path, init = {}) {
//     const res = await fetch(`${API}${path}`, {
//         credentials: "include",
//         headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(init.headers || {}) },
//         ...init,
//     });
//     const data = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
//     return data;
// }

// /* ================================
//    Helpers
// ================================ */
// const Row = ({ k, children, value }) => (
//     <div className="flex items-center gap-4 py-1">
//         <span className="w-40 text-sm text-gray-500">{k}</span>
//         <span className="flex-1 text-sm font-medium text-gray-900">{children ?? (value || "-")}</span>
//     </div>
// );

// const SectionCard = ({ title, children }) => (
//     <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
//         <p className="font-semibold text-gray-900 mb-3">{title}</p>
//         {children}
//     </div>
// );

// /* ================================
//    Page
// ================================ */
// export default function MyProfile() {
//     const nav = useNavigate();
//     const { id: _routeId } = useParams();

//     const [me, setMe] = useState(null);
//     const [profile, setProfile] = useState(null);
//     const [tab, setTab] = useState("resume"); // resume | private | salary | security
//     const [toast, setToast] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // editable state (Private Info)
//     const [edit, setEdit] = useState({
//         date_of_birth: "",
//         address: "",
//         nationality: "",
//         personal_email: "",
//         gender: "",
//         marital_status: "",
//         date_of_joining: "",
//         // bank block
//         account_number: "",
//         bank_name: "",
//         ifsc_code: "",
//         pan_no: "",
//         uan_no: "",
//         emp_code: "",
//     });

//     // security
//     const [oldPassword, setOldPassword] = useState("");
//     const [newPassword, setNewPassword] = useState("");
//     const [saving, setSaving] = useState(false);
//     const [uploading, setUploading] = useState(false);

//     const showToast = (msg, type = "success") => {
//         setToast({ msg, type });
//         setTimeout(() => setToast(null), 2200);
//     };

//     /* 1) Auth → me */
//     useEffect(() => {
//         (async () => {
//             try {
//                 const r = await api("/auth/isAuth");
//                 setMe({
//                     id: r.user.user_id,
//                     name: r.user.name,
//                     role: r.user.role,
//                     email: r.user.email,
//                     company: r.user.company_id,
//                 });
//             } catch {
//                 nav("/auth");
//             }
//         })();
//     }, [nav]);

//     /* 2) Load my profile */
//     useEffect(() => {
//         if (!me) return;
//         (async () => {
//             setLoading(true);
//             try {
//                 const r = await api("/employee/myprofile");
//                 const p = r.profile;
//                 setProfile(p);

//                 // seed edit fields
//                 setEdit((e) => ({
//                     ...e,
//                     date_of_birth: p.date_of_birth || "",
//                     address: p.address || "",
//                     nationality: p.nationality || "",
//                     personal_email: p.personal_email || "",
//                     gender: p.gender || "",
//                     marital_status: p.marital_status || "",
//                     date_of_joining: p.date_of_joining || "",
//                     account_number: p.account_number || "",
//                     bank_name: p.bank_name || "",
//                     ifsc_code: p.ifsc_code || "",
//                     pan_no: p.pan_no || "",
//                     uan_no: p.uan_no || "",
//                     emp_code: p.emp_code || "",
//                 }));
//             } catch (e) {
//                 showToast(e.message, "error");
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [me]);

//     const initials = (name = "") => {
//         const parts = name.trim().split(/\s+/);
//         return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
//     };

//     const canSeeSalaryTab = useMemo(() => {
//         // As per note: Salary Info tab is mainly Admin/Payroll.
//         // For employees, we show read-only if backend returns the fields.
//         return true; // keep visible but read-only
//     }, []);

//     /* Handlers */
//     const onSavePrivate = async () => {
//         try {
//             setSaving(true);
//             await api("/employee/my-profile", {
//                 method: "PUT",
//                 body: JSON.stringify(edit),
//             });
//             showToast("Profile updated ✅");
//         } catch (e) {
//             showToast(e.message, "error");
//         } finally {
//             setSaving(false);
//         }
//     };

//     const onUploadResume = async (file) => {
//         if (!file) return;
//         try {
//             setUploading(true);
//             const fd = new FormData();
//             fd.append("resume", file);
//             const r = await api("/employee/upload-resume", {
//                 method: "POST",
//                 body: fd,
//             });
//             // refresh profile to reflect resume path
//             setProfile((p) => ({ ...p, resume_path: r.resume_url }));
//             showToast("Resume uploaded 📄");
//         } catch (e) {
//             showToast(e.message, "error");
//         } finally {
//             setUploading(false);
//         }
//     };

//     const onChangePassword = async () => {
//         if (!oldPassword || !newPassword) {
//             showToast("Enter both old & new passwords", "error");
//             return;
//         }
//         try {
//             setSaving(true);
//             await api("/employee/change-password", {
//                 method: "PUT",
//                 body: JSON.stringify({ oldPassword, newPassword }),
//             });
//             setOldPassword("");
//             setNewPassword("");
//             showToast("Password updated 🔐");
//         } catch (e) {
//             showToast(e.message, "error");
//         } finally {
//             setSaving(false);
//         }
//     };

//     const salaryInfo = {
//         monthly_wage: profile?.monthly_wage,
//         basic_salary: profile?.basic_salary,
//         hra: profile?.hra,
//         standard_allowance: profile?.standard_allowance,
//         performance_bonus: profile?.performance_bonus,
//         leave_travel_allowance: profile?.leave_travel_allowance,
//         fixed_allowance: profile?.fixed_allowance,
//         pf_rate: profile?.pf_rate,
//         professional_tax: profile?.professional_tax,
//         working_days_per_week: profile?.working_days_per_week,
//         break_time_hours: profile?.break_time_hours,
//     };

//     return (
//         <div className="min-h-screen bg-white">
//             {/* Header */}
//             <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
//                 <div className="flex items-center gap-3">
//                     <div className="h-8 w-8 rounded-md bg-purple-600" />
//                     <div className="text-sm">
//                         <p className="font-semibold text-gray-900">WorkZen</p>
//                         <p className="text-gray-500 text-xs">My Profile</p>
//                     </div>
//                 </div>
//             </header>

//             <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
//                 <div className="grid grid-cols-12 gap-6">
//                     {/* Sidebar */}
//                     <aside className="col-span-12 md:col-span-2">
//                         <nav className="rounded-xl border border-gray-200 overflow-hidden">
//                             {[
//                                 { label: "Employees", to: "/" },
//                                 { label: "Attendance", to: "/attendance" },
//                                 { label: "Time Off", to: "/timeoff" },
//                                 { label: "Payroll", to: "/payroll" },
//                                 { label: "Reports", to: "/reports" },
//                                 { label: "Settings", to: "/settings" },
//                             ].map((item) => (
//                                 <NavLink
//                                     key={item.label}
//                                     to={item.to}
//                                     end={item.to === "/"}
//                                     className={({ isActive }) =>
//                                         `block px-3 py-2 text-sm ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-50"
//                                         }`
//                                     }
//                                 >
//                                     {item.label}
//                                 </NavLink>
//                             ))}
//                         </nav>
//                     </aside>

//                     {/* Main */}
//                     <section className="col-span-12 md:col-span-10">
//                         {loading ? (
//                             <div className="text-sm text-gray-500">Loading profile…</div>
//                         ) : profile ? (
//                             <div className="space-y-6">
//                                 {/* Top identity strip */}
//                                 <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
//                                     <div className="flex items-start gap-4">
//                                         <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
//                                             {initials(profile.name)}
//                                         </div>

//                                         <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
//                                             <div>
//                                                 <p className="text-xl font-bold text-gray-900">{profile.name}</p>
//                                                 <div className="mt-2 text-sm text-gray-700 space-y-1">
//                                                     <div>Job Position: {profile.job_position || "-"}</div>
//                                                     <div>Email: {profile.email || "-"}</div>
//                                                     <div>Mobile: {profile.phone || "-"}</div>
//                                                 </div>
//                                             </div>

//                                             <div className="text-sm text-gray-700">
//                                                 <div>Company: {profile.company?.company_name || "-"}</div>
//                                                 <div>Department: {profile.department || "-"}</div>
//                                                 <div>Manager: {profile.Manager ? `${profile.Manager.name} (${profile.Manager.email})` : "-"}</div>
//                                                 <div>Location: {profile.location || "-"}</div>
//                                             </div>

//                                             <div className="flex items-start justify-end">
//                                                 <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
//                                                     {["resume", "private", "salary", "security"].map((t) => (
//                                                         <button
//                                                             key={t}
//                                                             onClick={() => setTab(t)}
//                                                             className={`px-3 py-1.5 text-xs sm:text-sm ${tab === t ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
//                                                                 }`}
//                                                         >
//                                                             {t === "resume" ? "Resume" : t === "private" ? "Private Info" : t === "salary" ? "Salary Info" : "Security"}
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Tabs */}
//                                 {tab === "resume" && (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <SectionCard title="Resume">
//                                             <div className="text-sm">
//                                                 <p className="mb-3 text-gray-600">
//                                                     Upload your latest resume (PDF/DOC). A link will appear after upload.
//                                                 </p>
//                                                 <div className="flex items-center gap-3">
//                                                     <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
//                                                         <input
//                                                             type="file"
//                                                             className="hidden"
//                                                             accept=".pdf,.doc,.docx"
//                                                             onChange={(e) => onUploadResume(e.target.files?.[0])}
//                                                             disabled={uploading}
//                                                         />
//                                                         <span>{uploading ? "Uploading…" : "Upload Resume"}</span>
//                                                     </label>
//                                                     {profile.resume_path && (
//                                                         <a
//                                                             href={`${API_BASE}${profile.resume_path}`}
//                                                             target="_blank"
//                                                             rel="noreferrer"
//                                                             className="text-blue-600 hover:underline"
//                                                         >
//                                                             View current resume
//                                                         </a>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </SectionCard>

//                                         <SectionCard title="Account">
//                                             <Row k="Login ID" value={profile.login_id} />
//                                             <Row k="Role" value={profile.role} />
//                                             <Row k="Joined" value={profile.date_of_joining || profile.join_date} />
//                                         </SectionCard>
//                                     </div>
//                                 )}

//                                 {tab === "private" && (
//                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                         <SectionCard title="Private Info">
//                                             <FormField label="Date of Birth">
//                                                 <input
//                                                     type="date"
//                                                     value={edit.date_of_birth || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, date_of_birth: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <FormField label="Residing Address">
//                                                 <textarea
//                                                     value={edit.address || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, address: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <FormField label="Nationality">
//                                                 <input
//                                                     value={edit.nationality || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, nationality: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <FormField label="Personal Email">
//                                                 <input
//                                                     type="email"
//                                                     value={edit.personal_email || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, personal_email: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <div className="grid grid-cols-2 gap-4">
//                                                 <FormField label="Gender">
//                                                     <input
//                                                         value={edit.gender || ""}
//                                                         onChange={(e) => setEdit((x) => ({ ...x, gender: e.target.value }))}
//                                                         className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                     />
//                                                 </FormField>
//                                                 <FormField label="Marital Status">
//                                                     <input
//                                                         value={edit.marital_status || ""}
//                                                         onChange={(e) => setEdit((x) => ({ ...x, marital_status: e.target.value }))}
//                                                         className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                     />
//                                                 </FormField>
//                                             </div>
//                                             <FormField label="Date of Joining">
//                                                 <input
//                                                     type="date"
//                                                     value={edit.date_of_joining || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, date_of_joining: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>

//                                             <div className="pt-2">
//                                                 <button
//                                                     onClick={onSavePrivate}
//                                                     disabled={saving}
//                                                     className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
//                                                 >
//                                                     {saving ? "Saving…" : "Save Changes"}
//                                                 </button>
//                                             </div>
//                                         </SectionCard>

//                                         <SectionCard title="Bank Details">
//                                             <FormField label="Account Number">
//                                                 <input
//                                                     value={edit.account_number || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, account_number: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <FormField label="Bank Name">
//                                                 <input
//                                                     value={edit.bank_name || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, bank_name: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <FormField label="IFSC Code">
//                                                 <input
//                                                     value={edit.ifsc_code || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, ifsc_code: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <div className="grid grid-cols-2 gap-4">
//                                                 <FormField label="PAN No">
//                                                     <input
//                                                         value={edit.pan_no || ""}
//                                                         onChange={(e) => setEdit((x) => ({ ...x, pan_no: e.target.value }))}
//                                                         className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                     />
//                                                 </FormField>
//                                                 <FormField label="UAN No">
//                                                     <input
//                                                         value={edit.uan_no || ""}
//                                                         onChange={(e) => setEdit((x) => ({ ...x, uan_no: e.target.value }))}
//                                                         className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                     />
//                                                 </FormField>
//                                             </div>
//                                             <FormField label="Emp Code">
//                                                 <input
//                                                     value={edit.emp_code || ""}
//                                                     onChange={(e) => setEdit((x) => ({ ...x, emp_code: e.target.value }))}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>

//                                             <div className="pt-2">
//                                                 <button
//                                                     onClick={onSavePrivate}
//                                                     disabled={saving}
//                                                     className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
//                                                 >
//                                                     {saving ? "Saving…" : "Save Bank Details"}
//                                                 </button>
//                                             </div>
//                                         </SectionCard>
//                                     </div>
//                                 )}

//                                 {tab === "salary" && canSeeSalaryTab && (
//                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                         <SectionCard title="Salary Info (read-only)">
//                                             <Row k="Monthly Wage" value={fmtMoney(salaryInfo.monthly_wage)} />
//                                             <Row k="Basic Salary" value={fmtMoney(salaryInfo.basic_salary)} />
//                                             <Row k="House Rent Allowance" value={fmtMoney(salaryInfo.hra)} />
//                                             <Row k="Standard Allowance" value={fmtMoney(salaryInfo.standard_allowance)} />
//                                             <Row k="Performance Bonus" value={fmtMoney(salaryInfo.performance_bonus)} />
//                                             <Row k="Leave Travel Allowance" value={fmtMoney(salaryInfo.leave_travel_allowance)} />
//                                             <Row k="Fixed Allowance" value={fmtMoney(salaryInfo.fixed_allowance)} />
//                                         </SectionCard>

//                                         <SectionCard title="PF & Tax (read-only)">
//                                             <Row k="PF Rate (%)" value={salaryInfo.pf_rate ?? "-"} />
//                                             <Row k="Professional Tax" value={fmtMoney(salaryInfo.professional_tax)} />
//                                             <Row k="Working days / week" value={salaryInfo.working_days_per_week ?? "-"} />
//                                             <Row k="Break time (hrs)" value={salaryInfo.break_time_hours ?? "-"} />
//                                         </SectionCard>
//                                     </div>
//                                 )}

//                                 {tab === "security" && (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <SectionCard title="Change Password">
//                                             <FormField label="Old Password">
//                                                 <input
//                                                     type="password"
//                                                     value={oldPassword}
//                                                     onChange={(e) => setOldPassword(e.target.value)}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <FormField label="New Password">
//                                                 <input
//                                                     type="password"
//                                                     value={newPassword}
//                                                     onChange={(e) => setNewPassword(e.target.value)}
//                                                     className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
//                                                 />
//                                             </FormField>
//                                             <div className="pt-2">
//                                                 <button
//                                                     onClick={onChangePassword}
//                                                     disabled={saving}
//                                                     className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
//                                                 >
//                                                     {saving ? "Updating…" : "Update Password"}
//                                                 </button>
//                                             </div>
//                                         </SectionCard>

//                                         <SectionCard title="Account Details">
//                                             <Row k="Email" value={profile.email} />
//                                             <Row k="Company" value={profile.company?.company_name} />
//                                             <Row k="Role" value={profile.role} />
//                                         </SectionCard>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="text-sm text-rose-600">Failed to load profile.</div>
//                         )}
//                     </section>
//                 </div>
//             </main>

//             {/* Toast */}
//             {toast && (
//                 <div
//                     className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${toast.type === "error"
//                             ? "bg-rose-50 border-rose-200 text-rose-700"
//                             : "bg-emerald-50 border-emerald-200 text-emerald-700"
//                         }`}
//                 >
//                     {toast.msg}
//                 </div>
//             )}
//         </div>
//     );
// }

// /* small presentational helper */
// function FormField({ label, children }) {
//     return (
//         <div className="mb-3">
//             <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//             {children}
//         </div>
//     );
// }

// function fmtMoney(v) {
//     if (v === null || v === undefined || v === "") return "-";
//     const n = Number(v);
//     if (Number.isNaN(n)) return String(v);
//     return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
// }

// src/MyProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

/* ================================
   Config + tiny fetch helper
================================ */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const API = `${API_BASE}/api`;

async function api(path, init = {}) {
  const isForm = init.body instanceof FormData;
  const headers = isForm ? (init.headers || {}) : { "Content-Type": "application/json", ...(init.headers || {}) };
  const res = await fetch(`${API}${path}`, { credentials: "include", headers, ...init });
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
export default function MyProfile() {
  const nav = useNavigate();
  const { id: routeId } = useParams(); // optional

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // who are we viewing?
  const [targetId, setTargetId] = useState(null);
  const [viewingOther, setViewingOther] = useState(false);

  // profile + salary slices
  const [profile, setProfile] = useState(null);          // identity + private/bank (and sometimes salary if Admin)
  const [salaryInfo, setSalaryInfo] = useState(null);    // normalized salary block for Admin/Payroll

  // ui state
  const [tab, setTab] = useState("resume");              // resume | private | salary | security
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // editable state (private + bank)
  const [edit, setEdit] = useState({
    // private
    date_of_birth: "", address: "", nationality: "", personal_email: "", gender: "", marital_status: "",
    date_of_joining: "",
    // bank
    account_number: "", bank_name: "", ifsc_code: "", pan_no: "", uan_no: "", emp_code: ""
  });

  // security
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  /* 1) Auth → me */
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        const u = r.user;
        const mine = { id: u.user_id, name: u.name, role: u.role, email: u.email, company: u.company_id };
        setMe(mine);
      } catch (e) {
        nav("/auth");
      }
    })();
  }, [nav]);

  /* 2) Decide target & permissions */
  useEffect(() => {
    if (!me) return;
    const rid = routeId ? Number(routeId) : null;
    const tgt = rid || me.id;
    setTargetId(tgt);
    setViewingOther(Boolean(rid && rid !== me.id));
  }, [me, routeId]);

  /* 3) Load data depending on who/role */
  useEffect(() => {
    if (!me || !targetId) return;

    (async () => {
      setLoading(true);
      try {
        if (!viewingOther) {
          // SELF
          const r = await api("/employee/myprofile");
          setProfile(r.profile);

          // seed edit fields
          const p = r.profile || {};
          setEdit({
            date_of_birth: p.date_of_birth || "",
            address: p.address || "",
            nationality: p.nationality || "",
            personal_email: p.personal_email || "",
            gender: p.gender || "",
            marital_status: p.marital_status || "",
            date_of_joining: p.date_of_joining || p.join_date || "",
            account_number: p.account_number || "",
            bank_name: p.bank_name || "",
            ifsc_code: p.ifsc_code || "",
            pan_no: p.pan_no || "",
            uan_no: p.uan_no || "",
            emp_code: p.emp_code || "",
          });

          // employees don’t see salary; admins seeing self will get salary below via admin path
          if (me.role === "Admin" || me.role === "Payroll") {
            // admins/payroll may want salary for self (optional)
            try {
              const s = await api(`/admin/salary-info/${targetId}`);
              setSalaryInfo(s.salaryInfo || null);
            } catch { /* ignore if blocked */ }
          }
        } else {
          // VIEWING OTHER
          if (me.role === "Admin") {
            // full profile via admin endpoint
            const r = await api(`/admin/employee-profile/${targetId}`);
            const p = r.profile || {};
            setProfile(p);

            setEdit({
              date_of_birth: p.date_of_birth || "",
              address: p.address || "",
              nationality: p.nationality || "",
              personal_email: p.personal_email || "",
              gender: p.gender || "",
              marital_status: p.marital_status || "",
              date_of_joining: p.date_of_joining || p.join_date || "",
              account_number: p.account_number || "",
              bank_name: p.bank_name || "",
              ifsc_code: p.ifsc_code || "",
              pan_no: p.pan_no || "",
              uan_no: p.uan_no || "",
              emp_code: p.emp_code || "",
            });

            // admin can also view/edit salary
            try {
              const s = await api(`/admin/salary-info/${targetId}`);
              setSalaryInfo(s.salaryInfo || null);
            } catch { setSalaryInfo(null); }
          } else if (me.role === "Payroll") {
            // payroll needs a shallow identity for header + salary block
            const base = await api(`/auth/profile/${targetId}`);
            setProfile(base.profile || null);

            const s = await api(`/admin/salary-info/${targetId}`);
            setSalaryInfo(s.salaryInfo || null);

            // ensure non-salary tabs don’t show
            setTab("salary");
          } else {
            // employees cannot open others
            showToast("Not allowed to view other profiles", "error");
            nav("/dashboard");
          }
        }
      } catch (e) {
        showToast(e.message || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [me, targetId, viewingOther, nav]);

  /* ===== Permissions (centralized) ===== */
  const perms = useMemo(() => {
    const role = me?.role;
    const isSelf = !viewingOther;

    return {
      canSeeSalary: role === "Admin" || role === "Payroll",
      canEditSalary: role === "Admin" || role === "Payroll",
      canSeePrivate: true,                                              // everyone sees private block for self; Admin sees others
      canEditPrivate: isSelf ? true : role === "Admin",
      canUploadResume: isSelf,                                          // backend only supports self upload
      canChangePassword: isSelf,                                        // backend only supports self change
      visibleTabs: (() => {
        const list = ["resume", "private", "security"];
        if (role === "Payroll" && viewingOther) return ["salary"];
        if (role === "Employee") return ["resume", "private", "security"];
        // Admin (self or other) and Payroll (self) can see salary too
        if (role === "Admin" || role === "Payroll") return ["resume", "private", "salary", "security"];
        return list;
      })(),
    };
  }, [me, viewingOther]);

  // keep selected tab valid if permissions changed
  useEffect(() => {
    if (!perms.visibleTabs.includes(tab)) setTab(perms.visibleTabs[0]);
  }, [perms, tab]);

  /* ===== Handlers ===== */
  const initials = (name = "") => {
    const parts = (name || "").trim().split(/\s+/);
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  };

  const savePrivate = async () => {
    try {
      setSaving(true);
      if (viewingOther && me.role === "Admin") {
        await api(`/admin/employee-profile/${targetId}`, { method: "PUT", body: JSON.stringify(edit) });
      } else {
        await api("/employee/my-profile", { method: "PUT", body: JSON.stringify(edit) });
      }
      showToast("Profile updated ✅");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file) => {
    if (!file || !perms.canUploadResume) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("resume", file);
      const r = await api("/employee/upload-resume", { method: "POST", body: fd });
      setProfile((p) => ({ ...(p || {}), resume_path: r.resume_url }));
      showToast("Resume uploaded 📄");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async () => {
    if (!perms.canChangePassword) return;
    if (!oldPassword || !newPassword) { showToast("Enter both old & new passwords", "error"); return; }
    try {
      setSaving(true);
      await api("/employee/change-password", { method: "PUT", body: JSON.stringify({ oldPassword, newPassword }) });
      setOldPassword(""); setNewPassword("");
      showToast("Password updated 🔐");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const saveSalary = async () => {
    if (!perms.canEditSalary || !salaryInfo) return;
    try {
      setSaving(true);
      await api(`/admin/salary-info/${targetId}`, { method: "PUT", body: JSON.stringify(salaryInfo) });
      showToast("Salary info saved 💾");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ===== Render ===== */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-purple-600" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">WorkZen</p>
            <p className="text-gray-500 text-xs">My Profile</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
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
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <section className="col-span-12 md:col-span-10">
            {loading ? (
              <div className="text-sm text-gray-500">Loading profile…</div>
            ) : !profile ? (
              <div className="text-sm text-rose-600">Failed to load profile.</div>
            ) : (
              <div className="space-y-6">
                {/* Identity strip */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {initials(profile.name)}
                      </div>
                      {/* little pencil as per sketch (focus first editable) */}
                      <button
                        onClick={() => document.getElementById("first-edit-field")?.focus()}
                        className="absolute -right-1 -bottom-1 h-7 w-7 rounded-full border bg-white hover:bg-gray-50 grid place-items-center"
                        title="Jump to edit"
                      >
                        ✏️
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{profile.name}</p>
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <div>Job Position: {profile.job_position || "-"}</div>
                          <div>Email: {profile.email || "-"}</div>
                          <div>Mobile: {profile.phone || "-"}</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700">
                        <div>Company: {profile.company?.company_name || "-"}</div>
                        <div>Department: {profile.department || "-"}</div>
                        <div>Manager: {profile.Manager ? `${profile.Manager.name} (${profile.Manager.email})` : "-"}</div>
                        <div>Location: {profile.location || "-"}</div>
                      </div>

                      <div className="flex items-start justify-end">
                        <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
                          {perms.visibleTabs.map((t) => (
                            <button
                              key={t}
                              onClick={() => setTab(t)}
                              className={`px-3 py-1.5 text-xs sm:text-sm ${tab === t ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                            >
                              {t === "resume" ? "Resume" : t === "private" ? "Private Info" : t === "salary" ? "Salary Info" : "Security"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                {tab === "resume" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Resume">
                      <p className="text-sm text-gray-600 mb-3">
                        Upload your latest resume (PDF/DOC). A link will appear after upload.
                      </p>

                      {perms.canUploadResume ? (
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => uploadResume(e.target.files?.[0])}
                              disabled={uploading}
                            />
                            <span>{uploading ? "Uploading…" : "Upload Resume"}</span>
                          </label>
                          {profile.resume_path && (
                            <a
                              href={`${API_BASE}${profile.resume_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View current resume
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Only the employee can upload their resume.</div>
                      )}
                    </Card>

                    <Card title="Account">
                      <Row k="Login ID" v={profile.login_id} />
                      <Row k="Role" v={profile.role} />
                      <Row k="Joined" v={profile.date_of_joining || profile.join_date} />
                    </Card>
                  </div>
                )}

                {tab === "private" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Private Info">
                      <Field label="Date of Birth">
                        <input
                          id="first-edit-field"
                          type="date"
                          value={edit.date_of_birth}
                          onChange={(e) => setEdit((x) => ({ ...x, date_of_birth: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <Field label="Residing Address">
                        <textarea
                          value={edit.address}
                          onChange={(e) => setEdit((x) => ({ ...x, address: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <Field label="Nationality">
                        <input
                          value={edit.nationality}
                          onChange={(e) => setEdit((x) => ({ ...x, nationality: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <Field label="Personal Email">
                        <input
                          type="email"
                          value={edit.personal_email}
                          onChange={(e) => setEdit((x) => ({ ...x, personal_email: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Gender">
                          <input
                            value={edit.gender}
                            onChange={(e) => setEdit((x) => ({ ...x, gender: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditPrivate}
                          />
                        </Field>
                        <Field label="Marital Status">
                          <input
                            value={edit.marital_status}
                            onChange={(e) => setEdit((x) => ({ ...x, marital_status: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditPrivate}
                          />
                        </Field>
                      </div>
                      <Field label="Date of Joining">
                        <input
                          type="date"
                          value={edit.date_of_joining}
                          onChange={(e) => setEdit((x) => ({ ...x, date_of_joining: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>

                      <div className="pt-2">
                        <button
                          onClick={savePrivate}
                          disabled={!perms.canEditPrivate || saving}
                          className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
                        >
                          {saving ? "Saving…" : "Save Changes"}
                        </button>
                      </div>
                    </Card>

                    <Card title="Bank Details">
                      <Field label="Account Number">
                        <input
                          value={edit.account_number}
                          onChange={(e) => setEdit((x) => ({ ...x, account_number: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <Field label="Bank Name">
                        <input
                          value={edit.bank_name}
                          onChange={(e) => setEdit((x) => ({ ...x, bank_name: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <Field label="IFSC Code">
                        <input
                          value={edit.ifsc_code}
                          onChange={(e) => setEdit((x) => ({ ...x, ifsc_code: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="PAN No">
                          <input
                            value={edit.pan_no}
                            onChange={(e) => setEdit((x) => ({ ...x, pan_no: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditPrivate}
                          />
                        </Field>
                        <Field label="UAN No">
                          <input
                            value={edit.uan_no}
                            onChange={(e) => setEdit((x) => ({ ...x, uan_no: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditPrivate}
                          />
                        </Field>
                      </div>
                      <Field label="Emp Code">
                        <input
                          value={edit.emp_code}
                          onChange={(e) => setEdit((x) => ({ ...x, emp_code: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          disabled={!perms.canEditPrivate}
                        />
                      </Field>

                      <div className="pt-2">
                        <button
                          onClick={savePrivate}
                          disabled={!perms.canEditPrivate || saving}
                          className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
                        >
                          {saving ? "Saving…" : "Save Bank Details"}
                        </button>
                      </div>
                    </Card>
                  </div>
                )}

                {tab === "salary" && perms.canSeeSalary && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title={`Salary Info ${perms.canEditSalary ? "" : "(read-only)"}`}>
                      <MoneyRow
                        label="Monthly Wage"
                        value={salaryInfo?.monthly_wage}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), monthly_wage: v }))}
                        editable={perms.canEditSalary}
                      />
                      <MoneyRow label="Basic Salary"
                        value={salaryInfo?.basic_salary}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), basic_salary: v }))}
                        editable={perms.canEditSalary}
                      />
                      <MoneyRow label="House Rent Allowance"
                        value={salaryInfo?.hra}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), hra: v }))}
                        editable={perms.canEditSalary}
                      />
                      <MoneyRow label="Standard Allowance"
                        value={salaryInfo?.standard_allowance}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), standard_allowance: v }))}
                        editable={perms.canEditSalary}
                      />
                      <MoneyRow label="Performance Bonus"
                        value={salaryInfo?.performance_bonus}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), performance_bonus: v }))}
                        editable={perms.canEditSalary}
                      />
                      <MoneyRow label="Leave Travel Allowance"
                        value={salaryInfo?.leave_travel_allowance}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), leave_travel_allowance: v }))}
                        editable={perms.canEditSalary}
                      />
                      <MoneyRow label="Fixed Allowance"
                        value={salaryInfo?.fixed_allowance}
                        onChange={(v) => setSalaryInfo((s) => ({ ...(s || {}), fixed_allowance: v }))}
                        editable={perms.canEditSalary}
                      />

                      <div className="pt-3">
                        <button
                          onClick={saveSalary}
                          disabled={!perms.canEditSalary || saving}
                          className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
                        >
                          {saving ? "Saving…" : "Save Salary"}
                        </button>
                      </div>
                    </Card>

                    <Card title="PF & Tax">
                      <GridTwo>
                        <Field label="PF Rate (%)">
                          <input
                            type="number"
                            step="0.01"
                            value={salaryInfo?.pf_rate ?? ""}
                            onChange={(e) => setSalaryInfo((s) => ({ ...(s || {}), pf_rate: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditSalary}
                          />
                        </Field>
                        <Field label="Professional Tax">
                          <input
                            type="number"
                            step="0.01"
                            value={salaryInfo?.professional_tax ?? ""}
                            onChange={(e) => setSalaryInfo((s) => ({ ...(s || {}), professional_tax: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditSalary}
                          />
                        </Field>
                        <Field label="Working days / week">
                          <input
                            type="number"
                            value={salaryInfo?.working_days_per_week ?? ""}
                            onChange={(e) => setSalaryInfo((s) => ({ ...(s || {}), working_days_per_week: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditSalary}
                          />
                        </Field>
                        <Field label="Break time (hrs)">
                          <input
                            type="number"
                            step="0.25"
                            value={salaryInfo?.break_time_hours ?? ""}
                            onChange={(e) => setSalaryInfo((s) => ({ ...(s || {}), break_time_hours: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            disabled={!perms.canEditSalary}
                          />
                        </Field>
                      </GridTwo>
                    </Card>
                  </div>
                )}

                {tab === "security" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Change Password">
                      {perms.canChangePassword ? (
                        <>
                          <Field label="Old Password">
                            <input
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            />
                          </Field>
                          <Field label="New Password">
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                            />
                          </Field>
                          <div className="pt-2">
                            <button
                              onClick={changePassword}
                              disabled={saving}
                              className="rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
                            >
                              {saving ? "Updating…" : "Update Password"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Only the employee can change their own password.
                        </div>
                      )}
                    </Card>

                    <Card title="Account Details">
                      <Row k="Email" v={profile.email} />
                      <Row k="Company" v={profile.company?.company_name} />
                      <Row k="Role" v={profile.role} />
                    </Card>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow border ${
            toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ================================
   Little presentational helpers
================================ */
function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
      <p className="font-semibold text-gray-900 mb-3">{title}</p>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
function GridTwo({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
function Row({ k, v }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="w-40 text-sm text-gray-500">{k}</span>
      <span className="flex-1 text-sm font-medium text-gray-900">{v ?? "-"}</span>
    </div>
  );
}
function MoneyRow({ label, value, onChange, editable }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-700">{label}</span>
        {editable ? (
          <input
            type="number"
            step="0.01"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-44 rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-right"
          />
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {value === null || value === undefined || value === "" ? "-" : Number(value).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  );
}
