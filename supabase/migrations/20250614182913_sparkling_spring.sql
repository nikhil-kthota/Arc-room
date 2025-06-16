/*
  # Add Folders Support and User Profile Features

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `name` (text) - Folder name
      - `parent_folder_id` (uuid, foreign key to folders, nullable for root folders)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)

  2. Schema Changes
    - Add `folder_id` to files table to support folder organization
    - Add indexes for better performance

  3. Security
    - Enable RLS on folders table
    - Add policies for folder management
    - Update file policies to support folders

  4. User Profile Support
    - Existing tables already support user profile features
    - Rooms table has created_by for user's rooms
    - Files table can be joined with rooms for user's files
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add folder_id to files table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE files ADD COLUMN folder_id uuid REFERENCES folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Policies for folders table
CREATE POLICY "Anyone can view folders" ON folders
  FOR SELECT USING (true);

CREATE POLICY "Room creators can create folders" ON folders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = folders.room_id 
      AND rooms.created_by = auth.uid()
    )
  );

CREATE POLICY "Room creators can update their folders" ON folders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = folders.room_id 
      AND rooms.created_by = auth.uid()
    )
  );

CREATE POLICY "Room creators can delete their folders" ON folders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = folders.room_id 
      AND rooms.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_room_id ON folders(room_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_folder_id ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON folders(created_by);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);

-- Add constraint to prevent circular folder references
ALTER TABLE folders ADD CONSTRAINT check_no_self_reference 
  CHECK (id != parent_folder_id);