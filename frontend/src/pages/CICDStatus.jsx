import { useEffect, useState } from "react";
import { GitBranch, Github, Server, CheckCircle2, Clock, XCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { endpoints } from "@/lib/api";

export default function CICDStatus() {
    const [d, setD] = useState(null);

    useEffect(() => {
        endpoints.deploymentStatus().then((r) => setD(r.data));
    }, []);

    if (!d) return <div className="text-slate-500 font-mono">Loading pipeline...</div>;

    return (
        <div data-testid="cicd-page">
            <PageHeader
                label="// DEVOPS"
                title={<>CI/CD <span className="text-cyan-400">Pipeline Status</span></>}
                description="Jenkins-driven build and deployment status for the SecureAI Cloud application."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoCard
                    icon={Github}
                    label="Source Control"
                    title={d.source_control.provider}
                    subtitle={`${d.source_control.repository} · ${d.source_control.branch}`}
                    footer={
                        <div className="font-mono text-xs text-slate-400 truncate">
                            <span className="text-cyan-400">{d.source_control.commit_hash}</span>{" "}
                            {d.source_control.last_commit}
                        </div>
                    }
                    testid="ci-source-card"
                />
                <InfoCard
                    icon={GitBranch}
                    label="CI/CD Tool"
                    title={d.ci_cd.tool}
                    subtitle={d.ci_cd.pipeline}
                    footer={<StatusBadge status={d.ci_cd.build_status} testid="pipeline-build-badge" />}
                    testid="ci-tool-card"
                />
                <InfoCard
                    icon={Server}
                    label="Deployment"
                    title={d.environment.name.toUpperCase()}
                    subtitle={`${d.environment.orchestrator} · ${d.environment.region}`}
                    footer={<StatusBadge status={d.ci_cd.deploy_status} />}
                    testid="ci-env-card"
                />
            </div>

            {/* Statuses row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard label="Build" status={d.ci_cd.build_status} />
                <MetricCard label="Tests" status={d.ci_cd.test_status} />
                <MetricCard label="Deploy" status={d.ci_cd.deploy_status} />
            </div>

            {/* Pipeline stages */}
            <div className="sac-card p-6" data-testid="pipeline-stages">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="sac-label">Pipeline Run</div>
                        <h3 className="font-display font-bold text-2xl mt-1">Build #{d.ci_cd.build_number}</h3>
                    </div>
                    <div className="text-right">
                        <div className="sac-label">Duration</div>
                        <div className="font-mono text-cyan-300 mt-1">{d.ci_cd.duration_seconds}s</div>
                    </div>
                </div>

                <div className="space-y-2">
                    {d.stages.map((s, i) => (
                        <Stage key={s.name} stage={s} index={i + 1} />
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--sac-border)] text-[11px] text-slate-500 font-mono">
                    Last build: {new Date(d.ci_cd.last_build).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, label, title, subtitle, footer, testid }) {
    return (
        <div className="sac-card p-5" data-testid={testid}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="sac-label">{label}</div>
                    <div className="font-display font-black text-2xl mt-2">{title}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{subtitle}</div>
                </div>
                <div className="w-10 h-10 flex items-center justify-center border border-cyan-400/30 bg-cyan-400/5 rounded-sm">
                    <Icon className="w-5 h-5 text-cyan-400" />
                </div>
            </div>
            <div className="pt-3 border-t border-[var(--sac-border)]">{footer}</div>
        </div>
    );
}

function MetricCard({ label, status }) {
    const ok = ["SUCCESS", "PASSED", "DEPLOYED"].includes(status);
    return (
        <div className="sac-card p-5">
            <div className="flex items-center justify-between">
                <div>
                    <div className="sac-label">{label}</div>
                    <div className={`font-display font-black text-3xl mt-2 ${ok ? "text-emerald-300" : "text-rose-300"}`}>
                        {status}
                    </div>
                </div>
                {ok ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                    <XCircle className="w-8 h-8 text-rose-400" />
                )}
            </div>
        </div>
    );
}

function Stage({ stage, index }) {
    const ok = stage.status === "SUCCESS";
    return (
        <div
            className="flex items-center gap-4 py-3 px-4 border border-[var(--sac-border)] rounded-sm bg-slate-900/40"
            data-testid={`stage-${stage.name.toLowerCase().replace(/\s+/g, "-")}`}
        >
            <div className="w-8 h-8 flex items-center justify-center border border-cyan-400/30 rounded-sm font-mono text-xs text-cyan-400">
                {String(index).padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium">{stage.name}</div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {stage.duration}s
                </div>
            </div>
            <StatusBadge status={stage.status} />
        </div>
    );
}
