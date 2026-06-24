# Manual SQL Execution for Prevencionista Role

## Problema
El cliente de Supabase no puede ejecutar DDL (ALTER TABLE) directamente.

## Solución
Ejecutar SQL manualmente en Supabase Dashboard.

## Pasos

### 1. Abre Supabase Dashboard
- URL: https://app.supabase.com
- Selecciona tu proyecto

### 2. Ve a SQL Editor
- Left menu → SQL Editor
- Click "New Query"

### 3. Copia y Pega Este SQL

```sql
-- Step 1: Drop existing role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add new constraint with prevencionista role
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('administrador', 'despachador', 'mandante', 'transportista', 'conductor', 'prevencionista'));

-- Step 3: Verify
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check';
```

### 4. Ejecuta
- Click botón "Run" (o Cmd+Enter)
- Deberías ver resultado: "constraint_name: profiles_role_check"

### 5. Agrega Perfiles Prevencionistas

```sql
-- Add/Update prevencionista profiles
INSERT INTO public.profiles (id, email, full_name, role, is_active)
VALUES 
  ('70bd49af-b9d2-468a-b255-d8b9ca272b74', 'aramirez@labbe.cl', 'Ignacia Guzmán', 'prevencionista', true),
  ('f1865bfc-b53e-4719-b8c9-0f22eb02ed99', 'bmiranda@labbe.cl', 'bmiranda', 'prevencionista', true)
ON CONFLICT (id) DO UPDATE SET role = 'prevencionista', is_active = true;

-- Verify
SELECT email, role FROM public.profiles WHERE role = 'prevencionista';
```

### 6. Verifica Resultado
Deberías ver:
```
email                 | role
aramirez@labbe.cl     | prevencionista
bmiranda@labbe.cl     | prevencionista
```

## Completado
Una vez ejecutado, las cuentas prevencionistas estarán listas para usar.
