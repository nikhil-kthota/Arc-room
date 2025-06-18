/*
  # Fix Delete Account Function and Room Constraints

  1. Database Changes
    - Create proper delete_user_account function that works with client-side auth
    - Ensure room keys are unique but PINs can be reused
    - Add proper indexes for performance

  2. Security
    - Function handles cascade deletion properly
    - Maintains referential integrity
    - Allows same PIN for different rooms
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS delete_user_account();

-- Create a function to delete all user data (but not the auth user itself)
-- The auth user deletion will be handled by the client
CREATE OR REPLACE FUNCTION delete_user_data(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user_id is provided
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User ID must be provided';
  END IF;
  
  -- Delete all user's rooms (this will cascade delete files due to foreign key)
  DELETE FROM rooms WHERE created_by = user_id;
  
  -- Note: Storage files should be deleted by the application before calling this function
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data(uuid) TO authenticated;

-- Ensure the unique constraint on room key exists
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

-- Add comments to clarify the constraints
COMMENT ON COLUMN rooms.key IS 'Unique room identifier - must be unique across all rooms';
COMMENT ON COLUMN rooms.pin IS 'Room access PIN - can be reused across different rooms';

SELECT 'Database constraints and delete function updated successfully' as status;