
import asyncio
import logging

from tinyfish import AsyncTinyFish
from config import TINYFISH_API_KEY


logger = logging.getLogger("RivalRadar.TinyFish")


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

QUEUE_TIMEOUT = 30.0
POLL_INTERVAL = 5.0
MAX_RESEARCH_SECONDS = 300.0


# --------------------------------------------------
# STRUCTURED RESEARCH OUTPUT
# --------------------------------------------------

RESEARCH_SCHEMA = {
    "type": "object",
    "properties": {
        "company_name": {"type": "string"},
        "company_description": {"type": "string"},
        "products_and_services": {
            "type": "array",
            "items": {"type": "string"}
        },
        "target_customers": {
            "type": "array",
            "items": {"type": "string"}
        },
        "pricing_information": {
            "type": "array",
            "items": {"type": "string"}
        },
        "recent_updates": {
            "type": "array",
            "items": {"type": "string"}
        },
        "market_positioning": {"type": "string"},
        "key_features": {
            "type": "array",
            "items": {"type": "string"}
        },
        "source_urls": {
            "type": "array",
            "items": {"type": "string"}
        },
        "missing_information": {
            "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": [
        "company_name",
        "company_description",
        "products_and_services",
        "target_customers",
        "pricing_information",
        "recent_updates",
        "market_positioning",
        "key_features",
        "source_urls",
        "missing_information"
    ]
}


# --------------------------------------------------
# TINYFISH RESEARCH GOAL
# --------------------------------------------------

RESEARCH_GOAL = """
You are RivalRadar's competitor intelligence research agent.

Research the company at the supplied URL using its public website.

Inspect only the most relevant pages:

1. Homepage
2. About or Company page
3. Products or Features page
4. Pricing page
5. Blog, News or Announcements page

Do not explore unrelated pages or perform an exhaustive website crawl.

Extract the following information:

1. Company name and description.
2. Main products and services.
3. Important product features and capabilities.
4. Target customers and industries.
5. Public pricing, plans and subscription details.
6. Recent product launches and announcements.
7. Market positioning and value proposition.
8. Source URLs supporting each finding.
9. Information that could not be found.

STRICT RULES:

- Use only information actually found on the website.
- Do not invent facts, prices, features or dates.
- Do not guess missing information.
- If pricing is unavailable, return an empty array.
- If recent updates cannot be verified, return an empty array.
- Record missing information explicitly.
- Keep findings concise and factual.
- Include source URLs wherever possible.
- Return the requested structured JSON output.
"""


# --------------------------------------------------
# RESEARCH WEBSITE
# --------------------------------------------------

async def research_website(url: str) -> dict:
    """
    Queue a TinyFish browser task and poll until completion.

    Returns structured research data for Gemini analysis.
    """

    logger.info("Initializing TinyFish research: %s", url)

    client = AsyncTinyFish(
        api_key=TINYFISH_API_KEY,
        timeout=QUEUE_TIMEOUT,
        max_retries=0
    )

    # STEP 1: Queue the browser automation.
    try:
        queued = await client.agent.queue(
            goal=RESEARCH_GOAL,
            url=url,
            output_schema=RESEARCH_SCHEMA
        )

    except Exception as exc:
        logger.exception("TinyFish queue request failed: %s", url)

        raise RuntimeError(
            f"Could not queue TinyFish research for {url}: {exc}"
        ) from exc

    run_id = queued.run_id

    if queued.error:
        raise RuntimeError(
            f"TinyFish queue error for {url}: {queued.error}"
        )

    if not run_id:
        raise RuntimeError(
            f"TinyFish did not return a run ID for {url}"
        )

    logger.info(
        "TinyFish task queued | URL: %s | Run ID: %s",
        url,
        run_id
    )

    # STEP 2: Poll until completion.
    elapsed = 0.0

    while elapsed < MAX_RESEARCH_SECONDS:

        await asyncio.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL

        try:
            run = await client.runs.get(run_id)

        except Exception as exc:
            logger.exception(
                "TinyFish polling failed | Run ID: %s",
                run_id
            )

            raise RuntimeError(
                f"Could not retrieve TinyFish run {run_id}: {exc}"
            ) from exc

        status = getattr(run.status, "value", run.status)
        status = str(status).upper()

        logger.info(
            "TinyFish status: %s | URL: %s | Elapsed: %ss",
            status,
            url,
            int(elapsed)
        )

        if status == "COMPLETED":

            if run.result is None:
                raise RuntimeError(
                    f"TinyFish completed without research data: {url}"
                )

            logger.info(
                "TinyFish research completed successfully: %s",
                url
            )

            return {
                "url": url,
                "run_id": run_id,
                "status": "completed",
                "data": run.result
            }

        if status in ("FAILED", "CANCELLED"):

            error = getattr(run, "error", None)

            raise RuntimeError(
                f"TinyFish research {status.lower()} "
                f"for {url}: {error}"
            )

    raise TimeoutError(
        f"TinyFish research exceeded {MAX_RESEARCH_SECONDS} seconds. "
        f"URL: {url} | Run ID: {run_id}"
    )
