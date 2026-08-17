import { useEffect, useState } from "react";
import { Cpu, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { endpoints } from "@/lib/api";

export default function TEETechnologies() {
    const [techs, setTechs] = useState([]);

    useEffect(() => {
        endpoints.teeTechnologies().then((r) => setTechs(r.data.technologies));
    }, []);

    return (
        <div data-testid="tee-page">
            <PageHeader
                label="// HARDWARE ROOT OF TRUST"
                title={<>TEE <span className="text-cyan-400">Technologies</span></>}
                description="Compare the leading Trusted Execution Environments used to build Confidential Computing on modern cloud CPUs."
            />

            <div
                className="relative overflow-hidden sac-card mb-8 h-40 md:h-52"
                data-testid="tee-hero-image"
            >
                <img
                    src="https://images.pexels.com/photos/2105927/pexels-photo-2105927.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="CPU macro"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--sac-bg)] via-transparent to-[var(--sac-bg)]" />
                <div className="scanner-line" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {techs.map((t) => (
                    <div
                        key={t.id}
                        className="sac-card p-6 relative overflow-hidden group"
                        data-testid={`tee-card-${t.id}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="sac-label mb-2">{t.vendor} · SINCE {t.year}</div>
                                <h3 className="font-display font-black text-3xl">{t.name}</h3>
                            </div>
                            <div className="w-11 h-11 flex items-center justify-center border border-cyan-400/40 bg-cyan-400/5 rounded-sm">
                                <Cpu className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed mb-5">{t.description}</p>

                        <div className="space-y-3 pt-4 border-t border-[var(--sac-border)]">
                            <Field label="Isolation" value={t.isolation_type} />
                            <Field label="Purpose" value={t.security_purpose} />
                            <Field label="Use Case" value={t.use_case} accent />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 sac-card p-5 flex items-start gap-3" data-testid="tee-disclaimer">
                <ShieldCheck className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                    Note: This application demonstrates TEE concepts at the software level. It does not directly
                    interface with SGX / SEV / TDX / TrustZone hardware. Real production TEE deployments require compatible
                    CPUs, attested firmware, and a trusted runtime such as Gramine, Occlum, or Constellation.
                </p>
            </div>
        </div>
    );
}

function Field({ label, value, accent }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <div className="sac-label sm:w-24 sm:flex-shrink-0 sm:pt-1">{label}</div>
            <div className={`text-sm ${accent ? "text-cyan-300" : "text-slate-200"}`}>{value}</div>
        </div>
    );
}
