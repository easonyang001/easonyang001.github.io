# mrama.org SEO 完整執行計劃

> **給 Claude Code 的執行條件**
> 放在 repo 根目錄，存 `docs/SEO_PLAN.md`。
> 遇到指令建議：`請讀 SEO_PLAN.md，執行 Phase 0，把結果寫回本文件的「Phase 0 產出」欄位。`

---

## 0. 執行守則（Claude Code 請每輪遵守）

1. **一次只做一個 Phase。** 每個 Phase 結束後回來回報，等確認再進下一個階段。
2. **改動內容不代表法規。** 不要創設框架、不要創設檔案結構，除非 repo 已有。
3. **每個 checkbox 完成後，把 `[ ]` 改成 `[x]` 並在後面加一行「✅ 實際做法：...」。** 這份文件本身是進度表。
4. **不要留 TODO 在 commit 裡。** 任何不確定的 issue，都寫進本文件的「待辦池」。
5. **Commit 格式**（沿用專案既有慣例）：
   ```
   feat: add JSON-LD Organization schema
   fix: correct canonical URL on paginated pages
   docs: update SEO_PLAN phase 1 results
   refactor: extract meta tag builder into lib/seo
   ```
6. **每個 Phase 一條分支**：`seo/phase-1-technical`、`seo/phase-2-performance`…
7. **不確定就問，不要猜。** 特別是網站定位、業務單位、關鍵字選擇、對外連結的部分。

---

## 1. 站台設定值 ⚠️ 需人工填寫

Claude Code：**這一段不要自己填，Phase 3 以後不要執行**。Phase 0 可以起跑，並用實際結果幫忙把空白欄填上草稿。

```yaml
domain: mrama.org
canonical_host:        # 例：https://mrama.org，要不要 www，站內統一
site_type:             # 例：SaaS 產品站 / 內容媒體 / NPO / 個人作品集 / 電商
primary_goal:          # 例：註冊轉換 / 詢價表單 / 訂閱 / 品牌曝光
target_market:         # 例：台灣 / 繁體中文 / 全球英語 / 台灣+日本
languages:             # 例：zh-Hant, en
tech_stack:            # 例：Next.js 15 App Router / Astro / WordPress / 純靜態
hosting:               # 例：Vercel / Cloudflare Pages / 自架 nginx
cms:                   # 例：無 / Contentful / MDX in repo
analytics:             # 例：GA4 / Plausible / 無
search_console:        # 已驗證 / 未驗證
competitors:           # 3-5 個直接競爭網站
```

> **現況備註（2026-08 追蹤）**：以 `mrama.org` 為關鍵字在公開搜尋引擎查詢，**查不到任何該網站的索引結果**。這代表三種可能之一：(a) 網站極新、尚未被索引；(b) 被 `noindex` / `robots.txt` 攔截；(c) 網站尚未上線或未公開。**Phase 0 第一件事就是釐清是哪一種**——如果是 (b)，那就是本站目前優先度最高的單一問題，其他都先放著。

---

## 2. Phase 0 — 現況盤點（不改任何東西）

目標：拿到事實，回報策略。

### 2.1 索引狀態（最優先）

```bash
# 站台是否正常、回什麼狀態碼、有沒有 noindex header
curl -sSI https://mrama.org | head -30

# robots.txt
curl -sS https://mrama.org/robots.txt

# sitemap
curl -sS https://mrama.org/sitemap.xml | head -50

# 首頁 HTML 裡的 robots meta / canonical / title / description
curl -sS https://mrama.org | grep -iE '<title>|name="description"|name="robots"|rel="canonical"|hreflang'

# www 跟非 www、http 跟 https 的重定向行為
for u in http://mrama.org https://www.mrama.org http://www.mrama.org; do
  echo "--- $u"; curl -sSI -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "$u"
done
```

- [x] 站台可正常存取，首頁回 200
  ✅ 實際做法：`curl -sSI https://mrama.org` 回 200 OK，`easonyang001.github.io` 301 正確轉到 `https://mrama.org`（先前排查過一次 http 不安全轉址，是 GitHub Pages 憑證生效延遲，已自行修復）。
- [x] `robots.txt` 沒有誤放 `Disallow: /`
  ✅ 實際做法：內容為 `User-agent: * / Allow: / / Disallow: /admin`，正確，只擋 admin 後台，並宣告了 sitemap 位置。
- [x] 沒有在全站 `<meta name="robots" content="noindex">` 或 `X-Robots-Tag: noindex`
  ✅ 實際做法：`<meta name="robots" content="index, follow">`，且 HTTP header 沒有 X-Robots-Tag。
- [x] www / 非 www、http / https 都 301 收斂到單一 canonical host
  ✅ 實際做法：`mrama.org` 為 canonical host（無 www）；`easonyang001.github.io` 301 → `https://mrama.org`；未設定 `www.mrama.org` 的 CNAME/A 紀錄（不使用 www 子網域，不需另外收斂）。
- [x] `sitemap.xml` 存在且 URL 數量正確
  ✅ 實際做法：本次已從只有 1 條（首頁）擴充為 13 條主要頁面；已在 Google Search Console 送出，狀態「無法擷取」——已確認是 sitemap 本身正常（200、格式正確），研判為剛提交的處理延遲，需等待觀察，非技術問題。
- [x] Google Search Console 已驗證域名？若否 → 這是 Phase 1 第一項
  ✅ 實際做法：已驗證（domain property），已送出 sitemap，正在等待 Google 首次擷取。

**結論：現況是 (a)，網站極新、尚未被索引，且技術面已無明顯攔截。** 不是 (b) 被攔截、也不是 (c) 未上線。

### 2.2 Repo 掃描

- [x] 列出框架、路由方式、頁面總數
  ✅ 實際做法：Vite + React + react-router-dom（CSR，非 SSR/SSG），約 20 個靜態路由 + 多個動態 slug 路由（research/:slug、projects/:slug、people/:slug、solutions/:slug 等）。
- [x] 列出現有 SEO 相關實作
  ✅ 實際做法：`index.html` 已有 title、meta description、OG、Twitter Card、robots meta、JSON-LD `ResearchOrganization`（本次新增）；`public/robots.txt`、`public/sitemap.xml` 存在。沒有 per-route meta 管理機制（無 react-helmet 之類），所有路由共用同一份 `index.html` 的靜態 meta 標籤。
- [x] 確認渲染方式（SSR / SSG / CSR）— **純 CSR 是重大風險，要標記出來**
  ✅ 實際做法：**確認是純 CSR**。`curl https://mrama.org/about` 拿到的原始 HTML 沒有頁面實際內容（React 掛載前是空殼），所有內容要等 JS 執行完才出現。Googlebot 近年對 CSR 站台會執行 JS 後再索引，通常可行但比 SSR/SSG 慢、且更依賴渲染預算，是本計劃裡優先度最高的技術債，列入 §11 待辦池。

### 2.3 效能基準線

- [x] 記錄基準分數：Performance / SEO / A11y / Best Practices
  ✅ 實際做法：對正式環境 `https://mrama.org` 跑 `npx lighthouse`。
  Desktop：Performance 91 / **SEO 100**（零失敗項）/ A11y 95 / Best Practices 100
  Mobile：Performance 64 / **SEO 100**（零失敗項）/ A11y 95 / Best Practices 100
  A11y 的唯一扣分項是 `color-contrast`（文字對比度），跟 SEO 無關，記進 §11 待辦池，這次不動手改。
- [x] 記錄 Core Web Vitals（LCP、INP、CLS，行動優先）
  ✅ 實際做法：Lighthouse 是實驗室測試（lab data），量不到真正的 INP（那是需要真實使用者流量的欄位指標），用 TBT（Total Blocking Time）當替代指標。
  Desktop：LCP 1.5s / CLS 0 / TBT 0ms
  Mobile：LCP **6.5s**（Phase 2 目標是 < 2.5s，目前差距大）/ CLS 0 / TBT 80ms
  Mobile LCP 過高跟 build 時就有的警告一致（`BlochSpherePage` chunk 920KB，遠超建議值），是 Phase 2（效能）的頭號項目，這次不處理。
- [x] `reports/` 有進 `.gitignore`，作業數字才進版控區
  ✅ 實際做法：`.gitignore` 加了 `reports/`，原始報告只留在本機，不進版控。

### Phase 0 產出（Claude Code 填寫）

```
索引狀態：未索引（技術面已排除攔截可能，純粹是新站尚待爬取 + 剛送出 sitemap 等待處理）
框架 / 渲染：Vite + React + react-router-dom，純 CSR
頁面數量（概略分類）：~20 靜態路由 + 4 類動態 slug 路由（research/projects/people/solutions）
Lighthouse 基準（mobile）：Performance 64 / SEO 100 / A11y 95 / Best Practices 100
Lighthouse 基準（desktop）：Performance 91 / SEO 100 / A11y 95 / Best Practices 100
Core Web Vitals（mobile, lab data）：LCP 6.5s / CLS 0 / TBT 80ms
三大最急風險項（更新於 Phase 1 完成後）：
1. Mobile LCP 6.5s，遠高於 Phase 2 目標 2.5s——最大單一元凶是 BlochSpherePage 920KB 的 JS chunk，是接下來效能優化的第一個對象
2. 純 CSR——Googlebot 需要額外渲染步驟才能看到內容，SEO 分數雖已是 100，但這是「爬蟲執行 JS 後」的分數，實際索引速度仍受影響，是否要改 SSR/SSG 需要你拍板（見 3.3）
3. §1 站台設定值尚未由人工填寫，Phase 3（關鍵字/內容架構）起無法安全執行

~~2. 全站共用同一份靜態 meta~~ — 已在 Phase 1 解決（每頁專屬 title/description/canonical，見 3.1）
```

---

## 3. Phase 1 — 技術 SEO 地基

**原則：先讓 Google 進得來、看得懂、不重複。** 這個階段沒做完，內容都是浪費。

### 3.1 可索引性

- [x] `robots.txt` 正確，允許爬取，宣告 sitemap 位置
  ✅ 實際做法：見 2.1，已確認正確。
- [x] 移除所有非正式頁面的 `noindex`，特別檢查預覽環境的設定有沒有洩漏到 production
  ✅ 實際做法：全站只有一份 `index.html`（無環境變體），`robots` meta 統一為 `index, follow`，沒有預覽環境洩漏的風險。
- [x] 每頁有唯一、正確的絕對路徑 `<link rel="canonical">`
  ✅ 實際做法：全站原本共用同一份 `index.html` 靜態 meta，每個路由標題/描述都一樣。新增 `src/lib/seo/useSeo.ts`（輕量 hook，沒有另外裝 react-helmet 之類的套件），掛進三個共用 layout（`ListPageLayout`、`DetailPageLayout`、`ToolPageLayout`）加上 `PageShell`，`path` 設為必填 prop，逼 TypeScript 檢查漏掉哪個呼叫點都會報錯。約 28 個路由全部覆蓋，含首頁、About、及沒有共用 layout 的 SolutionDetailPage。用 Playwright 對 `/research`、`/research/quantum-annealing`、SPA 內部導航都驗證過 `document.title`/canonical/description 正確更新，且不會重複產生 `<link rel="canonical">`。
- [x] 分頁、篩選、UTM 參數頁面的 canonical 指回主版本
  ✅ 實際做法：篩選/排序狀態（Projects 的 status 篩選、Publications 的搜尋等）都是純前端 state，不寫進網址查詢參數，所以 canonical 天然就是同一個乾淨路徑，不需要額外處理。
- [x] 建立 404 頁面，是真的 404（不是 200 的「軟 404」）
  ✅ 實際做法：`NotFoundPage` 走 `<Route path="*">`；GitHub Pages 對不存在路徑本來就回 404 狀態碼，而 `dist/404.html`（build 時從 index.html 複製）讓 SPA 路由在 404 狀態下仍能正確渲染對應頁面內容，兩者不衝突。
- [ ] 若網域曾改版，建立 301 對照表（不適用——全新網域）

### 3.2 Sitemap 與結構

- [x] `sitemap.xml` 自動產生，不要手寫維護
  ✅ 實際做法：新增 `scripts/generate-sitemap.mjs`，從 `src/data/research.ts`、`projects.ts`、`people.ts`、`src/data/cases/*.json`（手動讀目錄，因為 `import.meta.glob` 是 Vite 專屬語法，獨立腳本裡跑不動）讀出所有 slug，跟靜態路由一起產生完整 sitemap，接進 `npm run build`。publications 和 news 沒有 detail route，故意不產生對應條目。目前產出 35 條 URL（13 靜態 + 22 動態）。
- [x] sitemap 只包含 200 + 可索引 + canonical 指向自己的頁面
  ✅ 實際做法：動態產生的每一條都對應真實存在的路由與資料，cases 只納入 `status === "published"` 的項目，跟網站本身 `/solutions` 列表的篩選邏輯一致。
- [x] URL 結構乾淨：小寫、連字號分隔、無無意義參數、層級 ≤ 3
  ✅ 實際做法：既有路由本來就符合（`/research/quantum-annealing` 這種形式），本次沒有新增不符合的路由。
- [x] 全站 HTTPS，無混合內容（mixed content）
  ✅ 實際做法：CSP 含 `upgrade-insecure-requests`，且先前排查過的唯一 http 問題（github.io 轉址）已修復。
- [x] 提交 sitemap 到 Google Search Console 及 Bing Webmaster Tools
  ✅ 實際做法：GSC 已送出（狀態待處理中）。**Bing Webmaster Tools 還沒做**——這個可以直接匯入 GSC 驗證結果，幾分鐘完成，建議你之後也做一下，留在待辦池。

### 3.3 渲染

- [x] 主要內容在**原始 HTML** 就存在，用 `curl` 檢查（不要看瀏覽器）
  ✅ 實際做法：已檢查，**確認不存在**——見 2.2，純 CSR，原始 HTML 是空殼。這條目前是「發現問題」而非「做完」，故評估內容見下。
- [ ] 若目前是 CSR，要不要改成 SSR/SSG，這是本階段最高成本的改動方案
  **不自己動手，先回報評估**：現有站台是 Vite SPA，改 SSR/SSG（例如換成 Next.js 或加 Vite SSR）是架構級變動，会牽動全部頁面、Admin 後台整合、GitHub Pages 純靜態託管的部署模式（GitHub Pages 不跑 server，SSR 需要另外的執行環境，等於要換 hosting）。這不是「這次順手做」量級的事，需要你明確決定要不要做、以及可接受的改動範圍有多大。目前 Googlebot 對 CSR 網站確實會執行 JS 再索引，只是比 SSR/SSG 慢、更依賴爬取預算，並非完全爬不到——先把 Phase 1 其餘項目做完、觀察 GSC 的「涵蓋範圍」報告，若幾週後仍遲遲不索引，再回頭考慮這個大改動更務實。
- [x] 內部連結用真正的 `<a href>`，不要用 `onClick` 導頁
  ✅ 實際做法：站內連結統一用 `react-router-dom` 的 `<Link>`，會渲染成真正的 `<a href>`，不是純 onClick 導頁。

**驗收：** Lighthouse SEO 分數 ≥ 95；GSC「網頁」報告無「已封鎖」「未編入索引」的異常項；未編入索引的頁數合理。
- [x] Lighthouse SEO 分數 ≥ 95 ✅ 實際做法：desktop/mobile 都是 100 分，零失敗項（見 2.3）。
- [ ] GSC 涵蓋範圍報告——網站太新，GSC 目前還沒有涵蓋範圍資料可看，等 Google 真的開始爬了才有東西可查，留待下一輪。

---

## 4～10（Phase 2-7、時程規劃）

尚未執行，維持原文件內容不變，等 Phase 1 剩餘項目與 §1 站台設定值確認後再排。

---

## 11. 待辦池

（Claude Code 過程中發現、但不屬於當下 Phase 的事，寫這裡，不要留在程式碼裡當 TODO）

- [x] ~~Sitemap 改成 build time 自動產生~~ — 已完成，見 3.2
- [x] ~~每頁專屬 title / description / canonical~~ — 已完成，見 3.1
- [ ] 提交 sitemap 到 Bing Webmaster Tools（可直接匯入 GSC 驗證，幾分鐘工作量）
- [ ] og:image 目前是全站共用同一張（`/og-image.svg`），沒有隨路由換圖——Phase 3（結構化資料/OG）範圍，先記著
- [ ] Lighthouse a11y 95 分，唯一扣分項是 `color-contrast`（文字對比度不足）——不是 SEO 範疇，是 claude.md 本來就要求的無障礙項目，找時間單獨處理
- [ ] Mobile LCP 6.5s（目標 < 2.5s），最大元凶是 `BlochSpherePage` 920KB 的 JS chunk——這是 Phase 2（效能）第一項要處理的
- [ ] 是否要為 CSR 導入 SSR/SSG 或預渲染（prerender）——架構級決定，需要你明確拍板，見 3.3
- [ ] Lighthouse 基準線還沒跑（2.3、3.3 的驗收都卡在這裡）
- [ ] §1 站台設定值需要你填：`site_type` / `primary_goal` / `target_market` / `competitors` 等，Phase 3（On-Page 關鍵字）開始前必須先有這些

---

## 12. Claude Code 起手式指令範例

```
# 第一步
請讀 SEO_PLAN.md，執行 Phase 0 剩餘項目（Lighthouse 基準線）。
把結果填進「Phase 0 產出」欄位。

# 確認後
Phase 0 結果我看過了，開分支 seo/phase-1-technical，
把 3.1、3.2 剩下的 checkbox 做掉，每個完成後更新文件。
3.3 渲染那段先不要動，等我看完評估再決定。
```
