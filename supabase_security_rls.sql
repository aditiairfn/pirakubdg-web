-- CARA JALANKAN DI SUPABASE SQL EDITOR:
-- Karena SQL Editor Supabase memotong tanda ";" jika banyak fungsi dijalankan bersamaan,
-- jalankan 1 per 1 (blok/select masing-masing bagian lalu klik Run), ATAU jalankan Bagian 1 saja sudah cukup menahan inject angka jutaan!

-- === BAGIAN 1: Batas Keras Database (Langsung blok & Run) ===
ALTER TABLE public.piraku_wallets DROP CONSTRAINT IF EXISTS chk_piraku_wallet_coins_range;
ALTER TABLE public.piraku_wallets ADD CONSTRAINT chk_piraku_wallet_coins_range CHECK (coins >= 0 AND coins <= 200000);

ALTER TABLE public.warga_piraku DROP CONSTRAINT IF EXISTS chk_warga_piraku_xp_range;
ALTER TABLE public.warga_piraku ADD CONSTRAINT chk_warga_piraku_xp_range CHECK (xp >= 0 AND xp <= 200000);
