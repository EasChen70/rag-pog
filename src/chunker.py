#Chunk Page Objects files

from langchain_text_splitters import CharacterTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
import os
import pickle


# load env vars from .env + any *.env (ignore if python-dotenv missing)
try:
    from dotenv import load_dotenv
    load_dotenv()
    for _f in os.listdir(os.getcwd()):
        if _f.endswith(".env") and _f != ".env":
            load_dotenv(_f, override=False)
except Exception:
    pass  # fall back to OS env

# use env var; no hard-coded paths
data_dir = os.getenv("RAG_DATA_DIR")
if not data_dir:
    raise RuntimeError("Set RAG_DATA_DIR in .env / *.env or OS env")

if not os.path.isdir(data_dir):
    raise FileNotFoundError(f"Directory not found: {os.path.abspath(data_dir)}")


# Load all JS files from directory.
loader = DirectoryLoader(
    data_dir,
    glob="*.js", # use "**/*.js" if you have subfolders
    loader_cls=TextLoader,
    loader_kwargs={"autodetect_encoding": True},
    show_progress=True,
)
documents = loader.load()

# Create text splitter
text_splitter = CharacterTextSplitter(
    chunk_size=500,        # Adjust based on your needs
    chunk_overlap=50,      # Small overlap to maintain context
    separator="\n"         # Split on newlines for code
)

# Use for po.js files but 

# Better for code - respects function boundaries
code_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\n\n", "\n", " ", ""]  # Hierarchical splitting
)

# Split the documents
chunks = text_splitter.split_documents(documents)

with open("chunks.pkl", "wb") as f:
    pickle.dump(chunks, f)

print(f"Created {len(chunks)} chunks from {len(documents)} files")
for i, chunk in enumerate(chunks, start=1):  
    print(f"\n--- Chunk {i} ---")
    print(chunk.page_content[:200] + "...")



