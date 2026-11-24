-- =========================================================================
-- FIX LIMIT XP & KOIN SUPABASE PIRAKU BANDUNG
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> Klik RUN
-- =========================================================================

-- 1. Naikkan batas XP warga dari 200.000 menjadi 50.000.000 (50 Juta XP)
ALTER TABLE public.warga_piraku DROP CONSTRAINT IF EXISTS chk_warga_piraku_xp_range;
ALTER TABLE public.warga_piraku ADD CONSTRAINT chk_warga_piraku_xp_range CHECK (xp >= 0 AND xp <= 50000000);

-- 2. Naikkan batas Koin wallet dari 200.000 menjadi 50.000.000 (50 Juta Koin)
ALTER TABLE public.piraku_wallets DROP CONSTRAINT IF EXISTS chk_piraku_wallet_coins_range;
ALTER TABLE public.piraku_wallets ADD CONSTRAINT chk_piraku_wallet_coins_range CHECK (coins >= 0 AND coins <= 50000000);
