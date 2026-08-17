import { Lock, ShieldCheck, Cpu, Database, Cloud, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const points = [
    {
        icon: Lock,
        title: "Data-in-Use Protection",
        text: "Traditional encryption protects data at-rest and in-transit. Confidential Computing closes the last gap by keeping data encrypted while being processed inside a Trusted Execution Environment (TEE).",
    },
    {
        icon: Cpu,
        title: "Trusted Execution Environments (TEEs)",
        text: "TEEs are hardware-enforced enclaves — like Intel SGX, AMD SEV, or Intel TDX — that isolate CPU and memory from the host OS, hypervisor, and other tenants running on the same machine.",
    },
    {
        icon: Database,
        title: "Why It Matters for AI",
        text: "AI workloads process highly sensitive assets: proprietary model weights, personal medical images, financial transactions. Confidential Computing lets you run inference & training in the cloud without exposing them to the cloud provider itself.",
    },
    {
        icon: Cloud,
        title: "Cloud Security Benefits",
        text: "Reduce insider threat surface, satisfy data-residency and regulatory requirements (HIPAA, GDPR, PCI), and enable multi-party collaboration on shared models without leaking either side's data.",
    },
    {
        icon: Eye,
        title: "Remote Attestation",
        text: "Before sending sensitive data, clients cryptographically verify (attest) that the TEE is genuine, patched, and running the expected code — building end-to-end trust from developer to production.",
    },
];

export default function ConfidentialComputing() {
    return (
        <div data-testid="cc-page">
            <PageHeader
                label="// EDUCATION"
                title={<>What is <span className="text-cyan-400">Confidential Computing?</span></>}
                description="A primer for engineers, students, and security architects on why in-use encryption is the next frontier of cloud security — and how it unlocks safe AI in shared environments."
            />

            <div
                className="relative overflow-hidden sac-card mb-10 h-56 md:h-72"
                data-testid="cc-hero-image"
            >
                <img
                    src="https://images.pexels.com/photos/36750789/pexels-photo-36750789.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="Confidential lock"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--sac-bg)] via-[var(--sac-bg)]/70 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8 md:px-12">
                    <div>
                        <div className="sac-label mb-3 text-cyan-400">Layer 3 · Data-in-Use</div>
                        <h2 className="font-display font-black text-3xl md:text-4xl max-w-md leading-tight">
                            Encrypt not just the disk.<br />
                            Encrypt the <span className="text-cyan-400">RAM</span>.
                        </h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {points.map((p, idx) => (
                    <div
                        key={p.title}
                        className="sac-card p-6"
                        data-testid={`cc-point-${idx}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-cyan-400/30 bg-cyan-400/5 rounded-sm">
                                <p.icon className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="sac-label mb-1">0{idx + 1}</div>
                                <h3 className="font-display font-bold text-xl mb-2">{p.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{p.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 sac-card p-6 border-l-2 border-l-amber-400/60" data-testid="cc-disclaimer">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="sac-label text-amber-300 mb-1">Academic Disclaimer</div>
                        <p className="text-sm text-slate-300">
                            SecureAI Cloud is a <span className="font-bold text-white">software-level educational simulation</span>. It does not
                            provide actual hardware-backed TEE isolation. Its purpose is to illustrate the concepts, data
                            flows, and pipeline stages involved in running Confidential AI workloads.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
