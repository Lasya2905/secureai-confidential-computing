import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, ShieldCheck, ShieldAlert, Copy } from "lucide-react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/lib/api";

export default function WorkloadDetail() {
    const { id } = useParams();
    const [w, setW] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    const load = () => {
        setLoading(true);
        endpoints
            .getWorkload(id)
            .then((r) => setW(r.data))
            .catch(() => toast.error("Workload not found"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line
    }, [id]);

    const rerun = async () => {
        setRunning(true);
        try {
            await endpoints.runAnalysis(id);
            toast.success("Security analysis refreshed");
            load();
        } catch {
            toast.error("Analysis failed");
        } finally {
            setRunning(false);
        }
    };

    if (loading) {
        return <div className="text-slate-500 font-mono">Loading...</div>;
    }
    if (!w) return null;

    const a = w.security_analysis || {};
    const radar = [
        { metric: "Data Protection", score: a.data_protection || 0 },
        { metric: "Memory Isolation", score: a.memory_isolation || 0 },
        { metric: "Runtime Protection", score: a.runtime_protection || 0 },
        { metric: "Secure Execution", score: a.secure_execution || 0 },
        { metric: "Attestation", score: a.attestation_status || 0 },
    ];

    return (
        <div data-testid="workload-detail-page">
            <Link
                to="/workloads"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-cyan-300 mb-6"
                data-testid="back-btn"
            >
                <ArrowLeft className="w-3 h-3" /> Back to monitor
            </Link>

            <PageHeader
                label={`// WORKLOAD ${w.id.slice(0, 8)}`}
                title={w.workload_name}
                description={`${w.model_name} · ${w.dataset_type} · ${w.workload_size}`}
                action={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={w.status} testid="detail-status-badge" />
                        <Button
                            onClick={rerun}
                            disabled={running}
                            variant="outline"
                            className="rounded-sm border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 font-mono uppercase tracking-widest text-xs"
                            data-testid="rerun-analysis-btn"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${running ? "animate-spin" : ""}`} />
                            Re-run
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                {/* Radar chart */}
                <div className="sac-card p-6 lg:col-span-3" data-testid="radar-chart-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="sac-label">Security Analysis</div>
                            <h3 className="font-display font-bold text-2xl mt-1">Attestation Radar</h3>
                        </div>
                        <div className="text-right">
                            <div className="sac-label">Overall</div>
                            <div className="font-display font-black text-4xl text-cyan-300 mt-1" data-testid="overall-score">
                                {a.overall_score}
                                <span className="text-lg text-slate-500">/100</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 340 }}>
                        <ResponsiveContainer>
                            <RadarChart data={radar}>
                                <PolarGrid stroke="#1e293b" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: "#8a96b3", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                                <PolarRadiusAxis
                                    domain={[0, 100]}
                                    tick={{ fill: "#475569", fontSize: 10 }}
                                    stroke="#1e293b"
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#00f0ff"
                                    fill="#00f0ff"
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#12182b",
                                        border: "1px solid #1e293b",
                                        borderRadius: "2px",
                                        fontFamily: "JetBrains Mono",
                                    }}
                                    labelStyle={{ color: "#00f0ff" }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Meta */}
                <div className="sac-card p-6 lg:col-span-2 space-y-3" data-testid="workload-meta-card">
                    <div className="sac-label mb-2">Workload Manifest</div>
                    <Row label="ID">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(w.id);
                                toast.success("ID copied");
                            }}
                            className="font-mono text-cyan-300 hover:text-cyan-100 flex items-center gap-1 max-w-full truncate"
                        >
                            {w.id.slice(0, 16)}... <Copy className="w-3 h-3" />
                        </button>
                    </Row>
                    <Row label="Model" value={w.model_name} />
                    <Row label="Dataset" value={w.dataset_type} />
                    <Row label="Size" value={w.workload_size} />
                    <Row label="Security Level" value={w.security_level} />
                    <Row label="TEE" value={w.tee_technology} />
                    <Row label="Created" value={new Date(w.created_at).toLocaleString()} />
                    <div className="pt-3 border-t border-[var(--sac-border)]">
                        <div className={`flex items-center gap-2 text-sm font-mono ${a.attested ? "text-emerald-300" : "text-rose-300"}`} data-testid="attestation-indicator">
                            {a.attested ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                            {a.attested ? "ATTESTED · Enclave verified" : "NOT ATTESTED · Re-run required"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {radar.map((r) => (
                    <Indicator key={r.metric} label={r.metric} value={r.score} />
                ))}
            </div>

            {/* Findings */}
            <div className="sac-card p-6" data-testid="findings-card">
                <div className="sac-label mb-2">Findings</div>
                <h3 className="font-display font-bold text-2xl mb-4">Analysis Notes</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                    {(a.findings || []).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">▸</span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-[11px] text-slate-500 font-mono mt-4">
                    Analyzed: {a.analyzed_at ? new Date(a.analyzed_at).toLocaleString() : "-"}
                </p>
            </div>
        </div>
    );
}

function Row({ label, value, children }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="sac-label pt-0.5">{label}</span>
            <span className="text-slate-200 text-right text-sm">{children ?? value}</span>
        </div>
    );
}

function Indicator({ label, value }) {
    const color =
        value >= 90 ? "text-emerald-300 border-emerald-400/30" :
        value >= 75 ? "text-cyan-300 border-cyan-400/30" :
        value >= 60 ? "text-amber-300 border-amber-400/30" :
        "text-rose-300 border-rose-400/30";
    return (
        <div className={`sac-card p-4 border ${color}`} data-testid={`indicator-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="sac-label">{label}</div>
            <div className={`font-display font-black text-3xl mt-2 ${color}`}>{value}</div>
            <div className="h-1 bg-slate-800 rounded-sm mt-3 overflow-hidden">
                <div
                    className="h-full bg-current opacity-70"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
