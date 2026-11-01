
import json
import logging

from google import genai

from config import GEMINI_API_KEY, GEMINI_MODEL
from agents import get_all_agents


logger = logging.getLogger("RivalRadar.Gemini")

client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_competitors(research_data: list) -> dict:
    """
    Generate all four specialist reports using ONE Gemini request.

    This replaces four sequential API calls with one combined request.
    """

    agents = get_all_agents()

    agent_instructions = []

    for agent in agents:
        agent_instructions.append({
            "agent_name": agent["name"],
            "role": agent["role"],
            "objective": agent["objective"]
        })

    prompt = f"""
You are the central intelligence engine of RivalRadar.

Analyze the supplied website research and produce FOUR separate
specialist reports.

SPECIALIST AGENTS:

{json.dumps(agent_instructions, indent=2, ensure_ascii=False)}

WEBSITE RESEARCH EVIDENCE:

{json.dumps(research_data, indent=2, ensure_ascii=False)}

STRICT RULES:

1. Use only the supplied research evidence.
2. Never invent company facts, prices, features or announcements.
3. Include source URLs wherever possible.
4. Distinguish verified facts from strategic inferences.
5. Clearly identify missing information.
6. Never present an inference as a verified fact.
7. Do not invent recent update dates.
8. Compare the submitted company with its competitors.
9. Make recommendations based on actual evidence.
10. Return valid JSON only. Do not use Markdown code fences.

RETURN THIS JSON STRUCTURE:

{{
    "Market Scout": {{
        "company_overviews": [],
        "products_and_services": [],
        "target_customers": [],
        "market_positioning": [],
        "verified_facts": [],
        "missing_information": []
    }},
    "Pricing Analyst": {{
        "pricing_comparison": [],
        "plan_differences": [],
        "verified_facts": [],
        "missing_information": []
    }},
    "Change Detector": {{
        "recent_updates": [],
        "product_launches": [],
        "announcements": [],
        "verified_facts": [],
        "missing_information": []
    }},
    "Strategy Analyst": {{
        "competitive_strengths": [],
        "competitive_weaknesses": [],
        "market_gaps": [],
        "opportunities": [],
        "threats": [],
        "recommendations": [],
        "evidence": []
    }}
}}

Every report must contain meaningful analysis supported by the supplied
evidence. Use empty arrays when evidence is unavailable.
"""

    logger.info("Sending combined analysis request to Gemini")

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )

        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        raw_text = response.text.strip()

        # Remove Markdown code fences if present.
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1]
            raw_text = raw_text.rsplit("```", 1)[0].strip()

        results = json.loads(raw_text)

        required_agents = [
            "Market Scout",
            "Pricing Analyst",
            "Change Detector",
            "Strategy Analyst"
        ]

        for agent_name in required_agents:
            if agent_name not in results:
                results[agent_name] = {
                    "status": "error",
                    "message": "This specialist report was not returned."
                }

        logger.info("All four Gemini specialist reports generated")

        return results

    except Exception as exc:
        logger.exception("Gemini analysis failed")

        return {
            agent["name"]: {
                "status": "error",
                "message": str(exc)
            }
            for agent in agents
        }
