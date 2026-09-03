-- ChileFlota RBAC hardening.
-- Keep legacy roles while adding explicit Labbe operational roles.
-- Super-admin privileges must never be inferred from an email domain.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (
    role = ANY (
      ARRAY[
        'administrador'::text,
        'despachador'::text,
        'mandante'::text,
        'transportista'::text,
        'conductor'::text,
        'prevencionista'::text,
        'ejecutiva'::text,
        'super_admin'::text
      ]
    )
  );
