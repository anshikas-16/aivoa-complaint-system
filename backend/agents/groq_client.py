import os
import json
from groq import Groq

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Copy backend/.env.example to backend/.env "
                "and add your key from https://console.groq.com"
            )
        _client = Groq(api_key=api_key)
    return _client


def call_llm_json(system_prompt: str, user_prompt: str, model: str = "openai/gpt-oss-120b") -> dict:
    """
    Calls Groq chat completion and forces a JSON object response.
    Falls back to llama-3.3-70b-versatile if gemma2-9b-it errors (e.g. deprecated/unavailable).
    """
    client = get_client()
    models_to_try = [model, "openai/gpt-oss-20b"]
    last_err = None

    for m in models_to_try:
        try:
            completion = client.chat.completions.create(
                model=m,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            content = completion.choices[0].message.content
            return json.loads(content)
        except Exception as e:  # noqa: BLE001
            last_err = e
            continue

    raise RuntimeError(f"All Groq model calls failed. Last error: {last_err}")
