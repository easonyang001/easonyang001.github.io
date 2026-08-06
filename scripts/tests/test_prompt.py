from scripts.generation.prompt import build_prompt


def test_prompt_requires_languages_sections_and_source_links() -> None:
    papers = [
        {
            "arxiv_id": "2608.00001",
            "title": "Paper title",
            "authors": ["A. Author"],
            "url": "https://arxiv.org/abs/2608.00001",
            "abstract": "Paper abstract",
        }
    ]
    news = [
        {
            "source": "Publisher",
            "title": "News title",
            "url": "https://example.com/news",
            "snippet": "News summary",
        }
    ]

    prompt, prompt_hash = build_prompt(papers, news, "2026-W32")

    for required in ("zh-TW", '"en"', '"fr"', "weeklyNews", "selectedPapers", "literatureDeepDive"):
        assert required in prompt
    assert papers[0]["url"] in prompt
    assert news[0]["url"] in prompt
    assert len(prompt_hash) == 64
