# DUA+ 管理者帳密

前台內容不需要應用程式登入；後台頁面、管理 API、草稿圖片需要有效的管理者工作階段。
目前 Sites 線上測試站為公開瀏覽，管理後台另以應用程式帳密保護。部署至其他帳戶需自行確認外層存取規則。

## 設定

執行環境需要 DUA_AUTH_PEPPER、DUA_INITIAL_PASSWORD_HASH（均為秘密）、DUA_ADMIN_USERNAME、DUA_RESET_EMAIL。密碼雜湊使用 lib/password.ts 的 hashPassword，密碼先以秘密 HMAC 處理，再以獨立鹽值和 PBKDF2-SHA256 100,000 次處理。原始密碼不寫入程式碼或資料庫。
首次讀取帳號時，以設定初始化 settings 表 auth:account；之後變更密碼只更新持久資料，不會被初始值覆蓋。備份需要保留資料庫與 DUA_AUTH_PEPPER。
目前唯一的管理者角色，不開放自行註冊。

工作階段：隨機 256-bit 代碼，資料庫僅保留 SHA-256 雜湊；Cookie 為 HttpOnly、SameSite=Strict，HTTPS 加 Secure。有效期 8 小時；密碼變更或重設會使所有舊工作階段失效；登出會刪除目前工作階段。

## 寄信服務

忘記密碼需設定 DUA_MAIL_API_KEY（秘密，Resend）、DUA_MAIL_FROM（已驗證寄件地址）、DUA_SITE_ORIGIN（正式 HTTPS 網址）。未設定時明確回傳服務未啟用，沒有寄信。
重設代碼不記錄在伺服器日誌，不以回應送回；只傳至管理者信箱。30 分鐘有效、單次使用、新申請取代舊連結。連結將代碼放在片段中，頁面讀取後即移除網址片段，後續以 POST 送交驗證。

## 驗證與限制

node tests/account-auth.mjs 使用 SQLite 驗證實際路由邏輯與持久化，但模擬 Worker bindings 及 framework cookies。
node tests/geo-admin.mjs 驗證 GEO 格式。
登入失敗、CSRF、不符工作階段、過期、密碼變更、重設重複使用、登出、次數限制均有測試。寄信尚未實際設定及端到端驗證。

測試用初始密碼由使用者指定；正式公開前更換為至少 12 字元的新密碼。正式頁面不自動填入密碼。
