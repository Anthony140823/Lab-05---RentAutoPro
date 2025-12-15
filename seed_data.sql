-- ============================================
-- SCRIPT DE POBLACIÓN DE DATOS (SEED DATA)
-- ============================================

-- 1. Asegurar Tipos de Vehículo (si no existen)
INSERT INTO public.vehicle_types (name, description)
VALUES 
('Sedan', 'Auto compacto o mediano de 4 puertas'),
('SUV', 'Vehículo deportivo utilitario'),
('Pickup', 'Camioneta de carga'),
('Van', 'Furgoneta para pasajeros o carga'),
('Deportivo', 'Auto de alto rendimiento'),
('Lujo', 'Vehículo de gama alta')
ON CONFLICT (name) DO NOTHING;

-- 2. Asegurar Tipos de Mantenimiento
INSERT INTO public.maintenance_types (name, description, recommended_interval_km, recommended_interval_months)
VALUES 
('Cambio de Aceite', 'Reemplazo de aceite sintético y filtro', 10000, 6),
('Rotación de Llantas', 'Cambio de posición de neumáticos', 12000, 6),
('Frenos', 'Revisión y cambio de pastillas', 20000, 12),
('Afinamiento', 'Limpieza de inyectores y bujías', 30000, 24),
('Batería', 'Revisión y cambio de batería', 40000, 36)
ON CONFLICT (name) DO NOTHING;

-- 3. Insertar 15 Vehículos de Prueba
-- Nota: Usamos subconsultas para obtener los IDs de los tipos
INSERT INTO public.vehicles (license_plate, make, model, year, color, status, current_mileage, fuel_type, fuel_efficiency, vehicle_type_id)
VALUES
-- Disponibles
('ABC-101', 'Toyota', 'Corolla', 2023, 'Blanco', 'available', 15000, 'Gasolina', 45.5, (SELECT id FROM public.vehicle_types WHERE name = 'Sedan' LIMIT 1)),
('ABC-102', 'Honda', 'Civic', 2024, 'Plata', 'available', 5000, 'Gasolina', 48.0, (SELECT id FROM public.vehicle_types WHERE name = 'Sedan' LIMIT 1)),
('ABC-103', 'Mazda', 'CX-5', 2023, 'Rojo', 'available', 22000, 'Gasolina', 38.2, (SELECT id FROM public.vehicle_types WHERE name = 'SUV' LIMIT 1)),
('ABC-104', 'Hyundai', 'Tucson', 2022, 'Gris', 'available', 35000, 'Gasolina', 39.0, (SELECT id FROM public.vehicle_types WHERE name = 'SUV' LIMIT 1)),
('ABC-105', 'Nissan', 'Versa', 2023, 'Azul', 'available', 12000, 'Gasolina', 42.5, (SELECT id FROM public.vehicle_types WHERE name = 'Sedan' LIMIT 1)),

-- Alquilados (rented)
('RNT-201', 'Ford', 'Ranger', 2022, 'Negro', 'rented', 45000, 'Diesel', 30.5, (SELECT id FROM public.vehicle_types WHERE name = 'Pickup' LIMIT 1)),
('RNT-202', 'Toyota', 'Hilux', 2023, 'Blanco', 'rented', 28000, 'Diesel', 32.0, (SELECT id FROM public.vehicle_types WHERE name = 'Pickup' LIMIT 1)),
('RNT-203', 'Kia', 'Sportage', 2024, 'Gris', 'rented', 8000, 'Gasolina', 40.0, (SELECT id FROM public.vehicle_types WHERE name = 'SUV' LIMIT 1)),
('RNT-204', 'Chevrolet', 'Tahoe', 2022, 'Negro', 'rented', 55000, 'Gasolina', 25.5, (SELECT id FROM public.vehicle_types WHERE name = 'SUV' LIMIT 1)),

-- En Mantenimiento (maintenance)
('MNT-301', 'Volkswagen', 'Gol', 2021, 'Blanco', 'maintenance', 60000, 'Gasolina', 44.0, (SELECT id FROM public.vehicle_types WHERE name = 'Sedan' LIMIT 1)),
('MNT-302', 'Toyota', 'Hiace', 2020, 'Blanco', 'maintenance', 120000, 'Diesel', 28.0, (SELECT id FROM public.vehicle_types WHERE name = 'Van' LIMIT 1)),
('MNT-303', 'Ford', 'Mustang', 2023, 'Rojo', 'maintenance', 15000, 'Gasolina', 22.0, (SELECT id FROM public.vehicle_types WHERE name = 'Deportivo' LIMIT 1)),

-- No Disponibles (unavailable)
('NAV-401', 'BMW', 'X5', 2022, 'Azul Oscuro', 'unavailable', 40000, 'Gasolina', 28.5, (SELECT id FROM public.vehicle_types WHERE name = 'Lujo' LIMIT 1)),
('NAV-402', 'Mercedes', 'C200', 2023, 'Plata', 'unavailable', 18000, 'Gasolina', 35.0, (SELECT id FROM public.vehicle_types WHERE name = 'Lujo' LIMIT 1)),

-- Otro Disponible
('ABC-106', 'Suzuki', 'Swift', 2024, 'Rojo', 'available', 2000, 'Híbrido', 65.0, (SELECT id FROM public.vehicle_types WHERE name = 'Sedan' LIMIT 1))

ON CONFLICT (license_plate) DO UPDATE 
SET status = EXCLUDED.status, current_mileage = EXCLUDED.current_mileage;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Vehículos insertados exitosamente' as status;
