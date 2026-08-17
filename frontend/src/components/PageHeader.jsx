export default function PageHeader({ label, title, description, action, testid }) {
    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4" data-testid={testid}>
            <div>
                {label && <div className="sac-label mb-3">{label}</div>}
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tighter">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 text-slate-400 max-w-2xl">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
