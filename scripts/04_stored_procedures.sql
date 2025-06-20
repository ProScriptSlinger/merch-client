-- =============================================
-- PROCEDIMIENTOS ALMACENADOS
-- =============================================

-- Procedimiento para crear un pedido completo
CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_event_id UUID,
    p_pickup_location_id UUID,
    p_cart_items JSONB -- [{"product_id": "uuid", "size_id": "uuid", "quantity": 2}]
)
RETURNS TABLE(
    order_id UUID,
    order_number TEXT,
    total_amount DECIMAL,
    qr_code TEXT
) AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal DECIMAL := 0;
    v_total_amount DECIMAL := 0;
    v_qr_code TEXT;
    cart_item JSONB;
    product_price DECIMAL;
    item_total DECIMAL;
BEGIN
    -- Generar número de pedido
    v_order_number := generate_order_number('EVT');
    
    -- Crear el pedido
    INSERT INTO orders (order_number, user_id, event_id, pickup_location_id, subtotal, total_amount)
    VALUES (v_order_number, p_user_id, p_event_id, p_pickup_location_id, 0, 0)
    RETURNING id INTO v_order_id;
    
    -- Procesar cada item del carrito
    FOR cart_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        -- Verificar stock disponible
        IF NOT check_stock_availability(
            (cart_item->>'product_id')::UUID,
            (cart_item->>'size_id')::UUID,
            (cart_item->>'quantity')::INTEGER
        ) THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %', cart_item->>'product_id';
        END IF;
        
        -- Obtener precio del producto
        SELECT COALESCE(i.price_override, p.base_price)
        INTO product_price
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id AND i.size_id = (cart_item->>'size_id')::UUID
        WHERE p.id = (cart_item->>'product_id')::UUID;
        
        IF product_price IS NULL THEN
            RAISE EXCEPTION 'Producto no encontrado: %', cart_item->>'product_id';
        END IF;
        
        item_total := product_price * (cart_item->>'quantity')::INTEGER;
        v_subtotal := v_subtotal + item_total;
        
        -- Insertar item del pedido
        INSERT INTO order_items (
            order_id, product_id, size_id, product_name, size_name,
            quantity, unit_price, total_price
        )
        SELECT 
            v_order_id,
            (cart_item->>'product_id')::UUID,
            (cart_item->>'size_id')::UUID,
            p.name,
            s.name,
            (cart_item->>'quantity')::INTEGER,
            product_price,
            item_total
        FROM products p, sizes s
        WHERE p.id = (cart_item->>'product_id')::UUID
        AND s.id = (cart_item->>'size_id')::UUID;
        
        -- Reservar stock
        UPDATE inventory 
        SET reserved_quantity = reserved_quantity + (cart_item->>'quantity')::INTEGER
        WHERE product_id = (cart_item->>'product_id')::UUID
        AND size_id = (cart_item->>'size_id')::UUID;
    END LOOP;
    
    -- Calcular total (por ahora sin impuestos)
    v_total_amount := v_subtotal;
    
    -- Actualizar totales del pedido
    UPDATE orders 
    SET subtotal = v_subtotal, total_amount = v_total_amount
    WHERE id = v_order_id;
    
    -- Generar QR code
    v_qr_code := 'QR-' || v_order_number || '-' || substring(md5(random()::text) from 1 for 8);
    
    INSERT INTO pickup_qr_codes (order_id, qr_code, qr_data)
    VALUES (
        v_order_id,
        v_qr_code,
        jsonb_build_object(
            'order_id', v_order_id,
            'order_number', v_order_number,
            'pickup_location_id', p_pickup_location_id,
            'total_amount', v_total_amount,
            'created_at', NOW()
        )
    );
    
    -- Log de actividad
    INSERT INTO activity_logs (user_id, order_id, event_id, action, description)
    VALUES (p_user_id, v_order_id, p_event_id, 'order_created', 'Pedido creado exitosamente');
    
    -- Retornar información del pedido
    RETURN QUERY SELECT v_order_id, v_order_number, v_total_amount, v_qr_code;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para procesar pago
CREATE OR REPLACE FUNCTION process_payment(
    p_order_id UUID,
    p_payment_method VARCHAR(50),
    p_payment_provider_id VARCHAR(255),
    p_amount DECIMAL,
    p_provider_response JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_order_total DECIMAL;
BEGIN
    -- Verificar que el monto coincida con el total del pedido
    SELECT total_amount INTO v_order_total
    FROM orders WHERE id = p_order_id;
    
    IF v_order_total IS NULL THEN
        RAISE EXCEPTION 'Pedido no encontrado: %', p_order_id;
    END IF;
    
    IF v_order_total != p_amount THEN
        RAISE EXCEPTION 'El monto del pago no coincide con el total del pedido';
    END IF;
    
    -- Insertar registro de pago
    INSERT INTO payments (
        order_id, payment_method, payment_provider_id, 
        amount, status, provider_response, processed_at
    )
    VALUES (
        p_order_id, p_payment_method, p_payment_provider_id,
        p_amount, 'completed', p_provider_response, NOW()
    );
    
    -- Actualizar estado del pedido
    UPDATE orders 
    SET status = 'paid', payment_status = 'paid', paid_at = NOW()
    WHERE id = p_order_id;
    
    -- Convertir stock reservado en stock vendido
    UPDATE inventory 
    SET 
        stock_quantity = stock_quantity - oi.quantity,
        reserved_quantity = reserved_quantity - oi.quantity
    FROM order_items oi
    WHERE inventory.product_id = oi.product_id
    AND inventory.size_id = oi.size_id
    AND oi.order_id = p_order_id;
    
    -- Log de actividad
    INSERT INTO activity_logs (order_id, action, description, metadata)
    VALUES (
        p_order_id, 
        'payment_completed', 
        'Pago procesado exitosamente',
        jsonb_build_object('payment_method', p_payment_method, 'amount', p_amount)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para marcar pedido como listo para retiro
CREATE OR REPLACE FUNCTION mark_order_ready(p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE orders 
    SET status = 'ready', ready_at = NOW()
    WHERE id = p_order_id AND status = 'paid';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo marcar el pedido como listo. Verificar estado actual.';
    END IF;
    
    INSERT INTO activity_logs (order_id, action, description)
    VALUES (p_order_id, 'order_ready', 'Pedido marcado como listo para retiro');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para procesar retiro con QR
CREATE OR REPLACE FUNCTION process_pickup_with_qr(
    p_qr_code VARCHAR(255),
    p_staff_member VARCHAR(255)
)
RETURNS TABLE(
    success BOOLEAN,
    order_number TEXT,
    message TEXT
) AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_order_status TEXT;
BEGIN
    -- Buscar el pedido por QR code
    SELECT qr.order_id, o.order_number, o.status
    INTO v_order_id, v_order_number, v_order_status
    FROM pickup_qr_codes qr
    JOIN orders o ON qr.order_id = o.id
    WHERE qr.qr_code = p_qr_code AND qr.is_used = false;
    
    IF v_order_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'QR code inválido o ya utilizado';
        RETURN;
    END IF;
    
    IF v_order_status NOT IN ('paid', 'ready') THEN
        RETURN QUERY SELECT false, v_order_number, 'El pedido no está listo para retiro';
        RETURN;
    END IF;
    
    -- Marcar QR como usado
    UPDATE pickup_qr_codes 
    SET is_used = true, used_at = NOW(), used_by = p_staff_member
    WHERE qr_code = p_qr_code;
    
    -- Marcar pedido como completado
    UPDATE orders 
    SET status = 'completed', completed_at = NOW()
    WHERE id = v_order_id;
    
    -- Log de actividad
    INSERT INTO activity_logs (order_id, action, description, metadata)
    VALUES (
        v_order_id, 
        'order_completed', 
        'Pedido retirado exitosamente',
        jsonb_build_object('staff_member', p_staff_member, 'qr_code', p_qr_code)
    );
    
    RETURN QUERY SELECT true, v_order_number, 'Pedido retirado exitosamente';
END;
$$ LANGUAGE plpgsql;
