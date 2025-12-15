-- ============================================
-- TRIGGER PARA REGISTRO AUTOMÁTICO DE USUARIOS
-- ============================================

-- 1. Crear función que maneja el nuevo usuario
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Eliminar trigger anterior si existe (para evitar duplicados)
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Crear el trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Trigger configurado exitosamente' as status;
