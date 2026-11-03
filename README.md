# DUA+ 建案導覽平台

前台、管理後台、API 與資料庫結構都在這個專案裡。技術：React 19、vinext（Next App Router 寫法，跑在 Vite 8）、Cloudflare Workers、D1、R2、Drizzle、Tailwind 4。

## 本機啟動（Windows／macOS／Linux）

需要 Node.js 24 以上與 pnpm 11.25.0（`npm install -g pnpm@11.25.0`）。

```sh
pnpm install --frozen-lockfile   # 安裝套件
pnpm setup:local                 # 建立 .dev.vars 與本機 D1 資料表（不會覆蓋既有資料）
pnpm dev                         # http://localhost:5173 ，後台 /admin/login
```

本機測試帳號：admin／admin12345。本機資料庫和上傳的圖片存在 `.wrangler/state`，密鑰在 `.dev.vars`，兩者都不提交，請保留。

## 常用指令

| 指令 | 用途 |
|---|---|
| `pnpm dev` | 開發伺服器（port 5173） |
| `pnpm typecheck` | TypeScript 型別檢查 |
| `pnpm test` | 執行 tests/ 內所有測試 |
| `pnpm build` | 建置到 dist/ |
| `pnpm start` | 用 wrangler 在本機跑建置後的版本 |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | 依 db/schema.ts 產生新的 migration |

## 目錄

| 位置 | 用途 |
|---|---|
| app/ | 頁面與 API（App Router） |
| components/ | 前台與後台元件；components/ui 是 shadcn 元件 |
| lib/ | 資料模型、驗證、搜尋條件、Sheets 串接等核心邏輯 |
| db/、drizzle/ | Drizzle schema 與 D1 migration |
| styles/ | 新設計系統（tokens、base、元件、Header／Footer） |
| public/ | 圖片素材；角色圖在 public/assets/characters |
| worker/ | Cloudflare Worker 進入點 |
| scripts/ | 本機初始化與測試執行腳本 |
| tests/ | 測試 |
| vendor/ | shadcn 的 Tailwind 樣式（globals.css 引用） |
| docs/ | 交接與功能文件 |
| wrangler.jsonc | Worker、D1、R2 設定（正式部署時換成正式 ID） |

## 部署

正式站將部署到公司自己的 Cloudflare 帳號與購買的網域，步驟見 docs/03-部署與交接.md。本機修改不會自動發布。
