import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, Rocket, Copy } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { endpoints } from "@/lib/api";

const DATASET_TYPES = ["Text", "Image", "Tabular", "Audio", "Video", "Multimodal"];
const SIZES = ["Small", "Medium", "Large", "X-Large"];
const LEVELS = ["Standard", "High", "Critical"];

export default function SubmitWorkload() {
    const [form, setForm] = useState({
        workload_name: "",
        model_name: "",
        dataset_type: "",
        workload_size: "",
        security_level: "",
        tee_technology: "",
    });
    const [tees, setTees] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        endpoints.teeTechnologies().then((r) => setTees(r.data.technologies));
    }, []);

    const update = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v.target.value }));

    const canSubmit = Object.values(form).every((v) => v && v.length > 0);

    const submit = async (e) => {
        e.preventDefault();
        if (!canSubmit) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const { data } = await endpoints.createWorkload(form);
            setResult(data);
            toast.success(`Workload deployed to ${data.tee_technology}`);
        } catch (err) {
            toast.error(err?.response?.data?.detail?.[0]?.msg || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const copyId = () => {
        if (result?.id) {
            navigator.clipboard.writeText(result.id);
            toast.success("Workload ID copied");
        }
    };

    return (
        <div data-testid="submit-page">
            <PageHeader
                label="// NEW WORKLOAD"
                title={<>Deploy an <span className="text-cyan-400">AI Workload</span></>}
                description="Submit your AI job with the desired security posture. The platform will simulate its execution inside the selected Trusted Execution Environment."
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form */}
                <form
                    onSubmit={submit}
                    className="sac-card p-6 lg:col-span-3 space-y-5"
                    data-testid="workload-form"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Workload Name">
                            <Input
                                value={form.workload_name}
                                onChange={update("workload_name")}
                                placeholder="e.g. Fraud Detection Job #42"
                                className="bg-slate-900/60 border-slate-700 rounded-sm focus-visible:ring-cyan-400"
                                data-testid="input-workload-name"
                            />
                        </Field>
                        <Field label="AI Model Name">
                            <Input
                                value={form.model_name}
                                onChange={update("model_name")}
                                placeholder="e.g. ResNet50-v2"
                                className="bg-slate-900/60 border-slate-700 rounded-sm focus-visible:ring-cyan-400"
                                data-testid="input-model-name"
                            />
                        </Field>

                        <Field label="Dataset Type">
                            <SelectField
                                value={form.dataset_type}
                                onChange={update("dataset_type")}
                                items={DATASET_TYPES}
                                placeholder="Select dataset type"
                                testid="select-dataset"
                            />
                        </Field>
                        <Field label="Workload Size">
                            <SelectField
                                value={form.workload_size}
                                onChange={update("workload_size")}
                                items={SIZES}
                                placeholder="Select size"
                                testid="select-size"
                            />
                        </Field>

                        <Field label="Security Level">
                            <SelectField
                                value={form.security_level}
                                onChange={update("security_level")}
                                items={LEVELS}
                                placeholder="Select level"
                                testid="select-security-level"
                            />
                        </Field>
                        <Field label="TEE Technology">
                            <SelectField
                                value={form.tee_technology}
                                onChange={update("tee_technology")}
                                items={tees.map((t) => t.name)}
                                placeholder="Select TEE"
                                testid="select-tee"
                            />
                        </Field>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[var(--sac-border)]">
                        <p className="text-xs text-slate-500 font-mono">
                            All workloads execute inside the selected simulated TEE.
                        </p>
                        <Button
                            type="submit"
                            disabled={!canSubmit || loading}
                            data-testid="submit-workload-btn"
                            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono uppercase tracking-widest rounded-sm disabled:opacity-40"
                        >
                            {loading ? "Deploying..." : (<>Deploy Secure <Rocket className="ml-2 w-4 h-4" /></>)}
                        </Button>
                    </div>
                </form>

                {/* Result */}
                <div className="lg:col-span-2 space-y-4">
                    {result ? (
                        <div className="sac-card p-6 relative overflow-hidden" data-testid="workload-result">
                            <div className="scanner-line" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 flex items-center justify-center border border-emerald-400/40 bg-emerald-400/10 rounded-sm">
                                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                                </div>
                                <div>
                                    <div className="sac-label text-emerald-300">Deployed</div>
                                    <div className="font-display font-bold text-xl">Workload Sealed</div>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <Row label="Workload ID">
                                    <button
                                        onClick={copyId}
                                        className="font-mono text-cyan-300 hover:text-cyan-100 flex items-center gap-1.5 truncate max-w-full"
                                        data-testid="result-workload-id"
                                    >
                                        {result.id.slice(0, 18)}...
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </Row>
                                <Row label="Name" value={result.workload_name} />
                                <Row label="Model" value={result.model_name} />
                                <Row label="TEE" value={result.tee_technology} />
                                <Row label="Status" value={<StatusBadge status={result.status} testid="result-status-badge" />} />
                                <Row
                                    label="Security"
                                    value={
                                        <span className="font-mono text-cyan-300">
                                            {result.security_analysis?.overall_score}/100
                                        </span>
                                    }
                                />
                            </div>
                            <Button
                                onClick={() => navigate(`/workloads/${result.id}`)}
                                variant="outline"
                                className="w-full mt-5 rounded-sm border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200 font-mono uppercase tracking-widest text-xs"
                                data-testid="view-result-btn"
                            >
                                View Full Analysis
                            </Button>
                        </div>
                    ) : (
                        <div className="sac-card p-6 h-full flex flex-col justify-center items-center text-center min-h-[300px]" data-testid="workload-placeholder">
                            <div className="w-14 h-14 flex items-center justify-center border border-cyan-400/30 bg-cyan-400/5 rounded-sm mb-4">
                                <ShieldCheck className="w-7 h-7 text-cyan-400" />
                            </div>
                            <div className="sac-label mb-2">Awaiting Input</div>
                            <p className="text-sm text-slate-400 max-w-xs">
                                Fill the form to deploy a simulated AI workload inside a Trusted Execution Environment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <Label className="sac-label mb-2 block">{label}</Label>
            {children}
        </div>
    );
}
function SelectField({ value, onChange, items, placeholder, testid }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                className="bg-slate-900/60 border-slate-700 rounded-sm focus:ring-cyan-400"
                data-testid={testid}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 rounded-sm">
                {items.map((i) => (
                    <SelectItem key={i} value={i} className="font-mono">
                        {i}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
function Row({ label, value, children }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="sac-label">{label}</span>
            <span className="text-slate-200 text-right">{children ?? value}</span>
        </div>
    );
}
