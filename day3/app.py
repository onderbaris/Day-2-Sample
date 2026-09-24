"""Local Day 3 chat API. Run with: uvicorn app:app --reload"""

import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from groq import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    AsyncGroq,
    BadRequestError,
    NotFoundError,
    RateLimitError,
)
from pydantic import BaseModel, Field, model_validator

load_dotenv(Path(__file__).resolve().parent / ".env")

INSTRUCTION = (
    "You are a helpful educational assistant. Explain clearly, be concise, "
    "and acknowledge uncertainty."
)
MAX_MESSAGES = 12
MAX_TOTAL_CHARS = 12000
app = FastAPI(title="Day 3 local chat API")


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)

    @model_validator(mode="after")
    def nonblank(self):
        if not self.content.strip():
            raise ValueError("Message content cannot be blank")
        return self


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=MAX_MESSAGES)

    @model_validator(mode="after")
    def valid_conversation(self):
        if sum(len(m.content) for m in self.messages) > MAX_TOTAL_CHARS:
            raise ValueError("Conversation is too long")
        if self.messages[-1].role != "user":
            raise ValueError("The last message must be from the user")
        return self


def config():
    key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "").strip()
    if key == "your_groq_api_key_here":
        key = ""
    if model == "your_instructor_provided_model_id_here":
        model = ""
    return key, model


@app.get("/api/health")
def health():
    key, model = config()
    return {"status": "ok", "configured": bool(key and model)}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    key, model = config()
    if not key or not model:
        raise HTTPException(503, "Set GROQ_API_KEY and GROQ_MODEL on the server.")

    client = AsyncGroq(api_key=key, timeout=20.0, max_retries=0)
    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": INSTRUCTION}]
            + [m.model_dump() for m in request.messages],
            max_completion_tokens=512,
        )
    except AuthenticationError:
        raise HTTPException(502, "Groq rejected the server API key. Check its configuration.") from None
    except NotFoundError:
        raise HTTPException(503, "The configured Groq model is unavailable. Check GROQ_MODEL.") from None
    except BadRequestError:
        raise HTTPException(503, "The configured Groq model is unavailable or rejected this request. Check GROQ_MODEL.") from None
    except RateLimitError:
        raise HTTPException(429, "Groq rate limit reached. Try again later.") from None
    except APIConnectionError:
        raise HTTPException(503, "Could not reach Groq. Try again later.") from None
    except APIStatusError:
        raise HTTPException(502, "Groq could not complete the request. Check the configured model and try again.") from None
    finally:
        await client.close()

    reply = completion.choices[0].message.content if completion.choices else None
    if not reply or not reply.strip():
        raise HTTPException(502, "Groq returned an empty response. Try again.")
    return {"reply": reply, "model": model}
