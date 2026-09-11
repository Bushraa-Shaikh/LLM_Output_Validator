# LLM Output Validator

A Python tool that extracts structured, validated data from unstructured text using an LLM — with automatic retry-and-self-correction when the LLM's output fails validation.

## The Problem

LLMs are unreliable at producing perfectly formatted structured output (e.g. JSON matching a schema). They can return malformed JSON, missing fields, or wrong data types. Naively trusting LLM output in production leads to silent failures or crashes.

## The Solution

This project extracts a structured product review from raw text, validates it against a strict schema, and — if validation fails — automatically retries by feeding the LLM its own broken output plus the specific error, so it can self-correct. Up to 3 attempts before failing loudly and explicitly.

## How It Works

1. **`schema.py`** — defines the exact shape of valid output using Pydantic (fields, types, constraints)
2. **`prompts.py`** — builds the extraction prompt (first attempt) and a separate "fix" prompt (retries, includes the previous bad output + error)
3. **`validator.py`** — orchestrates the retry loop: calls the LLM, tries to parse/validate the response, and on failure, calls the LLM again with the fix prompt
4. **`main.py`** — a minimal entry point demonstrating the validator on a sample review

## Tech Stack

- Python
- LangChain (`PydanticOutputParser`, `PromptTemplate`)
- Pydantic (schema definition and validation)
- Groq API (LLM inference)

## Setup

1. Clone this repo
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `venv\Scripts\Activate.ps1` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with your Groq API key: