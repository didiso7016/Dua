-- 首頁設定範例（settings 表 key='home'；格式見 lib/model.ts HomeSettings、驗證見 lib/home-schema.ts）。
-- 第 2 批：示範首頁「精選與廣告」版位（1 個橫幅＋2 個方形）。
--   * 橫幅：編輯精選（角落顯示「精選」），連到華邑代代木5-星峠；標題同時出現在首頁上方「最新消息」列。
--   * 方形 1：廣告／贊助（角落顯示「廣告」），連到 /partner。
--   * 方形 2：刻意留空 → 前台顯示「廣告版位招募中」佔位。
-- 圖片使用 repo 內的 /assets/demo/*.jpg。預算級距與 lib/discovery.ts defaultHome 相同；「大家都在看」預設關閉。
-- INSERT OR REPLACE，可重複執行；注意：會覆蓋本機後台「首頁管理」已存的設定（只影響 --local）。
-- 要清除（回到程式預設）：DELETE FROM settings WHERE key = 'home';

INSERT OR REPLACE INTO settings (key,value) VALUES ('home','{"popularEnabled":false,"budgetRanges":[{"id":"under-1000","label":"1,000 萬以下","min":0,"max":1000},{"id":"1000-1500","label":"1,000–1,500 萬","min":1000,"max":1500},{"id":"1500-2000","label":"1,500–2,000 萬","min":1500,"max":2000},{"id":"2000-3000","label":"2,000–3,000 萬","min":2000,"max":3000},{"id":"over-3000","label":"3,000 萬以上","min":3000,"max":null}],"banners":[{"id":"seed-featured-huayi","title":"華邑代代木5-星峠｜青埔近境水岸 2 房","description":"編輯精選示範橫幅","image":"/assets/demo/huayi-exterior.jpg","url":"/projects/huayi-yoyogi-5","kind":"editorial","visible":true,"startDate":"","endDate":"","slot":"wide"},{"id":"seed-ad-partner","title":"建商刊登合作｜讓更多買家看見你的建案","description":"廣告示範方形版位","image":"/assets/demo/land-art.jpg","url":"/partner","kind":"ad","visible":true,"startDate":"","endDate":"","slot":"square"}]}');
