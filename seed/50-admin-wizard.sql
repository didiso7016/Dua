-- 第 4 批：後台「建案精靈」示範草稿（虛構資料，status=draft，前台不顯示）。
-- 固定 id demo-wizard-draft，INSERT OR REPLACE 可重複執行；只動這一筆，不影響 5 個既有建案。
-- 內容只填到第 1 步（基本資料）＋1 張封面照，用來示範在 /admin「建案管理」→「編輯建案」接續精靈的第 2～6 步。
-- 注意：重新執行會把這筆還原成草稿內容（若你已在本機後台改過或刊登它）。
-- 要清除：DELETE FROM projects WHERE id = 'demo-wizard-draft';

INSERT OR REPLACE INTO projects (id,data,status,updated_at) VALUES ('demo-wizard-draft','{"id":"demo-wizard-draft","name":"範例草稿・青田小日子（精靈示範）","builder":"晴川建設（虛構）","city":"臺北市","district":"大安區","rooms":"2–3房","area":"","stage":"預售屋","type":"大樓","sales":"即將公開","slogan":"","feature":"","description":"後台建案精靈的示範草稿：已完成第 1 步基本資料與 1 張封面照，其餘步驟留空，可從「建案管理」點「編輯建案」接續填寫。","source":"","verifiedOn":"","seoTitle":"","seoDescription":"","mapEmbed":"","photos":[{"url":"/assets/demo/land-art.jpg","caption":"基地周邊示意（範例）"}],"plans":[],"surroundings":[],"address":"","reception":"","map":"","hours":"09:00–18:00","faq":[],"lifestyles":[],"contentBlocks":[],"facebook":"","advantages":[],"sections":[{"key":"basic","visible":true},{"key":"plan","visible":true},{"key":"surrounding","visible":true},{"key":"location","visible":true},{"key":"faq","visible":false},{"key":"appointment","visible":true}],"status":"draft","sheet":"","email":"","contact":"","phone":"","receptionMap":"","updatedAt":""}','draft','2026-11-03T08:00:00.000Z');
