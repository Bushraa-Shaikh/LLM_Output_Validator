from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from validator import get_structured_output
from schema import SCHEMA_REGISTRY

app = FastAPI(title="LLM Output Validator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    input_text: str
    schema_type: str  # one of: "product_review", "invoice", "resume"


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.get("/schemas")
def list_schemas():
    return {"schemas": list(SCHEMA_REGISTRY.keys())}


@app.post("/extract")
def extract(request: ExtractRequest):
    schema_class = SCHEMA_REGISTRY.get(request.schema_type)
    if schema_class is None:
        raise HTTPException(status_code=400, detail=f"Unknown schema_type: {request.schema_type}")

    try:
        result = get_structured_output(request.input_text, schema_class)
        return {
            "attempts": result["attempts"],
            **result["data"].model_dump(),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))