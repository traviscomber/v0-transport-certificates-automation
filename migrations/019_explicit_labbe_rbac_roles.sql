-- ChileFlota RBAC hardening.
-- Keep all legacy roles while adding explicit Labbe operational roles.
-- Super-admin privileges must never be inferred from an email domain.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (
    role = ANY (
      ARRAY[
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
