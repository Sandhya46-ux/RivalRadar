
from pydantic import BaseModel, Field, HttpUrl, field_validator


class InvestigationRequest(BaseModel):
    company_url: HttpUrl
    competitor_urls: list[HttpUrl] = Field(
        default_factory=list,
        max_length=3
    )

    @field_validator("competitor_urls")
    @classmethod
    def validate_competitors(cls, urls):
        normalized = [str(url).rstrip("/") for url in urls]

        if len(normalized) != len(set(normalized)):
            raise ValueError("Duplicate competitor URLs are not allowed.")

        return urls


class InvestigationResponse(BaseModel):
    status: str
    websites_researched: int
    research: list[dict]
    failed_websites: list[dict]
    analysis: dict
