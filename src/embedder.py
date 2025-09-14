from langchain_openai import OpenAIEmbeddings
import numpy as np
import pickle

with open("chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

embeddings = OpenAIEmbeddings(model = "text-embedding-3-large",
    # With the `text-embedding-3` class
    # of models, you can specify the size
    # of the embeddings you want returned.
    # dimensions=1024
)

texts = [c.page_content for c in chunks]

vecs = embeddings.embed_documents(texts)

#Save for vector store (for use into Chroma or FAISS later)
np.save("embeddings.npy", vecs)



#Note to self, .embed_documents will send all chunks to api, maybe use batching + retry in future.
#JSON instead of pickle for future refactoring
#Metadata preservation, right now only embedding page content, need JSON with ids and metadata in future.
