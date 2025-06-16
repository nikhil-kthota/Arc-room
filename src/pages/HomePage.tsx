import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { HardDrive, Upload, Shield, Eye } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-800 text-white">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Secure File Storage & Sharing Made Simple
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Create secure rooms with custom keys and PIN protection to share and view files directly in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  onClick={() => navigate('/create-room')}
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  Create a Room
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/register')}
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  Get Started
                </Button>
              )}
              <Button 
                onClick={() => navigate('/enter-room')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Enter a Room
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <div className="bg-primary-100 text-primary-700 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Rooms</h3>
              <p className="text-gray-600">
                Create private rooms with custom keys for organized file storage.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <div className="bg-primary-100 text-primary-700 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">PIN Protection</h3>
              <p className="text-gray-600">
                Secure your rooms with a 4-digit PIN for extra protection.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <div className="bg-primary-100 text-primary-700 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Uploading</h3>
              <p className="text-gray-600">
                Drag and drop to upload files or select them from your device.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <div className="bg-primary-100 text-primary-700 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">In-Browser Viewing</h3>
              <p className="text-gray-600">
                View different file types directly in your browser without downloading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center h-full">
                  <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create a Room</h3>
                  <p className="text-gray-600">
                    Register an account and create a room with a custom key and PIN.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M39.5303 6.53033C39.8232 6.23744 39.8232 5.76256 39.5303 5.46967L34.7574 0.696699C34.4645 0.403806 33.9896 0.403806 33.6967 0.696699C33.4038 0.989593 33.4038 1.46447 33.6967 1.75736L37.9393 6L33.6967 10.2426C33.4038 10.5355 33.4038 11.0104 33.6967 11.3033C33.9896 11.5962 34.4645 11.5962 34.7574 11.3033L39.5303 6.53033ZM0 6.75H39V5.25H0V6.75Z" fill="#CBD5E1"/>
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center h-full">
                  <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Files</h3>
                  <p className="text-gray-600">
                    Add files to your room - supports images, documents, spreadsheets, and more.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M39.5303 6.53033C39.8232 6.23744 39.8232 5.76256 39.5303 5.46967L34.7574 0.696699C34.4645 0.403806 33.9896 0.403806 33.6967 0.696699C33.4038 0.989593 33.4038 1.46447 33.6967 1.75736L37.9393 6L33.6967 10.2426C33.4038 10.5355 33.4038 11.0104 33.6967 11.3033C33.9896 11.5962 34.4645 11.5962 34.7574 11.3033L39.5303 6.53033ZM0 6.75H39V5.25H0V6.75Z" fill="#CBD5E1"/>
                  </svg>
                </div>
              </div>
              
              <div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center h-full">
                  <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Share Access</h3>
                  <p className="text-gray-600">
                    Share your room key and PIN with others to give them access to view files.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Create your first secure room today and start sharing files with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button 
                onClick={() => navigate('/create-room')}
                size="lg"
                className="bg-white text-primary-700 hover:bg-gray-100"
              >
                Create a Room
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-white text-primary-700 hover:bg-gray-100"
              >
                Create an Account
              </Button>
            )}
            <Button 
              onClick={() => navigate('/enter-room')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              Enter a Room
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}