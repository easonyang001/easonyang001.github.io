from scripts.processing.dedup import filter_seen


class _FakeResponse:
    def __init__(self, data):
        self.data = data


class _FakeQuery:
    def __init__(self, seen_ids):
        self._seen_ids = seen_ids
        self._requested_ids: list[str] = []

    def select(self, _columns):
        return self

    def in_(self, _column, values):
        self._requested_ids = values
        return self

    def execute(self):
        matched = [{"item_id": i} for i in self._requested_ids if i in self._seen_ids]
        return _FakeResponse(matched)


class _FakeSupabase:
    def __init__(self, seen_ids):
        self._seen_ids = seen_ids

    def table(self, _name):
        return _FakeQuery(self._seen_ids)


def test_seen_ids_are_filtered_out():
    client = _FakeSupabase(seen_ids={"2407.00001"})
    items = [{"arxiv_id": "2407.00001"}, {"arxiv_id": "2407.00002"}]
    result = filter_seen(items, client)
    assert result == [{"arxiv_id": "2407.00002"}]


def test_unseen_ids_pass_through():
    client = _FakeSupabase(seen_ids=set())
    items = [{"arxiv_id": "2407.00001"}, {"arxiv_id": "2407.00002"}]
    result = filter_seen(items, client)
    assert result == items


def test_empty_list_returns_empty_list():
    client = _FakeSupabase(seen_ids=set())
    assert filter_seen([], client) == []
