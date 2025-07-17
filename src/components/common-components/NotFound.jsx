import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 bg-[#8929fe] opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#8929fe]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-6 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
            <p className="text-xl font-semibold text-gray-700 mt-2">Page Not Found</p>
            <p className="mt-3 text-base text-gray-500">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#8929fe] hover:bg-[#7620e0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8929fe]"
            >
              {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;