// import React, { useState } from "react";

// /**
//  * WorkZenAuth.jsx (aligned to /api/auth/*)
//  * Env: VITE_API_BASE=http://localhost:5000
//  * Requires TailwindCSS.
//  */

// import { useLocation } from "react-router-dom";




// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// const API = `${API_BASE}/api/auth`; // 👈 matches your server mount

// export default function WorkZenAuth() {

//     const { state } = useLocation();
//     const initialMode = state?.mode === "signup" ? "signup" : "signin";
//     const [mode, setMode] = useState(initialMode);

//     // const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
//     const [loading, setLoading] = useState(false);
//     const [showPwd, setShowPwd] = useState(false);
//     const [toast, setToast] = useState(null);


//     // shared
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [remember, setRemember] = useState(false);

//     // signup-only
//     const [name, setName] = useState("");
//     const [phone, setPhone] = useState("");
//     const [company, setCompany] = useState("");
//     const [role, setRole] = useState("Employee");

//     const showToast = (type, message) => {
//         setToast({ type, message });
//         setTimeout(() => setToast(null), 4500);
//     };

//     const handleSignin = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const res = await fetch(`${API}/loginUser`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 credentials: "include",
//                 body: JSON.stringify({ email, password }),
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data?.message || "Login failed");

//             showToast("success", `Welcome back! Role: ${data.role}`);

//             // OPTIONAL: fetch user data after login
//             try {
//                 const me = await fetch(`${API}/data`, {
//                     credentials: "include",
//                 }).then((r) => r.json());
//                 console.log("User data:", me);
//             } catch { }

//             // redirect to dashboard if you have a route:
//             // window.location.href = "/dashboard";
//         } catch (err) {
//             showToast("error", err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSignup = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const payload = {
//                 company_name: company,
//                 name,
//                 email,
//                 phone,
//                 password,
//                 role,
//             };

//             const res = await fetch(`${API}/register`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 credentials: "include",
//                 body: JSON.stringify(payload),
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data?.message || "Registration failed");

//             showToast(
//                 "success",
//                 `Account created. Login ID: ${data.login_id ?? "generated"}`
//             );
//             setMode("signin");
//         } catch (err) {
//             showToast("error", err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen w-full bg-gradient-to-b from-white to-violet-50 flex items-center justify-center p-4">
//             {/* Card wrapper with soft shadow and glow */}
//             <div className="relative w-full max-w-5xl">
//                 <div className="absolute -inset-3 rounded-3xl bg-purple-500/20 blur-2xl" />
//                 <div className="relative rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
//                     {/* Top purple wave */}
//                     <TopWave />

//                     <div className="grid md:grid-cols-2 gap-0">
//                         {/* Left: Form */}
//                         <div className="p-8 md:p-12">
//                             <div className="mb-6 text-center md:text-left">
//                                 <h2 className="text-3xl font-bold tracking-tight text-gray-900">
//                                     {mode === "signin" ? "Hello!" : "Create Account"}
//                                 </h2>
//                                 <p className="text-sm text-gray-500 mt-1">
//                                     {mode === "signin"
//                                         ? "Sign in to your WorkZen account"
//                                         : "Join WorkZen to manage your team"}
//                                 </p>
//                             </div>

//                             <form
//                                 onSubmit={mode === "signin" ? handleSignin : handleSignup}
//                                 className="space-y-4"
//                             >
//                                 {mode === "signup" && (
//                                     <>
//                                         <Input
//                                             icon={<EnvelopeIcon />}
//                                             placeholder="Full name"
//                                             value={name}
//                                             onChange={(e) => setName(e.target.value)}
//                                             required
//                                         />
//                                         <Input
//                                             icon={<BuildingIcon />}
//                                             placeholder="Company name"
//                                             value={company}
//                                             onChange={(e) => setCompany(e.target.value)}
//                                             required
//                                         />
//                                         <Input
//                                             icon={<PhoneIcon />}
//                                             type="tel"
//                                             placeholder="Phone"
//                                             value={phone}
//                                             onChange={(e) => setPhone(e.target.value)}
//                                         />
//                                     </>
//                                 )}

//                                 <Input
//                                     icon={<MailIcon />}
//                                     type="email"
//                                     placeholder="E-mail"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     required
//                                 />

//                                 <Input
//                                     icon={<LockIcon />}
//                                     type={showPwd ? "text" : "password"}
//                                     placeholder="Password"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     required
//                                     trailing={
//                                         <button
//                                             type="button"
//                                             className="px-2 text-gray-400 hover:text-gray-700"
//                                             onClick={() => setShowPwd((s) => !s)}
//                                         >
//                                             {showPwd ? <EyeOffIcon /> : <EyeIcon />}
//                                         </button>
//                                     }
//                                 />

//                                 {mode === "signup" && (
//                                     <div className="flex items-center gap-3 pt-1">
//                                         <label className="text-sm font-medium text-gray-600">
//                                             Role
//                                         </label>
//                                         <select
//                                             className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm px-3 py-2"
//                                             value={role}
//                                             onChange={(e) => setRole(e.target.value)}
//                                         >
//                                             <option>Employee</option>
//                                             <option>HR</option>
//                                             <option>Admin</option>
//                                         </select>
//                                     </div>
//                                 )}

//                                 {mode === "signin" && (
//                                     <div className="flex items-center justify-between text-sm">
//                                         <label className="inline-flex items-center gap-2 select-none">
//                                             <input
//                                                 type="checkbox"
//                                                 className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                                                 checked={remember}
//                                                 onChange={(e) => setRemember(e.target.checked)}
//                                             />
//                                             <span className="text-gray-600">Remember me</span>
//                                         </label>
//                                         <button
//                                             type="button"
//                                             onClick={() =>
//                                                 alert("Password reset flow coming soon")
//                                             }
//                                             className="text-purple-600 hover:text-purple-700 font-medium"
//                                         >
//                                             Forgot password?
//                                         </button>
//                                     </div>
//                                 )}

//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
//                                 >
//                                     {loading
//                                         ? "Please wait…"
//                                         : mode === "signin"
//                                             ? "SIGN IN"
//                                             : "CREATE ACCOUNT"}
//                                 </button>

//                                 <p className="text-center text-sm text-gray-600 pt-2">
//                                     {mode === "signin" ? (
//                                         <>
//                                             Don’t have an account?{" "}
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setMode("signup")}
//                                                 className="text-purple-600 font-semibold hover:underline"
//                                             >
//                                                 Create
//                                             </button>
//                                         </>
//                                     ) : (
//                                         <>
//                                             Already have an account?{" "}
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setMode("signin")}
//                                                 className="text-purple-600 font-semibold hover:underline"
//                                             >
//                                                 Sign in
//                                             </button>
//                                         </>
//                                     )}
//                                 </p>
//                             </form>
//                         </div>

//                         {/* Right: Welcome / Marketing side */}
//                         <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-fuchsia-600 text-white p-12">
//                             <div className="absolute inset-0 opacity-30">
//                                 <Noise />
//                             </div>
//                             <div className="relative z-10 max-w-sm text-center">
//                                 <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 mb-4 backdrop-blur">
//                                     <SparkleIcon />
//                                     <span className="text-sm font-medium">WorkZen</span>
//                                 </div>
//                                 <h3 className="text-3xl font-bold">Welcome Back!</h3>
//                                 <p className="mt-3 text-white/90 leading-6">
//                                     All your employees on one platform — streamline HR, payroll
//                                     and attendance with a modern, secure dashboard.
//                                 </p>
//                             </div>
//                             {/* Bottom cloud cutout */}
//                             <BottomWave />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Toast */}
//             {toast && (
//                 <div
//                     className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl border ${toast.type === "success"
//                         ? "bg-emerald-50 border-emerald-200 text-emerald-700"
//                         : "bg-rose-50 border-rose-200 text-rose-700"
//                         }`}
//                 >
//                     {toast.message}
//                 </div>
//             )}
//         </div>
//     );
// }

// /* ----------------------------- UI Primitives ----------------------------- */

// function Input({ icon, trailing, className = "", ...props }) {
//     return (
//         <div className="relative">
//             <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
//                 <div className="w-5 h-5 text-purple-600">{icon}</div>
//             </div>
//             <input
//                 {...props}
//                 className={`w-full rounded-2xl border border-gray-200 bg-white/90 pl-12 pr-12 py-3 text-gray-800 shadow-[0_8px_24px_-12px_rgba(99,102,241,0.35)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 placeholder-gray-400 ${className}`}
//             />
//             {trailing && (
//                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
//                     {trailing}
//                 </div>
//             )}
//         </div>
//     );
// }

// /* ------------------------------- SVG Shapes ------------------------------ */
// function TopWave() {
//     return (
//         <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
//             <path
//                 d="M0,96L60,85.3C120,75,240,53,360,42.7C480,32,600,32,720,53.3C840,75,960,117,1080,117.3C1200,117,1320,75,1380,53.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
//                 fill="url(#g0)"
//             />
//             <defs>
//                 <linearGradient id="g0" x1="0" x2="1">
//                     <stop offset="0%" stopColor="#7C3AED" />
//                     <stop offset="50%" stopColor="#4F46E5" />
//                     <stop offset="100%" stopColor="#A21CAF" />
//                 </linearGradient>
//             </defs>
//         </svg>
//     );
// }

// function BottomWave() {
//     return (
//         <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
//             <path
//                 d="M0,32L60,42.7C120,53,240,75,360,85.3C480,96,600,96,720,85.3C840,75,960,53,1080,42.7C1200,32,1320,32,1380,32L1440,32L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
//                 fill="white"
//             />
//         </svg>
//     );
// }

// function Noise() {
//     return (
//         <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
//             <filter id="n" x="0" y="0">
//                 <feTurbulence
//                     type="fractalNoise"
//                     baseFrequency="0.80"
//                     numOctaves="4"
//                     stitchTiles="stitch"
//                 />
//                 <feColorMatrix type="saturate" values="0" />
//                 <feComponentTransfer>
//                     <feFuncA type="table" tableValues="0 0.2" />
//                 </feComponentTransfer>
//             </filter>
//             <rect width="100%" height="100%" filter="url(#n)" />
//         </svg>
//     );
// }

// /* ------------------------------ Minimal Icons --------------------------- */
// const MailIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//         <path d="M4 6h16v12H4z" />
//         <path d="m22 7-10 7L2 7" />
//     </svg>
// );
// const EnvelopeIcon = MailIcon;
// const BuildingIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//         <path d="M3 21h18" />
//         <path d="M4 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
//         <path d="M9 21V12h2v9" />
//     </svg>
// );
// const PhoneIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//         <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" />
//     </svg>
// );
// const LockIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//         <rect x="3" y="11" width="18" height="11" rx="2" />
//         <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
// );
// const EyeIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
//         <circle cx="12" cy="12" r="3" />
//     </svg>
// );
// const EyeOffIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
//         <path d="M3 3l18 18" />
//         <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
//         <path d="M16.24 7.76A10.94 10.94 0 0 1 23 12s-4 8-11 8a10.94 10.94 0 0 1-7.76-3.24" />
//         <path d="M6.35 6.35A10.94 10.94 0 0 1 1 12s4 8 11 8c1.7 0 3.3-.35 4.76-.98" />
//     </svg>
// );
// const SparkleIcon = () => (
//     <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
//         <path d="M12 2l1.8 4.5L18 8l-4.2 1.5L12 14l-1.8-4.5L6 8l4.2-1.5L12 2z" />
//     </svg>
// );
import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
//import { useLocation } from "react-router-dom";

/**
 * WorkZenAuth.jsx (aligned to /api/auth/*)
 * Env: VITE_API_BASE=http://localhost:5000
 * Requires TailwindCSS.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const API = `${API_BASE}/api/auth`; // matches your server mount

export default function WorkZenAuth() {
  // which tab to open (signin/signup) based on navigation state
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
  const [role, setRole] = useState("Employee");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };


  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      showToast("success", `Welcome back! Role: ${data.role}`);

      // OPTIONAL extra fetch
      try {
        const me = await fetch(`${API}/data`, { credentials: "include" }).then((r) => r.json());
        console.log("User data:", me);
      } catch { }

      // 👇 redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 300); // small delay to let the toast show
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };


  // const handleSignin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${API}/loginUser`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({ email, password }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data?.message || "Login failed");

  //     showToast("success", `Welcome back! Role: ${data.role}`);

  //     // OPTIONAL: fetch user data after login
  //     try {
  //       const me = await fetch(`${API}/data`, { credentials: "include" }).then((r) => r.json());
  //       console.log("User data:", me);
  //     } catch {}
  //     // window.location.href = "/dashboard";
  //   } catch (err) {
  //     showToast("error", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

 const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const payload = { company_name: company, name, email, phone, password, role };

    // 1) Register
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Registration failed");

    // 2) Auto-login (this sets the cookie)
    const loginRes = await fetch(`${API}/loginUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData?.message || "Auto-login failed");

    showToast("Account created ✅ Redirecting…", "success");

    // 3) Go to dashboard
    setTimeout(() => navigate("/dashboard"), 300);
  } catch (err) {
    showToast("error", err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
      {/* Top purple wave */}
      <div className="pointer-events-none absolute top-0 left-0 right-0">
        <TopWave />
      </div>

      {/* Bottom purple wave (mirrored) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 rotate-180">
        <TopWave />
      </div>

      {/* BIG centered white card */}
      <div className="relative w-full max-w-5xl">
        <div className="rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5 p-8 md:p-12 lg:p-16">
          {/* Header */}
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
                : "Join WorkZen to manage your team"}
            </p>
          </div>

          {/* Form — larger controls */}
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

            {mode === "signup" ? (
              <div className="flex items-center gap-3 pt-1">
                <label className="text-sm font-medium text-gray-600">Role</label>
                <select
                  className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm px-3 py-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>Employee</option>
                  <option>HR</option>
                  <option>Admin</option>
                </select>
              </div>
            ) : (
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
              {loading ? "Please wait…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl border ${toast.type === "success"
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
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {trailing}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- SVG Shapes ------------------------------ */
function TopWave() {
  return (
    <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0,96L60,85.3C120,75,240,53,360,42.7C480,32,600,32,720,53.3C840,75,960,117,1080,117.3C1200,117,1320,75,1380,53.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        fill="url(#g0)"
      />
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

/* ------------------------------ Minimal Icons --------------------------- */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M4 6h16v12H4z" />
    <path d="m22 7-10 7L2 7" />
  </svg>
);
const EnvelopeIcon = MailIcon;
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M3 21h18" />
    <path d="M4 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
    <path d="M9 21V12h2v9" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M3 3l18 18" />
    <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
    <path d="M16.24 7.76A10.94 10.94 0 0 1 23 12s-4 8-11 8a10.94 10.94 0 0 1-7.76-3.24" />
    <path d="M6.35 6.35A10.94 10.94 0 0 1 1 12s4 8 11 8c1.7 0 3.3-.35 4.76-.98" />
  </svg>
);
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l1.8 4.5L18 8l-4.2 1.5L12 14l-1.8-4.5L6 8l4.2-1.5L12 2z" />
  </svg>
);
