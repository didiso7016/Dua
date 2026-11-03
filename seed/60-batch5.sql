-- 第 5 批：格局說明、自訂章節、長名稱地圖標籤的示範資料（只動示範建案，不動 huayi-yoyogi-5 的真實內容）。
-- 可重複執行：只用 json_set 改指定欄位，其它內容不受影響。
-- 長名稱：七期光之丘（示範）、鳳山和樂透天（示範）已在 00-projects.sql，地圖標籤會自動縮字／換行。
-- 格局說明：只填 D2（光之丘）與 C1（悅森居），其餘戶別留空，用來確認空白時版面收合、不留空隙。

UPDATE projects SET data = json_set(data,'$.plans[0].description','D2 戶為邊間三房，客廳與主臥皆有雙面採光。廚房採一字型設計，可依需求改為開放式中島（示範文字）。')
 WHERE id = 'demo-taichung-hikari' AND json_extract(data,'$.plans[0].name') = 'D2';

UPDATE projects SET data = json_set(data,'$.plans[0].description','C1 戶為兩房一廳，衛浴開窗通風；次臥可作書房或兒童房（示範文字）。')
 WHERE id = 'demo-newtaipei-yuesen' AND json_extract(data,'$.plans[0].name') = 'C1';

-- 自訂章節：光之丘（gallery 模板）2 個（基本資料之後有圖、位置之後純文字＋1 個隱藏）；悅森居（compact 模板）1 個（格局之後有圖）。
UPDATE projects SET data = json_set(data,'$.customSections',json('[
 {"id":"b5-hikari-materials","after":"basic","visible":true,"title":"建材與設備","text":"外牆採用二丁掛磁磚搭配石材腰帶，室內配置知名品牌廚具與衛浴設備。\n實際建材以買賣契約附表為準（示範文字）。","image":"/assets/demo/land-art.jpg","caption":"建材示意（範例）"},
 {"id":"b5-hikari-builder","after":"location","visible":true,"title":"建商理念","text":"從生活動線出發規劃每一戶，讓採光、通風與收納都恰到好處（示範文字）。","image":"","caption":""},
 {"id":"b5-hikari-hidden","after":"plan","visible":false,"title":"隱藏章節（不應顯示）","text":"這個章節設為隱藏，前台不會出現。","image":"","caption":""}
]')) WHERE id = 'demo-taichung-hikari';

UPDATE projects SET data = json_set(data,'$.customSections',json('[
 {"id":"b5-yuesen-park","after":"plan","visible":true,"title":"社區公設","text":"一樓規劃迎賓大廳與信箱區，頂樓為空中花園，可眺望板橋市景（示範文字）。","image":"/assets/demo/paperbark-trail.jpg","caption":"公設示意（範例）"}
]')) WHERE id = 'demo-newtaipei-yuesen';
