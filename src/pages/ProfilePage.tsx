import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  User, 
  Folder, 
  FileIcon, 
  Trash2, 
  Download, 
  ExternalLink,
  AlertTriangle,
  HardDrive,
  Calendar,
  Users
} from 'lucide-react';
import { getUserProfile, deleteRoom, deleteUserFile, deleteUserAccount } from '../services/userService';
import { UserProfile } from '../types';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'room' | 'file' | 'account';
    id?: string;
    name: string;
  } | null>(null);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(user.id);
      setProfile(profileData);
    } catch (err) {
      setError((err as Error).message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      setDeleteConfirmation(null);
      await loadProfile(); // Refresh profile
    } catch (err) {
      setError((err as Error).message || 'Failed to delete room');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteUserFile(fileId);
      setDeleteConfirmation(null);
      await loadProfile(); // Refresh profile
    } catch (err) {
      setError((err as Error).message || 'Failed to delete file');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirm !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    try {
      await deleteUserAccount();
      logout();
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Failed to delete account');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
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

  if (loading) {
    return (
      <div className="container py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary-100 text-primary-600 rounded-full p-3">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Folder className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Rooms</p>
                <p className="text-2xl font-bold text-blue-900">{profile.rooms.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileIcon className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Total Files</p>
                <p className="text-2xl font-bold text-green-900">{profile.totalFiles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-purple-900">{formatFileSize(profile.totalStorage)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User's Rooms */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            My Rooms ({profile.rooms.length})
          </h2>
          
          {profile.rooms.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No rooms created yet</p>
              <Button 
                onClick={() => navigate('/create-room')}
                className="mt-4"
              >
                Create Your First Room
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.rooms.map(room => (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        Key: {room.key} • {room.files.length} files • Created {room.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/room/${room.key}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteConfirmation({
                          type: 'room',
                          id: room.id,
                          name: room.name
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User's Files */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileIcon className="w-5 h-5" />
            My Files ({profile.totalFiles})
          </h2>
          
          {profile.totalFiles === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {profile.rooms.map(room => 
                room.files.map(file => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {room.name} • {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-1 text-gray-500 hover:text-primary-600 rounded"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(file.url, file.name)}
                          className="p-1 text-gray-500 hover:text-primary-600 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation({
                            type: 'file',
                            id: file.id,
                            name: file.name
                          })}
                          className="p-1 text-gray-500 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setDeleteConfirmation({
                type: 'account',
                name: 'your account'
              })}
            >
              Delete Account
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Logout</h3>
              <p className="text-sm text-gray-600">
                Sign out of your account on this device.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {deleteConfirmation.type === 'account' ? 'Delete Account' : 
                 deleteConfirmation.type === 'room' ? 'Delete Room' : 'Delete File'}
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete {deleteConfirmation.name}?
              </p>
              {deleteConfirmation.type === 'account' && (
                <div className="text-left">
                  <p className="text-sm text-red-600 mb-4">
                    This will permanently delete all your rooms, files, and account data. This action cannot be undone.
                  </p>
                  <Input
                    label='Type "DELETE" to confirm'
                    value={deleteAccountConfirm}
                    onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteConfirmation(null);
                  setDeleteAccountConfirm('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (deleteConfirmation.type === 'account') {
                    handleDeleteAccount();
                  } else if (deleteConfirmation.type === 'room' && deleteConfirmation.id) {
                    handleDeleteRoom(deleteConfirmation.id);
                  } else if (deleteConfirmation.type === 'file' && deleteConfirmation.id) {
                    handleDeleteFile(deleteConfirmation.id);
                  }
                }}
              >
                Delete {deleteConfirmation.type === 'account' ? 'Account' : 
                       deleteConfirmation.type === 'room' ? 'Room' : 'File'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}