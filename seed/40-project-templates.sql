-- 第 3 批：建案詳細頁模板示範（template 欄位存在 projects.data JSON 內，見 lib/project-templates.ts）。
-- 只用 json_set 改 template 一個欄位，不動其他建案內容；可重複執行（結果相同）。
--   classic 經典：huayi-yoyogi-5（華邑代代木5-星峠，真實建案，維持經典）
--   gallery 圖像：demo-taipei-qingtian、demo-taichung-hikari
--   compact 簡約：demo-newtaipei-yuesen、demo-kaohsiung-hele
-- 要恢復預設（經典）：UPDATE projects SET data = json_remove(data,'$.template');
-- 建案不存在時（尚未載入 00-projects.sql）不會新增任何資料。

UPDATE projects SET data = json_set(data,'$.template','classic') WHERE id = 'huayi-yoyogi-5';
UPDATE projects SET data = json_set(data,'$.template','gallery') WHERE id = 'demo-taipei-qingtian';
UPDATE projects SET data = json_set(data,'$.template','compact') WHERE id = 'demo-newtaipei-yuesen';
UPDATE projects SET data = json_set(data,'$.template','gallery') WHERE id = 'demo-taichung-hikari';
UPDATE projects SET data = json_set(data,'$.template','compact') WHERE id = 'demo-kaohsiung-hele';
