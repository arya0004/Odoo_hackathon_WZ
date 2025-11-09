import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

/* ------------------------------------------------
   API helper (same as other pages)
------------------------------------------------ */
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

/* ------------------------------------------------
   Role helpers
------------------------------------------------ */
const ROLE_OPTIONS = ["Admin", "HR", "Payroll", "Employee"];
const roleBadge = (r) =>
  ({
    Admin: "bg-purple-600 text-white",
    HR: "bg-purple-100 text-purple-700",
    Payroll: "bg-amber-100 text-amber-800",
    Employee: "bg-gray-100 text-gray-700",
  }[r] || "bg-gray-100 text-gray-700");

/* ------------------------------------------------
   SETTINGS PAGE (Admin only)
------------------------------------------------ */
export default function SettingsPage() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [busyRow, setBusyRow] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  // 1) Auth gate — Admin only
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/auth/isAuth");
        const u = r.user;
        if (u.role !== "Admin") {
          showToast("Only Admins can access Settings", "error");
          nav("/");
          return;
        }
        setMe(u);
      } catch {
        nav("/auth");
      }
    })();
  }, [nav]);

  // 2) Fetch users (admin’s company)
  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        const r = await api("/admin/settings/users");
        setUsers(r.employees || []);
      } catch (e) {
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [me]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.login_id || "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  // 3) Update role (optimistic)
  const updateRole = async (user_id, newRole) => {
    const prev = users.slice();
    const idx = prev.findIndex((u) => u.user_id === user_id);
    if (idx < 0) return;

    setBusyRow(user_id);
    const next = prev.slice();
    next[idx] = { ...next[idx], role: newRole };
    setUsers(next);

    try {
      await api(`/admin/settings/update-role/${user_id}`, {
        method: "PUT",
        body: JSON.stringify({ newRole }),
      });
      showToast("Role updated");
    } catch (e) {
      // rollback on error
      setUsers(prev);
      showToast(e.message, "error");
    } finally {
      setBusyRow(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading settings…</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-purple-600" />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">WorkZen</p>
            <p className="text-gray-500 text-xs">Admin Settings</p>
          </div>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs px-3 py-1">
            {me?.role}
          </span>
        </div>
      </header>

      {/* Content grid with left nav */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left panel (same style as other pages) */}
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
                      isActive
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "hover:bg-gray-50"
                    }`
                  }
                  end={item.to === "/dashboard"}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main section */}
          <section className="col-span-12 md:col-span-10">
            {/* Title + search */}
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">User Settings</h2>
              <p className="text-xs text-gray-500">
                Assign access rights by role for each module.
              </p>
              <div className="ml-auto">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, login id, email, role"
                  className="w-full md:w-80 rounded-xl border border-purple-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 rounded-2xl border border-purple-200 overflow-hidden bg-white shadow-sm">
              <div className="border-b border-purple-100 bg-purple-50/60 px-4 py-2.5">
                <div className="grid grid-cols-12 text-xs font-semibold text-purple-800">
                  <div className="col-span-4">User name</div>
                  <div className="col-span-3">Login id</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2 text-right">Role</div>
                </div>
              </div>

              <ul className="divide-y divide-purple-100">
                {filtered.map((u) => (
                  <li key={u.user_id} className="px-4 py-3">
                    <div className="grid grid-cols-12 items-center gap-2">
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                          {initials(u.name)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {u.name}
                          </div>
                          <div className="text-xs text-gray-500">{u.user_id}</div>
                        </div>
                      </div>

                      <div className="col-span-3 text-sm text-gray-700">
                        {u.login_id || "—"}
                      </div>

                      <div className="col-span-3 text-sm text-gray-700 truncate">
                        {u.email}
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-full ${roleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>

                        <select
                          disabled={busyRow === u.user_id}
                          value={u.role}
                          onChange={(e) => updateRole(u.user_id, e.target.value)}
                          className="ml-2 rounded-lg border border-purple-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </li>
                ))}

                {filtered.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm text-gray-500">
                    No users found.
                  </li>
                )}
              </ul>
            </div>

            {/* Helper text */}
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>
                Access rights are controlled by role. Changing a user’s role updates
                what they can see in Employees, Attendance, Time Off, Payroll, Reports,
                and Settings.
              </p>
            </div>
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

/* ---------- small helpers ---------- */
function initials(name = "") {
  const n = (name || "").trim().split(/\s+/);
  return ((n[0]?.[0] || "") + (n[1]?.[0] || "")).toUpperCase();
}
