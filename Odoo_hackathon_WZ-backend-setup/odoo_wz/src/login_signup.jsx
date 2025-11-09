// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// /**
//  * WorkZenAuth.jsx (aligned to /api/auth/*)
//  * Env: VITE_API_BASE=http://localhost:5000
//  * Requires TailwindCSS.
//  */

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api/auth`; // matches your server mount
// const DEFAULT_ROLE = "Admin"; // 👈 everyone who signs up becomes Admin

// export default function WorkZenAuth() {
//   // which tab to open (signin/signup) based on navigation state
//   const { state } = useLocation();
//   const initialMode = state?.mode === "signup" ? "signup" : "signin";
//   const [mode, setMode] = useState(initialMode);

//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [showPwd, setShowPwd] = useState(false);
//   const [toast, setToast] = useState(null);

//   // shared
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);

//   // signup-only
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [company, setCompany] = useState("");

//   const showToast = (type, message) => {
//     setToast({ type, message });
//     setTimeout(() => setToast(null), 4500);
//   };

//   const handleSignin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/loginUser`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Login failed");

//       showToast("success", `Welcome back! Role: ${data.role}`);

//       // OPTIONAL extra fetch
//       try {
//         const me = await fetch(`${API}/isAuth`, { credentials: "include" }).then((r) => r.json());
//         console.log("User data:", me);
//       } catch {}

//       // redirect to dashboard
//       setTimeout(() => navigate("/dashboard"), 300);
//     } catch (err) {
//       showToast("error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const payload = {
//         company_name: company,
//         name,
//         email,
//         phone,
//         password,
//         role: DEFAULT_ROLE, // 👈 force Admin on backend
//       };

//       // 1) Register
//       const res = await fetch(`${API}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Registration failed");

//       // 2) Auto-login (sets cookie)
//       const loginRes = await fetch(`${API}/loginUser`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });
//       const loginData = await loginRes.json();
//       if (!loginRes.ok) throw new Error(loginData?.message || "Auto-login failed");

//       showToast("success", "Account created ✅ Redirecting…"); // ✅ fixed argument order
//       setTimeout(() => navigate("/dashboard"), 300);
//     } catch (err) {
//       showToast("error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
//       {/* Top purple wave */}
//       <div className="pointer-events-none absolute top-0 left-0 right-0">
//         <TopWave />
//       </div>

//       {/* Bottom purple wave (mirrored) */}
//       <div className="pointer-events-none absolute bottom-0 left-0 right-0 rotate-180">
//         <TopWave />
//       </div>

//       {/* BIG centered white card */}
//       <div className="relative w-full max-w-5xl">
//         <div className="rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5 p-8 md:p-12 lg:p-16">
//           {/* Header */}
//           <div className="mb-8 text-center">
//             <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 px-4 py-1 text-xs font-semibold">
//               WorkZen
//             </span>
//             <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
//               {mode === "signin" ? "Hello!" : "Create Account"}
//             </h2>
//             <p className="text-sm md:text-base text-gray-500 mt-2">
//               {mode === "signin"
//                 ? "Sign in to your WorkZen account"
//                 : "Join WorkZen to manage your team"}
//             </p>
//             {mode === "signup" && (
//               <p className="mt-2 text-xs text-gray-400">
//                 (All new accounts are created as <span className="font-semibold text-gray-600">Admin</span>)
//               </p>
//             )}
//           </div>

//           {/* Form — larger controls */}
//           <form
//             onSubmit={mode === "signin" ? handleSignin : handleSignup}
//             className="mx-auto w-full max-w-2xl space-y-5"
//           >
//             {mode === "signup" && (
//               <>
//                 <Input
//                   icon={<EnvelopeIcon />}
//                   placeholder="Full name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="py-4 text-base"
//                 />
//                 <Input
//                   icon={<BuildingIcon />}
//                   placeholder="Company name"
//                   value={company}
//                   onChange={(e) => setCompany(e.target.value)}
//                   required
//                   className="py-4 text-base"
//                 />
//                 <Input
//                   icon={<PhoneIcon />}
//                   type="tel"
//                   placeholder="Phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="py-4 text-base"
//                 />
//               </>
//             )}

//             <Input
//               icon={<MailIcon />}
//               type="email"
//               placeholder="E-mail"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="py-4 text-base"
//             />

//             <Input
//               icon={<LockIcon />}
//               type={showPwd ? "text" : "password"}
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="py-4 text-base"
//               trailing={
//                 <button
//                   type="button"
//                   className="px-2 text-gray-400 hover:text-gray-700"
//                   onClick={() => setShowPwd((s) => !s)}
//                 >
//                   {showPwd ? <EyeOffIcon /> : <EyeIcon />}
//                 </button>
//               }
//             />

//             {mode === "signin" && (
//               <div className="flex items-center justify-between text-sm">
//                 <label className="inline-flex items-center gap-2 select-none">
//                   <input
//                     type="checkbox"
//                     className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                     checked={remember}
//                     onChange={(e) => setRemember(e.target.checked)}
//                   />
//                   <span className="text-gray-600">Remember me</span>
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => alert("Password reset flow coming soon")}
//                   className="text-purple-600 hover:text-purple-700 font-medium"
//                 >
//                   Forgot password?
//                 </button>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 text-base"
//             >
//               {loading ? "Please wait…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
//             </button>

//             <p className="text-center text-sm text-gray-600 pt-2">
//               {mode === "signin" ? (
//                 <>
//                   Don’t have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => setMode("signup")}
//                     className="text-purple-600 font-semibold hover:underline"
//                   >
//                     Create
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Already have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => setMode("signin")}
//                     className="text-purple-600 font-semibold hover:underline"
//                   >
//                     Sign in
//                   </button>
//                 </>
//               )}
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Toast */}
//       {toast && (
//         <div
//           className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl border ${
//             toast.type === "success"
//               ? "bg-emerald-50 border-emerald-200 text-emerald-700"
//               : "bg-rose-50 border-rose-200 text-rose-700"
//           }`}
//         >
//           {toast.message}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ----------------------------- UI Primitives ----------------------------- */

// function Input({ icon, trailing, className = "", ...props }) {
//   return (
//     <div className="relative">
//       <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
//         <div className="w-5 h-5 text-purple-600">{icon}</div>
//       </div>
//       <input
//         {...props}
//         className={`w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-12 py-3 text-gray-800 shadow-[0_8px_24px_-12px_rgba(99,102,241,0.25)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 placeholder-gray-400 ${className}`}
//       />
//       {trailing && (
//         <div className="absolute right-2 top-1/2 -translate-y-1/2">
//           {trailing}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ------------------------------- SVG Shapes ------------------------------ */
// function TopWave() {
//   return (
//     <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
//       <path
//         d="M0,96L60,85.3C120,75,240,53,360,42.7C480,32,600,32,720,53.3C840,75,960,117,1080,117.3C1200,117,1320,75,1380,53.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
//         fill="url(#g0)"
//       />
//       <defs>
//         <linearGradient id="g0" x1="0" x2="1">
//           <stop offset="0%" stopColor="#7C3AED" />
//           <stop offset="50%" stopColor="#4F46E5" />
//           <stop offset="100%" stopColor="#A21CAF" />
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// }

// /* ------------------------------ Minimal Icons --------------------------- */
// const MailIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M4 6h16v12H4z" />
//     <path d="m22 7-10 7L2 7" />
//   </svg>
// );
// const EnvelopeIcon = MailIcon;
// const BuildingIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M3 21h18" />
//     <path d="M4 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
//     <path d="M9 21V12h2v9" />
//   </svg>
// );
// const PhoneIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" />
//   </svg>
// );
// const LockIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <rect x="3" y="11" width="18" height="11" rx="2" />
//     <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//   </svg>
// );
// const EyeIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
//     <circle cx="12" cy="12" r="3" />
//   </svg>
// );
// const EyeOffIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M3 3l18 18" />
//     <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
//     <path d="M16.24 7.76A10.94 10.94 0 0 1 23 12s-4 8-11 8a10.94 10.94 0 0 1-7.76-3.24" />
//     <path d="M6.35 6.35A10.94 10.94 0 0 1 1 12s4 8 11 8c1.7 0 3.3-.35 4.76-.98" />
//   </svg>
// );
// const SparkleIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
//     <path d="M12 2l1.8 4.5L18 8l-4.2 1.5L12 14l-1.8-4.5L6 8l4.2-1.5L12 2z" />
//   </svg>
// );

// src/login_signup.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * WorkZenAuth.jsx (aligned to /api/auth/* and /api/admin/signup)
 * Env: VITE_API_BASE=http://localhost:5000
 * Requires TailwindCSS.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const AUTH = `${API_BASE}/api/auth`;
const ADMIN = `${API_BASE}/api/admin`;

export default function WorkZenAuth() {
  const { state } = useLocation();
  const initialMode = state?.mode === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState(initialMode);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState(null);

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // signup-only
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${AUTH}/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      showToast("success", `Welcome back! Role: ${data.role}`);
      setTimeout(() => navigate("/dashboard"), 300);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!company) {
      showToast("error", "Please enter your company name");
      return;
    }
    setLoading(true);
    try {
      // 1) Create company + first Admin with logo (multipart)
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("password", password);
      fd.append("company_name", company);
      if (companyLogo) fd.append("company_logo", companyLogo);

      const res = await fetch(`${ADMIN}/signup`, {
        method: "POST",
        credentials: "include",
        body: fd, // <-- multipart/form-data
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Registration failed");

      // 2) Auto-login (sets cookie)
      const loginRes = await fetch(`${AUTH}/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData?.message || "Auto-login failed");

      showToast("success", "Account created ✅ Redirecting…");
      setTimeout(() => navigate("/dashboard"), 300);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const onPickLogo = (file) => {
    setCompanyLogo(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } else {
      setLogoPreview(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
      {/* Top purple wave */}
      <div className="pointer-events-none absolute top-0 left-0 right-0">
        <TopWave />
      </div>
      {/* Bottom purple wave */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 rotate-180">
        <TopWave />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5 p-8 md:p-12 lg:p-16">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 px-4 py-1 text-xs font-semibold">
              WorkZen
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {mode === "signin" ? "Hello!" : "Create Account"}
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              {mode === "signin"
                ? "Sign in to your WorkZen account"
                : "Create your company and first admin"}
            </p>
            {mode === "signup" && (
              <p className="mt-2 text-xs text-gray-400">
                (This will create your <b>Company</b> and your <b>Admin</b> user)
              </p>
            )}
          </div>

          <form
            onSubmit={mode === "signin" ? handleSignin : handleSignup}
            className="mx-auto w-full max-w-2xl space-y-5"
          >
            {mode === "signup" && (
              <>
                <Input
                  icon={<EnvelopeIcon />}
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="py-4 text-base"
                />
                <Input
                  icon={<BuildingIcon />}
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="py-4 text-base"
                />

                {/* Company logo picker */}
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickLogo(e.target.files?.[0])}
                    />
                    <span className="text-sm text-gray-700">Add company logo</span>
                  </label>

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-10 w-10 rounded-md object-cover ring-1 ring-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md grid place-items-center text-xs text-gray-400 ring-1 ring-gray-200">
                      Logo
                    </div>
                  )}
                </div>

                <Input
                  icon={<PhoneIcon />}
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="py-4 text-base"
                />
              </>
            )}

            <Input
              icon={<MailIcon />}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="py-4 text-base"
            />

            <Input
              icon={<LockIcon />}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-4 text-base"
              trailing={
                <button
                  type="button"
                  className="px-2 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowPwd((s) => !s)}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            {mode === "signin" && (
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset flow coming soon")}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 text-base"
            >
              {loading ? "Please wait…" : mode === "signin" ? "SIGN IN" : "CREATE COMPANY & ADMIN"}
            </button>

            <p className="text-center text-sm text-gray-600 pt-2">
              {mode === "signin" ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Create
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- UI Primitives ----------------------------- */

function Input({ icon, trailing, className = "", ...props }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
        <div className="w-5 h-5 text-purple-600">{icon}</div>
      </div>
      <input
        {...props}
        className={`w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-12 py-3 text-gray-800 shadow-[0_8px_24px_-12px_rgba(99,102,241,0.25)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 placeholder-gray-400 ${className}`}
      />
      {trailing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  );
}

/* ------------------------------- SVGs ------------------------------ */
function TopWave() { /* unchanged from your file */ 
  return (
    <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <path d="M0,96L60,85.3C120,75,240,53,360,42.7C480,32,600,32,720,53.3C840,75,960,117,1080,117.3C1200,117,1320,75,1380,53.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" fill="url(#g0)" />
      <defs>
        <linearGradient id="g0" x1="0" x2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#A21CAF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MailIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 6h16v12H4z" /><path d="m22 7-10 7L2 7" /></svg>);
const EnvelopeIcon = MailIcon;
const BuildingIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 21h18" /><path d="M4 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" /><path d="M9 21V12h2v9" /></svg>);
const PhoneIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" /></svg>);
const LockIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const EyeIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
const EyeOffIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 3l18 18" /><path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" /><path d="M16.24 7.76A10.94 10.94 0 0 1 23 12s-4 8-11 8a10.94 10.94 0 0 1-7.76-3.24" /><path d="M6.35 6.35A10.94 10.94 0 0 1 1 12s4 8 11 8c1.7 0 3.3-.35 4.76-.98" /></svg>);


// import React, { useState } from "react";

// import { useLocation, useNavigate } from "react-router-dom";
// //import { useLocation } from "react-router-dom";

// /**
//  * WorkZenAuth.jsx (aligned to /api/auth/*)
//  * Env: VITE_API_BASE=http://localhost:5000
//  * Requires TailwindCSS.
//  */

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api/auth`; // matches your server mount

// export default function WorkZenAuth() {
//   // which tab to open (signin/signup) based on navigation state
//   const { state } = useLocation();
//   const initialMode = state?.mode === "signup" ? "signup" : "signin";
//   const [mode, setMode] = useState(initialMode);

//   const navigate = useNavigate();


//   const [loading, setLoading] = useState(false);
//   const [showPwd, setShowPwd] = useState(false);
//   const [toast, setToast] = useState(null);

//   // shared
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);

//   // signup-only
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [company, setCompany] = useState("");
//   const [role, setRole] = useState("Employee");

//   const showToast = (type, message) => {
//     setToast({ type, message });
//     setTimeout(() => setToast(null), 4500);
//   };


//   const handleSignin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/loginUser`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Login failed");

//       showToast("success", `Welcome back! Role: ${data.role}`);

//       // OPTIONAL extra fetch
//       try {
//         const me = await fetch(`${API}/data`, { credentials: "include" }).then((r) => r.json());
//         console.log("User data:", me);
//       } catch { }

//       // 👇 redirect to dashboard
//       setTimeout(() => navigate("/dashboard"), 300); // small delay to let the toast show
//     } catch (err) {
//       showToast("error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };


//   // const handleSignin = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   try {
//   //     const res = await fetch(`${API}/loginUser`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       credentials: "include",
//   //       body: JSON.stringify({ email, password }),
//   //     });
//   //     const data = await res.json();
//   //     if (!res.ok) throw new Error(data?.message || "Login failed");

//   //     showToast("success", `Welcome back! Role: ${data.role}`);

//   //     // OPTIONAL: fetch user data after login
//   //     try {
//   //       const me = await fetch(`${API}/data`, { credentials: "include" }).then((r) => r.json());
//   //       console.log("User data:", me);
//   //     } catch {}
//   //     // window.location.href = "/dashboard";
//   //   } catch (err) {
//   //     showToast("error", err.message);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//  const handleSignup = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   try {
//     const payload = { company_name: company, name, email, phone, password, role };

//     // 1) Register
//     const res = await fetch(`${API}/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(payload),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data?.message || "Registration failed");

//     // 2) Auto-login (this sets the cookie)
//     const loginRes = await fetch(`${API}/loginUser`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ email, password }),
//     });
//     const loginData = await loginRes.json();
//     if (!loginRes.ok) throw new Error(loginData?.message || "Auto-login failed");

//     showToast("Account created ✅ Redirecting…", "success");

//     // 3) Go to dashboard
//     setTimeout(() => navigate("/dashboard"), 300);
//   } catch (err) {
//     showToast("error", err.message);
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
//       {/* Top purple wave */}
//       <div className="pointer-events-none absolute top-0 left-0 right-0">
//         <TopWave />
//       </div>

//       {/* Bottom purple wave (mirrored) */}
//       <div className="pointer-events-none absolute bottom-0 left-0 right-0 rotate-180">
//         <TopWave />
//       </div>

//       {/* BIG centered white card */}
//       <div className="relative w-full max-w-5xl">
//         <div className="rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5 p-8 md:p-12 lg:p-16">
//           {/* Header */}
//           <div className="mb-8 text-center">
//             <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 px-4 py-1 text-xs font-semibold">
//               WorkZen
//             </span>
//             <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
//               {mode === "signin" ? "Hello!" : "Create Account"}
//             </h2>
//             <p className="text-sm md:text-base text-gray-500 mt-2">
//               {mode === "signin"
//                 ? "Sign in to your WorkZen account"
//                 : "Join WorkZen to manage your team"}
//             </p>
//           </div>

//           {/* Form — larger controls */}
//           <form
//             onSubmit={mode === "signin" ? handleSignin : handleSignup}
//             className="mx-auto w-full max-w-2xl space-y-5"
//           >
//             {mode === "signup" && (
//               <>
//                 <Input
//                   icon={<EnvelopeIcon />}
//                   placeholder="Full name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="py-4 text-base"
//                 />
//                 <Input
//                   icon={<BuildingIcon />}
//                   placeholder="Company name"
//                   value={company}
//                   onChange={(e) => setCompany(e.target.value)}
//                   required
//                   className="py-4 text-base"
//                 />
//                 <Input
//                   icon={<PhoneIcon />}
//                   type="tel"
//                   placeholder="Phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="py-4 text-base"
//                 />
//               </>
//             )}

//             <Input
//               icon={<MailIcon />}
//               type="email"
//               placeholder="E-mail"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="py-4 text-base"
//             />

//             <Input
//               icon={<LockIcon />}
//               type={showPwd ? "text" : "password"}
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="py-4 text-base"
//               trailing={
//                 <button
//                   type="button"
//                   className="px-2 text-gray-400 hover:text-gray-700"
//                   onClick={() => setShowPwd((s) => !s)}
//                 >
//                   {showPwd ? <EyeOffIcon /> : <EyeIcon />}
//                 </button>
//               }
//             />

//             {mode === "signup" ? (
//               <div className="flex items-center gap-3 pt-1">
//                 <label className="text-sm font-medium text-gray-600">Role</label>
//                 <select
//                   className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm px-3 py-2"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                 >
//                   <option>Employee</option>
//                   <option>HR</option>
//                   <option>Admin</option>
//                 </select>
//               </div>
//             ) : (
//               <div className="flex items-center justify-between text-sm">
//                 <label className="inline-flex items-center gap-2 select-none">
//                   <input
//                     type="checkbox"
//                     className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                     checked={remember}
//                     onChange={(e) => setRemember(e.target.checked)}
//                   />
//                   <span className="text-gray-600">Remember me</span>
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => alert("Password reset flow coming soon")}
//                   className="text-purple-600 hover:text-purple-700 font-medium"
//                 >
//                   Forgot password?
//                 </button>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 text-base"
//             >
//               {loading ? "Please wait…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
//             </button>

//             <p className="text-center text-sm text-gray-600 pt-2">
//               {mode === "signin" ? (
//                 <>
//                   Don’t have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => setMode("signup")}
//                     className="text-purple-600 font-semibold hover:underline"
//                   >
//                     Create
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Already have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => setMode("signin")}
//                     className="text-purple-600 font-semibold hover:underline"
//                   >
//                     Sign in
//                   </button>
//                 </>
//               )}
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Toast */}
//       {toast && (
//         <div
//           className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl border ${toast.type === "success"
//               ? "bg-emerald-50 border-emerald-200 text-emerald-700"
//               : "bg-rose-50 border-rose-200 text-rose-700"
//             }`}
//         >
//           {toast.message}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ----------------------------- UI Primitives ----------------------------- */

// function Input({ icon, trailing, className = "", ...props }) {
//   return (
//     <div className="relative">
//       <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
//         <div className="w-5 h-5 text-purple-600">{icon}</div>
//       </div>
//       <input
//         {...props}
//         className={`w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-12 py-3 text-gray-800 shadow-[0_8px_24px_-12px_rgba(99,102,241,0.25)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 placeholder-gray-400 ${className}`}
//       />
//       {trailing && (
//         <div className="absolute right-2 top-1/2 -translate-y-1/2">
//           {trailing}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ------------------------------- SVG Shapes ------------------------------ */
// function TopWave() {
//   return (
//     <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
//       <path
//         d="M0,96L60,85.3C120,75,240,53,360,42.7C480,32,600,32,720,53.3C840,75,960,117,1080,117.3C1200,117,1320,75,1380,53.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
//         fill="url(#g0)"
//       />
//       <defs>
//         <linearGradient id="g0" x1="0" x2="1">
//           <stop offset="0%" stopColor="#7C3AED" />
//           <stop offset="50%" stopColor="#4F46E5" />
//           <stop offset="100%" stopColor="#A21CAF" />
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// }

// /* ------------------------------ Minimal Icons --------------------------- */
// const MailIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M4 6h16v12H4z" />
//     <path d="m22 7-10 7L2 7" />
//   </svg>
// );
// const EnvelopeIcon = MailIcon;
// const BuildingIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M3 21h18" />
//     <path d="M4 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
//     <path d="M9 21V12h2v9" />
//   </svg>
// );
// const PhoneIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" />
//   </svg>
// );
// const LockIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <rect x="3" y="11" width="18" height="11" rx="2" />
//     <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//   </svg>
// );
// const EyeIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
//     <circle cx="12" cy="12" r="3" />
//   </svg>
// );
// const EyeOffIcon = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//     <path d="M3 3l18 18" />
//     <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
//     <path d="M16.24 7.76A10.94 10.94 0 0 1 23 12s-4 8-11 8a10.94 10.94 0 0 1-7.76-3.24" />
//     <path d="M6.35 6.35A10.94 10.94 0 0 1 1 12s4 8 11 8c1.7 0 3.3-.35 4.76-.98" />
//   </svg>
// );
// const SparkleIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
//     <path d="M12 2l1.8 4.5L18 8l-4.2 1.5L12 14l-1.8-4.5L6 8l4.2-1.5L12 2z" />
//   </svg>
// );

