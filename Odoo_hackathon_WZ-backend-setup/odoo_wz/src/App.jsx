// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import { Routes, Route, Link } from "react-router-dom";
// import WorkZenAuth from "./login_signup.jsx"; // file is login_signup.jsx
// import Dashboard from './dashboard.jsx';
// import AttendancePage from "./attendance.jsx";


// export default function App() {
//   return (
//     // <Routes>
//     //   <Route path="/" element={<Home />} />       {/* your current homepage UI is already rendered */}
//     //   <Route path="/auth" element={<WorkZenAuth />} />
//     //   <Route path="/attendance" element={<AttendancePage />} />
//     //   <Route path="/dashboard" element={<Dashboard />} />
//     //   {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
//     // </Routes>
//     <Routes>
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//       <Route path="/auth" element={<WorkZenAuth />} />

//       {/* Shared shell with left panel */}
//       <Route element={<Layout />}>
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/attendance" element={<AttendancePage />} />
//         {/* add others later */}
//       </Route>

//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>

//   );

// }

// import React from "react";
// import { Routes, Route, Link, Navigate } from "react-router-dom";
// import WorkZenAuth from "./login_signup.jsx";
// import Dashboard from "./dashboard.jsx";
// import AttendancePage from "./attendance.jsx";
// import "./App.css";
// import TimeOffPage from "./timeoff.jsx";
// // import { Routes, Route, Link, Navigate } from "react-router-dom"; // <- ensure Navigate is imported


// // ✅ Combined Shell — Dashboard acts as Layout
// export default function App() {
//   return (
//     <Routes>
//       {/* Default route redirects to dashboard */}
//       <Route path="/" element={<Navigate to="/Home" replace />} />

//       {/* Auth pages (no sidebar) */}
//       <Route path="/auth" element={<WorkZenAuth />} />

//       {/* ✅ Shared layout: dashboard contains sidebar */}
//       <Route path="/dashboard" element={<Dashboard />} />
//       <Route path="/attendance" element={<AttendancePage />} />
//       <Route path="/timeoff" element={<TimeOffPage />} />   {/* NEW */}

//       {/* Catch-all */}
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// }

// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import WorkZenAuth from "./login_signup.jsx";
// import Dashboard from "./dashboard.jsx";
// import AttendancePage from "./attendance.jsx";
// import TimeOffPage from "./timeoff.jsx";
// import "./App.css";
// import Home from "./home.jsx"; // 💡 Move your Home component into its own file\
// import PayrollPage from "./payroll.jsx";
// import SettingsPage from "./settings.jsx";
// import MyProfile from "./MyProfile.jsx";
// // OR keep it inline (see below)

// export default function App() {
//   return (
//     <Routes>
//       {/* ✅ 1. Home page (root route) */}
//       <Route path="/" element={<Home />} />

//       {/* ✅ 2. Auth page */}
//       <Route path="/auth" element={<WorkZenAuth />} />

//       {/* ✅ 3. Dashboard pages */}
//       <Route path="/dashboard" element={<Dashboard />} />
//       <Route path="/attendance" element={<AttendancePage />} />
//       <Route path="/timeoff" element={<TimeOffPage />} />
//       <Route path="/payroll" element={<PayrollPage />} />
//       <Route path="/settings" element={<SettingsPage />} />
//       <Route path="/profile/:id" element={<MyProfile />} />

//       {/* ✅ 4. Catch-all redirect */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }



import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import WorkZenAuth from "./login_signup.jsx";
import Dashboard from "./dashboard.jsx";
import AttendancePage from "./attendance.jsx";
import TimeOffPage from "./timeoff.jsx";
import PayrollPage from "./payroll.jsx";
import SettingsPage from "./settings.jsx";
import MyProfile from "./MyProfile.jsx";
import Home from "./home.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function RequireAuth({ children }) {
  const [ok, setOk] = useState(null); // null = loading, true/false = decided
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/isAuth`, {
          credentials: "include",
        });
        setOk(res.ok);
      } catch {
        setOk(false);
      }
    })();
  }, [loc.pathname]);

  if (ok === null) return null; // or a spinner
  if (!ok) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<WorkZenAuth />} />
      <Route path="/" element={<Home />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/attendance"
        element={
          <RequireAuth>
            <AttendancePage />
          </RequireAuth>
        }
      />
      <Route
        path="/timeoff"
        element={
          <RequireAuth>
            <TimeOffPage />
          </RequireAuth>
        }
      />
      <Route
        path="/payroll"
        element={
          <RequireAuth>
            <PayrollPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />

      <Route
        path="/profile/:id"
        element={
          <RequireAuth>
            <MyProfile />
          </RequireAuth>
        }
      />  {/* admin views any employee */}

      <Route
        path="/profile"
        element={<MyProfile />}  
      />
    

      {/* Catch-all */ }
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes >
  );
}
