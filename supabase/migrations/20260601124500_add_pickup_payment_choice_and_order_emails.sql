alter table public.orders
  add column if not exists payment_method text not null default 'pay_now'
    check (payment_method = any (array['pay_now'::text, 'pay_in_store'::text])),
  add column if not exists confirmation_email_status text not null default 'pending'
    check (confirmation_email_status = any (array['pending'::text, 'sending'::text, 'sent'::text])),
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists last_customer_email_template text,
  add column if not exists last_customer_email_sent_at timestamptz;

alter table public.pickup_requests
  add column if not exists payment_method text not null default 'pay_in_store'
    check (payment_method = any (array['pay_now'::text, 'pay_in_store'::text])),
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists stripe_session_id text;

comment on column public.orders.payment_method is 'pay_now for Stripe-hosted checkout or pay_in_store for payment during pickup.';
comment on column public.pickup_requests.payment_method is 'pay_now for Stripe-hosted checkout or pay_in_store for payment during pickup.';
comment on column public.orders.tax_total is 'Puerto Rico IVU charged on taxable merchandise and taxable shipping. Express pickup is currently excluded by business instruction.';
