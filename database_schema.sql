-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'fleet_manager', 'customer', 'mechanic', 'accounting')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Types
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to vehicle_types
ALTER TABLE public.vehicle_types ADD CONSTRAINT vehicle_types_name_key UNIQUE (name);

-- Maintenance Types
CREATE TABLE IF NOT EXISTS public.maintenance_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  recommended_interval_km DECIMAL(10, 2),
  recommended_interval_months INTEGER
);

-- Add unique constraint to maintenance_types
ALTER TABLE public.maintenance_types ADD CONSTRAINT maintenance_types_name_key UNIQUE (name);

-- Insert default maintenance types (English)
INSERT INTO public.maintenance_types (name, description, recommended_interval_km, recommended_interval_months)
VALUES 
('Oil Change', 'Engine oil and filter replacement', 8000, 6),
('Tire Rotation', 'Rotate tires to ensure even wear', 12000, 6),
('Brake Inspection', 'Inspect and service brake system', 15000, 12),
('Air Filter Replacement', 'Replace engine air filter', 24000, 12),
('Transmission Service', 'Transmission fluid and filter change', 60000, 24),
('Coolant Flush', 'Drain and replace engine coolant', 80000, 36)
ON CONFLICT (name) DO NOTHING;

-- Insert Spanish maintenance types
INSERT INTO public.maintenance_types (name, description, recommended_interval_km, recommended_interval_months)
VALUES 
('Cambio de Aceite', 'Reemplazo de aceite y filtro del motor', 8000, 6),
('Rotación de Neumáticos', 'Rotación de neumáticos para desgaste uniforme', 12000, 6),
('Inspección de Frenos', 'Inspección y servicio del sistema de frenos', 15000, 12),
('Cambio de Filtro de Aire', 'Reemplazo del filtro de aire del motor', 24000, 12),
('Servicio de Transmisión', 'Cambio de fluido y filtro de la transmisión', 60000, 24),
('Lavado de Refrigerante', 'Drenado y reemplazo del refrigerante del motor', 80000, 36)
ON CONFLICT (name) DO NOTHING;

-- Insert default vehicle types (English)
INSERT INTO public.vehicle_types (name, description)
VALUES 
('Sedan', 'Standard 4-door sedan'),
('SUV', 'Sport Utility Vehicle'),
('Truck', 'Pickup Truck'),
('Van', 'Passenger or Cargo Van'),
('Luxury', 'Premium/Luxury Vehicle')
ON CONFLICT (name) DO NOTHING;

-- Insert Spanish vehicle types
INSERT INTO public.vehicle_types (name, description)
VALUES 
('Sedán', 'Sedán estándar de 4 puertas'),
('SUV', 'Vehículo Utilitario Deportivo'),
('Camioneta', 'Camioneta Pickup'),
('Furgoneta', 'Furgoneta de Pasajeros o Carga'),
('Lujo', 'Vehículo Premium/De Lujo')
ON CONFLICT (name) DO NOTHING;

-- Rest of your tables (vehicles, maintenance_records, etc.) go here...
-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  license_plate TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vehicle_type_id UUID REFERENCES public.vehicle_types(id) ON DELETE SET NULL,
  color TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'unavailable')),
  current_mileage DECIMAL(10, 2) DEFAULT 0,
  fuel_type TEXT,
  fuel_efficiency DECIMAL(5, 2),
  last_maintenance_date TIMESTAMPTZ,
  next_maintenance_mileage DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Records
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  maintenance_type_id UUID REFERENCES public.maintenance_types(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  cost DECIMAL(10, 2),
  mileage DECIMAL(10, 2) NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  next_due_mileage DECIMAL(10, 2),
  next_due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rentals
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  actual_return_date TIMESTAMPTZ,
  start_mileage DECIMAL(10, 2),
  end_mileage DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuel Records
CREATE TABLE IF NOT EXISTS public.fuel_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE SET NULL,
  fuel_amount DECIMAL(6, 2) NOT NULL,
  fuel_cost DECIMAL(10, 2) NOT NULL,
  mileage DECIMAL(10, 2) NOT NULL,
  fuel_type TEXT NOT NULL,
  filled_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_rentals_dates ON public.rentals(start_date, end_date);
CREATE INDEX idx_maintenance_vehicle ON public.maintenance_records(vehicle_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simplified example)
CREATE POLICY "Enable read access for all users" ON public.vehicles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.rentals
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE TRIGGER update_vehicles_modtime
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_rentals_modtime
BEFORE UPDATE ON public.rentals
FOR EACH ROW EXECUTE FUNCTION update_modified_column();