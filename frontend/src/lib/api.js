import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    timeout: 20000,
});

export const endpoints = {
    health: () => api.get("/health"),
    teeTechnologies: () => api.get("/tee-technologies"),
    listWorkloads: () => api.get("/workloads"),
    getWorkload: (id) => api.get(`/workloads/${id}`),
    createWorkload: (payload) => api.post("/workloads", payload),
    runAnalysis: (id) => api.post(`/workloads/${id}/security-analysis`),
    dashboardStats: () => api.get("/dashboard/stats"),
    deploymentStatus: () => api.get("/deployment-status"),
};
