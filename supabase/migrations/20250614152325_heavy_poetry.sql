/*
  # Database Schema Setup for FileVault

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)
      - `pin` (text)
    - `files`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `name` (text)
      - `type` (text)
      - `size` (bigint)
      - `url` (text)
      - `uploaded_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access control
    - Create indexes for performance

  3. Changes
    - Handles existing policies gracefully
    - Uses IF NOT EXISTS for all operations
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pin text NOT NULL
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON rooms;
DROP POLICY IF EXISTS "Room creators can delete their rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can view files" ON files;
DROP POLICY IF EXISTS "Room creators can upload files" ON files;
DROP POLICY IF EXISTS "Room creators can delete their files" ON files;

-- Policies for rooms table
CREATE POLICY "Anyone can view rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON rooms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" ON rooms
  FOR DELETE USING (auth.uid() = created_by);

-- Policies for files table
CREATE POLICY "Anyone can view files" ON files
  FOR SELECT USING (true);

CREATE POLICY "Room creators can upload files" ON files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = files.room_id 
      AND rooms.created_by = auth.uid()
    )
  );

CREATE POLICY "Room creators can delete their files" ON files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = files.room_id 
      AND rooms.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_key ON rooms(key);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_files_room_id ON files(room_id);