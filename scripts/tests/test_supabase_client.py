from scripts.storage.supabase_client import save_draft


class Query:
    def __init__(self) -> None:
        self.operation = ""
        self.payload = None
        self.conflict = None
        self.data = [{"id": "draft-id"}]

    def insert(self, payload: dict):
        self.operation = "insert"
        self.payload = payload
        return self

    def upsert(self, payload: dict, on_conflict: str):
        self.operation = "upsert"
        self.payload = payload
        self.conflict = on_conflict
        return self

    def execute(self):
        return self


class Supabase:
    def __init__(self) -> None:
        self.query = Query()

    def table(self, _name: str) -> Query:
        return self.query


def test_force_save_resets_review_and_upserts_by_week() -> None:
    supabase = Supabase()
    result = save_draft(supabase, {"week_label": "2026-W32"}, force=True)

    assert result == "draft-id"
    assert supabase.query.operation == "upsert"
    assert supabase.query.conflict == "week_label"
    assert supabase.query.payload["status"] == "draft"
    assert supabase.query.payload["published_at"] is None


def test_normal_save_remains_an_insert() -> None:
    supabase = Supabase()
    save_draft(supabase, {"week_label": "2026-W33"})
    assert supabase.query.operation == "insert"
