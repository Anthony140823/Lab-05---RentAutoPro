-- ============================================
-- POLÍTICAS DE SEGURIDAD SIMPLIFICADAS
-- Solo ejecuta las que faltan
-- ============================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES PRIMERO
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.rentals;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins and fleet managers can insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins and fleet managers can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can delete vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view own rentals" ON public.rentals;
DROP POLICY IF EXISTS "Authenticated users can create rentals" ON public.rentals;
DROP POLICY IF EXISTS "Admins and fleet managers can update rentals" ON public.rentals;
DROP POLICY IF EXISTS "Authenticated users can view maintenance" ON public.maintenance_records;
DROP POLICY IF EXISTS "Staff can insert maintenance" ON public.maintenance_records;
DROP POLICY IF EXISTS "Staff can update maintenance" ON public.maintenance_records;
DROP POLICY IF EXISTS "Anyone can view vehicle types" ON public.vehicle_types;
DROP POLICY IF EXISTS "Anyone can view maintenance types" ON public.maintenance_types;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can view fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Staff can insert fuel records" ON public.fuel_records;

-- 2. CREAR POLÍTICAS PARA PROFILES (CRÍTICO)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. POLÍTICAS PARA VEHICLES
CREATE POLICY "Anyone can view vehicles" 
ON public.vehicles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins and fleet managers can insert vehicles" 
ON public.vehicles FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager')
  )
);

CREATE POLICY "Admins and fleet managers can update vehicles" 
ON public.vehicles FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager')
  )
);

CREATE POLICY "Admins can delete vehicles" 
ON public.vehicles FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. POLÍTICAS PARA RENTALS
CREATE POLICY "Users can view own rentals" 
ON public.rentals FOR SELECT 
TO authenticated 
USING (
  customer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager', 'accounting')
  )
);

CREATE POLICY "Authenticated users can create rentals" 
ON public.rentals FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins and fleet managers can update rentals" 
ON public.rentals FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager')
  )
);

-- 5. POLÍTICAS PARA MAINTENANCE_RECORDS
CREATE POLICY "Authenticated users can view maintenance" 
ON public.maintenance_records FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Staff can insert maintenance" 
ON public.maintenance_records FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager', 'mechanic')
  )
);

CREATE POLICY "Staff can update maintenance" 
ON public.maintenance_records FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager', 'mechanic')
  )
);

-- 6. POLÍTICAS PARA VEHICLE_TYPES Y MAINTENANCE_TYPES
CREATE POLICY "Anyone can view vehicle types" 
ON public.vehicle_types FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Anyone can view maintenance types" 
ON public.maintenance_types FOR SELECT 
TO authenticated 
USING (true);

-- 7. POLÍTICAS PARA INVOICES
CREATE POLICY "Users can view own invoices" 
ON public.invoices FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.rentals 
    WHERE rentals.id = invoices.rental_id 
    AND rentals.customer_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'accounting')
  )
);

-- 8. POLÍTICAS PARA FUEL_RECORDS
CREATE POLICY "Staff can view fuel records" 
ON public.fuel_records FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager', 'mechanic')
  )
);

CREATE POLICY "Staff can insert fuel records" 
ON public.fuel_records FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'fleet_manager', 'mechanic')
  )
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Políticas creadas exitosamente' as status;
