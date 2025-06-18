import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FolderPlus, Key, Pin } from 'lucide-react';
import { createRoom } from '../services/roomService';

export function CreateRoomPage() {
  const [roomName, setRoomName] = useState('');
  const [roomKey, setRoomKey] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a room');
      return;
    }
    
    // Basic validation
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    
    if (!roomKey.trim()) {
      setError('Room key is required');
      return;
    }
    
    // Validate room key format (alphanumeric, hyphens, no spaces)
    if (!/^[a-zA-Z0-9-]+$/.test(roomKey)) {
      setError('Room key can only contain letters, numbers, and hyphens');
      return;
    }
    
    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const room = await createRoom(
        user.id,
        roomKey.toLowerCase(),
        roomName,
        pin
      );
      
      // Store PIN in session storage for immediate access
      sessionStorage.setItem(`room_pin_${room.key}`, pin);
      
      navigate(`/room/${room.key}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-xl mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-100 text-primary-600 rounded-full p-3">
            <FolderPlus className="w-6 h-6" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Create a New Room</h1>
        
        <p className="text-gray-600 text-center mb-8">
          Create a secure room to store and share your files with custom access controls.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            placeholder="Project Files, Team Documents, etc."
            helperText="A descriptive name for your room"
          />
          
          <div className="space-y-1">
            <Input
              label="Room Key"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value)}
              required
              placeholder="project-alpha"
              helperText="Used in the URL for accessing your room. Only use letters, numbers, and hyphens."
            />
          </div>
          
          <div className="space-y-1">
            <Input
              label="Room PIN (4 digits)"
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 4))}
              required
              pattern="\d{4}"
              placeholder="1234"
              maxLength={4}
              helperText="This 4-digit PIN will be required to access the room"
            />
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              Create Room
            </Button>
          </div>
        </form>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Security Note</h3>
          <p className="text-sm text-blue-700">
            Anyone with both your room key and PIN will be able to access files in this room. Choose a unique PIN and only share it with people you trust.
          </p>
        </div>
      </div>
    </div>
  );
}