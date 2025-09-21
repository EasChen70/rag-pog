from typing import List
from langchain.schema import Document

# Potential inputs:
#   - Relevant Documents (.po.js)
#   - User Query
#   - Conversation History (future)


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


def assemble_context(docs: List[Document], query: str, max_chunks: int = 5, max_chars: int = 1000) -> str:
    """
    Take retrieved chunks and user query, assemble into a structured prompt.
    """
    context_parts = []

    # Loop over each retrieved document (chunk)
    for i, doc in enumerate(docs[:max_chunks], start=1):
        snippet = _format_chunk(doc, i, max_chars=max_chars)
        if snippet.strip():  # skip empty chunks
            context_parts.append(snippet)

    # Combine chunks into one context block
    context_text = "\n".join(context_parts).strip()

    # Final stitched prompt
    prompt = f"""Use the following context to answer the question.
    If the answer is not in the context, say "I don’t know."

    {context_text}

    Question: {query}
    Answer:"""

    # Return cleaned string
    return prompt.strip()
