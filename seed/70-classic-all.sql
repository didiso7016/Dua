-- 第 6 批：5 個建案全部改用「經典」模板（經典模板改版：滿版首圖、色帶章節、捲動進場）。
-- 只用 json_set 改 template 一個欄位，不動其他內容；可重複執行，也可安全對正式 D1 執行。
-- 建案不存在時不會新增資料。要恢復第 3 批的混搭示範：重跑 seed/40-project-templates.sql。
UPDATE projects SET data = json_set(data,'$.template','classic')
 WHERE id IN ('huayi-yoyogi-5','demo-taipei-qingtian','demo-newtaipei-yuesen','demo-taichung-hikari','demo-kaohsiung-hele');
