import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-md mx-auto py-16 px-4 text-center animate-fade-in">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Go to Home Page
      </Button>
    </div>
  );
}