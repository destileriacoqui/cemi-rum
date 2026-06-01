create or replace function public.claim_my_guest_orders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  account_email text := auth.jwt() ->> 'email';
begin
  if auth.uid() is null or account_email is null then
    raise exception 'A confirmed account is required.';
  end if;

  update public.orders
  set user_id = auth.uid()
  where user_id is null and lower(email) = lower(account_email);

  update public.pickup_requests
  set user_id = auth.uid()
  where user_id is null and lower(email) = lower(account_email);
end;
$$;

revoke all on function public.claim_my_guest_orders() from public, anon;
grant execute on function public.claim_my_guest_orders() to authenticated;

comment on function public.claim_my_guest_orders() is
  'Links guest orders to the signed-in customer after account confirmation, using the email in the authenticated JWT.';
