# Google Sheets 預約分流

Google Drive 連線只供本次建立試算表，並未授予網站持續寫入權限。
網站透過獨立 Google Apps Script Web App 的接收入口寫入；一次 Google 授權及部署由試算表持有人完成。

管理者登入 `/admin/sheets`，依頁面步驟複製接收程式碼、產生 256 位元金鑰，將其設為 Apps Script 的指令碼屬性 `DUA_TOKEN`。執行 `authorizeSheets` 完成授權，部署為「以自己身分執行／所有人可存取」。部署網址與金鑰填入同一個後台頁面。金鑰存於伺服器 settings 的 `integration:sheets` 記錄，不提供匿名端點或 GET 回傳，不記錄於錯誤訊息。

預設目的地：
- 公司總表：`1ZQYgbmrqUSYPbvK24DuD4MHRotpu82Kb08Ls6OKDsNI`
- 星峠專用表：`1gTzmRvTaEN-E1_oNiNpyzhSrRgM9FIRgQ9J_XD5bg20`
- 分頁：`預約名單`，標題列為預約編號、填寫時間、建案名稱、姓名、聯絡電話、希望賞屋日期、希望時段、備註。

公司及星峠在後台未指定表格網址時使用上述預設；填入其他網址時採用後台指定網址。Google 端 ALLOWED 清單也需加入其 ID 並更新部署。不得以總表替代其他建案的專用表。

提交先 INSERT OR IGNORE 保存預約，再取得 60 秒租約寫入 Google。兩份表均回報相同預約編號及成功才標為 sent。失敗仍保留於資料庫。Google 以 ScriptLock 與預約編號比對防止重複；總表成功但專用表失敗時，補送不會再次新增總表。日期使用實際 Date，時間區域為 Asia/Taipei；電話作為文字。可能的公式文字會轉為純文字。

已提供每次最多 5 筆的人工補送。尚無定時自動補送排程，不能宣稱自動重試。Google 逾時可能已寫入，但再次補送會由 Google 端防重複。沒有銷售跟進進度回傳，也沒有寄送通知信。

測試入口只驗證 token 及 Google Web App 是否可連線，並不代表表格寫入成功。正式接通前，需從星峠頁送出虛構預約，核對兩份表的預約編號、電話及台灣時間；再次送出同一編號不應增加筆數。未完成 Google 部署時，網站只保存名單，不會寫入試算表。

驗證：`node tests/sheet-delivery.mjs` 包含實際接收程式的 mock Google 測試及 SQLite 的租約、pending／sent、重送檢查；不等於 Google 帳號的端到端驗證。
