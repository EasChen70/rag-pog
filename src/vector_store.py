from langchain_chroma import Chroma
import numpy as np
import pickle


with open("chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

vecs = np.load("embeddings.npy").tolist()


#Chroma.from_embeddings signature
    #It expects:
        #embeddings → List[List[float]]
        #texts → List[str]

db = Chroma.from_embeddings(
    embeddings=vecs,
    texts=[c.page_content for c in chunks],
    persist_directory="./chroma_db"
)

#Quick test query (for retrieval)
res = db.similarity_search("checkbox", k=2)
for doc in res:
    print(doc.page_content[:200])