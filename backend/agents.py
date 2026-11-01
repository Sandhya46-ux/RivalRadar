
"""
RivalRadar - Specialized AI Research Agents

Each agent has a distinct responsibility.
TinyFish gathers website evidence; Gemini will analyze it.
"""

AGENTS = {
    "market_scout": {
        "name": "Market Scout",
        "role": "Market Research Specialist",
        "objective": """
        Analyze the company's market positioning.

        Identify:
        - Company overview and business model
        - Main products and services
        - Target customer segments
        - Key value propositions
        - Market positioning

        Use only the supplied research evidence.
        Clearly identify information that is unavailable.
        """
    },

    "pricing_analyst": {
        "name": "Pricing Analyst",
        "role": "Competitive Pricing Specialist",
        "objective": """
        Analyze the company's pricing strategy.

        Identify:
        - Available pricing plans
        - Exact prices and currencies
        - Billing periods
        - Features included in each plan
        - Differences between plans

        Never estimate or invent prices.
        If pricing is not available, explicitly report it.
        """
    },

    "change_detector": {
        "name": "Change Detector",
        "role": "Product and Market Intelligence Specialist",
        "objective": """
        Analyze the company's recent announcements and changes.

        Identify:
        - New product launches
        - Newly announced features
        - Product updates
        - Public announcements
        - Relevant dated developments

        Include dates and source URLs when available.
        Never label an undated or old feature as a recent update.
        """
    },

    "strategy_analyst": {
        "name": "Strategy Analyst",
        "role": "Competitive Strategy Specialist",
        "objective": """
        Compare the collected company research.

        Identify:
        - Competitive strengths
        - Competitive weaknesses
        - Product and pricing differences
        - Potential market gaps
        - Business opportunities
        - Actionable strategic recommendations

        Separate evidence-based findings from strategic inferences.
        Explain the evidence behind every recommendation.
        Do not invent competitor capabilities.
        """
    }
}


def get_agent(agent_id: str) -> dict:
    """Return a specialist agent configuration."""

    if agent_id not in AGENTS:
        raise ValueError(f"Unknown agent: {agent_id}")

    return AGENTS[agent_id]


def get_all_agents() -> list:
    """Return all four specialist agents."""

    return list(AGENTS.values())
