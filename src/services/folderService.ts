import { supabase } from '../lib/supabase';
import { Folder } from '../types';

// Create a new folder
export const createFolder = async (
  roomId: string,
  folderName: string,
  parentFolderId?: string
): Promise<Folder> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('folders')
    .insert({
      room_id: roomId,
      name: folderName,
      parent_folder_id: parentFolderId,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    roomId: data.room_id,
    name: data.name,
    parentFolderId: data.parent_folder_id,
    createdAt: new Date(data.created_at),
    createdBy: data.created_by,
    files: [],
    subfolders: []
  };
};

// Get folders for a room with proper hierarchy
export const getFoldersForRoom = async (roomId: string): Promise<Folder[]> => {
  const { data, error } = await supabase
    .from('folders')
    .select(`
      *,
      files (*)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Build folder hierarchy
  const folderMap = new Map<string, Folder>();
  const rootFolders: Folder[] = [];

  // First pass: create all folder objects
  data.forEach(folderData => {
    const folder: Folder = {
      id: folderData.id,
      roomId: folderData.room_id,
      name: folderData.name,
      parentFolderId: folderData.parent_folder_id,
      createdAt: new Date(folderData.created_at),
      createdBy: folderData.created_by,
      files: folderData.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        uploadedAt: new Date(file.uploaded_at),
        folderId: file.folder_id
      })),
      subfolders: []
    };
    folderMap.set(folder.id, folder);
  });

  // Second pass: build hierarchy
  folderMap.forEach(folder => {
    if (folder.parentFolderId) {
      const parent = folderMap.get(folder.parentFolderId);
      if (parent) {
        parent.subfolders.push(folder);
      }
    } else {
      rootFolders.push(folder);
    }
  });

  return rootFolders;
};

// Delete a folder and move its files to parent or root
export const deleteFolder = async (folderId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get folder info first
  const { data: folder, error: folderError } = await supabase
    .from('folders')
    .select('parent_folder_id, room_id')
    .eq('id', folderId)
    .single();

  if (folderError) {
    throw new Error(folderError.message);
  }

  // Move all files in this folder to the parent folder (or root if no parent)
  const { error: moveError } = await supabase
    .from('files')
    .update({ folder_id: folder.parent_folder_id })
    .eq('folder_id', folderId);

  if (moveError) {
    throw new Error('Failed to move files from folder: ' + moveError.message);
  }

  // Move all subfolders to the parent folder (or root if no parent)
  const { error: moveSubfoldersError } = await supabase
    .from('folders')
    .update({ parent_folder_id: folder.parent_folder_id })
    .eq('parent_folder_id', folderId);

  if (moveSubfoldersError) {
    throw new Error('Failed to move subfolders: ' + moveSubfoldersError.message);
  }

  // Delete the folder
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    throw new Error(error.message);
  }
};

// Move file to folder
export const moveFileToFolder = async (fileId: string, folderId?: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user has permission to move the file
  const { data: fileData, error: fileError } = await supabase
    .from('files')
    .select(`
      *,
      rooms!inner(created_by)
    `)
    .eq('id', fileId)
    .single();

  if (fileError || !fileData) {
    throw new Error('File not found');
  }

  if (fileData.rooms.created_by !== user.id) {
    throw new Error('Permission denied');
  }

  // If moving to a folder, verify the folder exists and belongs to the same room
  if (folderId) {
    const { data: folderData, error: folderError } = await supabase
      .from('folders')
      .select('room_id')
      .eq('id', folderId)
      .single();

    if (folderError || !folderData) {
      throw new Error('Folder not found');
    }

    if (folderData.room_id !== fileData.room_id) {
      throw new Error('Cannot move file to folder in different room');
    }
  }

  // Move the file
  const { error } = await supabase
    .from('files')
    .update({ folder_id: folderId })
    .eq('id', fileId);

  if (error) {
    throw new Error(error.message);
  }
};

// Move multiple files to folder
export const moveFilesToFolder = async (fileIds: string[], folderId?: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify all files belong to user's rooms
  const { data: filesData, error: filesError } = await supabase
    .from('files')
    .select(`
      id,
      room_id,
      rooms!inner(created_by)
    `)
    .in('id', fileIds);

  if (filesError) {
    throw new Error('Failed to verify file permissions');
  }

  // Check permissions for all files
  const unauthorizedFiles = filesData.filter(file => file.rooms.created_by !== user.id);
  if (unauthorizedFiles.length > 0) {
    throw new Error('Permission denied for some files');
  }

  // If moving to a folder, verify the folder exists and all files belong to the same room
  if (folderId) {
    const { data: folderData, error: folderError } = await supabase
      .from('folders')
      .select('room_id')
      .eq('id', folderId)
      .single();

    if (folderError || !folderData) {
      throw new Error('Folder not found');
    }

    // Check if all files belong to the same room as the folder
    const invalidFiles = filesData.filter(file => file.room_id !== folderData.room_id);
    if (invalidFiles.length > 0) {
      throw new Error('Cannot move files to folder in different room');
    }
  }

  // Move all files
  const { error } = await supabase
    .from('files')
    .update({ folder_id: folderId })
    .in('id', fileIds);

  if (error) {
    throw new Error(error.message);
  }
};

// Get folder path (breadcrumb)
export const getFolderPath = async (folderId: string): Promise<Folder[]> => {
  const path: Folder[] = [];
  let currentFolderId: string | null = folderId;

  while (currentFolderId) {
    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', currentFolderId)
      .single();

    if (error || !folder) {
      break;
    }

    path.unshift({
      id: folder.id,
      roomId: folder.room_id,
      name: folder.name,
      parentFolderId: folder.parent_folder_id,
      createdAt: new Date(folder.created_at),
      createdBy: folder.created_by,
      files: [],
      subfolders: []
    });

    currentFolderId = folder.parent_folder_id;
  }

  return path;
};