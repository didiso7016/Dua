# DUA+ 技術移轉手冊（HANDOVER）

> 狀態截至：2026-11-03，第 3 批（建案詳細頁模板）完成後。第 2 批為首頁資訊架構＋ /projects 改版；第 1 批為聯絡我們／洽詢名單／隱私權政策／關於我們併入刊登合作。
>
> **第 3 批變更摘要（建案詳細頁模板）**
> - 建案詳細頁 `/projects/<id>` 有 3 種模板：**經典 classic**（標題在上、框起來的大圖、編號章節＋粗黑分隔線、周邊機能左右交錯）、**圖像 gallery**（滿版大圖、標題卡片壓在照片上、色塊章節、周邊機能照片卡片並排）、**簡約 compact**（左文右圖開場、各段落白色卡片、窄版、周邊機能小圖清單）。三者顯示相同資料與段落（輪播、基本資料＋行政區圖、優勢、格局切換、周邊機能各自照片、影片與新增段落、預約／位置／FAQ、段落錨點、JSON-LD），只改呈現。開場新增彩色貼紙標籤（地區＝天空藍、房型＝草綠、類型＝橘、總價＝黃、生活＝粉紫）。
> - 資料：專案 JSON 新增**選填**欄位 `template`（`classic`／`gallery`／`compact`），沒有時視為 classic，不需 migration。定義在 `lib/project-templates.ts`，驗證在 `lib/project-schema.ts`。
> - 元件：`components/project-detail.tsx`（三模板共用結構，`<main class="project-detail pd-<模板>" data-template>`）、後台 `components/admin-project-template.tsx`（「版面設定」分頁最上方的模板單選卡片；「預覽目前編輯」即時套用）。捲動進場動畫 `DetailMotion` 已移除（效能）。
> - 樣式：新增 `styles/project-detail.css`（三模板＋輪播、格局、行政區圖、預約表單、影片、手機預約列）。`app/globals.css` 內舊的 jp-／clean-／apricot-／polished-detail 詳細頁樣式層已全部移除（58KB → 11KB，只剩 shadcn 主題變數與後台舊樣式）；`docs/apricot-detail.md` 描述的是舊樣式，僅供歷史參考。
> - 種子：新增 `seed/40-project-templates.sql`；測試：新增 `tests/project-templates.mjs`。
>
> **第 2 批變更摘要**
> - 首頁由上而下：Hero → 最新消息列（編輯精選標題，有才顯示）→ 開始找房 Q&A（5 題：地區 → 預算 → 房型 → 類型 → 生活需求）→ 最新建案（最多 6）→ 熱門區塊（排除已在最新建案出現者，沒有剩下就隱藏）→ 精選與廣告（1 橫幅＋2 方形）。
> - 元件：`components/home-discovery.tsx`（HomeFinder、HomeProjectRail）、`components/home-sections.tsx`（新）；舊的 `components/explore-showcase.tsx` 已刪除。建案卡片 `ProjectCard`（`components/site.tsx`）改為新樣式，首頁與 `/projects` 共用。
> - 樣式：新增 `styles/home.css`（卡片、輪播、Q&A、首頁區塊、共用下拉）與 `styles/listing.css`（/projects）；`app/globals.css` 中舊的 discovery／explore／editorial 首頁與列表樣式（藍色系、PMingLiU 等）已移除。
> - 資料：首頁設定 `banners[]` 新增**選填**欄位 `slot`（`auto`／`wide`／`square`）；舊資料沒有此欄位時視為 `auto`，不需 migration。邏輯在 `lib/discovery.ts` 的 `adSlots()`、`popularExcluding()`、`lifeOptions`。
> - 種子：新增 `seed/30-home-settings.sql`。
> 之後每一批改動都要回頭更新本檔。其他細節文件：`docs/01-專案架構.md`、`docs/02-功能與完成狀態.md`、`docs/03-部署與交接.md`、`docs/admin-auth.md`、`docs/google-sheets.md`、`docs/sheets-inquiries.md`。

---

## 1. 架構與技術棧

| 層 | 技術 |
|---|---|
| 前端 | React 19（App Router 寫法）、Tailwind 4、自訂設計系統（`styles/`） |
| 框架／建置 | vinext 1.0 beta（Next App Router 相容層，跑在 Vite 8），`@cloudflare/vite-plugin` |
| 執行環境 | Cloudflare Worker（進入點 `worker/index.ts`，把所有請求交給 vinext） |
| 資料庫 | Cloudflare D1（SQLite），Drizzle ORM，schema 在 `db/schema.ts`，migration 在 `drizzle/` |
| 圖片儲存 | Cloudflare R2（binding `BUCKET`；**正式帳號尚未啟用 R2**，見第 6、10 章） |
| 名單外送 | Google Apps Script Web App → Google 試算表（預約名單、洽詢名單） |
| 寄信 | Resend（選填，只用在管理者忘記密碼） |

Worker bindings（名稱不可改，程式依賴）：
- `DB`：D1，`database_name` = `dua-plus-db`，`migrations_dir` = `drizzle`
- `BUCKET`：R2，`bucket_name` = `dua-plus-media`

D1 資料表：
| 表 | 說明 |
|---|---|
| `projects` | 建案；`data` 欄位為整份建案 JSON（格式見 `lib/model.ts`、`lib/project-schema.ts`），`status` = published／draft |
| `bookings` | 賞屋預約；`data` 為 JSON，Sheets 寫入狀態存在 JSON 內（`sheetStatus`、`sheetLease`…） |
| `inquiries` | 洽詢名單（第 1 批新增，`drizzle/0001_inquiries.sql`）；type = general／partner，Sheets 狀態用實體欄位 `sheet_status`、`sheet_attempts`、`sheet_lease`、`sheet_attempt_at` |
| `settings` | 鍵值設定：`company`（平台資訊）、`home`（首頁）、`integration:sheets`（Sheets 網址與金鑰）、`auth:account`、`auth:reset`、`auth:session:*` |

## 2. 資料夾結構

| 位置 | 用途 |
|---|---|
| `app/` | 頁面與 API（App Router）。前台：`/`、`/projects`、`/projects/[id]`、`/partner`、`/contact`、`/privacy`（`/about` 308 轉到 `/partner#about`）。後台：`/admin/*`。API：`app/api/*` |
| `components/` | 前台與後台元件；`components/ui` 為 shadcn 元件；洽詢表單與彈窗在 `components/inquiry.tsx`，後台洽詢列表在 `components/admin-inquiries.tsx` |
| `lib/` | 資料模型、驗證（zod）、搜尋邏輯（`discovery*.ts`）、Sheets 串接（`sheet-delivery.ts`、`google-sheet-script.ts`）、隱私權文字（`privacy.ts`）、帳號（`account-auth.ts`、`password.ts`） |
| `db/`、`drizzle/` | Drizzle schema 與 D1 migration（`0000_…`、`0001_inquiries.sql`，meta 在 `drizzle/meta/`） |
| `seed/` | 本機種子資料 SQL（第 5 章） |
| `styles/` | 設計系統：tokens、base、components、site-chrome、home-hero、home（首頁 Q&A／區塊／建案卡片）、listing（/projects）、contact、page-loading、admin（由 `styles/dua.css` 匯入）。project-detail（建案詳細頁三模板）。`app/globals.css` 只剩 shadcn 主題變數與後台的舊樣式 |
| `public/` | 靜態素材；`public/assets/characters` 角色圖；`public/assets/demo/*.jpg` 建案示範照片（已提交） |
| `worker/` | Worker 進入點 |
| `scripts/` | `local-setup.mjs`（本機初始化）、`seed-local.mjs`（種子資料）、`run-tests.mjs`（測試） |
| `tests/` | `node` 直接執行的測試（`*.mjs`） |
| `vendor/` | shadcn 的 Tailwind 樣式 |
| `docs/` | 交接與功能文件 |
| `wrangler.jsonc` | Worker、D1、R2 設定。repo 內的 `database_id` 是 placeholder（`00000000-…`），只供本機使用 |

## 3. 本機開發

需求：Node.js 22.13 以上（建議 24）、pnpm 11.25.0（`npm install -g pnpm@11.25.0`）。

```sh
pnpm install --frozen-lockfile   # 安裝套件
pnpm setup:local                 # 建立 .dev.vars（本機密鑰）＋依序套用 drizzle/ 所有 migration 到本機 D1（可重複執行）
pnpm seed:local                  # 載入 seed/ 範例資料（第 5 章）
pnpm dev                         # http://localhost:5173 ，後台 /admin/login
```

- 本機測試帳號：`admin`／`admin12345`（可在第一次 setup 前用環境變數 `DUA_LOCAL_PASSWORD` 指定別的密碼）。
- 本機 D1 與 R2 狀態存在 `.wrangler/state`（`--persist-to .wrangler/state`），本機密鑰在 `.dev.vars`。兩者都在 `.gitignore`，不要提交，也不要隨便刪（刪掉 `.dev.vars` 會換 pepper，舊帳號密碼失效）。
- 本機一律使用 `--local`，不會碰到正式資料庫。
- 直接查本機資料庫：`node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --persist-to .wrangler/state --command "SELECT id,status FROM projects"`

常用指令：
| 指令 | 用途 |
|---|---|
| `pnpm dev` | 開發伺服器（port 5173） |
| `pnpm typecheck` | TypeScript 型別檢查 |
| `pnpm test` | 執行 `tests/` 內所有測試 |
| `pnpm lint` | ESLint |
| `pnpm build` | 建置到 `dist/`（產生 `dist/server/wrangler.json`） |
| `pnpm start` | 以 wrangler 在本機跑建置後的版本 |
| `pnpm db:generate` | 依 `db/schema.ts` 產生新 migration |
| `pnpm setup:local` | 本機初始化 |
| `pnpm seed:local` | 載入本機種子資料 |

## 4. 環境變數與密鑰名稱

只列名稱，**不要把值寫進 repo 或文件**。本機放 `.dev.vars`（`pnpm setup:local` 自動產生）；正式環境用 `wrangler secret put <名稱>` 設定。

| 名稱 | 類型 | 用途 |
|---|---|---|
| `DUA_AUTH_PEPPER` | 秘密 | 密碼雜湊用的 HMAC 秘密；遺失則所有密碼失效，正式環境必須備份 |
| `DUA_INITIAL_PASSWORD_HASH` | 秘密 | 初始管理者密碼雜湊（只在第一次建立 `auth:account` 時使用） |
| `DUA_ADMIN_USERNAME` | 設定 | 初始管理者帳號 |
| `DUA_RESET_EMAIL` | 設定 | 忘記密碼時收信的管理者信箱 |
| `DUA_SITE_ORIGIN` | 設定 | 站點網址（正式用 HTTPS），用於重設密碼連結 |
| `DUA_MAIL_API_KEY` | 秘密（選填） | Resend API 金鑰；未設定則忘記密碼功能回報未啟用 |
| `DUA_MAIL_FROM` | 設定（選填） | Resend 已驗證的寄件地址 |
| `DUA_LOCAL_PASSWORD` | 只限本機 | `pnpm setup:local` 第一次執行時的本機密碼（預設 admin12345） |

其他：
- Google Sheets 的接收網址與金鑰**不是**環境變數，而是存在 D1 `settings` 表的 `integration:sheets`（在 `/admin/sheets` 填寫）。Apps Script 端的金鑰存在指令碼屬性 `DUA_TOKEN`。
- 本機腳本會設定 `WRANGLER_SEND_METRICS=false`、`CLOUDFLARE_CF_FETCH_ENABLED=false` 等 wrangler 環境變數，這些不是密鑰。

## 5. 種子資料載入

`seed/` 內的 SQL 依檔名順序執行，全部為固定 id ＋ `INSERT OR REPLACE`，可重複執行：

| 檔案 | 內容 |
|---|---|
| `seed/00-projects.sql` | 5 個既有建案的完整資料（`huayi-yoyogi-5` 華邑代代木5-星峠為真實建案；`demo-taipei-qingtian`、`demo-newtaipei-yuesen`、`demo-taichung-hikari`、`demo-kaohsiung-hele` 為虛構示範建案）。也是匯出／還原用的備份 |
| `seed/10-inquiries.sql` | 8 筆虛構洽詢（一般／合作混合；已寫入、待補送、多次失敗等狀態；電話 0900-000-001～008；consent_version `privacy-2026-11`） |
| `seed/20-bookings.sql` | 4 筆虛構賞屋預約，分屬既有建案（sent／pending 混合） |
| `seed/30-home-settings.sql` | 首頁設定（`settings` key=`home`）：預設預算級距＋「精選與廣告」示範——橫幅＝編輯精選（連到星峠）、方形 1＝廣告（連到 /partner）、方形 2 留空以顯示「廣告版位招募中」。**會覆蓋本機後台已存的首頁設定**；清除：`DELETE FROM settings WHERE key='home'` |
| `seed/40-project-templates.sql` | 第 3 批：用 `json_set` 只改 5 個建案的 `template` 欄位——星峠＝經典、青田晴光／台中光＝圖像、板橋悅森居／高雄和樂＝簡約。不動其他內容；建案不存在時不新增。還原預設：`UPDATE projects SET data=json_remove(data,'$.template')` |

```sh
pnpm setup:local          # 先確保資料表存在
pnpm seed:local           # 依序執行 seed/*.sql
pnpm seed:local -- --reset-projects   # 連 00-projects.sql 也強制執行（覆蓋本機建案）
```

- `scripts/seed-local.mjs` 用 `node_modules/wrangler/bin/wrangler.js d1 execute DB --local --persist-to .wrangler/state --file <檔案>` 逐一執行，並設定 `WRANGLER_SEND_METRICS=false`。只寫本機。
- **建案保護**：本機 `projects` 表已有 `00-projects.sql` 中任何一個建案時，預設會跳過該檔，避免蓋掉本機後台的修改；加 `--reset-projects` 才會覆蓋。
- 範例資料 id 都以 `5eed0000-` 開頭，可用 `DELETE FROM inquiries WHERE id LIKE '5eed0000-%'`（bookings 同理）清除。
- **注意**：若本機後台已設定 Google Sheets 串接，按「補送未完成名單」會把 pending 範例寫進真的試算表。測試補送前先清掉範例或改用測試用試算表。
- 範例資料只給本機用，**不要**對正式 D1 執行 `10-`、`20-`、`30-`（`30-` 會蓋掉正式首頁設定）。`00-projects.sql` 必要時可用來還原正式建案（`--remote --file seed/00-projects.sql`，會覆蓋正式資料，請先備份）。
- 建案照片 `/assets/demo/*.jpg`（hsr-a19、hsr-station、huayi-exterior、land-art、paperbark-trail、plan-a6）已放在 `public/assets/demo/` 並隨 repo 提交。
- 之後每一批的新功能都要在 `seed/` 加上對應的 `NN-<功能>.sql`。

## 6. 部署到 Cloudflare Worker

- 目前正式網址：https://dua-plus.onlyworkandeducation.workers.dev
- 尚無自訂網域。
- 部署**從複本資料夾 `C:\DUA-deploy` 進行**，不是從 `C:\DUA`。`C:\DUA-deploy` 有自己的 `wrangler.jsonc`，裡面是正式 D1 的真實 `database_id`；repo 內的 `wrangler.jsonc` 是 placeholder，不要把真實 ID 提交進 repo，也不要用 repo 的設定蓋掉 deploy 資料夾的設定。

### 步驟
1. 把 `C:\DUA` 的最新程式同步到 `C:\DUA-deploy`（保留 `C:\DUA-deploy\wrangler.jsonc` 不被覆蓋），在 `C:\DUA-deploy` 執行 `pnpm install --frozen-lockfile`。
2. 建置：`pnpm build`，會產生 `dist/server/wrangler.json`。
3. **移除 R2 設定（目前必要）**：Cloudflare 帳號**尚未啟用 R2**。打開 `dist/server/wrangler.json`，刪除整個 `"r2_buckets": [ … ]` 項目（並注意前後逗號，保持 JSON 正確）。沒有刪的話，`wrangler deploy` 會失敗，錯誤是 r2/buckets API 錯誤。
   - 後果：正式站的後台**無法上傳照片**（`/api/admin/upload` 回傳「圖片服務暫時無法使用」），`/api/media/*` 也無法讀圖。建案照片目前都用 `public/assets/` 的靜態檔。
   - 等 R2 啟用、建立 `dua-plus-media` bucket 後，就不要再刪這段，讓 `r2_buckets` 保持原樣，上傳功能就會恢復。（`dist/` 每次 build 都會重新產生，所以每次部署都要重做這一步，直到 R2 啟用。）
4. 部署：`npx wrangler deploy --config dist/server/wrangler.json`（或在 deploy 資料夾使用 `node node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.json`）。
5. **套用新 migration 到正式 D1**：
   ```sh
   wrangler d1 migrations apply dua-plus-db --remote
   ```
   - **目前 `0001_inquiries` 在正式環境尚未套用**。未套用前，洽詢表單會回「暫時無法完成操作」，後台洽詢名單與洽詢補送也無法使用（其他功能正常）。
   - 若正式 D1 當初是用 `d1 execute --file` 手動建立 0000（沒有 `d1_migrations` 紀錄），上面的指令會嘗試重跑 0000 而失敗，改成只跑新檔：`wrangler d1 execute dua-plus-db --remote --file drizzle/0001_inquiries.sql`。
6. 密鑰：第一次或有新增時，`wrangler secret put DUA_AUTH_PEPPER` 等（名稱見第 4 章）。
7. 驗證：開正式網址首頁、`/projects`、星峠詳細頁、`/contact` 送一筆虛構洽詢、`/admin/login` 登入看「洽詢名單」。

### 新增 migration 的流程
修改 `db/schema.ts` → `pnpm db:generate`（產生 `drizzle/NNNN_*.sql` 與 meta）→ 本機 `pnpm setup:local` 套用 → 部署後跑 `wrangler d1 migrations apply dua-plus-db --remote`。

## 7. 後台使用說明

登入：`/admin/login`（本機 `admin`／`admin12345`；正式帳密另行交接）。工作階段 8 小時，HttpOnly Cookie。

| 路徑 | 功能 |
|---|---|
| `/admin` | 主後台。左側選單：**建案管理**、**首頁與瀏覽統計**、**洽詢名單**、**名單接收設定**、**平台資訊** |
| `/admin/sheets` | Google Sheets 串接：複製接收程式碼、產生金鑰、填部署網址、測試入口連線、「補送未完成名單」（預約與洽詢各最多 5 筆／次） |
| `/admin/account` | 帳號資訊 |
| `/admin/change` | 變更密碼（會讓所有舊工作階段失效） |
| `/admin/forgot`、`/admin/reset` | 忘記密碼／重設（需設定 Resend，見第 4 章） |
| `/admin-preview/[screen]` | 後台畫面預覽頁（開發用） |

- **建案管理**：每個建案可編輯 基本資料、照片與格局、周邊機能、位置、常見問題、搜尋與資料來源（SEO／GEO）、建案優勢、新增段落、版面設定（**詳細頁模板**：經典／圖像／簡約，第 3 批；各區塊顯示／隱藏、排序、名稱、預約區塊開關）。狀態 published 才會出現在前台。照片上傳需要 R2（正式站目前無法上傳，可填 `/assets/...` 靜態路徑）。
- **洽詢名單**（第 1 批新增）：切換 全部／一般洽詢／合作洽詢（含筆數），顯示時間（台北）、類型、姓名、電話／Email 連結、公司、內容、來源頁、試算表狀態（已寫入／待補送＋嘗試次數），待補送可連到 `/admin/sheets` 補送。沒有 CSV 匯出。
- **名單接收設定**：公司名單總表、各建案專用表網址；串接細節在 `/admin/sheets`。
- **平台資訊**：公司名稱、電話、Email、地址、FB／IG，前台 Footer 與 `/contact` 共用。
- **首頁與瀏覽統計**：
  - 互動找房的預算級距（首頁 Q&A 與 `/projects` 共用）。
  - **精選與廣告版位**（第 2 批）：每筆有 標題、類型（編輯精選／廣告・贊助）、**首頁版位**（自動／橫幅 2:1／方形 1:1）、連結、顯示期間、圖片。首頁固定保留 1 個橫幅＋2 個方形，只顯示圖片（標題當替代文字），角落小貼紙標示「廣告」或「精選」；「自動」依排列順序先補橫幅再補方形，多出的不顯示；空位顯示「廣告版位招募中」連到 `/partner`。建議尺寸：橫幅 1200×600、方形 800×800。編輯精選的標題也會出現在首頁上方「最新消息」列。正式站 R2 未啟用前上傳停用，可在「圖片路徑」欄位直接填 `/assets/...` 站內靜態圖（第 2 批新增欄位；只接受 `/assets/` 或 `/api/media/` 開頭）。
  - 「大家都在看」開關與近 30 天瀏覽統計：開啟且至少 3 案有瀏覽、合計 10 次以上才有熱門資料；首頁會再排除已在「最新建案」出現的建案，沒有剩下就不顯示熱門區塊（目前只有 5 個建案，全部都在最新建案內，所以熱門區塊通常不會出現）。

## 8. Google Sheets 同步

流程：前台送出 → 先存進 D1（bookings／inquiries）→ 取得 60 秒租約 → 呼叫 Apps Script Web App → 回傳成功才標記 sent；失敗保留 pending，可手動補送。Google 端用 ScriptLock＋編號比對防重複。目前**沒有自動定時重送**。

- 預約：寫入公司總表與建案專用表的「預約名單」分頁（`action: 'deliver'`），詳見 `docs/google-sheets.md`。
- 洽詢：只寫入公司總表的「洽詢名單」分頁（`action: 'inquiry'`），欄位 A～I：編號、時間、類型、姓名、電話、Email、公司、內容、來源頁。詳見 `docs/sheets-inquiries.md`。
- 接收程式原始碼：`lib/google-sheet-script.ts`（`/admin/sheets` 的「複製接收程式碼」就是它）。

### Apps Script 更新／重新部署步驟（每次 `lib/google-sheet-script.ts` 有改都要做）
1. 公司總表新增分頁「洽詢名單」，第 1 列 A1～I1 填上述標題（可略過：程式在分頁不存在或第 1 列全空時會自動建立；標題不一致則拒絕寫入）。
2. 後台 `/admin/sheets` →「複製接收程式碼」。
3. 開啟原本的 Apps Script 專案 → `Code.gs` 全選刪除 → 貼上 → 儲存。
4. 指令碼屬性 `DUA_TOKEN` 不用改。
5. （建議）執行 `authorizeSheets`，必要時依指示授權。
6. 「部署」→「**管理部署作業**」→ 選現有網頁應用程式 → 鉛筆「編輯」→ 版本選「**新版本**」→ 執行身分「我」、存取權「所有人」→「部署」。網址不變，後台不用改設定。
   - 不要用「新增部署作業」（會產生新網址；若誤用，需把新網址與原金鑰重新存到 `/admin/sheets`）。
7. 驗證：`/admin/sheets`「測試入口連線」→ 前台 `/contact` 送一般洽詢、`/partner` 送合作洽詢（用虛構資料）→ 確認總表「洽詢名單」多兩列、時間為台灣時間、電話開頭 0 保留 → 後台「洽詢名單」顯示已寫入。顯示待補送多半是忘了發布新版本，發布後按「補送未完成名單」。

## 9. GitHub 分支

| 分支 | 用途 |
|---|---|
| `main` | 主線；每次大版本合併到這裡 |
| `gh-pages` | 給客戶看的靜態示範站。**絕對不要動** |
| `full-version`、`backup-before-squash` | 封存用的舊版本／壓縮歷史前的備份，只讀不改 |

## 10. 已知待辦

- **R2 未啟用**：正式站後台照片上傳停用；每次部署前要從 `dist/server/wrangler.json` 移除 `r2_buckets`（第 6 章）。啟用 R2 並建立 `dua-plus-media` 後恢復。
- **正式 D1 尚未套用 `0001_inquiries`**：部署時執行 `wrangler d1 migrations apply dua-plus-db --remote`。
- **Google 端**：公司總表要有「洽詢名單」分頁，Apps Script 要貼新版程式碼並發布新版本（第 8 章）。
- **尚無自訂網域**：目前只用 workers.dev 網址。接上網域後要更新 `DUA_SITE_ORIGIN` 並重新部署。另外 `app/sitemap.ts`、`app/robots.ts` 目前寫死舊的 `https://dua-plus-platform.userforall.chatgpt.site`，要一併改成正式網域。
- **角色跑步動畫圖待補**：載入畫面（`components/page-loading-overlay.tsx`、`components/dua-loading.tsx`）保留了替換點，等 run-cycle 圖稿到位再換上。
- **隱私權政策需法務審閱**：`lib/privacy.ts` 目前逐字照原稿（含疑似錯字「蒐集著」「導至」），版本 `privacy-2026-11`；修改文字時一併更新版本號。
- Sheets 沒有自動重送排程，pending 名單需人工到 `/admin/sheets` 補送。
- 忘記密碼寄信（Resend）尚未實際設定與端到端驗證。
- **廣告圖片**：R2 未啟用前，廣告／精選圖片只能用已提交到 `public/assets/` 的靜態檔（後台「圖片路徑」欄位填寫）；客戶提供的廣告圖需先放進 repo 再部署。
