export interface Room {
  id: string;
  key: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  files: FileItem[];
  folders: Folder[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  folderId?: string;
}

export interface Folder {
  id: string;
  roomId: string;
  name: string;
  parentFolderId?: string;
  createdAt: Date;
  createdBy: string;
  files: FileItem[];
  subfolders: Folder[];
}

export interface RoomPin {
  roomKey: string;
  pin: string;
}

export interface UserProfile {
  id: string;
  email: string;
  rooms: Room[];
  totalFiles: number;
  totalStorage: number;
}