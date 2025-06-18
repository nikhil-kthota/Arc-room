import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DoorOpen } from 'lucide-react';
import { getRoomByKey, verifyRoomPin } from '../services/roomService';

export function EnterRoomPage() {
  const [roomKey, setRoomKey] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!roomKey.trim()) {
      setError('Room key is required');
      return;
    }
    
    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if room exists
      const room = await getRoomByKey(roomKey.toLowerCase());
      
      if (!room) {
        setError('Room not found');
        return;
      }
      
      // Verify PIN
      const isPinValid = await verifyRoomPin(roomKey.toLowerCase(), pin);
      
      if (!isPinValid) {
        setError('Invalid PIN');
        return;
      }
      
      // Store PIN in session storage to avoid asking again during this session
      sessionStorage.setItem(`room_pin_${roomKey.toLowerCase()}`, pin);
      
      // Navigate to room
      navigate(`/room/${roomKey.toLowerCase()}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to enter room');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-100 text-primary-600 rounded-full p-3">
            <DoorOpen className="w-6 h-6" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Enter a Room</h1>
        
        <p className="text-gray-600 text-center mb-8">
          Enter the room key and PIN to access shared files.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Room Key"
            value={roomKey}
            onChange={(e) => setRoomKey(e.target.value)}
            required
            placeholder="project-alpha"
          />
          
          <Input
            label="Room PIN (4 digits)"
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 4))}
            required
            pattern="\d{4}"
            placeholder="1234"
            maxLength={4}
          />
          
          <div>
            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              Enter Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}