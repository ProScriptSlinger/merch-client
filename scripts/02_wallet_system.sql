-- =============================================
-- SISTEMA DE BILLETERA VIRTUAL
-- =============================================

-- Tabla de billeteras de usuario
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency VARCHAR(3) DEFAULT 'ARS',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabla de transacciones de billetera
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'purchase', 'refund')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    
    -- Información del depósito
    deposit_method VARCHAR(20) CHECK (deposit_method IN ('mercadopago', 'cash', 'transfer')),
    payment_provider_id VARCHAR(255),
    
    -- Referencias
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Metadata
    description TEXT,
    metadata JSONB,
    
    -- Staff info (para depósitos en efectivo)
    processed_by VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para crear billetera automáticamente
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_wallets (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear billetera cuando se crea un perfil
CREATE TRIGGER create_wallet_on_profile_creation
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet();

-- Función para agregar saldo
CREATE OR REPLACE FUNCTION add_wallet_balance(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_deposit_method VARCHAR(20),
    p_description TEXT DEFAULT NULL,
    p_payment_provider_id VARCHAR(255) DEFAULT NULL,
    p_processed_by VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Obtener billetera y saldo actual
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM user_wallets 
    WHERE user_id = p_user_id AND is_active = true;
    
    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Billetera no encontrada para el usuario %', p_user_id;
    END IF;
    
    v_new_balance := v_current_balance + p_amount;
    
    -- Actualizar saldo
    UPDATE user_wallets 
    SET balance = v_new_balance, updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Registrar transacción
    INSERT INTO wallet_transactions (
        wallet_id, user_id, transaction_type, amount, 
        balance_before, balance_after, deposit_method,
        payment_provider_id, description, processed_by
    )
    VALUES (
        v_wallet_id, p_user_id, 'deposit', p_amount,
        v_current_balance, v_new_balance, p_deposit_method,
        p_payment_provider_id, p_description, p_processed_by
    )
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Función para usar saldo en compra
CREATE OR REPLACE FUNCTION use_wallet_balance(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_order_id UUID,
    p_description TEXT DEFAULT 'Compra de productos'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
BEGIN
    -- Obtener billetera y saldo actual
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM user_wallets 
    WHERE user_id = p_user_id AND is_active = true;
    
    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Billetera no encontrada para el usuario %', p_user_id;
    END IF;
    
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente. Saldo actual: %, Monto requerido: %', v_current_balance, p_amount;
    END IF;
    
    v_new_balance := v_current_balance - p_amount;
    
    -- Actualizar saldo
    UPDATE user_wallets 
    SET balance = v_new_balance, updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Registrar transacción
    INSERT INTO wallet_transactions (
        wallet_id, user_id, transaction_type, amount, 
        balance_before, balance_after, order_id, description
    )
    VALUES (
        v_wallet_id, p_user_id, 'purchase', p_amount,
        v_current_balance, v_new_balance, p_order_id, p_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);
