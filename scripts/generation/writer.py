"""Call OpenAI API to generate the draft."""

from __future__ import annotations

import openai

MAX_RETRIES = 2
REQUEST_TIMEOUT_SECONDS = 60


def generate_draft(prompt: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI to generate the weekly draft. Raises on empty response."""
    client = openai.OpenAI()

    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"},
                max_tokens=7000,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            break
        except openai.APITimeoutError as error:
            last_error = error
            if attempt == MAX_RETRIES:
                raise
    else:
        raise RuntimeError("OpenAI request failed") from last_error

    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise ValueError("OpenAI returned empty response")
    return content
