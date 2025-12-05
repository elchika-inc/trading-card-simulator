-- R2にある画像ファイル名でD1のカードデータを更新
-- Run: cd apps/backend && bunx wrangler d1 execute trading-cards --local --file=../../scripts/fix-card-images.sql

-- R2にある画像ファイル:
-- 1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png
-- 1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png
-- 1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png
-- 2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png
-- 2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png
-- 2-1-3_unnamed.jpg
-- 3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png
-- 3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png
-- 3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png
-- 4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png
-- 4-1-2_Gemini_Generated_Image_eh2apbeh2apbeh2a.png
-- 5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png
-- 5-1-2_Gemini_Generated_Image_qtornhqtornhqtor.png

-- Step 1: R2にある画像をassetsテーブルに追加
INSERT OR REPLACE INTO assets (id, type, original_name, content_type, size, r2_key, has_webp, is_active)
VALUES
  ('1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'card', '1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'image/png', 962678, 'images/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 1, 0),
  ('1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'card', '1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'image/png', 5224333, 'images/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 1, 0),
  ('1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'card', '1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'image/png', 1000000, 'images/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 1, 0),
  ('2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png', 'card', '2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png', 'image/png', 1000000, 'images/2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png', 1, 0),
  ('2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png', 'card', '2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png', 'image/png', 1000000, 'images/2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png', 1, 0),
  ('2-1-3_unnamed.jpg', 'card', '2-1-3_unnamed.jpg', 'image/jpeg', 1000000, 'images/2-1-3_unnamed.jpg', 1, 0),
  ('3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png', 'card', '3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png', 'image/png', 1000000, 'images/3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png', 1, 0),
  ('3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png', 'card', '3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png', 'image/png', 1000000, 'images/3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png', 1, 0),
  ('3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png', 'card', '3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png', 'image/png', 1000000, 'images/3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png', 1, 0),
  ('4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png', 'card', '4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png', 'image/png', 1000000, 'images/4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png', 1, 0),
  ('4-1-2_Gemini_Generated_Image_eh2apbeh2apbeh2a.png', 'card', '4-1-2_Gemini_Generated_Image_eh2apbeh2apbeh2a.png', 'image/png', 1000000, 'images/4-1-2_Gemini_Generated_Image_eh2apbeh2apbeh2a.png', 1, 0),
  ('5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png', 'card', '5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png', 'image/png', 1000000, 'images/5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png', 1, 0),
  ('5-1-2_Gemini_Generated_Image_qtornhqtornhqtor.png', 'card', '5-1-2_Gemini_Generated_Image_qtornhqtornhqtor.png', 'image/png', 1000000, 'images/5-1-2_Gemini_Generated_Image_qtornhqtornhqtor.png', 1, 0);

-- Step 2: 13枚の画像を25枚のカードに割り当て（モジュロで循環）
UPDATE cards SET asset_id = '1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png' WHERE id = 1;
UPDATE cards SET asset_id = '1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png' WHERE id = 2;
UPDATE cards SET asset_id = '1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png' WHERE id = 3;
UPDATE cards SET asset_id = '2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png' WHERE id = 4;
UPDATE cards SET asset_id = '2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png' WHERE id = 5;
UPDATE cards SET asset_id = '2-1-3_unnamed.jpg' WHERE id = 6;
UPDATE cards SET asset_id = '3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png' WHERE id = 7;
UPDATE cards SET asset_id = '3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png' WHERE id = 8;
UPDATE cards SET asset_id = '3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png' WHERE id = 9;
UPDATE cards SET asset_id = '4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png' WHERE id = 10;
UPDATE cards SET asset_id = '4-1-2_Gemini_Generated_Image_eh2apbeh2apbeh2a.png' WHERE id = 11;
UPDATE cards SET asset_id = '5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png' WHERE id = 12;
UPDATE cards SET asset_id = '5-1-2_Gemini_Generated_Image_qtornhqtornhqtor.png' WHERE id = 13;

-- 14枚目以降はモジュロで循環
UPDATE cards SET asset_id = '1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png' WHERE id = 14;
UPDATE cards SET asset_id = '1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png' WHERE id = 15;
UPDATE cards SET asset_id = '1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png' WHERE id = 16;
UPDATE cards SET asset_id = '2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png' WHERE id = 17;
UPDATE cards SET asset_id = '2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png' WHERE id = 18;
UPDATE cards SET asset_id = '2-1-3_unnamed.jpg' WHERE id = 19;
UPDATE cards SET asset_id = '3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png' WHERE id = 20;
UPDATE cards SET asset_id = '3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png' WHERE id = 21;
UPDATE cards SET asset_id = '3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png' WHERE id = 22;
UPDATE cards SET asset_id = '4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png' WHERE id = 23;
UPDATE cards SET asset_id = '4-1-2_Gemini_Generated_Image_eh2apbeh2apbeh2a.png' WHERE id = 24;
UPDATE cards SET asset_id = '5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png' WHERE id = 25;
