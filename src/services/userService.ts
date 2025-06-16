import { supabase } from '../lib/supabase';
import { UserProfile, Room, FileItem } from '../types';

// Get user profile with rooms and files
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // Get user's rooms with files and folders
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select(`
      *,
      files (*),
      folders (*)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (roomsError) {
    throw new Error(roomsError.message);
  }

  // Get user info
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not found');
  }

  // Calculate total files and storage
  let totalFiles = 0;
  let totalStorage = 0;

  const processedRooms: Room[] = rooms.map(room => {
    const roomFiles = room.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      uploadedAt: new Date(file.uploaded_at),
      folderId: file.folder_id
    }));

    const roomFolders = room.folders.map((folder: any) => ({
      id: folder.id,
      roomId: folder.room_id,
      name: folder.name,
      parentFolderId: folder.parent_folder_id,
      createdAt: new Date(folder.created_at),
      createdBy: folder.created_by,
      files: [],
      subfolders: []
    }));

    totalFiles += roomFiles.length;
    totalStorage += roomFiles.reduce((sum, file) => sum + file.size, 0);

    return {
      id: room.id,
      key: room.key,
      name: room.name,
      createdAt: new Date(room.created_at),
      createdBy: room.created_by,
      files: roomFiles,
      folders: roomFolders
    };
  });

  return {
    id: user.id,
    email: user.email!,
    rooms: processedRooms,
    totalFiles,
    totalStorage
  };
};

// Delete user account
export const deleteUserAccount = async (): Promise<void> => {
  // First delete all user's files from storage
  const { data: rooms } = await supabase
    .from('rooms')
    .select('key')
    .eq('created_by', (await supabase.auth.getUser()).data.user?.id);

  if (rooms) {
    for (const room of rooms) {
      // Delete all files in the room's storage folder
      const { data: files } = await supabase.storage
        .from('room-files')
        .list(room.key);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${room.key}/${file.name}`);
        await supabase.storage
          .from('room-files')
          .remove(filePaths);
      }
    }
  }

  // Delete user account (this will cascade delete rooms, folders, and files due to foreign key constraints)
  const { error } = await supabase.auth.admin.deleteUser(
    (await supabase.auth.getUser()).data.user?.id!
  );

  if (error) {
    throw new Error(error.message);
  }
};

// Delete a specific room
export const deleteRoom = async (roomId: string): Promise<void> => {
  // Get room info first
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('key')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    throw new Error('Room not found');
  }

  // Delete all files in storage for this room
  const { data: files } = await supabase.storage
    .from('room-files')
    .list(room.key);

  if (files && files.length > 0) {
    const filePaths = files.map(file => `${room.key}/${file.name}`);
    await supabase.storage
      .from('room-files')
      .remove(filePaths);
  }

  // Delete room (this will cascade delete folders and files due to foreign key constraints)
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId);

  if (error) {
    throw new Error(error.message);
  }
};

// Delete a specific file
export const deleteUserFile = async (fileId: string): Promise<void> => {
  // Get file info first
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('url, room_id')
    .eq('id', fileId)
    .single();

  if (fileError || !file) {
    throw new Error('File not found');
  }

  // Get room key for storage path
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('key')
    .eq('id', file.room_id)
    .single();

  if (roomError || !room) {
    throw new Error('Room not found');
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
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw new Error(`Failed to delete file: ${dbError.message}`);
  }
};