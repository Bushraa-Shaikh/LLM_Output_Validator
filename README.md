# LLM Output Validator

A full-stack web app that extracts structured, validated data from unstructured text using an LLM — with automatic retry and self-correction when the model's output fails validation, and an honest rejection when the input doesn't match the requested data type.

## The Problem

LLMs are unreliable at producing perfectly formatted structured output. They can return malformed JSON, missing fields, wrong data types — or worse, invent plausible-looking values when the input doesn't actually contain what's being asked for. Naively trusting LLM output in production leads to silent failures or fabricated data.

## The Solution

This app extracts structured data (product reviews, invoices, or resumes) from raw text, validates it against a strict schema, and — if validation fails — automatically retries by feeding the LLM its own broken output plus the specific error, so it can self-correct (up to 3 attempts). A separate relevance check runs first, so the app cleanly rejects input that doesn't actually match the selected data type instead of hallucinating fake values to force a fit.

## Features

- **Multiple schema types** — Product Review, Invoice, Resume (easily extensible)
- **Automatic retry with error-feedback self-correction** — up to 3 attempts, each one shown the previous failure
- **Relevance detection** — rejects irrelevant/insufficient input honestly instead of fabricating data
- **Extraction history** — last 10 extractions saved locally, browsable and reloadable
- **JSON export** — copy any result as formatted JSON
- **Full-stack** — FastAPI backend + React/Vite/Tailwind frontend

## How It Works

**Backend (`backend/`)**
- `schema.py` — Pydantic schemas defining the exact shape of valid output for each data type
- `prompts.py` — builds the extraction prompt, the retry/fix prompt, and the relevance-check prompt per schema
- `validator.py` — orchestrates relevance checking, extraction, validation, and the retry loop
- `app.py` — FastAPI app exposing `/extract` and `/schemas` endpoints

**Frontend (`frontend/`)**
- React app with a schema picker, text input, live-rendered results per schema type, extraction history (persisted via `localStorage`), and JSON export

## Tech Stack

- **Backend:** Python, FastAPI, LangChain (`PydanticOutputParser`), Pydantic, Groq API
- **Frontend:** React, Vite, Tailwind CSS

## Setup

### Backend
