
import os
from dotenv import load_dotenv
 
load_dotenv()
 
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
 
def get_llm(temperature=0.3):
    if LLM_PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=temperature,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )
    elif LLM_PROVIDER == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-sonnet-4-6",
            temperature=temperature,
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        )
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")
 