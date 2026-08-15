from scripts.generation.prompt import build_prompts


def test_prompts_are_built_per_language_and_include_source_links() -> None:
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

    prompts, prompt_hash = build_prompts(papers, news, "2026-W32")

    assert set(prompts) == {"zh-TW", "en", "fr"}
    for language, prompt in prompts.items():
        assert "weeklyNews" in prompt
        assert "selectedPapers" in prompt
        assert "literatureDeepDive" in prompt
        assert papers[0]["url"] in prompt
        assert news[0]["url"] in prompt
        # Each language's prompt asks only for that language, not all three.
        assert "translations" not in prompt

    assert prompts["fr"] != prompts["en"]
    assert len(prompt_hash) == 64

    for prompt in prompts.values():
        # weeklyNews requires the structured explainer format, not a plain summary.
        assert "What the Numbers Mean" in prompt
        assert "What to Be Careful About" in prompt
        assert "What Happened and Why It Matters must appear for every item" in prompt


def test_deep_dive_analysis_is_included_and_changes_the_instruction() -> None:
    papers = [
        {
            "arxiv_id": "2608.00001",
            "title": "Paper title",
            "authors": ["A. Author"],
            "url": "https://arxiv.org/abs/2608.00001",
            "abstract": "Paper abstract",
        }
    ]
    deep_dive = {
        "research_question": "Does the method improve accuracy?",
        "motivation": "Existing methods are slow.",
        "research_gap": "No prior work handles this case.",
        "core_contribution": "A new hybrid circuit.",
        "method": {
            "core_idea": "Encode features as rotation angles.",
            "quantum_component": "4-qubit variational circuit.",
            "classical_component": "Adam optimizer.",
        },
        "experiments": {"datasets": ["MNIST"], "baselines": [], "metrics": [], "hardware_or_simulator": "simulator"},
        "key_results": ["+0.8% accuracy vs MLP"],
        "author_claims": [],
        "limitations": ["No matched-parameter baseline."],
        "unsupported_or_weak_claims": ["Quantum advantage"],
        "evidence": [{"claim": "Quantum advantage", "evidence": "No matched baseline", "strength": "unsupported"}],
    }

    prompts, _ = build_prompts(papers, [], "2026-W32", deep_dive=deep_dive, deep_dive_title="Paper title")

    for prompt in prompts.values():
        assert "DEEP DIVE SOURCE" in prompt
        assert "Encode features as rotation angles." in prompt
        assert "No matched-parameter baseline." in prompt
        # The model should be told to use this specific paper, not pick its own.
        assert "choose the 2-3 most significant" not in prompt


def test_without_deep_dive_falls_back_to_the_original_instruction() -> None:
    prompts, _ = build_prompts([], [], "2026-W32")

    for prompt in prompts.values():
        assert "DEEP DIVE SOURCE" not in prompt
        assert "choose the 2-3 most significant" in prompt
