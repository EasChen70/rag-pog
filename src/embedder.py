import numpy as np
import os
import pickle
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

# Load env variables 
load_dotenv("src/api_keys.env")
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Missing OPENAI_API_KEY in src/api_keys.env")

# Load pre-chunked documents
with open("chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

# Initialize embeddings client
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    openai_api_key=api_key
    # With the `text-embedding-3` class
    # of models, you can specify the size
    # of the embeddings you want returned.
    # dimensions=1024
)

# Extract text content from chunks
texts = [c.page_content for c in chunks]

# Generate embeddings for all chunks
vecs = embeddings.embed_documents(texts)

# Save embeddings for vector store (for use in Chroma or FAISS later)
np.save("embeddings.npy", vecs)

# Note to self:
# - .embed_documents will send all chunks to API → consider batching + retry in future
# - JSON instead of pickle may be better for portability
# - Metadata preservation: right now only embedding page_content, need JSON with ids + metadata later
