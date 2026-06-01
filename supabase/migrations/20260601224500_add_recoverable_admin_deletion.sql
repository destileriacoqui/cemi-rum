-- Add soft-delete support so admin removal retains recoverable history.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
