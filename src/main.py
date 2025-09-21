import sys
import warnings
from vector_store import get_retriever
from context_assembler import assemble_context
from generator import ask_llm

# Suppress noisy LangChain warnings for cleaner UX
warnings.filterwarnings("ignore", category=UserWarning)


def run_query(query: str, retriever, debug: bool = False):
    # Step 1: Retrieve relevant chunks
    docs = retriever.invoke(query)
    print(f"\n[Retrieved {len(docs)} chunks]\n")

    # Print chunk sources for transparency
    for i, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "unknown")
        print(f"  Chunk {i} from {source}")

    # Optional: show retrieved chunk content (first 300 chars)
    if debug:
        print("\n--- Retrieved Chunks (preview) ---")
        for i, doc in enumerate(docs, start=1):
            print(f"\n[Chunk {i}]")
            print(doc.page_content[:300])

    # Step 2: Assemble prompt with retrieved docs + query
    prompt = assemble_context(docs, query)

    # Step 3: Send prompt to LLM and get answer
    answer = ask_llm(prompt)

    # Display answer
    print(f"\nAnswer:\n{answer}\n")


def main():
    # Load retriever from persisted Chroma DB
    retriever = get_retriever("./chroma_db")

    # Case 1: Query passed via command-line args
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        run_query(query, retriever, debug=True)  # debug mode for CLI args
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
            run_query(query, retriever, debug=False)
    except KeyboardInterrupt:
        print("\nExiting...")


if __name__ == "__main__":
    main()
