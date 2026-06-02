-- Add soft-delete support so admin removal retains recoverable history.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

comment on column public.orders.deleted_at is
  'Soft-delete timestamp set by the protected admin dashboard. Retains order history for recovery and audit review.';

comment on column public.pickup_requests.deleted_at is
  'Soft-delete timestamp set with the related order. Retains pickup history for recovery and audit review.';

comment on column public.tour_bookings.deleted_at is
  'Soft-delete timestamp set by the protected admin dashboard. Retains booking history for recovery and audit review.';
