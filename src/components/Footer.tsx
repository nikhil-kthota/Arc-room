import { Link } from 'react-router-dom';
import { HardDrive } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <HardDrive className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-semibold text-white">FileVault</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/enter-room" className="hover:text-blue-400 transition-colors">
              Enter Room
            </Link>
            <Link to="/create-room" className="hover:text-blue-400 transition-colors">
              Create Room
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; {currentYear} FileVault. All rights reserved.</p>
          <p className="mt-2">
            Securely share and access files with custom room keys and PIN protection.
          </p>
        </div>
      </div>
    </footer>
  );
}