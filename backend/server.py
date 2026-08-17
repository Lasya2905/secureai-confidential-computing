"""
SecureAI Cloud - FastAPI Backend
Confidential Computing for Secure AI Workloads in Cloud Environments
(Software-level educational simulation)
"""
from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Literal
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ---------------- Config ----------------
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(
    title="SecureAI Cloud API",
    description="Confidential Computing for Secure AI Workloads (Educational Simulation)",
    version="1.0.0",
)
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("secureai")

# ---------------- Constants ----------------
TEE_TECHNOLOGIES = [
    {
        "id": "intel-sgx",
        "name": "Intel SGX",
        "vendor": "Intel",
        "description": "Software Guard Extensions provides hardware-based memory encryption that isolates specific application code and data (enclaves) from the rest of the system.",
        "security_purpose": "Protect application-level code and data with hardware enclaves.",
        "use_case": "Confidential inference of proprietary AI models on shared cloud infrastructure.",
        "isolation_type": "Enclave-based",
        "year": 2015,
    },
    {
        "id": "amd-sev",
        "name": "AMD SEV",
        "vendor": "AMD",
        "description": "Secure Encrypted Virtualization encrypts VM memory with per-VM keys managed by the AMD Secure Processor, protecting guests from a compromised hypervisor.",
        "security_purpose": "Encrypt VM memory to defend against hypervisor and host-level attacks.",
        "use_case": "Confidential training of ML models inside sealed cloud VMs.",
        "isolation_type": "VM-based",
        "year": 2017,
    },
    {
        "id": "intel-tdx",
        "name": "Intel TDX",
        "vendor": "Intel",
        "description": "Trust Domain Extensions provides VM-level isolation with hardware-enforced trust domains, extending confidential computing to full virtual machines.",
        "security_purpose": "Isolate entire VMs (Trust Domains) from cloud providers and other tenants.",
        "use_case": "Lift-and-shift confidential AI pipelines without refactoring workloads.",
        "isolation_type": "VM-based",
        "year": 2022,
    },
    {
        "id": "arm-trustzone",
        "name": "ARM TrustZone",
        "vendor": "ARM",
        "description": "System-wide security architecture that partitions execution into Secure and Non-Secure worlds, widely used in mobile and edge devices.",
        "security_purpose": "Provide a hardware-isolated secure world for sensitive operations at the edge.",
        "use_case": "Edge AI inference on mobile / IoT devices with protected biometric data.",
        "isolation_type": "World-based",
        "year": 2004,
    },
]

VALID_TEES = {t["name"] for t in TEE_TECHNOLOGIES}
VALID_SECURITY_LEVELS = {"Standard", "High", "Critical"}
VALID_DATASET_TYPES = {"Text", "Image", "Tabular", "Audio", "Video", "Multimodal"}
VALID_SIZES = {"Small", "Medium", "Large", "X-Large"}
VALID_STATUSES = {"Secure", "Processing", "Completed", "Failed"}

# ---------------- Models ----------------
class WorkloadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    workload_name: str = Field(..., min_length=2, max_length=80)
    model_name: str = Field(..., min_length=1, max_length=80)
    dataset_type: str
    workload_size: str
    security_level: str
    tee_technology: str

    @field_validator("dataset_type")
    @classmethod
    def _v_dataset(cls, v):
        if v not in VALID_DATASET_TYPES:
            raise ValueError(f"dataset_type must be one of {sorted(VALID_DATASET_TYPES)}")
        return v

    @field_validator("workload_size")
    @classmethod
    def _v_size(cls, v):
        if v not in VALID_SIZES:
            raise ValueError(f"workload_size must be one of {sorted(VALID_SIZES)}")
        return v

    @field_validator("security_level")
    @classmethod
    def _v_seclvl(cls, v):
        if v not in VALID_SECURITY_LEVELS:
            raise ValueError(f"security_level must be one of {sorted(VALID_SECURITY_LEVELS)}")
        return v

    @field_validator("tee_technology")
    @classmethod
    def _v_tee(cls, v):
        if v not in VALID_TEES:
            raise ValueError(f"tee_technology must be one of {sorted(VALID_TEES)}")
        return v


class SecurityAnalysis(BaseModel):
    data_protection: int
    memory_isolation: int
    runtime_protection: int
    secure_execution: int
    attestation_status: int
    overall_score: int
    attested: bool
    findings: List[str]
    analyzed_at: str


class Workload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workload_name: str
    model_name: str
    dataset_type: str
    workload_size: str
    security_level: str
    tee_technology: str
    status: str = "Processing"
    security_analysis: Optional[SecurityAnalysis] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---------------- Helpers ----------------
def _score_for(security_level: str, tee: str) -> SecurityAnalysis:
    """Deterministic-ish simulated security analysis."""
    base = {"Standard": 78, "High": 88, "Critical": 94}.get(security_level, 80)
    tee_bonus = {"Intel SGX": 4, "AMD SEV": 3, "Intel TDX": 5, "ARM TrustZone": 2}.get(tee, 0)

    def s(delta_min=-3, delta_max=6):
        return max(60, min(100, base + tee_bonus + random.randint(delta_min, delta_max)))

    dp = s()
    mi = s()
    rp = s()
    se = s()
    att = s(-2, 5)
    overall = round((dp + mi + rp + se + att) / 5)
    attested = overall >= 80

    findings = []
    if dp < 85:
        findings.append("Consider enabling stronger memory encryption for dataset in transit.")
    if mi < 85:
        findings.append("Increase enclave memory reservation to reduce paging events.")
    if att < 85:
        findings.append("Remote attestation quotes should be verified against the latest reference values.")
    if not findings:
        findings.append("All indicators nominal. Workload is executing within trusted boundaries.")

    return SecurityAnalysis(
        data_protection=dp,
        memory_isolation=mi,
        runtime_protection=rp,
        secure_execution=se,
        attestation_status=att,
        overall_score=overall,
        attested=attested,
        findings=findings,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
    )


def _status_for(security_level: str) -> str:
    # Bias status distribution based on security level
    pool = {
        "Standard": ["Secure", "Processing", "Completed", "Completed", "Failed"],
        "High": ["Secure", "Secure", "Processing", "Completed"],
        "Critical": ["Secure", "Secure", "Secure", "Processing", "Completed"],
    }.get(security_level, ["Secure", "Processing", "Completed"])
    return random.choice(pool)


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"service": "SecureAI Cloud API", "status": "online", "version": "1.0.0"}


@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        db_ok = True
    except Exception as e:  # noqa: BLE001
        logger.error(f"DB ping failed: {e}")
        db_ok = False
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime": "nominal",
    }


@api_router.get("/tee-technologies")
async def get_tee_technologies():
    return {"technologies": TEE_TECHNOLOGIES, "count": len(TEE_TECHNOLOGIES)}


@api_router.post("/workloads", response_model=Workload, status_code=status.HTTP_201_CREATED)
async def create_workload(payload: WorkloadCreate):
    initial_status = _status_for(payload.security_level)
    analysis = _score_for(payload.security_level, payload.tee_technology)
    wl = Workload(
        workload_name=payload.workload_name,
        model_name=payload.model_name,
        dataset_type=payload.dataset_type,
        workload_size=payload.workload_size,
        security_level=payload.security_level,
        tee_technology=payload.tee_technology,
        status=initial_status,
        security_analysis=analysis,
    )
    doc = wl.model_dump()
    await db.workloads.insert_one(doc)
    logger.info(f"Workload created: {wl.id}")
    return wl


@api_router.get("/workloads", response_model=List[Workload])
async def list_workloads():
    docs = await db.workloads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/workloads/{workload_id}", response_model=Workload)
async def get_workload(workload_id: str):
    doc = await db.workloads.find_one({"id": workload_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Workload not found")
    return doc


@api_router.post("/workloads/{workload_id}/security-analysis", response_model=SecurityAnalysis)
async def run_security_analysis(workload_id: str):
    doc = await db.workloads.find_one({"id": workload_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Workload not found")
    analysis = _score_for(doc["security_level"], doc["tee_technology"])
    await db.workloads.update_one(
        {"id": workload_id},
        {"$set": {"security_analysis": analysis.model_dump()}},
    )
    return analysis


@api_router.get("/dashboard/stats")
async def dashboard_stats():
    total = await db.workloads.count_documents({})
    active = await db.workloads.count_documents({"status": {"$in": ["Secure", "Processing"]}})
    protected = await db.workloads.count_documents({"status": {"$in": ["Secure", "Completed"]}})
    failed = await db.workloads.count_documents({"status": "Failed"})

    # Recent activity
    recent = await (
        db.workloads.find({}, {"_id": 0}).sort("created_at", -1).to_list(6)
    )
    # TEE distribution
    pipeline = [{"$group": {"_id": "$tee_technology", "count": {"$sum": 1}}}]
    tee_dist_raw = await db.workloads.aggregate(pipeline).to_list(20)
    tee_distribution = [{"tee": r["_id"], "count": r["count"]} for r in tee_dist_raw]

    return {
        "total_workloads": total,
        "active_workloads": active,
        "protected_workloads": protected,
        "failed_workloads": failed,
        "tee_status": "operational",
        "system_health": "healthy",
        "overall_security": "high" if failed == 0 else "warning",
        "recent_activity": recent,
        "tee_distribution": tee_distribution,
    }


@api_router.get("/deployment-status")
async def deployment_status():
    return {
        "source_control": {
            "provider": "GitHub",
            "repository": "secureai-cloud",
            "branch": "main",
            "last_commit": "feat: add radar security analysis chart",
            "commit_hash": "a1b4c9e",
        },
        "ci_cd": {
            "tool": "Jenkins",
            "pipeline": "secureai-cloud-pipeline",
            "build_status": "SUCCESS",
            "test_status": "PASSED",
            "deploy_status": "DEPLOYED",
            "last_build": datetime.now(timezone.utc).isoformat(),
            "build_number": 142,
            "duration_seconds": 187,
        },
        "environment": {
            "name": "preview",
            "region": "us-east-1",
            "container_runtime": "docker",
            "orchestrator": "docker-compose",
        },
        "stages": [
            {"name": "Checkout", "status": "SUCCESS", "duration": 4},
            {"name": "Install Dependencies", "status": "SUCCESS", "duration": 42},
            {"name": "Frontend Build", "status": "SUCCESS", "duration": 68},
            {"name": "Backend Tests", "status": "SUCCESS", "duration": 21},
            {"name": "Frontend Tests", "status": "SUCCESS", "duration": 18},
            {"name": "Package", "status": "SUCCESS", "duration": 15},
            {"name": "Deploy", "status": "SUCCESS", "duration": 12},
            {"name": "Health Check", "status": "SUCCESS", "duration": 7},
        ],
    }


# ---------------- Seed data ----------------
SEED_WORKLOADS = [
    {
        "workload_name": "Fraud Detection Inference",
        "model_name": "XGBoost-Fraud-v3",
        "dataset_type": "Tabular",
        "workload_size": "Medium",
        "security_level": "Critical",
        "tee_technology": "Intel SGX",
        "status": "Secure",
    },
    {
        "workload_name": "Medical Imaging Diagnosis",
        "model_name": "ResNet50-Radiology",
        "dataset_type": "Image",
        "workload_size": "Large",
        "security_level": "Critical",
        "tee_technology": "Intel TDX",
        "status": "Secure",
    },
    {
        "workload_name": "Federated LLM Fine-tuning",
        "model_name": "Llama3-8B-Enterprise",
        "dataset_type": "Text",
        "workload_size": "X-Large",
        "security_level": "High",
        "tee_technology": "AMD SEV",
        "status": "Processing",
    },
    {
        "workload_name": "Voice Assistant Edge Inference",
        "model_name": "Whisper-Small",
        "dataset_type": "Audio",
        "workload_size": "Small",
        "security_level": "Standard",
        "tee_technology": "ARM TrustZone",
        "status": "Completed",
    },
    {
        "workload_name": "Insurance Risk Scoring",
        "model_name": "LightGBM-Risk-v2",
        "dataset_type": "Tabular",
        "workload_size": "Medium",
        "security_level": "High",
        "tee_technology": "Intel SGX",
        "status": "Completed",
    },
]


async def seed_workloads():
    existing = await db.workloads.count_documents({})
    if existing > 0:
        logger.info(f"Skipping seed: {existing} workloads already present.")
        return
    docs = []
    now = datetime.now(timezone.utc)
    for i, s in enumerate(SEED_WORKLOADS):
        analysis = _score_for(s["security_level"], s["tee_technology"])
        wl = Workload(
            workload_name=s["workload_name"],
            model_name=s["model_name"],
            dataset_type=s["dataset_type"],
            workload_size=s["workload_size"],
            security_level=s["security_level"],
            tee_technology=s["tee_technology"],
            status=s["status"],
            security_analysis=analysis,
        )
        d = wl.model_dump()
        # backdate creation slightly for realism
        d["created_at"] = (now.replace(microsecond=0)).isoformat()
        docs.append(d)
    if docs:
        await db.workloads.insert_many(docs)
        logger.info(f"Seeded {len(docs)} sample workloads.")


# ---------------- App wiring ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup():
    try:
        await seed_workloads()
    except Exception as e:  # noqa: BLE001
        logger.error(f"Seed failed: {e}")


@app.on_event("shutdown")
async def _shutdown():
    client.close()


@app.exception_handler(Exception)
async def _global_handler(request, exc):  # noqa: ANN001
    logger.exception(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
    )
