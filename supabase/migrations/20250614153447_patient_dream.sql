/*
  # Storage Bucket and Policies Setup
  
  1. Storage Bucket
    - Create 'room-files' bucket (public)
  
  2. Storage Policies
    - Allow authenticated users to upload files
    - Allow public access to view/download files  
    - Allow file owners to delete their files
    
  Note: Storage policies must be created manually in Supabase Dashboard
  due to permission restrictions in SQL migrations.
*/

-- Create storage bucket (this may need to be done manually)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('room-files', 'room-files', true, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Storage policies must be created manually in the Supabase Dashboard
-- Go to Storage > room-files > Policies and create these policies:

/*
POLICY 1: "Authenticated users can upload files"
- Operation: INSERT ✅
- Target roles: authenticated
- Policy definition: true

POLICY 2: "Anyone can view files"  
- Operation: SELECT ✅
- Target roles: public
- Policy definition: true

POLICY 3: "Authenticated users can delete files"
- Operation: DELETE ✅
- Target roles: authenticated  
- Policy definition: (storage.foldername(name))[1] = auth.uid()::text
*/

SELECT 'Storage policies must be created manually - see migration comments for details' as instruction;