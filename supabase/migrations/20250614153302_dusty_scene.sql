/*
  # Storage Policies Setup

  This migration provides the correct SQL for storage policies.
  Note: These policies need to be created manually in the Supabase dashboard
  due to permission restrictions on the storage.objects table.

  ## Storage Policies Required

  1. **Authenticated users can upload files**
     - Operation: INSERT
     - Target roles: authenticated
     - Policy definition: `bucket_id = 'room-files'`

  2. **Anyone can view files**
     - Operation: SELECT  
     - Target roles: public
     - Policy definition: `bucket_id = 'room-files'`

  3. **Authenticated users can delete files**
     - Operation: DELETE
     - Target roles: authenticated
     - Policy definition: `bucket_id = 'room-files' AND auth.uid()::text = owner`

  ## Manual Steps Required

  1. Go to Supabase Dashboard → Storage → Buckets
  2. Create bucket named 'room-files' (if not exists)
  3. Go to Storage → room-files → Policies tab
  4. Create the three policies above using the dashboard interface

  The key fix for the error you encountered:
  - Use `auth.uid()::text = owner` instead of `auth.uid() = owner`
  - This converts the uuid to text for proper comparison
*/

-- Create the storage bucket if it doesn't exist
-- Note: This may need to be done manually in the dashboard
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-files', 'room-files', true)
ON CONFLICT (id) DO NOTHING;

-- Placeholder query to make this a valid migration
SELECT 'Storage policies must be created manually in Supabase dashboard' as note;