from scripts.storage.supabase_client import save_draft


class Query:
    def __init__(self) -> None:
        self.operation = ""
        self.payload = None
        self.data = [{"id": "draft-id"}]

    def insert(self, payload: dict):
        self.operation = "insert"
        self.payload = payload
        return self

    def execute(self):
        return self


class Supabase:
    def __init__(self) -> None:
        self.query = Query()

    def table(self, _name: str) -> Query:
        return self.query


def test_save_draft_always_inserts() -> None:
    # news_drafts no longer enforces one row per week_label (see migration
    # 008), so a manual --force run can add another draft for a week that
    # already has one -- save_draft has no special-case branch for that.
    supabase = Supabase()
    result = save_draft(supabase, {"week_label": "2026-W32"})

    assert result == "draft-id"
    assert supabase.query.operation == "insert"
    assert supabase.query.payload == {"week_label": "2026-W32"}
