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

## 1. 站台設定值

> 使用者已明確指示 Claude Code 直接填寫（原本的「不要自己填」規則本輪解除）。`competitors` 沒有把握用猜的，留白給使用者。

```yaml
domain: mrama.org
canonical_host: https://mrama.org        # 無 www，已確認 www.mrama.org 沒有 DNS 紀錄
site_type: 獨立研究機構官網（非 SaaS / 非電商 / 非內容媒體，比較接近 NPO/學術機構站）
primary_goal: 品牌能見度與可信度——讓外界搜尋機構名稱、研究人員、研究主題時找得到並認識這個機構，不是註冊轉換或詢價表單
target_market: 全球英語（網站文案全英文），機構本身立足台灣
languages: en（目前無 zh-Hant 版本，UI 全英文）
tech_stack: Vite + React + TypeScript + react-router-dom（CSR SPA，Phase 1 起加入 build-time prerender，見 3.3）
hosting: GitHub Pages（custom domain mrama.org，見 CNAME）
cms: 無傳統 CMS。Admin 後端（Express + Supabase）透過 GitHub API 開 PR，把內容寫回 src/data/*.ts 靜態檔案，人工 review 後 merge
analytics: 無（目前沒有 GA4 / Plausible 等工具，index.html 裡確認沒有）
search_console: 已驗證（domain property）
competitors:                            # ⚠️ 需要你填：claude.md 列的 IBM Research / MIT CSAIL / Microsoft Research / Google DeepMind / OpenAI 是「設計風格參考」，不是真正的搜尋排名競爭對手——真正會在搜尋結果裡跟 mrama.org 競爭的，應該是規模相近的獨立/小型量子運算研究者網站或部落格，這個我沒有真實資料，不該用猜的
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
框架 / 渲染：Vite + React + react-router-dom，CSR + build-time prerender（見 3.3）
頁面數量（概略分類）：~20 靜態路由 + 4 類動態 slug 路由（research/projects/people/solutions）
Lighthouse 基準（mobile）：Performance 64 / SEO 100 / A11y 95 / Best Practices 100
Lighthouse 基準（desktop）：Performance 91 / SEO 100 / A11y 95 / Best Practices 100
Core Web Vitals（mobile, lab data）：LCP 6.5s / CLS 0 / TBT 80ms
最急風險項（更新於 CSR→prerender 完成後）：
1. Mobile LCP 6.5s，遠高於 Phase 2 目標 2.5s——最大單一元凶是 BlochSpherePage 920KB 的 JS chunk，是接下來效能優化的第一個對象
2. §1 站台設定值已由使用者授權填寫（見上），但 `competitors` 仍空著，Phase 3（關鍵字/內容架構）真的要動之前需要你補上

~~純 CSR，Googlebot 需要額外渲染步驟~~ — 已解決，見 3.3 的 prerender 實作，現在 `curl` 任何路由都能直接拿到完整內容

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
  ✅ 實際做法：本輪之前確認不存在（純 CSR，原始 HTML 是空殼）。**本輪已解決**——見下一項的 prerender 實作，`curl` 現在對每個路由都能直接拿到完整渲染後的內容。
- [x] 若目前是 CSR，要不要改成 SSR/SSG，這是本階段最高成本的改動方案
  ✅ 實際做法：使用者決定要做，且明確選擇「**build-time prerender**」而非真正的 SSR/框架遷移——GitHub Pages 只能放靜態檔案，換成 Next.js 之類的 SSR 框架必須連 hosting 一起換，違反 claude.md「必須能部署到 GitHub Pages」的硬性要求，成本高太多不成比例。

  做法：新增 `scripts/prerender.mjs`，在 `vite build` + `copy-404.mjs` 之後、`npm run build` 的最後一步執行。用 Playwright（新增為 devDependency）開一個真的無頭瀏覽器，起一個本機靜態伺服器讀 `dist/`，把 `all-routes.mjs`（跟 sitemap 產生器共用的路由清單）列出的全部 35 條路由都真的訪問一次、等 `networkidle` 後抓 `page.content()`，寫成 `dist/<route>/index.html`（首頁例外，直接覆蓋 `dist/index.html`）。CI（`.github/workflows/deploy.yml`）加了 `npx playwright install --with-deps chromium` 步驟，不然 build 在 GitHub Actions 上會找不到瀏覽器執行檔。

  **過程中抓到一個真的 bug**：一開始的 SPA fallback 邏輯在遇到還沒生成的路由時，會退回去讀 `dist/index.html` 當殼——但這個檔案在處理完首頁後，已經被首頁「渲染完的實際內容」（含 Hero 區塊的 IntroOverlay 動畫）覆蓋掉了，導致除了首頁本身，其他 34 個頁面的殼都混進了首頁的殘留內容。修正：fallback 一律改讀 `dist/404.html`（`copy-404.mjs` 在預渲染開始前存下來的原始空殼備份，腳本全程不會去動它），並在腳本一開頭加了防呆——如果 `dist/404.html` 不存在就直接報錯，不會默默用錯的東西頂替。

  **驗證時的另一個插曲，記下來避免未來的人被誤導**：用 `npm run preview`（`vite preview`）在本機測試時，畫面整個是黑的，一度以為預渲染又壞了——後來查出來是 `vite preview` 自己的 SPA fallback 邏輯不認得巢狀的 `dist/about/index.html` 這種結構，對任何「看起來像路由、不是靜態資源」的請求一律回傳根目錄的 `index.html`，跟 GitHub Pages 真實的靜態檔案伺服器行為完全不同。**改用 `npx serve dist` 測試後，一切正常**（title、canonical、視覺畫面都對，多個路由 + client-side 導航都測過，0 console 錯誤）。**之後要在本機驗證預渲染結果，不要用 `npm run preview`，要用 `npx serve dist` 或直接看部署後的正式環境。**
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
- [x] ~~是否要為 CSR 導入 SSR/SSG 或預渲染（prerender）~~ — 已完成，見 3.3
- [x] ~~Lighthouse 基準線還沒跑~~ — 已完成，見 2.3
- [x] ~~§1 站台設定值需要你填~~ — 已由使用者授權填寫，`competitors` 仍留白
- [ ] **本機測試預渲染結果不要用 `npm run preview`**——`vite preview` 自己的 SPA fallback 不認得巢狀的 `dist/<route>/index.html`，任何非靜態資源的路徑都會回傳根目錄 `index.html`，會誤導成「畫面壞了」。改用 `npx serve dist` 或直接看正式環境。
- [ ] `npm run build` 現在多了一個 Playwright 開瀏覽器跑 35 個路由的步驟，本機/CI 的 build 時間會變長（CI 另外加了 `playwright install --with-deps chromium` 的安裝步驟）——如果之後路由數量大幅增加，這個步驟的耗時要留意
- [ ] Prerender 只走過一次 CSP 驗證（zero console 錯誤），但沒有針對「每個路由」逐一人工檢查畫面——目前是抽測幾個 + 自動化 title/canonical 驗證，如果之後發現特定頁面畫面跑掉，回來看是不是那個頁面本身的元件有 SSR-unsafe 的邏輯（例如直接讀 `window`/`document` 而沒做防呆）

### 關鍵字定位評估（2026-08-06）

Google 已經能查到「mrama quantum」找到本站。使用者接下來的目標是純「mrama」一個字也要出現，這裡記錄實際查證後的評估，避免之後重新花時間查一次。

查證發現：純 "mrama" 這個字**已經被多個長期存在、跟量子研究完全無關的東西佔用**：
- Wiktionary 收錄「mrama」為史瓦希里語字彙（船隻偏航、失控之意）——字典類搜尋很難被其他網站打敗。
- 一個辦到第 23 屆的學術研討會系列直接叫 "MRAMA workshop"（Barcelona UAB 主辦），累積十幾年學術網域權重與外部連結。
- 音樂團體 MRAMA DIVISION（IG/Bandcamp/SoundCloud）、IMDB 短片、遊戲 mod 作者等也用同名。

mrama.org 是 2026 年才成立的新網域，網域年齡與外部連結數目前完全無法對比那個辦 23 屆的學術研討會站台。

**短期目標（可控，優先）**：鞏固已經領先、沒有老牌競爭者的複合詞——「mrama quantum」「mrama institute」「mrama research」。持續累積這些詞的內容深度與內部連結，這是目前投入報酬率最高的地方。

**長期目標（不可控，放著累積即可）**：純「mrama」擠進第一頁（不是衝第一名）。做法不是靠站內優化，是靠外部真實連結（學術合作、論文作者頁互連、GitHub README 引用等）與網站年齡自然累積，急不來，不用特別排 Phase。

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
