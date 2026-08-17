const STYLES = {
    Secure: "text-cyan-300 bg-cyan-400/10 border-cyan-400/40",
    Processing: "text-amber-300 bg-amber-400/10 border-amber-400/40",
    Completed: "text-emerald-300 bg-emerald-400/10 border-emerald-400/40",
    Failed: "text-rose-300 bg-rose-500/10 border-rose-500/40",
    SUCCESS: "text-emerald-300 bg-emerald-400/10 border-emerald-400/40",
    PASSED: "text-emerald-300 bg-emerald-400/10 border-emerald-400/40",
    DEPLOYED: "text-emerald-300 bg-emerald-400/10 border-emerald-400/40",
    FAILED: "text-rose-300 bg-rose-500/10 border-rose-500/40",
    RUNNING: "text-amber-300 bg-amber-400/10 border-amber-400/40",
};

export default function StatusBadge({ status, testid }) {
    const cls = STYLES[status] || "text-slate-300 bg-slate-500/10 border-slate-500/40";
    const dot =
        status === "Processing" || status === "RUNNING"
            ? "pulse-dot"
            : "";
    return (
        <span
            data-testid={testid}
            className={`inline-flex items-center gap-2 px-2.5 py-1 border rounded-sm text-[11px] font-mono uppercase tracking-widest ${cls}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${dot}`} />
            {status}
        </span>
    );
}
