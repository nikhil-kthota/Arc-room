/*
  # Remove Folders Feature

  1. Drop Tables
    - Drop folders table completely
    - Remove folder_id column from files table

  2. Clean Up
    - Remove all folder-related indexes
    - Remove all folder-related policies
    - Clean up any constraints
*/

-- Remove folder_id column from files table
ALTER TABLE files DROP COLUMN IF EXISTS folder_id;

-- Drop folders table completely
DROP TABLE IF EXISTS folders CASCADE;

-- Remove any remaining indexes related to folders
DROP INDEX IF EXISTS idx_folders_room_id;
DROP INDEX IF EXISTS idx_folders_parent_folder_id;
DROP INDEX IF EXISTS idx_folders_created_by;
DROP INDEX IF EXISTS idx_files_folder_id;

-- Clean up is complete
SELECT 'Folders feature completely removed' as status;