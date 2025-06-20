-- =============================================
-- VISTAS ÚTILES PARA LA APLICACIÓN
-- =============================================

-- Vista de productos con información completa
CREATE VIEW v_products_full AS
SELECT 
    p.id,
    p.event_id,
    p.name,
    p.description,
    p.base_price,
    p.image_url,
    p.is_active,
    p.has_sizes,
    p.display_order,
    c.name as category_name,
    e.name as event_name,
    e.status as event_status,
    -- Stock total disponible
    COALESCE(SUM(i.stock_quantity - i.reserved_quantity), 0) as total_available_stock,
    -- Información de talles disponibles
    COALESCE(
        json_agg(
            json_build_object(
                'size_id', s.id,
                'size_name', s.name,
                'available_stock', (i.stock_quantity - i.reserved_quantity),
                'price', COALESCE(i.price_override, p.base_price)
            ) ORDER BY s.display_order
        ) FILTER (WHERE i.is_available = true AND (i.stock_quantity - i.reserved_quantity) > 0),
        '[]'::json
    ) as available_sizes
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN events e ON p.event_id = e.id
LEFT JOIN inventory i ON p.id = i.product_id AND i.is_available = true
LEFT JOIN sizes s ON i.size_id = s.id
WHERE p.is_active = true
GROUP BY p.id, p.event_id, p.name, p.description, p.base_price, p.image_url, 
         p.is_active, p.has_sizes, p.display_order, c.name, e.name, e.status;

-- Vista de pedidos con información completa
CREATE VIEW v_orders_full AS
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.event_id,
    o.pickup_location_id,
    o.subtotal,
    o.tax_amount,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    o.paid_at,
    o.ready_at,
    o.completed_at,
    -- Información del usuario
    u.email as user_email,
    u.first_name,
    u.last_name,
    -- Información del evento
    e.name as event_name,
    -- Información del punto de retiro
    pl.name as pickup_location_name,
    pl.address as pickup_location_address,
    -- Información del QR
    qr.qr_code,
    qr.is_used as qr_is_used,
    qr.used_at as qr_used_at,
    -- Items del pedido
    json_agg(
        json_build_object(
            'product_name', oi.product_name,
            'size_name', oi.size_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price
        ) ORDER BY oi.created_at
    ) as order_items
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN events e ON o.event_id = e.id
LEFT JOIN pickup_locations pl ON o.pickup_location_id = pl.id
LEFT JOIN pickup_qr_codes qr ON o.id = qr.order_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.user_id, o.event_id, o.pickup_location_id,
         o.subtotal, o.tax_amount, o.total_amount, o.status, o.payment_status,
         o.created_at, o.paid_at, o.ready_at, o.completed_at,
         u.email, u.first_name, u.last_name, e.name,
         pl.name, pl.address, qr.qr_code, qr.is_used, qr.used_at;

-- Vista de estadísticas de ventas por producto
CREATE VIEW v_product_sales_stats AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.event_id,
    e.name as event_name,
    c.name as category_name,
    -- Estadísticas de ventas
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    COALESCE(AVG(oi.unit_price), 0) as average_unit_price,
    -- Stock actual
    COALESCE(SUM(i.stock_quantity), 0) as total_stock,
    COALESCE(SUM(i.stock_quantity - i.reserved_quantity), 0) as available_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN events e ON p.event_id = e.id
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'ready', 'completed')
GROUP BY p.id, p.name, p.event_id, e.name, c.name;

-- Vista de carritos activos con items
CREATE VIEW v_active_carts AS
SELECT 
    sc.id as cart_id,
    sc.user_id,
    sc.session_id,
    sc.event_id,
    sc.expires_at,
    sc.created_at,
    -- Información del usuario (si existe)
    u.email as user_email,
    -- Información del evento
    e.name as event_name,
    -- Items del carrito
    json_agg(
        json_build_object(
            'product_id', ci.product_id,
            'product_name', p.name,
            'size_id', ci.size_id,
            'size_name', s.name,
            'quantity', ci.quantity,
            'unit_price', ci.unit_price,
            'total_price', (ci.quantity * ci.unit_price)
        ) ORDER BY ci.created_at
    ) as cart_items,
    -- Totales
    COUNT(ci.id) as total_items,
    COALESCE(SUM(ci.quantity), 0) as total_quantity,
    COALESCE(SUM(ci.quantity * ci.unit_price), 0) as total_amount
FROM shopping_carts sc
LEFT JOIN users u ON sc.user_id = u.id
LEFT JOIN events e ON sc.event_id = e.id
LEFT JOIN cart_items ci ON sc.id = ci.cart_id
LEFT JOIN products p ON ci.product_id = p.id
LEFT JOIN sizes s ON ci.size_id = s.id
WHERE sc.expires_at > NOW()
GROUP BY sc.id, sc.user_id, sc.session_id, sc.event_id, sc.expires_at, 
         sc.created_at, u.email, e.name;

-- Vista de estadísticas de puntos de retiro
CREATE VIEW v_pickup_location_stats AS
SELECT 
    pl.id as pickup_location_id,
    pl.name,
    pl.event_id,
    pl.capacity_level,
    pl.estimated_wait_time,
    -- Estadísticas de uso
    COUNT(o.id) as total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status IN ('paid', 'ready') THEN 1 END) as pending_pickups,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    -- Tiempo promedio de procesamiento (si tenemos datos)
    AVG(EXTRACT(EPOCH FROM (o.completed_at - o.ready_at))/60) as avg_pickup_time_minutes
FROM pickup_locations pl
LEFT JOIN orders o ON pl.id = o.pickup_location_id
GROUP BY pl.id, pl.name, pl.event_id, pl.capacity_level, pl.estimated_wait_time;
