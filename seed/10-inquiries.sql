-- 洽詢名單範例（inquiries 表，drizzle/0001_inquiries.sql）。全部為虛構資料：姓名加註（範例），電話 0900-000-0xx，Email 用 example.com。
-- INSERT OR REPLACE ＋ 固定 id（5eed0000-…），可重複執行，不影響真實洽詢。
-- sheet_status 混合 sent／pending（含多次失敗）以便測試後台「已寫入／待補送」顯示。
-- 注意：若本機後台已設定 Google Sheets 串接，按「補送未完成名單」會把 pending 範例寫進真的試算表。
-- 要清除：DELETE FROM inquiries WHERE id LIKE '5eed0000-%';

INSERT OR REPLACE INTO inquiries (id,type,name,phone,email,company,message,source_page,consent_version,created_at,sheet_status,sheet_attempts,sheet_lease,sheet_attempt_at) VALUES
('5eed0000-0000-4000-8000-000000000101','general','王小明（範例）','0900-000-001','demo.wang@example.com','','想了解桃園青埔一帶 2 房、總價 1,500 萬以內的預售案，週末方便看屋。','/contact','privacy-2026-11','2026-10-27T02:15:00.000Z','sent',1,0,'2026-10-27T02:15:03.000Z'),
('5eed0000-0000-4000-8000-000000000102','partner','林雅婷（範例）','0900-000-002','demo.lin@example.com','晴川建設（虛構）','我們有一個文山區新案預計明年第一季公開，想詢問刊登方案與費用。','/partner','privacy-2026-11','2026-10-28T06:40:00.000Z','sent',1,0,'2026-10-28T06:40:02.000Z'),
('5eed0000-0000-4000-8000-000000000103','general','陳志豪（範例）','0900-000-003','','','請問網站上的價格是否含車位？想比較板橋和中壢的案子。','/projects/demo-newtaipei-yuesen','privacy-2026-11','2026-10-29T11:05:00.000Z','pending',0,0,NULL),
('5eed0000-0000-4000-8000-000000000104','partner','張家瑜（範例）','0900-000-004','demo.chang@example.com','光丘代銷（虛構）','代銷公司，手上有三個台中案，想了解是否能用同一個帳號管理多案。','/partner','privacy-2026-11','2026-10-30T03:30:00.000Z','pending',3,0,'2026-10-31T01:00:00.000Z'),
('5eed0000-0000-4000-8000-000000000105','general','黃美玲（範例）','0900-000-005','demo.huang@example.com','','家裡三代同堂，想找高雄 4 房以上透天，預算 2,500 萬左右。','/','privacy-2026-11','2026-10-31T08:20:00.000Z','sent',2,0,'2026-10-31T08:25:10.000Z'),
('5eed0000-0000-4000-8000-000000000106','general','吳承恩（範例）','0900-000-006','','','網站上看到星峠，想問接待中心平日幾點開到幾點？','/projects/huayi-yoyogi-5','privacy-2026-11','2026-11-01T05:45:00.000Z','pending',1,0,'2026-11-01T05:45:04.000Z'),
('5eed0000-0000-4000-8000-000000000107','partner','劉冠廷（範例）','0900-000-007','demo.liu@example.com','和樂營造（虛構）','想刊登鳳山透天案，請提供刊登流程與需要準備的資料。','/contact','privacy-2026-11','2026-11-02T01:10:00.000Z','sent',1,0,'2026-11-02T01:10:02.000Z'),
('5eed0000-0000-4000-8000-000000000108','general','蔡佩君（範例）','0900-000-008','demo.tsai@example.com','','第一次買房，想請顧問協助說明預售屋付款流程。','/contact','privacy-2026-11','2026-11-03T07:55:00.000Z','pending',0,0,NULL);
