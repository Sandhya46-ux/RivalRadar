
import asyncio
import logging
from urllib.parse import urlparse

from tinyfish_client import research_website
from analyzer import analyze_competitors


logger = logging.getLogger("RivalRadar.Orchestrator")

MAX_CONCURRENT_RESEARCH = 2
WEBSITE_TIMEOUT = 315
ANALYSIS_TIMEOUT = 180


def validate_website_url(url: str) -> str:
    """Validate and normalize an HTTPS website URL."""

    url = url.strip()
    parsed = urlparse(url)

    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError(f"Invalid website URL: {url}")

    if parsed.username or parsed.password:
        raise ValueError("URLs containing credentials are not allowed.")

    return url.rstrip("/")


async def research_with_limit(
    url: str,
    semaphore: asyncio.Semaphore
):
    """Research one website with concurrency and timeout controls."""

    async with semaphore:

        logger.info("Starting TinyFish research: %s", url)

        try:
            result = await asyncio.wait_for(
                research_website(url),
                timeout=WEBSITE_TIMEOUT
            )

            logger.info("Research completed: %s", url)
            return result

        except asyncio.TimeoutError as exc:
            logger.error("Website research timed out: %s", url)

            raise RuntimeError(
                f"Research exceeded {WEBSITE_TIMEOUT} seconds: {url}"
            ) from exc

        except asyncio.CancelledError:
            logger.warning("Research cancelled: %s", url)
            raise

        except Exception:
            logger.exception("Website research failed: %s", url)
            raise


async def run_investigation(
    company_url: str,
    competitor_urls: list[str]
) -> dict:
    """
    Coordinate TinyFish research and Gemini analysis.
    Supports one company and up to three competitors.
    """

    logger.info("Investigation orchestration started")

    if len(competitor_urls) > 3:
        raise ValueError("A maximum of 3 competitors is allowed.")

    company_url = validate_website_url(company_url)

    competitor_urls = [
        validate_website_url(url)
        for url in competitor_urls
    ]

    urls = [company_url] + competitor_urls

    if len(set(urls)) != len(urls):
        raise ValueError("Duplicate website URLs are not allowed.")

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_RESEARCH)

    logger.info("Starting research for %s website(s)", len(urls))

    tasks = [
        research_with_limit(url, semaphore)
        for url in urls
    ]

    results = await asyncio.gather(
        *tasks,
        return_exceptions=True
    )

    successful_research = []
    failed_research = []

    for index, result in enumerate(results):

        website_record = {
            "type": "own_company" if index == 0 else "competitor",
            "url": urls[index]
        }

        if isinstance(result, asyncio.CancelledError):
            raise result

        if isinstance(result, BaseException):

            error_message = str(result) or type(result).__name__

            failed_research.append({
                **website_record,
                "error": error_message
            })

            logger.error(
                "Website failed: %s | %s",
                urls[index],
                error_message
            )

        else:

            successful_research.append({
                **website_record,
                **result
            })

    logger.info(
        "Research finished: %s successful, %s failed",
        len(successful_research),
        len(failed_research)
    )

    if not successful_research:
        raise RuntimeError(
            "Research failed for all submitted websites."
        )

    # Gemini analysis: one request for all four specialists.
    logger.info("Starting Gemini competitor analysis")

    try:
        analysis = await asyncio.wait_for(
            asyncio.to_thread(
                analyze_competitors,
                successful_research
            ),
            timeout=ANALYSIS_TIMEOUT
        )

        logger.info("Gemini analysis completed")

    except asyncio.TimeoutError:

        logger.error("Gemini analysis timed out")

        analysis = {
            "status": "timeout",
            "message": (
                f"Gemini analysis exceeded {ANALYSIS_TIMEOUT} seconds."
            )
        }

    except Exception as exc:

        logger.exception("Gemini analysis failed")

        analysis = {
            "status": "error",
            "message": str(exc)
        }

    response = {
        "status": "completed",
        "websites_researched": len(successful_research),
        "research": successful_research,
        "failed_websites": failed_research,
        "analysis": analysis
    }

    logger.info("Investigation orchestration completed")

    return response
