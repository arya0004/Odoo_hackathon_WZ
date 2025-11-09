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
// import React from "react";

// export default function Home() {
//     return (
//         <main className="relative min-h-screen overflow-hidden bg-white">
//             {/* Navigation */}
//             <header className="bg-white border-b border-gray-200">
//                 <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
//                             <span className="text-white font-bold text-base">W</span>
//                         </div>
//                         <span className="font-bold text-xl text-gray-900">
//                             WorkZen
//                         </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <a
//                             href="#login"
//                             className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
//                         >
//                             Login
//                         </a>
//                         <a
//                             href="#signup"
//                             className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all"
//                         >
//                             Sign Up
//                         </a>
//                     </div>
//                 </div>
//             </header>

//             {/* Hero Section */}
//             <section className="relative bg-gradient-to-b from-purple-50 to-white pt-16 pb-20 overflow-hidden">
//                 {/* Decorative grid lines */}
//                 <div className="absolute inset-0 opacity-30" style={{
//                     backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
//                                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
//                     backgroundSize: '60px 60px'
//                 }}></div>

//                 <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
//                     <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
//                         Empower Your HR Team with{" "}
//                         <span className="text-purple-600">WorkZen</span>
//                     </h1>

//                     <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
//                         WorkZen offers all the features you would expect from your favorite HR Software and much more.
//                     </p>

//                     <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
//                         <a
//                             href="#login"
//                             className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md"
//                         >
//                             Login
//                         </a>
//                         <a
//                             href="#signup"
//                             className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-all"
//                         >
//                             Sign Up
//                         </a>
//                     </div>

//                     {/* Character Image */}
//                     <div className="relative max-w-4xl mx-auto">
//                         <img
//                             src="/1.png"
//                             alt="WorkZen HR Team Illustration"
//                             className="w-full h-auto"
//                         />
//                     </div>
//                 </div>
//             </section>

//             {/* What Makes WorkZen Standout */}
//             <section className="bg-gray-900 py-16">
//                 <div className="mx-auto max-w-6xl px-4 sm:px-6">
//                     <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
//                         What makes WorkZen HRMS Standout
//                     </h2>

//                     <div className="grid md:grid-cols-3 gap-8">
//                         <StandoutCard
//                             icon={<FreeIcon />}
//                             title="Easy to Use"
//                             description="WorkZen is designed with simplicity in mind. Intuitive interface that's easy to navigate."
//                         />
//                         <StandoutCard
//                             icon={<OpenSourceIcon />}
//                             title="Comprehensive"
//                             description="All the HR modules you need in one place. From attendance to payroll management."
//                         />
//                         <StandoutCard
//                             icon={<HostIcon />}
//                             title="Secure & Reliable"
//                             description="Your data is safe with enterprise-grade security and regular backups."
//                         />
//                     </div>
//                 </div>
//             </section>

//             {/* All Modules Section */}
//             <section className="py-16 bg-white">
//                 <div className="mx-auto max-w-6xl px-4 sm:px-6">
//                     <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
//                         All the modules you'll ever need in one software.
//                     </h2>

//                     <div className="mt-12 grid lg:grid-cols-2 gap-12 items-center">
//                         {/* Left Content */}
//                         <div className="space-y-8">
//                             <ModuleFeature
//                                 badge="Attendance"
//                                 title="Seamless Integration and Familiarization"
//                                 description="Streamline employee attendance with automated check-in/out feature, eliminating manual tracking effortlessly."
//                             />
//                             <ModuleFeature
//                                 badge="Leave"
//                                 title="Preparation for a Successful Start"
//                                 description="Simplify leave applications and approval workflows with automated tracking and balance management."
//                             />
//                             <ModuleFeature
//                                 badge="Payroll"
//                                 title="Enhancing engagement, productivity, and retention"
//                                 description="Automated salary calculations, deductions, and payslip generation with comprehensive reports."
//                             />

//                             <a href="#" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700">
//                                 Explore More
//                                 <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                                 </svg>
//                             </a>
//                         </div>

//                         {/* Right Image Placeholder */}
//                         {/* <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-dashed border-purple-200 p-8 min-h-[500px] flex items-center justify-center">
//                             <div className="text-center">
//                                 <svg className="mx-auto h-20 w-20 text-purple-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                 </svg>
//                                 <p className="text-purple-500 font-medium">Screenshot placeholder</p>
//                             </div>
//                         </div> */}
//                         <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-200 p-8 min-h-[500px] flex items-center justify-center">
//                             <img
//                                 src="/dashboard.png"      // <-- Change the name according to your file
//                                 alt="Dashboard Preview"
//                                 className="w-full h-auto rounded-xl shadow-lg"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Roles Section */}
//             <section className="py-16 bg-gray-50">
//                 <div className="mx-auto max-w-6xl px-4 sm:px-6">
//                     <div className="text-center mb-12">
//                         <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
//                             Built for every team member
//                         </h2>
//                         <p className="text-lg text-gray-600">
//                             Tailored experiences for different roles in your organization
//                         </p>
//                     </div>

//                     <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         <RoleCard
//                             name="Admin"
//                             color="purple"
//                             responsibilities={[
//                                 "Complete system control",
//                                 "User & role management",
//                                 "System configuration",
//                                 "Audit logs & reports"
//                             ]}
//                         />
//                         <RoleCard
//                             name="Employee"
//                             color="blue"
//                             responsibilities={[
//                                 "Apply for leave",
//                                 "View attendance records",
//                                 "Access payslips",
//                                 "Update profile"
//                             ]}
//                         />
//                         <RoleCard
//                             name="HR Officer"
//                             color="green"
//                             responsibilities={[
//                                 "Manage employee data",
//                                 "Monitor attendance",
//                                 "Allocate leave quotas",
//                                 "Generate HR reports"
//                             ]}
//                         />
//                         <RoleCard
//                             name="Payroll Officer"
//                             color="orange"
//                             responsibilities={[
//                                 "Process payroll",
//                                 "Generate payslips",
//                                 "Manage deductions",
//                                 "Review time-off"
//                             ]}
//                         />
//                     </div>
//                 </div>
//             </section>

//             {/* CTA Section */}
//             <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800">
//                 <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
//                     <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
//                         Ready to transform your HR?
//                     </h2>
//                     <p className="text-lg sm:text-xl text-purple-100 mb-10">
//                         Join organizations that trust WorkZen to manage their most valuable asset—their people.
//                     </p>
//                     <a
//                         href="#signup"
//                         className="inline-flex items-center justify-center rounded-md px-8 py-4 text-base font-semibold text-purple-600 bg-white hover:bg-gray-50 transition-all shadow-xl"
//                     >
//                         Sign Up Now
//                         <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                         </svg>
//                     </a>
//                 </div>
//             </section>

//             {/* Footer */}
//             <footer className="bg-white border-t border-gray-200 py-12">
//                 <div className="mx-auto max-w-6xl px-4 sm:px-6">
//                     <div className="text-center text-sm text-gray-500">
//                         <p className="mb-2">© 2025 WorkZen. All rights reserved.</p>
//                         <p>
//                             View{" "}
//                             <a className="text-purple-600 hover:text-purple-700 underline" href="https://link.excalidraw.com/l/65VNwvy7c4X/7gxoB8JymIS" target="_blank" rel="noreferrer">
//                                 design mockup
//                             </a>
//                         </p>
//                     </div>
//                 </div>
//             </footer>
//         </main>
//     );
// }

// /* Standout Card Component */
// function StandoutCard({ icon, title, description }) {
//     return (
//         <div className="text-center">
//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 border-4 border-gray-700 mb-4">
//                 {icon}
//             </div>
//             <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
//             <p className="text-gray-300 text-sm">{description}</p>
//         </div>
//     );
// }

// /* Module Feature Component */
// function ModuleFeature({ badge, title, description }) {
//     return (
//         <div>
//             <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full mb-3">
//                 {badge}
//             </span>
//             <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
//             <p className="text-gray-600">{description}</p>
//         </div>
//     );
// }

// /* Role Card Component */
// function RoleCard({ name, color, responsibilities }) {
//     const colorMap = {
//         purple: "bg-purple-600",
//         blue: "bg-blue-600",
//         green: "bg-green-600",
//         orange: "bg-orange-600"
//     };

//     return (
//         <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all">
//             <div className={`inline-block px-4 py-2 rounded-md ${colorMap[color]} text-white text-sm font-semibold mb-4`}>
//                 {name}
//             </div>
//             <ul className="space-y-2">
//                 {responsibilities.map((item, idx) => (
//                     <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
//                         <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                         </svg>
//                         <span>{item}</span>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// /* Icon Components */
// function FreeIcon() {
//     return (
//         <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//     );
// }

// function OpenSourceIcon() {
//     return (
//         <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
//         </svg>
//     );
// }

// function HostIcon() {
//     return (
//         <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
//         </svg>
//     );
// }