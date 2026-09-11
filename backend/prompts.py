from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

def build_parser(schema_class):
    return PydanticOutputParser(pydantic_object=schema_class)


def build_prompts(schema_class):
    parser = build_parser(schema_class)

    extraction_prompt = PromptTemplate(
        template=(
            "Extract structured data from the following text.\n"
            "{format_instructions}\n\n"
            "Text:\n{input_text}\n"
        ),
        input_variables=["input_text"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    fix_prompt = PromptTemplate(
        template=(
            "You previously tried to generate structured output but it was invalid.\n\n"
            "{format_instructions}\n\n"
            "Original text:\n{input_text}\n\n"
            "Your previous (invalid) output:\n{bad_output}\n\n"
            "The error was:\n{error}\n\n"
            "Return ONLY the corrected output matching the format instructions exactly. "
            "No explanation, just the corrected output."
        ),
        input_variables=["input_text", "bad_output", "error"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    return parser, extraction_prompt, fix_prompt

def build_relevance_prompt(schema_class):
    return PromptTemplate(
        template=(
            "Does the following text contain real information matching this: "
            "{schema_description}\n"
            "Answer with exactly one word: YES or NO. No explanation.\n\n"
            "Text:\n{input_text}\n"
        ),
        input_variables=["input_text"],
        partial_variables={"schema_description": schema_class.__doc__ or schema_class.__name__},
    )