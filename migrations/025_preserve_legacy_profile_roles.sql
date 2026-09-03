-- Keep the deployed profiles constraint compatible with legacy English and
-- Spanish role values while the application is cut over to explicit RBAC.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (
    role = any (
      array[
        'admin'::text,
        'administrador'::text,
        'dispatcher'::text,
        'despachador'::text,
        'driver'::text,
        'conductor'::text,
        'executive'::text,
        'mandante'::text,
        'transportista'::text,
        'prevencionista'::text,
        'ejecutiva'::text,
        'super_admin'::text
      ]
    )
  );
