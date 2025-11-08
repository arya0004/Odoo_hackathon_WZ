import React from "react";
import { Link } from "react-router-dom";

// export default function Home() {
//   return (
//     // … your big <main> JSX …
//   );
// }
export default function Home() {
    return (
        <main
            className="relative min-h-screen overflow-hidden bg-white text-gray-900"
            style={{ colorScheme: "light" }}
        >
            {/* NAV — minimal and airy */}
            <header className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* <span className="inline-block h-8 w-8 rounded-xl bg-purple-700" /> */}
                    <span className="font-brand text-xl tracking-tight text-purple-700">
                        WorkZen
                    </span>
                </div>
                {/* <div className="flex items-center gap-3">
          <a
            href="#login"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 transition shadow-sm"
          >
            Login
          </a>
          <a
            href="#signup"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2 text-sm font-semibold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition"
          >
            Sign up
          </a>
        </div> */}

                <div className="flex items-center gap-3">
                    <Link
                        to="/auth"
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-2 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 transition shadow-sm"
                    >
                        Login
                    </Link>
                    <Link
                        to="/auth"
                        state={{ mode: "signup" }}  // open with Signup tab selected
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-2 text-sm font-semibold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition"
                    >
                        Sign up
                    </Link>
                </div>

            </header>

            {/* Soft arc background like Odoo */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[46vh]">
                <svg viewBox="0 0 1440 460" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,320 C250,420 1190,420 1440,320 L1440,460 L0,460 Z" fill="#F6F7FB" />
                </svg>
            </div>

            {/* Glow accents */}
            <div className="pointer-events-none absolute -top-20 -right-24 h-64 w-64 rounded-full bg-purple-200 blur-3xl opacity-70 -z-10" />
            <div className="pointer-events-none absolute -top-10 left-24 h-40 w-40 rounded-full bg-yellow-300 blur-3xl opacity-60 -z-10" />

            {/* HERO */}
            <section className="mx-auto max-w-5xl px-6 pt-10 pb-16 text-center">
                {/* Brand for mobile */}
                <div className="sm:hidden inline-flex items-center gap-2 mb-6 justify-center">
                    <span className="inline-block h-8 w-8 rounded-xl bg-purple-700" />
                    <span className="font-brand text-purple-700">WorkZen</span>
                </div>


                {/* Handwritten hero title */}
                <h1 className="font-hand font-black text-[38px] sm:text-[56px] lg:text-[72px] leading-[1.05] text-gray-900 mx-auto max-w-4xl">
                    <span className="block">All your employees on</span>
                    <span className="relative inline-block mt-1">
                        <span className="relative z-10">one</span>
                        <span className="absolute -inset-y-1 -right-2 left-3 -z-10 rounded-[18px] bg-yellow-300"></span>
                        <span className="relative z-10 ml-2">platform</span>
                    </span>
                </h1>

                {/* Tagline */}
                <p className="mt-4 font-hand font-semibold text-[26px] sm:text-[30px] text-gray-800 [font-style:oblique_10deg]">
                    Simplifying HR Operations for Smarter Workplaces
                </p>


                {/* Centered CTAs
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#login"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 transition shadow-sm"
          >
            Login
          </a>
          <a
            href="#signup"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition"
          >
            Sign up
          </a>
        </div> */}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/auth"
                        className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 transition shadow-sm"
                    >
                        Login
                    </Link>
                    <Link
                        to="/auth"
                        state={{ mode: "signup" }}   // 👈 open on signup tab
                        className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition"
                    >
                        Sign up
                    </Link>
                </div>
            </section>

            {/* CONTENT: replace tiles with your problem brief */}
            <section className="mx-auto max-w-6xl px-6 pb-20">
                {/* Intro strip */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="font-display text-2xl md:text-3xl text-gray-900">WorkZen</h2>
                    <p className="text-sm uppercase tracking-wide text-purple-700 font-semibold mt-1">
                        Smart Human Resource Management System
                    </p>
                    <p className="mt-4 text-gray-700 leading-relaxed">
                        WorkZen modernizes how organizations manage people, processes, and payroll with a clean,
                        reliable HRMS. It enables employees and administrators to collaborate on attendance,
                        leave, payroll and analytics from a unified interface—reducing manual work, improving
                        transparency, and empowering data-driven decisions for startups, institutions and SMEs.
                    </p>
                </div>

                {/* 3-up summary cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card
                        title="The Challenge"
                        body="Build a working HRMS that feels delightful yet robust—covering core flows from user access to attendance, leave and payroll—so teams can run HR operations smoothly."
                    />
                    <Card
                        title="Vision & Mission"
                        body="Deliver a scalable, thoughtfully engineered HR platform that’s simple for employees and powerful for admins—so organizations can focus on people, not paperwork."
                    />
                    <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-display text-lg text-gray-900">Problem Statement</h3>
                        <ul className="mt-3 text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li><b>User & Role</b>: registration, login, profiles; roles for Employee / HR Officer / Admin / Payroll Officer.</li>
                            <li><b>Attendance & Leave</b>: mark attendance, daily/monthly logs; leave apply/approve/reject.</li>
                            <li><b>Payroll</b>: salary breakdown, deductions, payout summary; generate/edit monthly reports & payslips.</li>
                            <li><b>Dashboard</b>: summaries & charts for attendance, leaves, payroll; admin overview.</li>
                        </ul>
                    </div>
                </div>

                {/* Roles grid */}
                <h3 className="mt-10 font-display text-xl text-gray-900">Roles & Responsibilities</h3>
                <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Role
                        name="Admin"
                        bullets={[
                            "Manage accounts & roles",
                            "Full CRUD across modules",
                            "Oversee system operations",
                        ]}
                    />
                    <Role
                        name="Employee"
                        bullets={[
                            "Apply for time-off",
                            "View attendance & records",
                            "Directory access (read-only)",
                        ]}
                    />
                    <Role
                        name="HR Officer"
                        bullets={[
                            "Create/update employee profiles",
                            "Monitor attendance for all",
                            "Allocate & manage leaves",
                        ]}
                    />
                    <Role
                        name="Payroll Officer"
                        bullets={[
                            "Approve/reject time-off",
                            "Generate payslips & reports",
                            "Manage salary information",
                        ]}
                    />
                </div>

                {/* Terminologies (compact) */}
                <h3 className="mt-10 font-display text-xl text-gray-900">Key Terminologies</h3>
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                    {[
                        ["Payroll", "Calculating and distributing employee earnings and deductions per period."],
                        ["Payrun", "A payroll cycle where salaries are processed based on attendance and leaves."],
                        ["Payslip", "Breakdown of earnings, deductions, net pay—issued after processing."],
                        ["Time-Off", "Approved leave (vacation, sick, personal) counted in payroll."],
                        ["Wage", "Compensation for work—based on hours/attendance and leaves."],
                        ["PF Contribution", "Employer/employee contributions (e.g., 12%) of basic salary for retirement."],
                        ["Professional Tax", "State tax deducted monthly from gross salary."],
                    ].map(([term, def]) => (
                        <div key={term} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                            <p className="text-purple-700 font-semibold">{term}</p>
                            <p className="text-sm text-gray-700 mt-1">{def}</p>
                        </div>
                    ))}
                </div>

                {/* Footer note with mockup link */}
                <div className="mt-10 text-sm text-gray-500">
                    Mockup:{" "}
                    <a className="text-purple-700 underline" href="https://link.excalidraw.com/l/65VNwvy7c4X/7gxoB8JymIS" target="_blank" rel="noreferrer">
                        Excalidraw (opens in new tab)
                    </a>
                </div>
            </section>
        </main>
    );
}



/* ---------- tiny presentational helpers ---------- */

function Card({ title, body }) {
    return (
        <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
            <h3 className="font-display text-lg text-gray-900">{title}</h3>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">{body}</p>
        </div>
    );
}

function Role({ name, bullets = [] }) {
    return (
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <p className="text-purple-700 font-semibold">{name}</p>
            <ul className="mt-2 text-sm text-gray-700 space-y-1 list-disc list-inside">
                {bullets.map((b) => (
                    <li key={b}>{b}</li>
                ))}
            </ul>
        </div>
    );
}
