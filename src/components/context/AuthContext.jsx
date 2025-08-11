// AuthContext.jsx - Improved Version
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, apiRequest as msalApiRequest, graphRequest } from "../../../msalConfig";
import { testApiConnection, apiRequest } from "../services/apiService";

const AuthContext = createContext();

// Auth states
const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error'
};

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  
  // State management
  const [authState, setAuthState] = useState(AUTH_STATES.IDLE);
  const [userRoles, setUserRoles] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Token acquisition with better error handling
  const acquireToken = useCallback(async (scopeType = "api") => {
    if (!accounts[0]) {
      throw new Error("No active account found. Please sign in again.");
    }

    const request = scopeType === "graph" 
      ? { ...graphRequest, account: accounts[0] } 
      : { ...msalApiRequest, account: accounts[0] };

    try {
      const response = await instance.acquireTokenSilent(request);
      console.log(`Token acquired successfully for ${scopeType}`);
      return response.accessToken;
    } catch (error) {
      console.error(`Token acquisition failed for ${scopeType}:`, error);
      
      if (error.name === "InteractionRequiredAuthError") {
        console.log("Interaction required, redirecting...");
        await instance.acquireTokenRedirect(request);
        return null; // Will redirect, so no return value needed
      }
      throw error;
    }
  }, [instance, accounts]);

  // User profile and roles fetching
  const fetchUserData = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    if (!isAuthenticated || !accounts[0]) {
      setAuthState(AUTH_STATES.IDLE);
      return;
    }

    try {
      setAuthState(AUTH_STATES.LOADING);
      setError(null);

      // Get API token
      const apiToken = await acquireToken("api");
      if (!apiToken) return; // Token acquisition redirected

      // Fetch user roles and profile
      const response = await testApiConnection(apiToken);
      console.log("User data fetched:", response);

      // Set user roles with fallback
      const roles = response.roles && response.roles.length > 0 
        ? response.roles 
        : ["user"];
      
      setUserRoles(roles);

      // Set user data
      setUser({
        id: accounts[0].localAccountId,
        username: accounts[0].username,
        name: accounts[0].name,
        email: accounts[0].username,
        roles: roles
      });

      // Save user profile to backend
      try {
        await apiRequest("GET", "/api/user/profile", apiToken);
        console.log("User profile synchronized with backend");
      } catch (profileError) {
        console.warn("Profile sync failed:", profileError);
        // Non-critical error, don't throw
      }

      setAuthState(AUTH_STATES.AUTHENTICATED);
      setIsInitialized(true);

    } catch (error) {
      console.error("Error fetching user data:", error);
      
      // Handle specific error cases
      if (error.message.includes("403") || error.message.includes("consent")) {
        setError("Additional permissions required. Please re-authenticate.");
        await instance.loginRedirect({ ...loginRequest, prompt: "consent" });
        return;
      }

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying user data fetch (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => fetchUserData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      // Final fallback - set default user role
      console.warn("Using fallback user role after retries");
      setUserRoles(["user"]);
      setUser({
        id: accounts[0].localAccountId,
        username: accounts[0].username,
        name: accounts[0].name,
        email: accounts[0].username,
        roles: ["user"]
      });
      setError(`Failed to load user permissions: ${error.message}`);
      setAuthState(AUTH_STATES.AUTHENTICATED);
      setIsInitialized(true);
    }
  }, [isAuthenticated, accounts, acquireToken, instance]);

  // Initialize user data when authenticated
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0 && !isInitialized) {
      fetchUserData();
    } else if (!isAuthenticated) {
      // Reset state when not authenticated
      setAuthState(AUTH_STATES.IDLE);
      setUserRoles([]);
      setUser(null);
      setError(null);
      setIsInitialized(false);
    }
  }, [isAuthenticated, accounts, isInitialized, fetchUserData]);

  // Login function
  const login = useCallback(async () => {
    try {
      setError(null);
      setAuthState(AUTH_STATES.LOADING);
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
      setAuthState(AUTH_STATES.ERROR);
    }
  }, [instance]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setError(null);
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin
      });
    } catch (error) {
      console.error("Logout error:", error);
      setError("Logout failed. Please try again.");
    }
  }, [instance]);

  // Get user's primary role for navigation
  const getPrimaryRole = useCallback(() => {
    if (userRoles.includes("admin")) return "admin";
    if (userRoles.includes("manager")) return "manager";
    return "user";
  }, [userRoles]);

  // Check if user has specific role
  // const hasRole = useCallback((role) => {
  //   const normalizedUserRoles = userRoles.map(r => r.toLowerCase());
  //   const normalizedRole = role.toLowerCase();
    
  //   // Admin has access to all roles
  //   if (normalizedUserRoles.includes("admin")) return true;
    
  //   // Manager has access to user role
  //   if (normalizedRole === "user" && normalizedUserRoles.includes("manager")) return true;
    
  //   return normalizedUserRoles.includes(normalizedRole);
  // }, [userRoles]);

  const hasRole = useCallback((role) => {
  // Handle edge cases
  if (!userRoles || userRoles.length === 0) return false;
  if (!role) return false;

  const normalizedUserRoles = userRoles.map(r => r.toLowerCase());
  
  // Handle array input
  if (Array.isArray(role)) {
    const normalizedRoles = role.map(r => r.toLowerCase());
    
    // Admin has access to all roles
    if (normalizedUserRoles.includes("admin")) return true;
    
    // Check if user has any of the required roles
    return normalizedRoles.some(requiredRole => {
      // Manager has access to user role
      if (requiredRole === "user" && normalizedUserRoles.includes("manager")) return true;
      
      return normalizedUserRoles.includes(requiredRole);
    });
  }
  
  // Handle string input (your original logic)
  const normalizedRole = role.toLowerCase();
  
  // Admin has access to all roles
  if (normalizedUserRoles.includes("admin")) return true;
  
  // Manager has access to user role
  if (normalizedRole === "user" && normalizedUserRoles.includes("manager")) return true;
  
  return normalizedUserRoles.includes(normalizedRole);
}, [userRoles]);

  // Retry failed operations
  const retry = useCallback(() => {
    if (isAuthenticated && accounts.length > 0) {
      fetchUserData();
    } else {
      login();
    }
  }, [isAuthenticated, accounts, fetchUserData, login]);

  const contextValue = {
    // State
    isAuthenticated,
    authState,
    user,
    userRoles,
    isLoading: authState === AUTH_STATES.LOADING,
    isInitialized,
    error,
    
    // Actions
    login,
    logout,
    acquireToken,
    retry,
    
    // Utilities
    getPrimaryRole,
    hasRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;










