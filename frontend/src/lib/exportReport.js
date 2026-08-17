import jsPDF from "jspdf";

export function downloadJSON(workload) {
    const blob = new Blob([JSON.stringify(workload, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secureai-workload-${workload.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function downloadPDF(workload) {
    const a = workload.security_analysis || {};
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 56;

    // Header band
    doc.setFillColor(10, 15, 28);
    doc.rect(0, 0, pageW, 90, "F");
    doc.setTextColor(0, 240, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SecureAI Cloud", 40, 48);
    doc.setTextColor(180, 190, 210);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Confidential Computing // Workload Security Report", 40, 68);
    y = 130;

    // Section: Workload manifest
    const line = (label, value) => {
        doc.setTextColor(120, 130, 155);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(label.toUpperCase(), 40, y);
        doc.setTextColor(20, 25, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(String(value ?? "-"), pageW - 200);
        doc.text(lines, 200, y);
        y += Math.max(18, lines.length * 14);
    };

    doc.setTextColor(20, 25, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Workload Manifest", 40, y);
    y += 20;

    line("Workload ID", workload.id);
    line("Workload Name", workload.workload_name);
    line("AI Model", workload.model_name);
    line("Dataset Type", workload.dataset_type);
    line("Workload Size", workload.workload_size);
    line("Security Level", workload.security_level);
    line("TEE Technology", workload.tee_technology);
    line("Status", workload.status);
    line("Created", new Date(workload.created_at).toLocaleString());

    y += 14;

    // Section: Security analysis
    doc.setTextColor(20, 25, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Security Analysis", 40, y);
    y += 20;

    // Overall score box
    doc.setDrawColor(0, 200, 220);
    doc.setLineWidth(1);
    doc.rect(40, y, pageW - 80, 60);
    doc.setFontSize(9);
    doc.setTextColor(120, 130, 155);
    doc.text("OVERALL SECURITY SCORE", 56, y + 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0, 130, 180);
    doc.text(`${a.overall_score ?? "-"} / 100`, 56, y + 52);

    doc.setFontSize(10);
    doc.setTextColor(a.attested ? 0 : 200, a.attested ? 130 : 0, a.attested ? 90 : 60);
    doc.setFont("helvetica", "bold");
    doc.text(
        a.attested ? "ATTESTED - Enclave verified" : "NOT ATTESTED",
        pageW - 220,
        y + 36
    );
    y += 80;

    // Indicator table
    const indicators = [
        ["Data Protection", a.data_protection],
        ["Memory Isolation", a.memory_isolation],
        ["Runtime Protection", a.runtime_protection],
        ["Secure Execution", a.secure_execution],
        ["Attestation Status", a.attestation_status],
    ];

    doc.setFontSize(10);
    indicators.forEach(([label, val]) => {
        doc.setTextColor(80, 90, 110);
        doc.setFont("helvetica", "normal");
        doc.text(label, 40, y + 12);
        // bar
        doc.setDrawColor(220, 225, 235);
        doc.setFillColor(240, 245, 250);
        doc.rect(220, y + 4, 260, 12, "F");
        doc.setFillColor(0, 180, 200);
        const w = Math.max(0, Math.min(260, ((val || 0) / 100) * 260));
        doc.rect(220, y + 4, w, 12, "F");
        doc.setTextColor(20, 25, 40);
        doc.setFont("helvetica", "bold");
        doc.text(`${val ?? "-"}`, pageW - 60, y + 14);
        y += 24;
    });

    y += 10;

    // Findings
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 25, 40);
    doc.text("Findings", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    (a.findings || []).forEach((f) => {
        const wrapped = doc.splitTextToSize(`- ${f}`, pageW - 80);
        doc.text(wrapped, 40, y);
        y += wrapped.length * 14 + 4;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 36;
    doc.setDrawColor(220, 225, 235);
    doc.line(40, footerY - 10, pageW - 40, footerY - 10);
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 170);
    doc.text(
        "SecureAI Cloud - Educational software-level simulation of Confidential Computing. Not a hardware-backed TEE.",
        40,
        footerY
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, footerY + 12);

    doc.save(`secureai-workload-${workload.id.slice(0, 8)}.pdf`);
}
