"""Parse ar5iv's LaTeXML-generated HTML into named paper sections.

ar5iv wraps each paper section in `<section class="ltx_section">` with a
heading like "3 Method" or "IV. Experimental Results". Numbering and
capitalization vary by paper, so sections are matched by keyword rather than
position. A paper that doesn't use one of these headings just ends up
without that key -- callers (paper_analyzer) treat missing sections as
"not reported", not an error.
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup

SECTION_MAX_CHARS = 6000

# Canonical section key -> heading substrings that map to it, checked in
# order against the lowercased, de-numbered heading text. "results" is
# checked before "experiments" so a heading like "Experimental Results"
# (which contains both "experiment" and "result" as substrings) lands on
# the more specific match.
SECTION_KEYWORDS: dict[str, tuple[str, ...]] = {
    "introduction": ("introduction",),
    "related_work": ("related work", "background", "prior work"),
    "method": ("method", "methodology", "approach", "architecture", "algorithm", "model"),
    "results": ("result", "evaluation"),
    "experiments": ("experiment", "experimental setup", "setup"),
    "discussion": ("discussion",),
    "limitations": ("limitation",),
    "conclusion": ("conclusion", "summary"),
}

# A leading numbering token ("3.", "IV.", "3 ") only counts as numbering when
# it's followed by whitespace -- a plain .lstrip() over roman-numeral letters
# would also eat the first letter of "Introduction", "Method", "Limitations",
# and "Conclusion", all of which happen to start with i/m/l/c.
_LEADING_NUMBERING_RE = re.compile(r"^(?:[ivxlcdm]+|\d+)\.?\s+", re.IGNORECASE)


def _canonical_key(heading_text: str) -> str | None:
    normalized = heading_text.strip().lower()
    normalized = _LEADING_NUMBERING_RE.sub("", normalized, count=1)
    for key, keywords in SECTION_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return key
    return None


def parse_metadata(html: str) -> dict:
    """Best-effort title/authors extraction from ar5iv's own HTML.

    Used by the standalone analyze_paper.py CLI, which only starts with an
    arXiv id -- the real weekly pipeline already has this metadata from
    scripts/sources/arxiv.py and doesn't need this.
    """
    soup = BeautifulSoup(html, "html.parser")

    title_el = soup.find(class_="ltx_title_document") or soup.find("h1")
    title = " ".join(title_el.get_text(separator=" ").split()) if title_el else ""

    authors = [
        " ".join(el.get_text(separator=" ").split())
        for el in soup.find_all(class_="ltx_personname")
    ]

    return {"title": title, "authors": authors}


HEADING_TAGS = ("h1", "h2", "h3", "h4")


def _merge(sections: dict[str, str], key: str, text: str) -> None:
    if not text:
        return
    existing = sections.get(key, "")
    # A later section with the same key (rare, but papers sometimes repeat
    # e.g. "Results" as a subsection heading too) extends rather than
    # overwrites, so nothing is silently dropped.
    combined = f"{existing} {text}".strip() if existing else text
    sections[key] = combined[:SECTION_MAX_CHARS]


def parse_sections(html: str) -> dict[str, str]:
    """Return {canonical_section_key: text}, skipping sections that can't be identified.

    Returns {} for anything that isn't a genuine ar5iv LaTeXML render (marked
    by the `ltx_document` wrapper class) -- ar5iv doesn't 404 for papers it
    hasn't rendered, it can 200 with the plain arxiv.org abstract page
    instead. Without this guard, the code below would happily heading-scan
    that page's navigation/footer chrome and hand the analyzer confidently
    wrong "full text" (caught by testing this against real, currently-recent
    arXiv ids -- ar5iv's rendering lag means the newest papers hit exactly
    this case).
    """
    soup = BeautifulSoup(html, "html.parser")
    if soup.find(class_="ltx_document") is None:
        return {}

    sections: dict[str, str] = {}

    ltx_sections = soup.find_all("section", class_="ltx_section")
    if ltx_sections:
        for section in ltx_sections:
            heading = section.find(HEADING_TAGS)
            if heading is None:
                continue
            key = _canonical_key(heading.get_text())
            if key is None:
                continue
            text = " ".join(section.get_text(separator=" ").split())
            _merge(sections, key, text)
        return sections

    # A genuine ltx_document that, unusually, didn't wrap its sections in
    # <section class="ltx_section"> -- walk headings directly and collect
    # each heading's sibling content up to the next heading.
    for heading in soup.find_all(HEADING_TAGS):
        key = _canonical_key(heading.get_text())
        if key is None:
            continue
        parts = []
        for sibling in heading.find_next_siblings():
            if sibling.name in HEADING_TAGS:
                break
            parts.append(sibling.get_text(separator=" "))
        _merge(sections, key, " ".join(" ".join(parts).split()))

    return sections
