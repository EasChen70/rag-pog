from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
import numpy as np
import pickle
import os
from dotenv import load_dotenv

# Load env variables (expects OPENAI_API_KEY in src/api_keys.env)
load_dotenv("src/api_keys.env")
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Missing OPENAI_API_KEY in src/api_keys.env")


def build_vector_store(chunks_path="chunks.pkl", persist_dir="./chroma_db"):
    """Build a Chroma vector store from saved chunks."""

    # Load pre-chunked docs
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    # Initialize embedding function (needed by Chroma)
    embedding_function = OpenAIEmbeddings(
        model="text-embedding-3-large",
        openai_api_key=api_key
    )

    # Build DB from texts + metadata
    db = Chroma.from_texts(
        texts=[c.page_content for c in chunks],
        metadatas=[c.metadata for c in chunks],
        embedding=embedding_function,
        persist_directory=persist_dir,
        collection_name="pojs"
    )

    return db


def get_retriever(persist_dir="./chroma_db", k=8):
    """Load existing Chroma DB and return a retriever (using MMR)."""

    # Must reinitialize the same embedding function for retrieval
    embedding_function = OpenAIEmbeddings(
        model="text-embedding-3-large",
        openai_api_key=api_key
    )

    db = Chroma(
        embedding_function=embedding_function,
        persist_directory=persist_dir,
        collection_name="pojs"
    )

    # Retriever will fetch top-k most relevant chunks
    # Use MMR (maximal marginal relevance) to increase diversity
    return db.as_retriever(
        search_type="mmr",
        search_kwargs={"k": k, "fetch_k": max(20, k*3), "lambda_mult": 0.5}
    )


# Quick test if run directly
if __name__ == "__main__":
    build_vector_store()
    retriever = get_retriever(k=8)
    results = retriever.invoke("logout button selector in DashboardPanel")
    for doc in results:
        print("\n--- Retrieved Chunk ---")
        print(doc.page_content[:200])
