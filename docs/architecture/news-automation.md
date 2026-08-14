# Mrama Institute — Weekly Quantum News 自動生成系統：技術現況

給 GPT 做重新設計/規劃參考用。以下是目前系統實際的架構、資料模型、參數與已知問題，全部來自 repo 現有程式碼（不是理想設計，是現況）。

---

## 1. 產品脈絡

- 網站：Mrama Institute for Quantum Information and Intelligence（量子資訊與智能研究機構官網），純靜態 React/Vite，部署在 GitHub Pages。
- 「News」是網站上的一個內容區塊，目前大部分內容來自這套自動化管線每週產生的「量子週報」。
- 定位是學術/研究機構的新聞摘要，不是行銷內容，editorial tone 必須克制、有來源、不誇大（見下方 prompt 的 STRICT EDITORIAL RULES）。

## 2. 端到端流程（現況）

```
GitHub Actions (weekly_news.yml, 每週一 06:00 UTC + 手動觸發)
  ↓
scripts/generate_news.py
  ├─ 1. 抓取來源
  │    ├─ arXiv API：quant-ph 分類，過去 7 天 (scripts/sources/arxiv.py)
  │    └─ Google News RSS：兩個查詢字串 (scripts/sources/google_news.py)
  ├─ 2. 關鍵字評分 (scripts/processing/score.py)
  ├─ 3. 去重：排除過去週已用過的項目 (scripts/processing/dedup.py + Supabase)
  ├─ 4. 篩選 top N (scripts/processing/filter.py)
  ├─ 5. 建 prompt，每語言各自一份 (scripts/generation/prompt.py)
  ├─ 6. 呼叫 OpenAI gpt-4o-mini，逐語言各打一次 API (scripts/generation/writer.py)
  ├─ 7. 驗證/組裝成多語 JSON brief (scripts/generation/brief.py)
  └─ 8. 寫入 Supabase news_drafts 表（狀態 = draft）
  ↓
GitHub Actions 開一個「通知用」PR（草稿已就緒，僅供提醒，可直接關閉）
  ↓
人工到 /admin 後台 (NewsDraftsAdmin.tsx) 審核草稿，可編輯 title/content_md
  ↓
按「核准並發布」(server/src/routes/newsAutomation.ts: PATCH /drafts/:id/approve)
  ├─ 把 markdown brief 轉成 HTML（sanitize 過）
  ├─ 寫入 Supabase content_news 表
  ├─ 額外republish一次 literatureDeepDive 章節成獨立的「論文精讀」News 條目
  └─ 呼叫後端持有的 GitHub PAT，開一個把 src/data/news.ts 更新的 PR
  ↓
人工在 GitHub review 該 PR 後 merge → 觸發 GitHub Pages 重新部署 → 正式上線
```

## 3. 資料來源與篩選參數

**arXiv** (`scripts/sources/arxiv.py`)
- `search_query: cat:quant-ph`，`sortBy: submittedDate`
- `days_back = 7`
- 分頁 100 筆/頁，最多 10 頁
- 標記 `is_cross_list`：primary_category 不是 quant-ph 就算跨領域

**Google News RSS** (`scripts/sources/google_news.py`)
- 查詢字串：`"quantum computing"`、`"quantum annealing OR quantum optimization"`
- `hl=zh-TW, gl=TW`（繁中地區）
- `MAX_AGE_DAYS = 8`
- 任何失敗回傳空清單（新聞是輔助來源，不是必要）
- 上限 `max_items=20`（去重後）

**關鍵字評分** (`scripts/processing/score.py`)
```
qubo / quantum annealing / reverse annealing        5.0（核心研究領域）
quantum optimization / quantum machine learning     4.0
variational quantum / qaoa / vqe / ising /
  combinatorial optimization                        3.0
quantum computing / quantum circuit / quantum error 2.0
entanglement / qubit                                1.5
quantum（單獨出現）                                  0.5
跨領域 (is_cross_list) 額外 × 0.7 懲罰
```
同一關鍵字每個項目最多算一次（不管出現幾次或在幾個欄位）。

**篩選** (`scripts/processing/filter.py`)
- `MIN_SCORE = 1.0`（低於此分數不列入候選）
- 至少要有 `MIN_PAPERS=3` 篇論文「或」`MIN_NEWS=2` 則新聞其中一項達標，否則整週跳過不產生草稿
- 最終取分數最高的 `max_papers=8`、`max_news=5`

**去重** (`scripts/processing/dedup.py` + Supabase `news_seen_items`)
- arXiv 項目 id = arxiv_id；新聞項目 id = sha256(url) 前 16 碼
- 只有正常排程（非 `--force`）才過濾已見項目
- 草稿成功存檔「之後」才標記為已見（避免生成失敗卻燒掉這週的候選）

## 4. 生成 Prompt（逐語言分開打）

- 語言：`zh-TW`, `en`, `fr`（三個語言各自獨立呼叫 OpenAI，不是一次 call 生三語言）
  - 這是踩過坑之後改的：三語言擠在同一個 response 裡系統性超過 gpt-4o-mini 的 16384-token 輸出上限，導致 JSON 被截斷。改成逐語言後每次呼叫拿到完整 16k 額度。
- Model：`gpt-4o-mini`，`temperature=0.3`，`response_format=json_object`，`max_tokens=16000`，timeout 240s
- 每個 brief 包含三個區塊：
  - `weeklyNews`：3-5 則本週新聞，說明發生什麼、為何重要、附連結
  - `selectedPapers`：4-6 篇論文，問題/方法/結果/限制 + arXiv 連結 + 未同行審查警語
  - `literatureDeepDive`：精選 2-3 篇最重要的論文深度分析，**這段之後會被獨立republish成一篇「論文精讀」文章**，所以必須自成一體、不能依賴其他章節的上下文
  - 規則：`literatureDeepDive` 選中的論文仍要在 `selectedPapers` 有完整條目，兩邊不能因為對方有寫就縮減
- Editorial rules 寫死在 system prompt 裡：只能用來源支持的說法、必須註明 arXiv 是 preprint 未經同行審查、避免 breakthrough/revolutionary 這類詞除非來源本身這樣講、每則都要附精確來源標題+URL

## 5. 驗證與重試邏輯

- `parse_generated_translation`：拒絕空章節/格式錯誤的 JSON，逐語言各自驗證
- `_generate_valid_translation`：每個語言最多重試 `MAX_BRIEF_ATTEMPTS=3` 次（驗證失敗才重試，不是網路錯誤）
- `generate_draft` 本身：對 API timeout 有一層獨立重試（`MAX_RETRIES=1`），刻意跟上面那層retry分開，避免兩層 retry 疊加把一次真正的 timeout 拖得更久
- `finish_reason == "length"` 會直接視為錯誤丟出（代表被 max_tokens 截斷）

## 6. 資料模型 (Supabase)

**`news_drafts`**（migration 007 + 008）
```
id, created_at, updated_at
week_label       text  -- "2026-W32"，原本 unique，後來拿掉這個限制
                        -- (migration 008)，因為手動 --force 應該能在
                        -- 同一週疊加新草稿而不是被擋掉/覆蓋掉舊的
status           draft | approved | published | rejected
title, content_md      -- content_md 存的其實是下面第7節那個 JSON brief 格式
sources          jsonb  -- [{type, id, title, url, relevanceScore}]
model            text   -- e.g. "gpt-4o-mini"
prompt_hash      text   -- sha256(prompt)，方便之後debug重現
reviewed_by, reviewed_at, published_at
```

**`news_seen_items`**：`item_id`（unique）+ `source`（arxiv|news）+ `seen_at`，純去重帳本。

**`content_news`**（發布後的正式內容，最終同步進 `src/data/news.ts`）：
`news_id`(slug), `date`, `category`, `title`, `summary`, `content`, `cover_image_url`, `related_project_id`, `related_publication_id`, `external_url`, `status`

## 7. Weekly Brief 內容格式

`news_drafts.content_md` 實際存的是這個 JSON（不是純 markdown，欄位名沿用歷史但已經是結構化格式）：

```json
{
  "format": "mrama-weekly-brief-v1",
  "contentType": "markdown",
  "translations": {
    "zh-TW": { "title": "...", "summary": "...", "sections": { "weeklyNews": "...", "selectedPapers": "...", "literatureDeepDive": "..." } },
    "en": { ... },
    "fr": { ... }
  }
}
```

核准發布時（`renderWeeklyBrief`），markdown 章節會被轉成消毒過的 HTML，`contentType` 變成 `"html"`，整包 JSON.stringify 存進 `content_news.content`。前端 `NewsDetailPage.tsx` 讀到這個格式時，會渲染語言切換 tab（中/英/法），並依 `literatureDeepDive` 等三個 section 各自成一個區塊；讀不到這個格式（舊資料）就退回當純 HTML 顯示。

## 8. 已知歷史問題（供參考，避免重蹈覆轍）

1. **Token ceiling 截斷**（PR #8, #61-64, #67）：三語言塞一次 API call 系統性超過 16384-token 輸出上限。先試過調高 max_tokens/timeout、偵測截斷再重試，但 retry 用的是同一個過大的 prompt，同樣的失敗會每次重演。最終解法是拆成逐語言各自呼叫（見第4節）。
2. **草稿週唯一性 vs 手動測試**（migration 008）：`week_label` 原本是 unique key，導致手動 `--force` 重跑沒辦法在同一週疊加新草稿。拿掉了 unique constraint。
3. **GitHub Actions 無法開 PR**：repo 層級 Settings → Actions → "Allow GitHub Actions to create and approve pull requests" 沒開，即使 workflow yaml 裡宣告了 `permissions: pull-requests: write` 也沒用——這是 repo 層的硬性關卡，跟 workflow 檔案本身無關。（2026-08-07 已修好。）

## 9. 現有限制/尚未做的事（可以拿去跟 GPT 討論要不要改）

- 來源只有 arXiv（quant-ph 一個分類）+ Google News RSS 兩個查詢字串，沒有其他來源（例如其他 arXiv 分類、學術媒體、Twitter/X、特定期刊 RSS）
- 評分是純關鍵字加權，沒有語意/embedding-based 相關性判斷
- 沒有圖片/封面圖生成或選取邏輯（`cover_image_url` 目前都是 null）
- 三語言（中/英/法）是寫死的清單，不是可配置
- 一週最多 8 papers + 5 news，這個上限沒有根據內容質量動態調整
- Model 固定用 `gpt-4o-mini`，沒有 fallback 或 model 選擇邏輯
- 沒有生成內容的自動品質評分（例如用另一個 LLM call 做 self-check），只有結構驗證（欄位是否存在、長度限制）
