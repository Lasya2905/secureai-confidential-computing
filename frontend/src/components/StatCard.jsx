export default function StatCard({ label, value, sub, icon: Icon, tone = "cyan", testid }) {
    const tones = {
        cyan: "text-cyan-300 border-cyan-400/30",
        green: "text-emerald-300 border-emerald-400/30",
        amber: "text-amber-300 border-amber-400/30",
        red: "text-rose-300 border-rose-400/30",
        slate: "text-slate-300 border-slate-600/40",
    };
    return (
        <div
            data-testid={testid}
            className="sac-card p-5 relative overflow-hidden group"
        >
            <div className="scanner-line opacity-0 group-hover:opacity-100" />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="sac-label">{label}</div>
                    <div className={`mt-3 font-display font-black text-3xl lg:text-4xl leading-none ${tones[tone]}`}>
                        {value}
                    </div>
                    {sub && <div className="mt-2 text-xs text-slate-500 font-mono">{sub}</div>}
                </div>
                {Icon && (
                    <div className={`w-10 h-10 flex items-center justify-center border rounded-sm ${tones[tone]} bg-white/5`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
