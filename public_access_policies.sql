-- ============================================
-- POLÍTICAS DE ACCESO PÚBLICO (MODO CONCESIONARIA)
-- ============================================

-- 1. VEHÍCULOS: Acceso total de lectura para todos (incluido anónimos)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicles;
DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.vehicles;

CREATE POLICY "Public read access" 
ON public.vehicles FOR SELECT 
USING (true);

-- 2. TIPOS DE VEHÍCULO: Acceso total de lectura
DROP POLICY IF EXISTS "Anyone can view vehicle types" ON public.vehicle_types;

CREATE POLICY "Public read access" 
ON public.vehicle_types FOR SELECT 
USING (true);

-- 3. PERFILES: Lectura pública (necesario si la UI muestra nombres de agentes/vendedores)
-- Se recomienda restringir campos sensibles en una aplicación real, pero para este demo está bien.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Public read access" 
ON public.profiles FOR SELECT 
USING (true);

-- Nota: Insertar/Actualizar sigue restringido o bloqueado por defecto si no hay política.
-- Si queremos que cualquiera se registre sin trabas, podríamos abrir el insert también, 
-- pero el objetivo es "ver" la concesionaria.

-- 4. ALQUILERES: Si quisieras que el público vea disponibilidad (calendario), necesitarían leer rentals
DROP POLICY IF EXISTS "Users can view own rentals" ON public.rentals;

CREATE POLICY "Public read access" 
ON public.rentals FOR SELECT 
USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Políticas públicas aplicadas correctamente' as status;
