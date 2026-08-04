"""Call OpenAI API to generate the draft."""

from __future__ import annotations

import openai

MAX_RETRIES = 2
REQUEST_TIMEOUT_SECONDS = 60

TITLE_PROMPT_TEMPLATE = """以下是一篇量子週報，請為它產生一個具體中文標題，
10–20 字，具體反映本週最重要的主題。
只回傳標題本身，不要加引號或其他文字。

週報內容：
{content}"""


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
                max_tokens=1200,
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


def generate_title(content: str, week_label: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI to generate a specific Chinese title for the draft."""
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": TITLE_PROMPT_TEMPLATE.format(content=content[:500]),
            }
        ],
        temperature=0.3,
        max_tokens=60,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    title = (response.choices[0].message.content or "").strip()
    if not title:
        raise ValueError("OpenAI returned empty title")
    return title
