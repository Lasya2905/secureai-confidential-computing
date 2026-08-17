import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/lib/api";

export default function Workloads() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        endpoints
            .listWorkloads()
            .then((r) => setItems(r.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = items.filter((w) => {
        const matchQ =
            w.workload_name.toLowerCase().includes(q.toLowerCase()) ||
            w.model_name.toLowerCase().includes(q.toLowerCase()) ||
            w.id.toLowerCase().includes(q.toLowerCase());
        const matchF = filter === "All" || w.status === filter;
        return matchQ && matchF;
    });

    return (
        <div data-testid="workloads-page">
            <PageHeader
                label="// MONITOR"
                title={<>Workload <span className="text-cyan-400">Monitor</span></>}
                description="Live view of all AI workloads sealed inside Trusted Execution Environments."
                action={
                    <Link to="/submit">
                        <Button
                            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono uppercase tracking-widest rounded-sm"
                            data-testid="new-workload-btn"
                        >
                            <Plus className="w-4 h-4 mr-2" /> New Workload
                        </Button>
                    </Link>
                }
            />

            {/* Filters */}
            <div className="sac-card p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name, model, or ID..."
                        className="bg-slate-900/60 border-slate-700 rounded-sm pl-9 focus-visible:ring-cyan-400"
                        data-testid="search-workloads"
                    />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                    {["All", "Secure", "Processing", "Completed", "Failed"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            data-testid={`filter-${s.toLowerCase()}`}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded-sm border transition-colors ${
                                filter === s
                                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                                    : "border-slate-700 text-slate-400 hover:text-white"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="sac-card overflow-hidden" data-testid="workloads-table">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--sac-border)] text-left">
                                <Th>ID</Th>
                                <Th>Workload</Th>
                                <Th>AI Model</Th>
                                <Th>TEE</Th>
                                <Th>Level</Th>
                                <Th>Status</Th>
                                <Th>Created</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-500 font-mono">
                                        Loading workloads...
                                    </td>
                                </tr>
                            )}
                            {!loading && filtered.map((w) => (
                                <tr
                                    key={w.id}
                                    className="border-b border-[var(--sac-border)] hover:bg-slate-800/30 transition-colors"
                                    data-testid={`row-${w.id}`}
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/workloads/${w.id}`}
                                            className="font-mono text-xs text-cyan-300 hover:text-cyan-100"
                                        >
                                            {w.id.slice(0, 8)}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        <Link to={`/workloads/${w.id}`} className="hover:text-cyan-300">
                                            {w.workload_name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-slate-300">{w.model_name}</td>
                                    <td className="px-4 py-3 text-slate-300">{w.tee_technology}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                                            {w.security_level}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={w.status} />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                        {new Date(w.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center">
                                        <Filter className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                        <div className="text-sm text-slate-400">No workloads match your filter.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="px-4 py-3 sac-label text-left">{children}</th>
    );
}
