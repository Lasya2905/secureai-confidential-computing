import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ConfidentialComputing from "@/pages/ConfidentialComputing";
import TEETechnologies from "@/pages/TEETechnologies";
import SubmitWorkload from "@/pages/SubmitWorkload";
import Workloads from "@/pages/Workloads";
import WorkloadDetail from "@/pages/WorkloadDetail";
import CICDStatus from "@/pages/CICDStatus";

export default function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/confidential-computing" element={<ConfidentialComputing />} />
                        <Route path="/tee" element={<TEETechnologies />} />
                        <Route path="/submit" element={<SubmitWorkload />} />
                        <Route path="/workloads" element={<Workloads />} />
                        <Route path="/workloads/:id" element={<WorkloadDetail />} />
                        <Route path="/cicd" element={<CICDStatus />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#12182b",
                        border: "1px solid #1e293b",
                        color: "#fff",
                        fontFamily: "JetBrains Mono, monospace",
                    },
                }}
            />
        </div>
    );
}
