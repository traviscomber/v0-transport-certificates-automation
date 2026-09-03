-- The approval guard is a trigger implementation detail, not a public RPC.
revoke all on function public.enforce_subcontractor_review_assignment() from public;
revoke all on function public.enforce_subcontractor_review_assignment() from anon;
revoke all on function public.enforce_subcontractor_review_assignment() from authenticated;
