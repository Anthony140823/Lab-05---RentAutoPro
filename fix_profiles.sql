-- ============================================
-- SCRIPT DE REPARACIÓN DE PERFILES
-- ============================================

-- 1. Intentar reparar perfiles faltantes manualmente
-- Esto buscará usuarios en auth.users que no tengan perfil en public.profiles
-- y se los creará usando los datos (metadata) guardados en su registro.

INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'first_name', 'Usuario'), 
    COALESCE(raw_user_meta_data->>'last_name', 'Nuevo'), 
    COALESCE(raw_user_meta_data->>'role', 'customer')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Verificar si hubo inserciones
DO $$
DECLARE
    count_missing INTEGER;
BEGIN
    SELECT count(*) INTO count_missing FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);
    IF count_missing = 0 THEN
        RAISE NOTICE '¡Éxito! Todos los usuarios tienen perfil.';
    ELSE
        RAISE NOTICE 'Advertencia: Aún hay % usuarios sin perfil.', count_missing;
    END IF;
END $$;

-- 3. Re-aplicar el trigger con permisos explícitos (por si acaso)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; -- Importante: SET search_path

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
