# Admin 系統架構

> **這份文件的用途**：讓 Claude Code 在每次 session 開始時就知道
> admin 系統的架構與安全約束，不需要重新解釋。
>
> **存放位置**：`docs/architecture/admin.md`，並在 `claude.md`
> 中以一行指向它。

---

# 一句話

`/admin` 有兩套互不相干的機制：**登入**是自己刻的（帳密 + JWT +
Postgres），**內容管理**是透過後端代呼叫 GitHub API 開 PR。
兩者只是剛好都掛在同一頁上。

---

# 服務拓撲

```
瀏覽器 (mrama.org · GitHub Pages · 純靜態)
   │
   │  所有需要憑證的操作一律經過後端
   ▼
Render (Node + TypeScript + Express)
   │
   ├──→ Supabase (Postgres)      users 表，驗證帳密
   └──→ GitHub REST API           以後端持有的 PAT 開 PR
```

**三個服務各自獨立部署，互不共用執行環境。**

---

# 系統 ① 登入

| 項目 | 內容 |
|---|---|
| 位置 | `server/`，部署於 Render |
| 資料庫 | Supabase Postgres，**僅當一般 Postgres 用**，不使用 Supabase Auth |
| 資料表 | `users`：帳號 + bcrypt 雜湊密碼 |
| 憑證 | JWT，以 `JWT_SECRET` 簽章 |
| 有效期 | **2 小時**（見下方說明） |
| 儲存 | 前端 localStorage |
| 驗證 | `GET /api/verify` |

## 端點

```
POST /api/login     帳密 → bcrypt 比對 → 簽發 JWT
GET  /api/verify    確認 token 有效
```

## 防護

- `express-rate-limit`：15 分鐘內同 IP 最多 5 次登入嘗試
- CORS 僅放行 `https://mrama.org`，**不得使用 `origin: '*'`**
- **無公開註冊功能**。新增帳號需在本機執行腳本直接寫入資料庫
- 登入失敗訊息不區分「帳號不存在」與「密碼錯誤」（避免帳號枚舉）

## JWT 有效期：2 小時，不是 12 小時

管理後台的 token 若外洩，攻擊者可在有效期內任意操作。12 小時的
暴露窗口對一個能改動公開網站的憑證而言過長。

建議 2 小時，搭配 refresh token 或單純要求重新登入——你不會整天
待在 admin 頁面。

---

# 系統 ② 內容管理

## 核心原則：PAT 存在後端，不存在瀏覽器

```
❌ 舊設計：瀏覽器持有 PAT → 直接呼叫 api.github.com
✅ 新設計：瀏覽器 → Render（帶 JWT）→ Render 以 PAT 呼叫 GitHub
```

### 為什麼必須改

**localStorage 對同源的任何 JavaScript 皆可讀**，包含被注入的
第三方腳本。而這個系統使用 Tiptap 產生 HTML 並以 DOMPurify 消毒
——HTML 處理是 XSS 的高風險面，只要有一處消毒疏漏，PAT 即外洩。

該 PAT 具備寫入 repo 的權限，外洩等同交出網站控制權。

**此外，舊設計讓 JWT 形同虛設。** 若 PAT 在瀏覽器端，任何取得它
的人都能直接呼叫 GitHub API，完全繞過登入系統。JWT 只擋住了
`/admin` 這個頁面，沒有保護真正重要的資產。

改為後端代呼叫後，**JWT 成為存取 GitHub 的唯一途徑**，登入系統
才真正發揮作用。

## GitHub PAT 規格

```
類型：Fine-grained personal access token（不使用 classic token）
範圍：僅 easonyang001.github.io 這一個 repo
權限：Contents        Read and write
      Pull requests   Read and write
有效期：90 天，到期前更換
存放：Render 環境變數 GITHUB_TOKEN
```

**Fine-grained 而非 classic**：classic token 的 `repo` scope 涵蓋
你所有的 repo，包含私有的 `mrama-cases`。

## 端點

```
GET  /api/content/:type          讀取內容（news/projects/people/publications）
POST /api/content/:type          提交變更 → 建分支 → commit → 開 PR
GET  /api/content/pulls          列出待審 PR
```

全部需要有效 JWT。

## 寫入流程

```
1. 讀取 main 的最新 commit SHA        Git Data API
2. 建立分支 admin/{type}-{timestamp}   Git Data API
3. 寫入檔案至該分支                    Contents API
4. 開啟 Pull Request                   Pull Requests API
5. 回傳 PR 網址給前端
```

**永不直接寫入 `main`。** `main` 有自動部署，直接寫入等於未經審閱
就上線。所有變更必須經由 PR，由人在 GitHub 上檢視 diff 後合併。

## 支援的內容類型

| 類型 | 富文本欄位 |
|---|---|
| News | description |
| Projects | — |
| People | — |
| Publications | abstract |

富文本以 Tiptap 編輯，存為 HTML。

## HTML 消毒：兩端都要做

```
編輯時（前端）→ DOMPurify → 送出
接收時（後端）→ 再次消毒 → 寫入 repo
顯示時（前端）→ 再次消毒 → 渲染
```

**前端消毒是體驗，後端消毒是安全。** 前端的檢查可被繞過，
後端必須重做一次。

允許的標籤限定為：`p, br, strong, em, u, a, ul, ol, li, h3, h4,
blockquote, code`。`a` 標籤僅允許 `href`、`title`，且 `href`
必須為 `https:` 或 `mailto:`。

---

# 環境變數（Render）

```
DATABASE_URL        Supabase Postgres 連線字串
JWT_SECRET          隨機字串，至少 32 位元組
GITHUB_TOKEN        Fine-grained PAT
GITHUB_OWNER        easonyang001
GITHUB_REPO         easonyang001.github.io
ALLOWED_ORIGIN      https://mrama.org
```

**這些值不得出現在任何前端程式碼、commit、或 log 中。**

---

# 技術清單

| 用途 | 技術 |
|---|---|
| 後端 | Node.js · Express · TypeScript |
| 密碼雜湊 | bcrypt |
| 登入憑證 | jsonwebtoken |
| 防暴力破解 | express-rate-limit |
| 資料庫 | Supabase (Postgres) |
| 後端部署 | Render |
| 內容存取 | GitHub REST API（Contents · Git Data · Pull Requests） |
| 富文本 | Tiptap |
| HTML 消毒 | DOMPurify（前後端各一次） |

---

# 修改此系統時的約束

Claude Code 在改動 admin 相關程式碼時必須遵守：

```
1. GITHUB_TOKEN 只能存在於後端環境變數。
   任何將其傳送至前端、寫入回應、或記錄於 log 的程式碼皆不可接受。

2. 所有 GitHub 寫入操作必須產生 PR，不得直接推送至 main。

3. 所有 /api/content/* 端點必須驗證 JWT。

4. 使用者提供的 HTML 在後端寫入前必須再次消毒，
   不得僅依賴前端的 DOMPurify。

5. CORS 僅放行 ALLOWED_ORIGIN。

6. 不得新增公開註冊端點。

7. 錯誤回應不得包含資料庫錯誤訊息或 schema 資訊。
```

---

# 待辦

```
□ PAT 從 localStorage 移至 Render 環境變數
□ 新增 /api/content/* 端點，由後端代呼叫 GitHub
□ 前端移除所有 api.github.com 的直接呼叫
□ 現有 PAT 撤銷後重新簽發 fine-grained token
□ JWT 有效期 12h → 2h
□ 後端加入 DOMPurify（isomorphic-dompurify）
□ 確認前端 bundle 中不含任何 token 字串
```

**第一項與第四項是安全修正，優先於功能開發。**
