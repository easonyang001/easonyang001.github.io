"""Call OpenAI API to generate the draft."""

from __future__ import annotations

import openai

MAX_RETRIES = 1
REQUEST_TIMEOUT_SECONDS = 240


def generate_draft(prompt: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI to generate the weekly draft. Raises on empty response."""
    # Each call generates one language's deep, multi-paper literatureDeepDive,
    # which can legitimately take well over a minute. max_retries=0 because
    # generate_draft already retries on timeout itself -- letting the SDK
    # also retry underneath stacks two retry loops and turns one
    # slow-but-real timeout into a much longer wait before the failure ever
    # surfaces.
    client = openai.OpenAI(max_retries=0)

    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"},
                # gpt-4o-mini's hard ceiling is 16384. Each call now only
                # has to fit one language's weeklyNews + selectedPapers +
                # literatureDeepDive (see scripts/generation/prompt.py),
                # which used to share this same ceiling three ways and got
                # cut off mid-JSON as a result -- this leaves generous
                # headroom for a single language.
                max_tokens=16000,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            break
        except openai.APITimeoutError as error:
            last_error = error
            if attempt == MAX_RETRIES:
                raise
    else:
        raise RuntimeError("OpenAI request failed") from last_error

    if response.choices[0].finish_reason == "length":
        raise ValueError(
            "OpenAI response was truncated by max_tokens before the brief JSON was complete"
        )

    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise ValueError("OpenAI returned empty response")
    return content
