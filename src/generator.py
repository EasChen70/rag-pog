import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load environment variables from api_keys.env
load_dotenv("src/api_keys.env")

def ask_llm(prompt: str, model: str = "gpt-4o-mini") -> str: 
    # Fetch API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing OPENAI_API_KEY in api_keys.env")
    
    # Initialize the LLM
    llm = ChatOpenAI(model=model, openai_api_key=api_key)

    # Call the model
    response = llm.invoke(prompt)

    # Return just the text content
    return response.content.strip()