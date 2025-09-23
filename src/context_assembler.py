from typing import List
from langchain.schema import Document
import re

# Potential inputs:
#   - Relevant Documents (.po.js)
#   - User Query
#   - Conversation History (future)

# Base system-style instruction for codegen mode
BASE_CODEGEN_PROMPT = """
You are a code generator for Page Object development.
You are trained on a consistent dataset of files:

* BasePanel.js: shared base class with standardized utilities (waits, clicks, dropdowns, validation, responses).
* LoginPanel.js: demonstrates login workflows with email/password inputs, error/success handling, and redirects.
* LogOutPanel.js: demonstrates logout workflows with confirmation/cancel buttons, user info retrieval, and result validation.
* DashboardPanel.js: demonstrates dashboard workflows with stats, recent activity, quick actions, refresh, and logout.
* SettingsPanel.js: demonstrates profile update workflows with form inputs, dropdowns, toggles, validation errors, and reset/cancel flows.

Key consistency rules across the dataset:
* All panels extend BasePanel.
* Each panel defines a `locators` getter and a `waitForPageLoad()` implementation.
* All interaction methods wrap Selenium calls with base utilities (`clickElement`, `enterText`, `selectFromDropdown`).
* Validation methods use `waitForElementVisible` and then return values (`getText`, `getAttribute`).
* Workflow methods always return `this.createResponse(success, message, { optionalData })`.
* `validateAllElementsPresent()` checks a list of required elements.
* Imports follow the pattern:

  const { By, until, Select } = require('selenium-webdriver');
  const BasePanel = require('./BasePanel');
"""


def _format_chunk(doc: Document, index: int, max_chars: int = 1000) -> str:
    """
    Format a single retrieved document chunk with numbering and source metadata.
    """
    # Try to get the source filename from metadata, fallback to "unknown"
    source = doc.metadata.get("source", "unknown")

    # Clean + trim overly long content
    text = (doc.page_content or "").strip()
    if len(text) > max_chars:
        text = text[:max_chars] + "..."

    # Return labeled chunk block
    return f"Context #{index} (source: {source}):\n{text}\n"


def assemble_context(
    docs: List[Document],
    query: str,
    max_chunks: int = 5,
    max_chars: int = 1000
) -> str:
    """
    Take retrieved chunks and user query, assemble into a structured prompt.
    Adds special instructions if query looks like a code generation request.
    """
    context_parts = []

    # Loop over each retrieved document (chunk)
    for i, doc in enumerate(docs[:max_chunks], start=1):
        snippet = _format_chunk(doc, i, max_chars=max_chars)
        if snippet.strip():  # skip empty chunks
            context_parts.append(snippet)

    # Combine chunks into one context block
    context_text = "\n".join(context_parts).strip()

    # Detect codegen intent using regex (covers generate/generates/generated/generating)
    if re.search(r"\bgenerat(e|es|ed|ing)?\b", query.lower()) and (
        "panel" in query.lower() or ".po.js" in query.lower()
    ):
        # Code generation mode
        instruction = (
            BASE_CODEGEN_PROMPT
            + "\n\nUse the following context as reference to generate a new panel file "
              "in valid JavaScript (.po.js) syntax. Follow the same class structure, "
              "selectors pattern, methods, and export style shown in the context."
        )
        mode_tag = "[codegen]"
    else:
        # Default Q&A mode
        instruction = (
            "Use the following context to answer the question and cite sources/file names. "
            "If the answer is not in the context, say \"I don’t know.\""
        )
        mode_tag = "[qa]"

    # Print mode so user knows which path was taken
    print(f"> Mode detected: {mode_tag}")

    # Final stitched prompt
    prompt = f"""{instruction}

{context_text}

Question: {query}
Answer {mode_tag}:"""

    # Return cleaned string
    return prompt.strip()
