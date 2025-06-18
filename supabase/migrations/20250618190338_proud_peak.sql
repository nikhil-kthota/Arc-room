/*
  # Add Room Constraints and Error Handling

  1. Database Changes
    - Ensure UNIQUE constraint on room key (already exists)
    - Remove any unique constraint on PIN (allow same PIN for different rooms)
    - Add proper indexes for performance

  2. Changes
    - Room keys must be unique across all rooms
    - PINs can be reused across different rooms
    - Proper error handling for constraint violations
*/

-- Ensure the unique constraint on room key exists (it should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'rooms' AND constraint_name = 'rooms_key_key'
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_key_key UNIQUE (key);
  END IF;
END $$;

-- Remove any unique constraint on PIN if it exists (PINs should be reusable)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'rooms' AND constraint_name = 'rooms_pin_key'
  ) THEN
    ALTER TABLE rooms DROP CONSTRAINT rooms_pin_key;
  END IF;
END $$;

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_rooms_key ON rooms(key);
CREATE INDEX IF NOT EXISTS idx_rooms_pin ON rooms(pin);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);

-- Add comment to clarify the constraints
COMMENT ON COLUMN rooms.key IS 'Unique room identifier - must be unique across all rooms';
COMMENT ON COLUMN rooms.pin IS 'Room access PIN - can be reused across different rooms';

SELECT 'Room constraints updated successfully' as status;