```ts
export interface Room {
  id: string;
  key: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  files: FileItem[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
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
```