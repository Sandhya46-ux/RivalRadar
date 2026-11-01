import os
import asyncio
import ipaddress
import logging
import socket
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import validate_config
from schemas import InvestigationRequest, InvestigationResponse
from orchestrator import run_investigation


# --------------------------------------------------
# LOGGING
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("RivalRadar")


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="RivalRadar API",
    description="AI-powered competitor intelligence platform",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

if FRONTEND_ORIGIN:
    allowed_origins.extend(
        origin.strip()
        for origin in FRONTEND_ORIGIN.split(",")
        if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

# --------------------------------------------------
# URL VALIDATION
# --------------------------------------------------

def check_public_url(url: str):
    """Accept public HTTPS websites only."""

    parsed = urlparse(str(url))

    if parsed.scheme != "https":
        raise ValueError("Only HTTPS URLs are allowed.")

    hostname = parsed.hostname

    if not hostname:
        raise ValueError("Invalid website hostname.")

    if (
        hostname.lower() == "localhost"
        or hostname.lower().endswith(".localhost")
    ):
        raise ValueError("Localhost URLs are not allowed.")

    if parsed.username or parsed.password:
        raise ValueError(
            "URLs containing credentials are not allowed."
        )

    try:
        addresses = socket.getaddrinfo(
            hostname,
            parsed.port or 443,
            type=socket.SOCK_STREAM
        )

        if not addresses:
            raise ValueError(
                "Could not resolve website hostname."
            )

        for address in addresses:

            ip = ipaddress.ip_address(address[4][0])

            if not ip.is_global:
                raise ValueError(
                    "Private or non-public IP addresses are not allowed."
                )

    except socket.gaierror as exc:
        raise ValueError(
            "Could not resolve website hostname."
        ) from exc


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "Welcome to RivalRadar API",
        "status": "running"
    }


# --------------------------------------------------
# HEALTH
# --------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "RivalRadar API"
    }


# --------------------------------------------------
# INVESTIGATION
# --------------------------------------------------

@app.post(
    "/api/investigate",
    response_model=InvestigationResponse
)
async def investigate(request: InvestigationRequest):

    logger.info("INVESTIGATION REQUEST RECEIVED")

    try:

        company_url = str(request.company_url)

        competitor_urls = [
            str(url)
            for url in request.competitor_urls
        ]

        all_urls = [company_url] + competitor_urls

        if len(all_urls) > 4:
            raise ValueError(
                "Only one company and up to three competitors are allowed."
            )

        logger.info("Validating %s website(s)", len(all_urls))

        for url in all_urls:
            await asyncio.to_thread(check_public_url, url)

        logger.info("URL VALIDATION SUCCESSFUL")

        logger.info(
            "STARTING TINYFISH QUEUE-AND-POLL "
            "AND GEMINI INVESTIGATION"
        )

        result = await asyncio.wait_for(
            run_investigation(
                company_url=company_url,
                competitor_urls=competitor_urls
            ),
            timeout=720
        )

        logger.info("INVESTIGATION COMPLETED SUCCESSFULLY")

        return result

    except asyncio.TimeoutError:

        logger.error("INVESTIGATION TIMED OUT")

        raise HTTPException(
            status_code=504,
            detail=(
                "Investigation exceeded the 720-second limit. "
                "Please try again later."
            )
        )

    except ValueError as exc:

        logger.warning("VALIDATION ERROR: %s", exc)

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except HTTPException:
        raise

    except Exception:

        logger.exception("INVESTIGATION FAILED")

        raise HTTPException(
            status_code=502,
            detail=(
                "Investigation failed. "
                "Check the backend terminal for details."
            )
        )


# --------------------------------------------------
# STARTUP
# --------------------------------------------------

@app.on_event("startup")
async def startup_event():

    validate_config()

    logger.info("RIVALRADAR API STARTED SUCCESSFULLY")


# --------------------------------------------------
# SHUTDOWN
# --------------------------------------------------

@app.on_event("shutdown")
async def shutdown_event():

    logger.info("RIVALRADAR API SHUTTING DOWN")
