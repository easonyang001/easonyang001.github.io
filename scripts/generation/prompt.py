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
- 總長度：500–750 字
- 開頭：一段 2–3 句的本週摘要
- 論文精讀：3–5 篇，每篇 3–4 句，依序點出研究問題、方法、關鍵結果——只寫摘要中明確提到的內容
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


PAPER_DEEP_DIVE_TEMPLATE = """你是量子研究機構 Mrama Institute 的編輯助理。
根據以下本週（{week_label}）的論文，撰寫一篇「論文精讀」深度分析文章。
這篇文章只討論論文本身，不討論產業新聞，讀者是已經讀過本週摘要、想看更詳細技術分析的人。

【嚴格規則，不得違反】
1. 只能寫來源資料中的內容（標題、作者、摘要），不得補充你自己的知識或臆測摘要中未提及的細節
2. 每篇論文都必須標注「尚未經同行審查」（arXiv preprint）
3. 不得使用「突破」「革命性」「顛覆」等詞，除非原文明確如此表述
4. 每個技術主張後面引用（來源：論文標題）標注
5. 論文作者的 affiliation 不要翻譯，保留英文
6. 不確定的內容寧可省略，不要猜測或補全摘要沒寫的方法細節

【格式】
- 使用 Markdown，每篇論文一個 `## 論文標題` 子標題
- 每篇依序說明：研究問題、方法、關鍵結果、為何重要（僅限摘要中明確提及的內容）
- 每篇 5–7 句，比一般新聞摘要更詳盡
- 不需要開頭總覽或結尾展望，直接逐篇分析
- 文末列出所有論文的 arXiv 連結，作為「延伸閱讀」

【本週論文（{paper_count} 篇）】
{formatted_papers}

現在請撰寫論文精讀："""


def build_paper_deep_dive_prompt(papers: list[dict], week_label: str) -> tuple[str, str]:
    """Build the OpenAI prompt for the paper-only deep-dive article."""
    prompt = PAPER_DEEP_DIVE_TEMPLATE.format(
        week_label=week_label,
        paper_count=len(papers),
        formatted_papers=_format_papers(papers),
    )
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
    return prompt, prompt_hash
