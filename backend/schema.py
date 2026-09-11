from pydantic import BaseModel, Field


class ProductReview(BaseModel):
    """Schema for a structured product review extracted from text."""
    product_name: str = Field(description="Name of the product being reviewed")
    rating: int = Field(description="Rating out of 5", ge=1, le=5)
    summary: str = Field(description="One-sentence summary of the review")
    pros: list[str] = Field(description="List of positive points mentioned")
    cons: list[str] = Field(description="List of negative points mentioned")


class Invoice(BaseModel):
    """Schema for a structured invoice extracted from text."""
    vendor_name: str = Field(description="Name of the company/person issuing the invoice")
    invoice_number: str = Field(description="Invoice number or ID")
    total_amount: float = Field(description="Total amount due")
    due_date: str = Field(description="Payment due date, as written in the text")
    line_items: list[str] = Field(description="List of individual items or services billed")


class Resume(BaseModel):
    """Schema for a structured resume/CV extracted from text."""
    full_name: str = Field(description="Candidate's full name")
    years_experience: int = Field(description="Approximate total years of professional experience", ge=0)
    skills: list[str] = Field(description="List of key skills mentioned")
    most_recent_role: str = Field(description="Most recent job title and company")
    summary: str = Field(description="One-sentence summary of the candidate's background")


# Registry so other files can look up a schema by name (used for the dropdown + dynamic parsing)
SCHEMA_REGISTRY = {
    "product_review": ProductReview,
    "invoice": Invoice,
    "resume": Resume,
}