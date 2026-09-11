import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from prompts import build_prompts, build_relevance_prompt

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)


def get_structured_output(input_text: str, schema_class, max_retries: int = 3):
    """
    Tries to get valid structured output from the LLM, matching schema_class.
    On failure, feeds the bad output + error back to the LLM so it can self-correct.
    Raises RuntimeError if it still fails after max_retries attempts.
    """
    parser, extraction_prompt, fix_prompt = build_prompts(schema_class)
    relevance_prompt = build_relevance_prompt(schema_class)
    relevance_response = llm.invoke(relevance_prompt.format(input_text=input_text))

    if "NO" in relevance_response.content.strip().upper():
        raise RuntimeError(
           "The provided text doesn't contain enough information for this data type."
    )
    last_error = None
    last_raw_output = None

    for attempt in range(1, max_retries + 1):
        try:
            print(f"Attempt {attempt}...")

            if attempt == 1:
                raw_response = llm.invoke(
                    extraction_prompt.format(input_text=input_text)
                )
            else:
                raw_response = llm.invoke(
                    fix_prompt.format(
                        input_text=input_text,
                        bad_output=last_raw_output,
                        error=str(last_error),
                    )
                )

            raw_text = raw_response.content
            last_raw_output = raw_text
            if raw_text.strip() == "NO_MATCH":
              raise RuntimeError(
                "The provided text doesn't contain enough information for this data type."
    )
            result = parser.parse(raw_text)
            print("Success!")
            return {"data": result, "attempts": attempt}

        except Exception as e:
            last_error = e
            print(f"Attempt {attempt} failed: {e}")

    raise RuntimeError(
        f"Failed to get valid structured output after {max_retries} attempts"
    ) from last_error