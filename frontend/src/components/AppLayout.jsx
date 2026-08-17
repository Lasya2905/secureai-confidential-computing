import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShieldCheck,
    Cpu,
    Plus,
    Activity,
    GitBranch,
    Lock,
    Radio,
} from "lucide-react";
import { useEffect, useState } from "react";
import { endpoints } from "@/lib/api";

const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
    { to: "/confidential-computing", label: "Confidential Computing", icon: Lock, testid: "nav-cc" },
    { to: "/tee", label: "TEE Technologies", icon: Cpu, testid: "nav-tee" },
    { to: "/submit", label: "Submit Workload", icon: Plus, testid: "nav-submit" },
    { to: "/workloads", label: "Workload Monitor", icon: Activity, testid: "nav-workloads" },
    { to: "/cicd", label: "CI/CD Pipeline", icon: GitBranch, testid: "nav-cicd" },
];

export default function AppLayout() {
    const [health, setHealth] = useState(null);
    const location = useLocation();

    useEffect(() => {
        endpoints
            .health()
            .then((r) => setHealth(r.data))
            .catch(() => setHealth({ status: "degraded" }));
    }, [location.pathname]);

    const online = health?.status === "healthy";

    return (
        <div className="relative min-h-screen flex" data-testid="app-layout">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-20 hidden md:flex md:w-64 flex-col border-r border-[var(--sac-border)] bg-[var(--sac-surface)]/80 backdrop-blur-md">
                <div className="px-6 py-6 border-b border-[var(--sac-border)]">
                    <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 flex items-center justify-center rounded-sm border border-cyan-400/40 bg-cyan-400/10">
                            <ShieldCheck className="w-5 h-5 text-cyan-400" />
                            <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
                        </div>
                        <div>
                            <div className="font-display font-black text-lg leading-none">SecureAI</div>
                            <div className="sac-label mt-1">Cloud // v1.0</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            data-testid={item.testid}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm border transition-colors ${
                                    isActive
                                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                                        : "border-transparent text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800/40"
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-[var(--sac-border)]">
                    <div className="sac-label mb-2">System</div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <Radio className={`w-3.5 h-3.5 ${online ? "text-emerald-400" : "text-red-400"}`} />
                        <span className={online ? "text-emerald-400" : "text-red-400"}>
                            {online ? "ALL SYSTEMS NOMINAL" : "DEGRADED"}
                        </span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                        db: {health?.database || "..."}
                    </div>
                </div>
            </aside>

            {/* Mobile top nav */}
            <div className="md:hidden fixed top-0 inset-x-0 z-30 border-b border-[var(--sac-border)] bg-[var(--sac-surface)]/90 backdrop-blur">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                        <span className="font-display font-black">SecureAI Cloud</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                        {online ? "● ONLINE" : "● OFFLINE"}
                    </span>
                </div>
                <div className="flex overflow-x-auto gap-1 px-3 pb-2">
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `whitespace-nowrap px-3 py-1.5 text-xs rounded-sm border font-mono ${
                                    isActive
                                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                                        : "border-slate-800 text-slate-400"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 md:ml-64 pt-28 md:pt-0 relative z-10">
                <div className="px-4 md:px-10 py-8 md:py-10 max-w-[1400px]">
                    <Outlet />
                </div>
                <footer className="border-t border-[var(--sac-border)] mt-16 py-6 px-4 md:px-10 text-xs text-slate-500 font-mono">
                    SecureAI Cloud &copy; 2026 · Educational software-level simulation of Confidential Computing.
                    Not a hardware-backed TEE.
                </footer>
            </main>
        </div>
    );
}
