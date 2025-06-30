import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen stadium-background flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="glass-card p-12 text-center max-w-md mx-4 relative z-10">
        <div className="mb-8">
          <div className="text-6xl font-bold text-white mb-4 opacity-90">404</div>
          <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-white/80 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🏠 Back to Home
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button 
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              👤 Go to Profile
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-white/60 text-sm">
            Tried to access: <code className="text-green-400">{location.pathname}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
