import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShieldCheck,
    Activity,
    Cpu,
    Heart,
    ArrowRight,
    GitBranch,
    AlertTriangle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [deploy, setDeploy] = useState(null);

    useEffect(() => {
        Promise.all([endpoints.dashboardStats(), endpoints.deploymentStatus()])
            .then(([s, d]) => {
                setStats(s.data);
                setDeploy(d.data);
            })
            .catch((e) => console.error(e));
    }, []);

    return (
        <div data-testid="dashboard-page">
            <PageHeader
                label="// SECUREAI CLOUD"
                title={<>Confidential Compute<br/><span className="text-cyan-400">for AI Workloads.</span></>}
                description="A software-level educational simulation of Confidential Computing. Explore how Trusted Execution Environments protect AI models, training data, and inference pipelines running on untrusted cloud infrastructure."
                action={
                    <Link to="/submit">
                        <Button
                            data-testid="hero-submit-btn"
                            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono uppercase tracking-widest rounded-sm"
                        >
                            Deploy Workload <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                }
                testid="dashboard-header"
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Overall Security"
                    value={stats?.overall_security === "high" ? "HIGH" : (stats?.overall_security || "...").toUpperCase()}
                    sub={"TEE Attested"}
                    icon={ShieldCheck}
                    tone="cyan"
                    testid="stat-security"
                />
                <StatCard
                    label="Protected Workloads"
                    value={stats?.protected_workloads ?? "-"}
                    sub={`of ${stats?.total_workloads ?? 0} total`}
                    icon={ShieldCheck}
                    tone="green"
                    testid="stat-protected"
                />
                <StatCard
                    label="Active Workloads"
                    value={stats?.active_workloads ?? "-"}
                    sub={"Executing in TEEs"}
                    icon={Activity}
                    tone="amber"
                    testid="stat-active"
                />
                <StatCard
                    label="System Health"
                    value={(stats?.system_health || "...").toUpperCase()}
                    sub={"All services nominal"}
                    icon={Heart}
                    tone="green"
                    testid="stat-health"
                />
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* TEE Distribution */}
                <div className="sac-card p-6 lg:col-span-2" data-testid="tee-distribution-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="sac-label">Attestation Layer</div>
                            <h3 className="font-display font-bold text-2xl mt-2">TEE Distribution</h3>
                        </div>
                        <Cpu className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="space-y-3 mt-6">
                        {(stats?.tee_distribution || []).map((t) => {
                            const total = stats?.total_workloads || 1;
                            const pct = Math.round((t.count / total) * 100);
                            return (
                                <div key={t.tee}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-mono text-slate-300">{t.tee}</span>
                                        <span className="font-mono text-cyan-400">
                                            {t.count} <span className="text-slate-500">/ {pct}%</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {(!stats?.tee_distribution || stats.tee_distribution.length === 0) && (
                            <div className="text-sm text-slate-500 font-mono">No workloads yet.</div>
                        )}
                    </div>
                </div>

                {/* CI/CD Status */}
                <div className="sac-card p-6" data-testid="cicd-summary-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="sac-label">DevOps</div>
                            <h3 className="font-display font-bold text-2xl mt-2">CI/CD Pipeline</h3>
                        </div>
                        <GitBranch className="w-5 h-5 text-cyan-400" />
                    </div>
                    {deploy && (
                        <div className="space-y-3 text-sm">
                            <Row label="Source" value={deploy.source_control.provider} />
                            <Row label="Tool" value={deploy.ci_cd.tool} />
                            <Row
                                label="Build"
                                value={<StatusBadge status={deploy.ci_cd.build_status} testid="ci-build-badge" />}
                            />
                            <Row
                                label="Tests"
                                value={<StatusBadge status={deploy.ci_cd.test_status} />}
                            />
                            <Row
                                label="Deploy"
                                value={<StatusBadge status={deploy.ci_cd.deploy_status} />}
                            />
                            <Row label="Build #" value={<span className="font-mono text-cyan-300">#{deploy.ci_cd.build_number}</span>} />
                        </div>
                    )}
                    <Link to="/cicd">
                        <Button
                            variant="outline"
                            className="w-full mt-5 rounded-sm border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200 font-mono uppercase tracking-widest text-xs"
                            data-testid="view-cicd-btn"
                        >
                            View Pipeline <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Recent activity */}
            <div className="sac-card" data-testid="recent-activity-card">
                <div className="px-6 py-5 border-b border-[var(--sac-border)] flex items-center justify-between">
                    <div>
                        <div className="sac-label">Live Feed</div>
                        <h3 className="font-display font-bold text-2xl mt-2">Recent Workload Activity</h3>
                    </div>
                    <Link
                        to="/workloads"
                        className="text-xs font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                    >
                        View all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-[var(--sac-border)]">
                    {(stats?.recent_activity || []).map((w) => (
                        <Link
                            key={w.id}
                            to={`/workloads/${w.id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-8 h-8 flex items-center justify-center border border-cyan-400/30 bg-cyan-400/5 rounded-sm">
                                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium truncate">{w.workload_name}</div>
                                    <div className="text-xs text-slate-500 font-mono truncate">
                                        {w.model_name} · {w.tee_technology}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={w.status} />
                        </Link>
                    ))}
                    {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
                        <div className="px-6 py-8 text-sm text-slate-500 font-mono flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> No workloads yet — submit one to begin.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <span className="sac-label">{label}</span>
            <span className="text-slate-200">{value}</span>
        </div>
    );
}
