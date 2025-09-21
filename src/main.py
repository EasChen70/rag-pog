import sys
import warnings
from vector_store import get_retriever
from context_assembler import assemble_context
from generator import ask_llm

# Suppress noisy LangChain warnings for cleaner UX
warnings.filterwarnings("ignore", category=UserWarning)


def run_query(query: str, retriever, k: int = 3):
    # Step 1: Retrieve relevant chunks
    docs = retriever.invoke(query)
    print(f"\n[Retrieved {len(docs)} chunks]\n")

    # Print chunk sources for transparency
    for i, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "unknown")
        print(f"  Chunk {i} from {source}")

    # Step 2: Assemble prompt with retrieved docs + query
    prompt = assemble_context(docs, query)

    # Step 3: Send prompt to LLM and get answer
    answer = ask_llm(prompt)

    # Display answer
    print(f"\nAnswer:\n{answer}\n")


def main():
    # Load retriever from persisted Chroma DB
    retriever = get_retriever("./chroma_db", k=3)

    # Case 1: Query passed via command-line args
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        run_query(query, retriever)
        return

    # Case 2: Interactive loop
    print("RAG system ready! Type your question, or 'quit' to exit.\n")
    try:
        while True:
            # Collect user query
            query = input("Ask a question: ")
            if query.lower() in ["quit", "exit"]:
                print("Goodbye!")
                break
            run_query(query, retriever)
    except KeyboardInterrupt:
        print("\nExiting...")


if __name__ == "__main__":
    main()
