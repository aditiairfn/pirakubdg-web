-- =========================================================================
-- FIX LIMIT XP & KOIN SUPABASE PIRAKU BANDUNG
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> Klik RUN
-- =========================================================================

-- 1. Hapus batas maksimal XP warga (cukup pastikan tidak minus)
ALTER TABLE public.warga_piraku DROP CONSTRAINT IF EXISTS chk_warga_piraku_xp_range;
ALTER TABLE public.warga_piraku ADD CONSTRAINT chk_warga_piraku_xp_range CHECK (xp >= 0);

-- 2. Hapus batas maksimal Koin wallet (cukup pastikan tidak minus)
ALTER TABLE public.piraku_wallets DROP CONSTRAINT IF EXISTS chk_piraku_wallet_coins_range;
ALTER TABLE public.piraku_wallets ADD CONSTRAINT chk_piraku_wallet_coins_range CHECK (coins >= 0);
