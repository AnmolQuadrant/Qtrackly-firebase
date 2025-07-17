// ProtectedRoute.jsx - Improved Version
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./common-components/LoadingSpinner";

const ProtectedRoute = ({ requiredRole }) => {
  const { 
    isAuthenticated, 
    authState, 
    isInitialized, 
    hasRole, 
    error, 
    retry 
  } = useAuth();

  console.log("ProtectedRoute Check:", {
    isAuthenticated,
    authState,
    isInitialized,
    requiredRole,
    error
  });

  // Show loading while authentication is being processed
  if (!isInitialized || authState === 'loading') {
    return <LoadingSpinner message="Verifying access..." />;
  }

  // Handle authentication errors
  if (error && authState === 'error') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">
            Authentication Error
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3">
            <button
              onClick={retry}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Redirecting to login - not authenticated");
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`ProtectedRoute: Access denied for role ${requiredRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("ProtectedRoute: Access granted");
  return <Outlet />;
};

export default ProtectedRoute;