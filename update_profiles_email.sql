-- ============================================
-- ACTUALIZACIÓN DE SCHEMA Y TRIGGER
-- ============================================

-- 1. Agregar columna email a profiles (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Sincronizar emails existentes (para usuarios ya registrados)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Actualizar el trigger para guardar el email automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email, -- Guardamos el email de autenticación
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo'), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error en trigger handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificación
SELECT id, email, first_name, last_name, role FROM public.profiles LIMIT 5;
