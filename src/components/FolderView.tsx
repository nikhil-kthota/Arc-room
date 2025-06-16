import { useState } from 'react';
import { Folder, FileItem } from '../types';
import { 
  FolderIcon, 
  FileIcon, 
  Plus, 
  Trash2, 
  Download, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Upload,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface FolderViewProps {
  folders: Folder[];
  files: FileItem[];
  currentPath: string[];
  isOwner: boolean;
  onCreateFolder: (name: string, parentFolderId?: string) => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onFileSelect: (file: FileItem) => void;
  onDeleteFile: (fileId: string, fileName: string) => void;
  onUploadToFolder: (folderId?: string) => void;
  selectedFileId?: string;
  selectedFiles?: Set<string>;
  onToggleFileSelection?: (fileId: string) => void;
}

export function FolderView({
  folders,
  files,
  currentPath,
  isOwner,
  onCreateFolder,
  onDeleteFolder,
  onFileSelect,
  onDeleteFile,
  onUploadToFolder,
  selectedFileId,
  selectedFiles = new Set(),
  onToggleFileSelection
}: FolderViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parentFolderId?: string) => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), parentFolderId);
      setNewFolderName('');
      setShowCreateFolder(null);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileTypeIcon = (file: FileItem) => {
    const type = file.type.toLowerCase();
    
    if (type.includes('image')) {
      return <FileIcon className="w-5 h-5 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileIcon className="w-5 h-5 text-red-500" />;
    } else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('xlsx')) {
      return <FileIcon className="w-5 h-5 text-green-500" />;
    } else if (type.includes('presentation') || type.includes('powerpoint') || type.includes('pptx')) {
      return <FileIcon className="w-5 h-5 text-orange-500" />;
    } else {
      return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const paddingLeft = level * 1.5;

    return (
      <div key={folder.id}>
        <div 
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${paddingLeft}rem` }}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <FolderIcon className="w-5 h-5 text-blue-500" />
          
          <span className="flex-1 text-sm font-medium text-gray-700">
            {folder.name}
          </span>
          
          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateFolder(folder.id);
                }}
                className="p-1 text-gray-500 hover:text-primary-600 rounded"
                title="Create subfolder"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadToFolder(folder.id);
                }}
                className="p-1 text-gray-500 hover:text-primary-600 rounded"
                title="Upload to folder"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id, folder.name);
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded"
                title="Delete folder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Create folder input */}
        {showCreateFolder === folder.id && (
          <div className="ml-8 mb-2">
            <div className="flex gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder(folder.id);
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => handleCreateFolder(folder.id)}
                disabled={!newFolderName.trim()}
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCreateFolder(null);
                  setNewFolderName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Folder contents */}
        {isExpanded && (
          <div>
            {/* Files in this folder */}
            {folder.files.map(file => (
              <div
                key={file.id}
                className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer ${
                  selectedFileId === file.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                }`}
                style={{ paddingLeft: `${paddingLeft + 2}rem` }}
              >
                {/* Selection checkbox */}
                {onToggleFileSelection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFileSelection(file.id);
                    }}
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      selectedFiles.has(file.id) 
                        ? 'bg-primary-600 border-primary-600 text-white' 
                        : 'border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {selectedFiles.has(file.id) && <Check className="w-3 h-3" />}
                  </button>
                )}
                
                <div onClick={() => onFileSelect(file)} className="flex items-center gap-2 flex-1">
                  {getFileTypeIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.url, '_blank');
                    }}
                    className="p-1 text-gray-500 hover:text-primary-600 rounded"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(file.url, file.name);
                    }}
                    className="p-1 text-gray-500 hover:text-primary-600 rounded"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id, file.name);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Subfolders */}
            {folder.subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Root level create folder */}
      {isOwner && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateFolder('root')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUploadToFolder()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </div>
      )}

      {/* Create root folder input */}
      {showCreateFolder === 'root' && (
        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => handleCreateFolder()}
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCreateFolder(null);
                setNewFolderName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Root level files */}
      {files.map(file => (
        <div
          key={file.id}
          className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer ${
            selectedFileId === file.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
          }`}
        >
          {/* Selection checkbox */}
          {onToggleFileSelection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFileSelection(file.id);
              }}
              className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                selectedFiles.has(file.id) 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              {selectedFiles.has(file.id) && <Check className="w-3 h-3" />}
            </button>
          )}
          
          <div onClick={() => onFileSelect(file)} className="flex items-center gap-2 flex-1">
            {getFileTypeIcon(file)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(file.url, '_blank');
              }}
              className="p-1 text-gray-500 hover:text-primary-600 rounded"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(file.url, file.name);
              }}
              className="p-1 text-gray-500 hover:text-primary-600 rounded"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id, file.name);
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Folders */}
      {folders.map(folder => renderFolder(folder))}

      {/* Empty state */}
      {folders.length === 0 && files.length === 0 && (
        <div className="text-center py-8">
          <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No files or folders yet</p>
          {isOwner && (
            <p className="text-gray-500 text-sm mt-1">
              Create folders to organize your files
            </p>
          )}
        </div>
      )}
    </div>
  );
}