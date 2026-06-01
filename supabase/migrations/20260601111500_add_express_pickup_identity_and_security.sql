alter table public.orders
  add column if not exists express_pickup boolean not null default false,
  add column if not exists express_pickup_fee numeric not null default 0 check (express_pickup_fee >= 0),
  add column if not exists identity_verification_method text check (identity_verification_method is null or identity_verification_method = any (array['stripe_identity'::text, 'in_person'::text])),
  add column if not exists identity_verification_status text not null default 'not_required' check (identity_verification_status = any (array['not_required'::text, 'pending'::text, 'verified'::text, 'requires_input'::text, 'cancelled'::text])),
  add column if not exists stripe_identity_verification_session_id text;

alter table public.pickup_requests
  add column if not exists express_pickup boolean not null default false,
  add column if not exists express_pickup_fee numeric not null default 0 check (express_pickup_fee >= 0),
  add column if not exists identity_verification_method text not null default 'in_person' check (identity_verification_method = any (array['stripe_identity'::text, 'in_person'::text])),
  add column if not exists identity_verification_status text not null default 'pending' check (identity_verification_status = any (array['pending'::text, 'verified'::text, 'requires_input'::text, 'cancelled'::text])),
  add column if not exists stripe_identity_verification_session_id text;

comment on column public.orders.tax_total is 'Puerto Rico IVU charged on taxable merchandise and taxable fulfillment charges.';
comment on column public.orders.express_pickup_fee is 'Express pickup preparation fee at $5 per bottle selected.';
comment on column public.pickup_requests.express_pickup_fee is 'Express pickup preparation fee at $5 per bottle selected.';
comment on column public.orders.identity_verification_method is 'stripe_identity for hosted online verification or in_person for ID check during pickup.';
comment on column public.pickup_requests.identity_verification_method is 'stripe_identity for hosted online verification or in_person for ID check during pickup.';

drop policy if exists order_items_insert_checkout on public.order_items;
drop policy if exists orders_insert_checkout on public.orders;
drop policy if exists "Public can submit pickup requests" on public.pickup_requests;
drop policy if exists "Public can submit tour bookings" on public.tour_bookings;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.order_exists(uuid) from public, anon, authenticated;
alter function public.set_updated_at() set search_path = public;
