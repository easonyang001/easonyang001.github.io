"""Build the prompt sent to OpenAI."""

from __future__ import annotations

import hashlib

ABSTRACT_MAX_CHARS = 500
MAX_AUTHORS_SHOWN = 3

SYSTEM_TEMPLATE = """你是量子研究機構 Mrama Institute 的編輯助理。
根據以下本週（{week_label}）的論文與新聞，撰寫一篇中文量子週報。

【嚴格規則，不得違反】
1. 只能寫來源資料中的內容，不得補充你自己的知識
2. arXiv 論文必須標注「尚未經同行審查」
3. 不得使用「突破」「革命性」「顛覆」等詞，除非原文明確如此表述
4. 每個技術主張後面引用（來源：論文/新聞標題）標注
5. 不確定的內容寧可省略，不要猜測或臆測
6. 論文作者的 affiliation 不要翻譯，保留英文

【格式】
- 總長度：400–600 字
- 開頭：一段 2–3 句的本週摘要
- 論文精選：3–5 篇，每篇 2–3 句說明重點
- 產業動態：2–3 條，每條 1–2 句
- 結尾：一句話說明下週值得關注的方向（若來源中有線索）
- 使用 Markdown 格式（## 標題、- 列表）

【本週來源】

=== 論文（{paper_count} 篇）===
{formatted_papers}

=== 新聞（{news_count} 則）===
{formatted_news}

現在請撰寫週報："""


def _format_authors(authors: list[str]) -> str:
    shown = authors[:MAX_AUTHORS_SHOWN]
    suffix = " et al." if len(authors) > MAX_AUTHORS_SHOWN else ""
    return ", ".join(shown) + suffix


def _format_papers(papers: list[dict]) -> str:
    blocks = [
        f"[{p['arxiv_id']}] {p['title']}\n"
        f"作者：{_format_authors(p['authors'])}\n"
        f"摘要：{p['abstract'][:ABSTRACT_MAX_CHARS]}\n"
        "---"
        for p in papers
    ]
    return "\n".join(blocks)


def _format_news(news: list[dict]) -> str:
    blocks = [
        f"來源：{n['source']}\n標題：{n['title']}\n內容：{n['snippet']}\n---" for n in news
    ]
    return "\n".join(blocks)


def build_prompt(papers: list[dict], news: list[dict], week_label: str) -> tuple[str, str]:
    """Build the OpenAI prompt and return (prompt, prompt_hash)."""
    prompt = SYSTEM_TEMPLATE.format(
        week_label=week_label,
        paper_count=len(papers),
        formatted_papers=_format_papers(papers),
        news_count=len(news),
        formatted_news=_format_news(news),
    )
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
    return prompt, prompt_hash
