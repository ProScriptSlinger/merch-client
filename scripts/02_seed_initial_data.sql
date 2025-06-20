-- =============================================
-- DATOS INICIALES PARA LA BASE DE DATOS
-- =============================================

-- Insertar talles básicos
INSERT INTO sizes (name, display_order) VALUES
('S', 1),
('M', 2),
('L', 3),
('XL', 4),
('XXL', 5),
('Única', 6);

-- Insertar categorías
INSERT INTO categories (name, description, display_order) VALUES
('Remeras', 'Remeras y camisetas básicas', 1),
('Hoodies', 'Buzos y hoodies premium', 2),
('Accesorios', 'Gorras, bolsos y otros accesorios', 3),
('Edición Limitada', 'Productos exclusivos del evento', 4);

-- Insertar evento de ejemplo
INSERT INTO events (name, description, start_date, end_date, location, qr_base_url) VALUES
(
    'Festival de Música 2024',
    'El festival de música más grande del año',
    '2024-12-15 10:00:00-03',
    '2024-12-17 23:59:59-03',
    'Parque de la Ciudad, Buenos Aires',
    'https://merch-store.com/event/festival2024'
);

-- Obtener IDs para referencias
DO $$
DECLARE
    event_id UUID;
    category_remeras UUID;
    category_hoodies UUID;
    category_accesorios UUID;
    size_s UUID;
    size_m UUID;
    size_l UUID;
    size_xl UUID;
    size_unica UUID;
    product_id UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO event_id FROM events WHERE name = 'Festival de Música 2024';
    SELECT id INTO category_remeras FROM categories WHERE name = 'Remeras';
    SELECT id INTO category_hoodies FROM categories WHERE name = 'Hoodies';
    SELECT id INTO category_accesorios FROM categories WHERE name = 'Accesorios';
    SELECT id INTO size_s FROM sizes WHERE name = 'S';
    SELECT id INTO size_m FROM sizes WHERE name = 'M';
    SELECT id INTO size_l FROM sizes WHERE name = 'L';
    SELECT id INTO size_xl FROM sizes WHERE name = 'XL';
    SELECT id INTO size_unica FROM sizes WHERE name = 'Única';

    -- Insertar productos
    -- Remera Básica
    INSERT INTO products (event_id, category_id, name, description, base_price, image_url, display_order)
    VALUES (event_id, category_remeras, 'Remera Básica', 'Remera 100% algodón con logo del festival', 8500.00, '/images/remera-basica.jpg', 1)
    RETURNING id INTO product_id;
    
    -- Inventario para Remera Básica
    INSERT INTO inventory (product_id, size_id, stock_quantity) VALUES
    (product_id, size_s, 50),
    (product_id, size_m, 100),
    (product_id, size_l, 80),
    (product_id, size_xl, 30);

    -- Hoodie Premium
    INSERT INTO products (event_id, category_id, name, description, base_price, image_url, display_order)
    VALUES (event_id, category_hoodies, 'Hoodie Premium', 'Buzo con capucha, diseño exclusivo del festival', 15000.00, '/images/hoodie-premium.jpg', 2)
    RETURNING id INTO product_id;
    
    -- Inventario para Hoodie Premium
    INSERT INTO inventory (product_id, size_id, stock_quantity) VALUES
    (product_id, size_s, 25),
    (product_id, size_m, 40),
    (product_id, size_l, 35),
    (product_id, size_xl, 20);

    -- Gorra Snapback
    INSERT INTO products (event_id, category_id, name, description, base_price, image_url, has_sizes, display_order)
    VALUES (event_id, category_accesorios, 'Gorra Snapback', 'Gorra ajustable con bordado del festival', 6500.00, '/images/gorra-snapback.jpg', false, 3)
    RETURNING id INTO product_id;
    
    -- Inventario para Gorra (talle único)
    INSERT INTO inventory (product_id, size_id, stock_quantity) VALUES
    (product_id, size_unica, 75);

    -- Tote Bag
    INSERT INTO products (event_id, category_id, name, description, base_price, image_url, has_sizes, display_order)
    VALUES (event_id, category_accesorios, 'Tote Bag', 'Bolsa de tela ecológica con diseño del festival', 4500.00, '/images/tote-bag.jpg', false, 4)
    RETURNING id INTO product_id;
    
    -- Inventario para Tote Bag
    INSERT INTO inventory (product_id, size_id, stock_quantity) VALUES
    (product_id, size_unica, 100);

    -- Insertar puntos de retiro
    INSERT INTO pickup_locations (event_id, name, address, description, opening_hours, estimated_wait_time, capacity_level, features, display_order) VALUES
    (
        event_id,
        'Stand Principal',
        'Sector A - Entrada principal',
        'Ubicación principal con mayor stock disponible',
        '10:00-22:00',
        '5-10 min',
        'high',
        '["Stock completo", "Atención rápida", "Fácil acceso"]'::jsonb,
        1
    ),
    (
        event_id,
        'Patio de Comidas',
        'Sector B - Junto al food court',
        'Punto de retiro cerca del área gastronómica',
        '11:00-21:00',
        '2-5 min',
        'low',
        '["Sin filas", "Cerca de restaurantes", "Ambiente relajado"]'::jsonb,
        2
    ),
    (
        event_id,
        'Escenario Principal',
        'Sector C - Lateral del escenario',
        'Ideal si vas a ver los shows principales',
        '12:00-20:00',
        '3-8 min',
        'medium',
        '["Cerca del escenario", "Horario extendido", "Stock limitado"]'::jsonb,
        3
    ),
    (
        event_id,
        'Área VIP',
        'Sector D - Zona exclusiva',
        'Retiro express para experiencia premium',
        '14:00-19:00',
        '1-2 min',
        'low',
        '["Atención premium", "Sin esperas", "Acceso VIP requerido"]'::jsonb,
        4
    );

END $$;
