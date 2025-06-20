-- =============================================
-- ELIMINAR SISTEMA DE BILLETERA
-- =============================================

-- Eliminar tablas relacionadas con el wallet
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;

-- Eliminar funciones relacionadas con el wallet
DROP FUNCTION IF EXISTS create_user_wallet() CASCADE;
DROP FUNCTION IF EXISTS add_wallet_balance(UUID, DECIMAL, VARCHAR, TEXT, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS use_wallet_balance(UUID, DECIMAL, UUID, TEXT) CASCADE;

-- Eliminar trigger relacionado
DROP TRIGGER IF EXISTS create_wallet_on_profile_creation ON user_profiles;

-- Comentario de confirmación
COMMENT ON SCHEMA public IS 'Sistema de wallet eliminado - solo pagos directos disponibles';
