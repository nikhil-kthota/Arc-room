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

// Get folders for a room
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

// Delete a folder
export const deleteFolder = async (folderId: string): Promise<void> => {
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
  const { error } = await supabase
    .from('files')
    .update({ folder_id: folderId })
    .eq('id', fileId);

  if (error) {
    throw new Error(error.message);
  }
};