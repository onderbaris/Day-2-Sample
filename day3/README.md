# Day 3 local chat backend

This FastAPI server accepts conversation messages and sends each submitted turn to Groq. It is for local workshop use; the existing GitHub Pages website remains a separate static site.

## Setup (Python 3.12)

From the `day3` directory:

```bash
python -m venv .venv
# Activate .venv using the command for your terminal, then:
python -m pip install -r requirements.txt
cp .env.example .env
```

On Windows Command Prompt, use `copy .env.example .env` instead of `cp`. Edit `.env` with your own `GROQ_API_KEY` and the current `GROQ_MODEL` ID supplied by your instructor. Environment variables also work and take precedence over `.env`. Keep `.env` private; never add it to Git or paste your key into a browser page.

```bash
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs` for interactive API documentation. `GET /api/health` reports whether both settings are present without contacting Groq. Example chat request:

```bash
curl -X POST http://127.0.0.1:8000/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

The response contains `reply` and `model`. Send only `user` and `assistant` messages, ending in a `user` message. The server enforces 12 messages maximum, 4,000 characters per message, and 12,000 characters total. Keep this server on localhost; publishing the static site on GitHub Pages does not run Python or provide a private backend.
