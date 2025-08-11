
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { AuthProvider } from "./components/context/AuthContext";
import { UserProvider } from "./components/context/UserContext";
import { useAuth } from "./components/context/AuthContext";
import { msalInstance } from "../msalConfig";
 
// Components
import Login from "./components/Auth/Login";
import UserView from "./components/TaskModuleComponents/UserComponents/UserView";
import NotFound from "./components/common-components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/common-components/LoadingSpinner";
import Header from "./components/common-components/Header";
import ManagerDashboard from "./components/TaskModuleComponents/Manager/ManagerDashboard";
import DependencyRequests from "./components/TaskModuleComponents/UserComponents/DependencyRequests";
import UserFlowLanding from "./components/TaskModuleComponents/UserComponents/UserFlowLanding";
import DepartmentSelector from "./components/TaskModuleComponents/UserComponents/DepartmentSelector";
 
// Placeholder components (in case Dashboard or Profile are needed later)
//const Dashboard = () => <div className="p-4">User Dashboard (Placeholder)</div>;
//const Profile = () => <div className="p-4">User Profile (Placeholder)</div>;
 
// Root component with authentication-based redirection
 
// Root component with authentication-based redirection - Updated
const Root = () => {
  const { isAuthenticated, user, authState, isInitialized } = useAuth();
 
  if (!isInitialized || authState === 'loading') {
    return <LoadingSpinner message="Checking authentication..." />;
  }
 
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
 
  // Let Login component handle first-time user detection and navigation
  // This component now just ensures authenticated users don't stay on root
  return <UserFlowLanding />;
};
 
function App() {
  const [isMsalInitialized, setIsMsalInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
 
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
       
        // Handle redirect response and log token claims for debugging
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log("Authentication redirect handled successfully");
          console.log("Token claims:", response.idTokenClaims);
          console.log("Roles in token:", response.idTokenClaims?.roles || "No roles found");
        }
       
        setIsMsalInitialized(true);
      } catch (error) {
        console.error("MSAL initialization failed:", error);
        setInitializationError(error.message);
      }
    };
 
    initializeMsal();
  }, []);
 
  // Show loading during MSAL initialization
  if (!isMsalInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        {initializationError ? (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <div className="text-red-600 text-xl font-semibold mb-4">
              Authentication Error
            </div>
            <p className="text-gray-600 mb-4">{initializationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <LoadingSpinner message="Initializing authentication..." />
        )}
      </div>
    );
  }
 
  // Layout wrapper for protected routes with Header
  const ProtectedLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
 
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/department-selector" element={<DepartmentSelector />} />
               
                {/* Root Route */}
                <Route path="/" element={<UserFlowLanding />} />
               
                {/* Protected Routes - User Level */}
                <Route element={<ProtectedRoute requiredRole="user" />}>
                  {/* <Route path="/dashboard" element={
                    <ProtectedLayout>
                      <UserView/>
                    </ProtectedLayout>
                  } />
                  <Route path="/profile" element={
                    <ProtectedLayout>
                      <UserView />
                    </ProtectedLayout>
                  } /> */}
                  <Route path="/tasks" element={
                    <ProtectedLayout>
                      <UserView />
                    </ProtectedLayout>
                  } />
                </Route>
               
                {/* Protected Routes - Manager Level */}
                <Route element={<ProtectedRoute requiredRole="manager" />}>
                  <Route path="/manager" element={
                    <ProtectedLayout>
                      <ManagerDashboard />
                    </ProtectedLayout>
                  } />
                </Route>
               
                {/* Protected Routes - Admin Level */}
                <Route element={<ProtectedRoute requiredRole={["admin","user"]} />}>
                  <Route path="/admin" element={
                    <ProtectedLayout>
                      <UserView />
                    </ProtectedLayout>
                  } />
                  <Route path="/admin/dependency" element={
                    <ProtectedLayout>
                      <DependencyRequests />
                    </ProtectedLayout>
                  } />
                </Route>
               
                {/* Error Routes */}
                <Route path="/unauthorized" element={
                  <div className="flex items-center justify-center h-screen">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                      <div className="text-red-600 text-2xl font-bold mb-4">
                        Access Denied
                      </div>
                      <p className="text-gray-600 mb-6">
                        You don't have permission to access this page.
                      </p>
                      <button
                        onClick={() => window.history.back()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mr-2"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Dashboard
                      </button>
                    </div>
                  </div>
                } />
               
                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </MsalProvider>
  );
}
 
export default App;
 