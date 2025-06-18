import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Folder, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-semibold text-xl">
          <Folder className="w-6 h-6" />
          <span>ArcRoom</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link to="/enter-room" className="text-gray-700 hover:text-blue-600 transition-colors">
            Enter Room
          </Link>
          {user ? (
            <Link to="/create-room" className="text-gray-700 hover:text-blue-600 transition-colors">
              Create Room
            </Link>
          ) : null}
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Profile Icon with Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 transition-colors"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                
                {/* Dropdown on Hover */}
                {showProfileDropdown && (
                  <div 
                    className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-20"
                    onMouseEnter={() => setShowProfileDropdown(true)}
                    onMouseLeave={() => setShowProfileDropdown(false)}
                  >
                    <div className="text-sm text-gray-600 mb-2">Signed in as:</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => navigate('/profile')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}