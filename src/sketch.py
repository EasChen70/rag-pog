from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

# Load and split documents
loader = TextLoader("your_document.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# Create vector store
embeddings = OpenAIEmbeddings()
db = Chroma.from_documents(docs, embeddings)

# Create QA chain
llm = OpenAI()
qa = RetrievalQA.from_chain_type(llm=llm, retriever=db.as_retriever())

# Ask questions
query = "Your question here"
result = qa.run(query)
print(result)

#Ingestion -> Chunker -> Embedder -> Vector Store & Retrieval -> Context Assembler -> Generator