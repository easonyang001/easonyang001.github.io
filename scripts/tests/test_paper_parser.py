from __future__ import annotations

from scripts.research.paper_parser import parse_metadata, parse_sections

LTX_SECTION_HTML = """
<html><body>
<div class="ltx_document">
<h1 class="ltx_title ltx_title_document">A Great Quantum Paper</h1>
<div class="ltx_authors">
  <span class="ltx_personname">Alice Example</span>
  <span class="ltx_personname">Bob Example</span>
</div>
<section class="ltx_section">
  <h2 class="ltx_title ltx_title_section">1 Introduction</h2>
  <p>This paper studies a new quantum optimization method.</p>
</section>
<section class="ltx_section">
  <h2 class="ltx_title ltx_title_section">3 Method</h2>
  <p>We use a variational quantum circuit with four qubits.</p>
</section>
<section class="ltx_section">
  <h2 class="ltx_title ltx_title_section">5 Experimental Results</h2>
  <p>Accuracy improved by 0.8 percent over the classical baseline.</p>
</section>
<section class="ltx_section">
  <h2 class="ltx_title ltx_title_section">7 Limitations</h2>
  <p>We did not test on real hardware.</p>
</section>
</div>
</body></html>
"""

# A genuine ar5iv render (has the ltx_document wrapper) that, unusually,
# didn't tag its sections with class="ltx_section" -- exercises the
# heading-scan fallback for a case that's still trustworthy content.
LTX_DOCUMENT_WITHOUT_SECTION_TAGS_HTML = """
<html><body>
<div class="ltx_document">
<h2>2. Related Work</h2>
<p>Prior work used classical solvers only.</p>
<h2>4 Conclusion</h2>
<p>We showed a modest improvement.</p>
</div>
</body></html>
"""

# What ar5iv actually serves (200 OK, not a 404) for a paper it hasn't
# rendered yet -- the plain arxiv.org abstract page, with its own nav/footer
# headings. No ltx_document marker anywhere. Discovered by testing against
# real, currently-recent arXiv ids: ar5iv's rendering lag meant the parser
# was heading-scanning this page's boilerplate and handing it to the
# analyzer as if it were the paper's real text.
NON_AR5IV_FALLBACK_PAGE_HTML = """
<html><body>
<h1>arXiv.org</h1>
<h2>Access Paper</h2>
<p>Download PDF.</p>
<h2>Demos</h2>
<p>arXivLabs is a framework for experimental features.</p>
</body></html>
"""


def test_parses_named_sections_from_ltx_section_blocks() -> None:
    sections = parse_sections(LTX_SECTION_HTML)
    assert "introduction" in sections
    assert "quantum optimization" in sections["introduction"]
    assert "variational quantum circuit" in sections["method"]
    assert "Accuracy improved" in sections["results"]
    assert "real hardware" in sections["limitations"]


def test_falls_back_to_heading_scan_within_a_genuine_ltx_document() -> None:
    sections = parse_sections(LTX_DOCUMENT_WITHOUT_SECTION_TAGS_HTML)
    assert "classical solvers" in sections["related_work"]
    assert "modest improvement" in sections["conclusion"]


def test_returns_empty_for_a_non_ar5iv_page_even_with_matching_headings() -> None:
    # Regression test: without the ltx_document gate, this page's "Demos"
    # section (mentioning "experimental features") used to get scanned in
    # and handed to the analyzer as if it were real paper content.
    assert parse_sections(NON_AR5IV_FALLBACK_PAGE_HTML) == {}


def test_unrecognized_headings_are_skipped_not_errored() -> None:
    html = '<html><body><div class="ltx_document"><h2>Acknowledgements</h2><p>Thanks to our funders.</p></div></body></html>'
    assert parse_sections(html) == {}


def test_parse_metadata_extracts_title_and_authors() -> None:
    metadata = parse_metadata(LTX_SECTION_HTML)
    assert metadata["title"] == "A Great Quantum Paper"
    assert metadata["authors"] == ["Alice Example", "Bob Example"]


def test_parse_metadata_handles_missing_fields_gracefully() -> None:
    metadata = parse_metadata("<html><body><p>no title here</p></body></html>")
    assert metadata["authors"] == []
