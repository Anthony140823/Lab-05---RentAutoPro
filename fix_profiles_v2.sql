-- ============================================
-- SCRIPT DE REPARACIÓN DE PERFILES Y TRIGGER
-- ============================================

-- 1. Eliminar el trigger existente para recrearlo desde cero
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear la función del trigger con permisos de SECURITY DEFINER
-- Esto es CRÍTICO: permite que la función se ejecute con permisos de superusuario
-- saltándose las restricciones de RLS que bloquean al usuario nuevo.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo'), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, lo registramos pero no bloqueamos el registro
    RAISE LOG 'Error en trigger handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asignar el trigger a la tabla de usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. REPARACIÓN DE USUARIOS EXISTENTES (Los que fallaron)
-- Esto insertará perfiles para cualquier usuario que exista en Auth pero no tenga Perfil
INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'first_name', 'Usuario'), 
    COALESCE(raw_user_meta_data->>'last_name', 'Recuperado'), 
    COALESCE(raw_user_meta_data->>'role', 'customer')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 5. VERIFICACIÓN FINAL
SELECT count(*) as usuarios_sin_perfil 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
