
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    const scrollToAbout = (e) => {
        e.preventDefault();
        const footer = document.getElementById('about-us');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-white">
            {/* Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-base">W</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">
                            WorkZen
                        </span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <a
                            href="#features"
                            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#roles"
                            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Solutions
                        </a>
                        <a
                            href="#about-us"
                            onClick={scrollToAbout}
                            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            About Us
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-gray-50 via-white to-white pt-20 pb-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            Enterprise HR Management Platform
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                            Transform Your HR
                            <br />
                            <span className="text-purple-600">Operations</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                            Streamline workforce management with WorkZen's comprehensive suite of HR tools designed for modern organizations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link
                                to="/auth"
                                className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Login
                            </Link>
                        
                            <Link
                                to="/auth"
                                state={{ mode: "signup" }}   // ✅ opens Signup tab
                                className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold border-2 border-gray-300 bg-white text-gray-900 hover:border-purple-600 hover:text-purple-600 transition-all"
                            >
                                Sign Up
                            </Link>
                        </div>

                    </div>

                    {/* Hero Image
                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl opacity-10 blur-2xl"></div>
                        <img
                            src="public/1.png"
                            alt="WorkZen HR Platform Overview"
                            className="relative w-full h-auto rounded-xl"
                        />
                    </div> */}
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-200">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatCard number="10,000+" label="Active Users" />
                        <StatCard number="99.9%" label="Uptime SLA" />
                        <StatCard number="50+" label="Countries" />
                        <StatCard number="24/7" label="Support" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gray-900 py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                            Why Choose WorkZen
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Built on enterprise-grade infrastructure with features that scale with your business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<IntuitiveIcon />}
                            title="Intuitive Design"
                            description="User-friendly interface that requires minimal training. Your team will be productive from day one."
                        />
                        <FeatureCard
                            icon={<ComprehensiveIcon />}
                            title="All-in-One Platform"
                            description="Complete HR ecosystem including attendance, leave management, payroll, and analytics."
                        />
                        <FeatureCard
                            icon={<SecurityIcon />}
                            title="Enterprise Security"
                            description="Bank-level encryption, regular security audits, and compliance with global data protection standards."
                        />
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Complete HR Suite
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage your workforce efficiently
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10">
                            <ModuleFeature
                                badge="Attendance"
                                title="Smart Time Tracking"
                                description="Automated attendance monitoring with biometric integration, real-time dashboards, and detailed reporting capabilities."
                            />
                            <ModuleFeature
                                badge="Leave Management"
                                title="Streamlined Approvals"
                                description="Digital leave requests with customizable workflows, automatic balance tracking, and email notifications."
                            />
                            <ModuleFeature
                                badge="Payroll"
                                title="Automated Processing"
                                description="Accurate salary calculations with tax compliance, direct deposit integration, and comprehensive audit trails."
                            />

                            <a href="#signup" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 text-lg">
                                Get Started
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl opacity-10 blur-2xl"></div>
                            <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-4 shadow-2xl">
                                <img
                                    src="/dashboard.png"
                                    alt="WorkZen Dashboard Interface"
                                    className="w-full h-auto rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section id="roles" className="py-20 bg-gray-50">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Solutions for Every Role
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Customized experiences tailored to the unique needs of each team member
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <RoleCard
                            name="Administrator"
                            color="purple"
                            responsibilities={[
                                "Full system access and control",
                                "User and role management",
                                "Configuration and settings",
                                "Comprehensive audit logs"
                            ]}
                        />
                        <RoleCard
                            name="Employee"
                            color="blue"
                            responsibilities={[
                                "Submit leave requests",
                                "Track attendance history",
                                "Download payslips",
                                "Manage personal profile"
                            ]}
                        />
                        <RoleCard
                            name="HR Manager"
                            color="green"
                            responsibilities={[
                                "Employee data oversight",
                                "Attendance monitoring",
                                "Leave quota allocation",
                                "Performance analytics"
                            ]}
                        />
                        <RoleCard
                            name="Payroll Specialist"
                            color="orange"
                            responsibilities={[
                                "Process monthly payroll",
                                "Generate payslips",
                                "Manage tax deductions",
                                "Financial reporting"
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-24 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
                
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                        Ready to Modernize Your HR?
                    </h2>
                    <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
                        Join forward-thinking organizations that trust WorkZen to manage their most valuable asset—their people.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/auth"
                            className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-purple-600 bg-white hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl"
                        >
                            Login
                        </Link>
                    
                        <Link
                            to="/auth"
                            state={{ mode: "signup" }}
                            className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
                        >
                            Sign Up
                        </Link>
                    </div>

                </div>
            </section>

            {/* Footer / About Us */}
            <footer id="about-us" className="bg-gray-900 text-gray-300 py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">W</span>
                                </div>
                                <span className="font-bold text-2xl text-white">
                                    WorkZen
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                WorkZen is a comprehensive Human Resource Management System designed to streamline HR operations for organizations of all sizes. Our platform combines cutting-edge technology with intuitive design to deliver exceptional value.
                            </p>
                            <p className="text-gray-400 leading-relaxed">
                                Founded with the mission to simplify workforce management, we serve thousands of organizations worldwide, helping them focus on what matters most—their people.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">Product</h3>
                            <ul className="space-y-3">
                                <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
                                <li><a href="#roles" className="hover:text-purple-400 transition-colors">Solutions</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
                            <ul className="space-y-3">
                                <li><a href="#about-us" className="hover:text-purple-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
                                <li><a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">Support</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-500">
                                © 2025 WorkZen. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                                <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">Privacy Policy</a>
                                <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">Terms of Service</a>
                                <a 
                                    className="text-gray-500 hover:text-purple-400 transition-colors" 
                                    href="https://link.excalidraw.com/l/65VNwvy7c4X/7gxoB8JymIS" 
                                    target="_blank" 
                                    rel="noreferrer"
                                >
                                    Design System
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}

/* Stats Card Component */
function StatCard({ number, label }) {
    return (
        <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{number}</div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
        </div>
    );
}

/* Feature Card Component */
function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-700 border border-gray-600 mb-6 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}

/* Module Feature Component */
function ModuleFeature({ badge, title, description }) {
    return (
        <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full mb-3">
                {badge}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}

/* Role Card Component */
function RoleCard({ name, color, responsibilities }) {
    const colorMap = {
        purple: "bg-purple-600 hover:bg-purple-700",
        blue: "bg-blue-600 hover:bg-blue-700",
        green: "bg-green-600 hover:bg-green-700",
        orange: "bg-orange-600 hover:bg-orange-700"
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-purple-300 hover:shadow-xl transition-all group">
            <div className={`inline-block px-4 py-2 rounded-lg ${colorMap[color]} text-white text-sm font-semibold mb-6 transition-all`}>
                {name}
            </div>
            <ul className="space-y-3">
                {responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* Icon Components */
function IntuitiveIcon() {
    return (
        <svg className="w-8 h-8 text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );
}

function ComprehensiveIcon() {
    return (
        <svg className="w-8 h-8 text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );
}

function SecurityIcon() {
    return (
        <svg className="w-8 h-8 text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}