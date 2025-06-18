import { supabase } from '../lib/supabase';
import { Room, FileItem } from '../types';

// Get all rooms for a user
export const getRoomsForUser = async (userId: string): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      files (*)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(room => ({
    id: room.id,
    key: room.key,
    name: room.name,
    createdAt: new Date(room.created_at),
    createdBy: room.created_by,
    files: room.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      uploadedAt: new Date(file.uploaded_at)
    }))
  }));
};

// Get a room by key (with files)
export const getRoomByKey = async (key: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      files (*)
    `)
    .eq('key', key)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null; // Room not found
  }

  return {
    id: data.id,
    key: data.key,
    name: data.name,
    createdAt: new Date(data.created_at),
    createdBy: data.created_by,
    files: data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      uploadedAt: new Date(file.uploaded_at)
    }))
  };
};

// Create a new room
export const createRoom = async (
  userId: string,
  roomKey: string,
  roomName: string,
  pin: string
): Promise<Room> => {
  // Check if room key already exists
  const { data: existingRoom } = await supabase
    .from('rooms')
    .select('id')
    .eq('key', roomKey)
    .single();

  if (existingRoom) {
    throw new Error('Room key already exists');
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      key: roomKey,
      name: roomName,
      created_by: userId,
      pin: pin
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    key: data.key,
    name: data.name,
    createdAt: new Date(data.created_at),
    createdBy: data.created_by,
    files: []
  };
};

// Verify room PIN
export const verifyRoomPin = async (roomKey: string, pin: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('pin')
    .eq('key', roomKey)
    .single();

  if (error) {
    return false;
  }

  return data.pin === pin;
};

// Upload files to a room
export const uploadFilesToRoom = async (roomKey: string, files: File[]): Promise<FileItem[]> => {
  // First get the room ID
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('key', roomKey)
    .single();

  if (roomError || !room) {
    throw new Error('Room not found');
  }

  const uploadedFiles: FileItem[] = [];

  for (const file of files) {
    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${roomKey}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('room-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('room-files')
        .getPublicUrl(filePath);

      // Insert file metadata into database
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          room_id: room.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl
        })
        .select()
        .single();

      if (fileError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('room-files').remove([filePath]);
        throw new Error(`Failed to save file metadata: ${fileError.message}`);
      }

      uploadedFiles.push({
        id: fileData.id,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        url: fileData.url,
        uploadedAt: new Date(fileData.uploaded_at)
      });
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  }

  return uploadedFiles;
};

// Delete a file from a room
export const deleteFileFromRoom = async (roomKey: string, fileId: string): Promise<boolean> => {
  // Get file info first
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('url, room_id')
    .eq('id', fileId)
    .single();

  if (fileError || !file) {
    throw new Error('File not found');
  }

  // Verify the file belongs to the correct room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('key', roomKey)
    .single();

  if (roomError || !room || room.id !== file.room_id) {
    throw new Error('File does not belong to this room');
  }

  // Extract file path from URL
  const url = new URL(file.url);
  const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two parts (roomKey/filename)

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('room-files')
    .remove([filePath]);

  if (storageError) {
    console.error('Storage deletion error:', storageError);
    // Continue with database deletion even if storage deletion fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw new Error(`Failed to delete file: ${dbError.message}`);
  }

  return true;
};