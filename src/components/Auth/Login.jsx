// // Login.jsx - Improved Version
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Logo from "../../../assets/Logo.png";

// const Login = () => {
//   const [loginState, setLoginState] = useState("idle"); // idle, loading, success, error
//   const [errorMessage, setErrorMessage] = useState(null);
//   const navigate = useNavigate();
  
//   const { 
//     isAuthenticated, 
//     authState, 
//     login, 
//     getPrimaryRole, 
//     isInitialized,
//     error: authError 
//   } = useAuth();

//   // Handle successful authentication and navigation
//   useEffect(() => {
//     if (isAuthenticated && isInitialized && authState === 'authenticated') {
//       setLoginState("success");
      
//       // Navigate based on user role after a brief success display
//       const timer = setTimeout(() => {
//         const primaryRole = getPrimaryRole();
//         const navigationMap = {
//           admin: "/admin",
//           manager: "/manager", 
//           user: "/admin"
//         };
        
//         const destination = navigationMap[primaryRole] || "/dashboard";
//         console.log(`Navigating to ${destination} for role: ${primaryRole}`);
//         navigate(destination, { replace: true });
//       }, 1500);

//       return () => clearTimeout(timer);
//     }
//   }, [isAuthenticated, isInitialized, authState, navigate, getPrimaryRole]);

//   // Handle authentication errors
//   useEffect(() => {
//     if (authError) {
//       setLoginState("error");
//       setErrorMessage(authError);
//     }
//   }, [authError]);

//   // Handle URL error parameters (from OAuth redirect)
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const errorParam = urlParams.get("error");
//     const errorDescription = urlParams.get("error_description");

//     if (errorParam) {
//       console.error("OAuth error:", errorParam, errorDescription);
//       setLoginState("error");
//       setErrorMessage(errorDescription || errorParam);
      
//       // Clean up URL
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);

//   const handleLogin = async () => {
//     try {
//       setLoginState("loading");
//       setErrorMessage(null);
//       await login();
//     } catch (error) {
//       console.error("Login failed:", error);
//       setLoginState("error");
//       setErrorMessage("Authentication failed. Please try again.");
//     }
//   };

//   const handleRetry = () => {
//     setLoginState("idle");
//     setErrorMessage(null);
//   };

//   // Microsoft logo component
//   const MicrosoftIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M11.4 3H3v8.4h8.4V3z" fill="#F25022"/>
//       <path d="M21 3h-8.4v8.4H21V3z" fill="#7FBA00"/>
//       <path d="M11.4 12.6H3V21h8.4v-8.4z" fill="#00A4EF"/>
//       <path d="M21 12.6h-8.4V21H21v-8.4z" fill="#FFB900"/>
//     </svg>
//   );

//   // Success state
//   if (loginState === "success") {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//         <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-[450px]">
//           <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full">
//             <svg
//               width="40"
//               height="40"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="#10b981"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//               <polyline points="22,4 12,14.01 9,11.01"></polyline>
//             </svg>
//           </div>
//           <div className="text-center">
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//               Welcome Back!
//             </h2>
//             <p className="text-gray-600 mb-8">
//               Authentication successful. Redirecting to your dashboard...
//             </p>
//             <div className="flex justify-center">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8929fe]"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (loginState === "error") {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//         <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-[450px]">
//           <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full">
//             <svg
//               width="40"
//               height="40"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="#ef4444"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <circle cx="12" cy="12" r="10"></circle>
//               <line x1="15" y1="9" x2="9" y2="15"></line>
//               <line x1="9" y1="9" x2="15" y2="15"></line>
//             </svg>
//           </div>
//           <div className="text-center">
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//               Authentication Failed
//             </h2>
//             <p className="text-gray-600 mb-6 text-sm">
//               {errorMessage || "We couldn't sign you in. Please try again."}
//             </p>
//             <button
//               onClick={handleRetry}
//               className="bg-[#8929fe] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#7620e0] transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main login form
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-[450px]">
//         <div className="text-center mb-8">
//           <div className="w-[70px] h-[70px] mx-auto mb-4 rounded-full flex items-center justify-center">
//             <img 
//               src={Logo} 
//               alt="Quadrant Technologies Logo" 
//               className="rounded-full w-full h-full object-cover" 
//             />
//           </div>
//           <h1 className="text-2xl font-semibold text-gray-800 mb-2">
//             Welcome to Quadrant Technologies
//           </h1>
//           <p className="text-gray-600">
//             Sign in with your Microsoft account to continue
//           </p>
//         </div>

//         <button
//           onClick={handleLogin}
//           disabled={loginState === "loading"}
//           className="w-full bg-[#8929fe] text-white py-4 px-5 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-[#7620e0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
//         >
//           {loginState === "loading" ? (
//             <>
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               Signing you in...
//             </>
//           ) : (
//             <>
//               <MicrosoftIcon />
//               Sign in with Microsoft
//             </>
//           )}
//         </button>

//         <div className="mt-6 text-center">
//           <p className="text-xs text-gray-500">
//             By signing in, you agree to our terms of service and privacy policy.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../../../assets/Logo.png";
import { decryptString } from "../services/decrypt";
import { fetchEncryptionKeys } from "../services/apiClient";
 
const Login = () => {
  const [loginState, setLoginState] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [aesKey, setAesKey] = useState(null);
  const [aesIV, setAesIV] = useState(null);
 
  const {
    isAuthenticated,
    authState,
    login,
    getPrimaryRole,
    isInitialized,
    error: authError,
    user,
    setUser,
    setUserRoles,
    acquireToken,
  } = useAuth();
 
  // Fetch encryption keys
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting to fetch encryption keys...");
        const keys = await fetchEncryptionKeys();
        if (keys && keys.aesKey && keys.aesIV) {
          setAesKey(keys.aesKey);
          setAesIV(keys.aesIV);
          console.log("Keys set successfully");
        } else {
          throw new Error("Invalid keys structure");
        }
      } catch (keyError) {
        console.error("Failed to fetch encryption keys:", keyError);
        setErrorMessage("Failed to fetch encryption keys. Please try again.");
      }
    };
    fetchData();
  }, []);
 
  // Check user data and determine navigation
  const checkUserDataAndNavigate = async () => {
    try {
      // if (!aesKey || !aesIV) {
      //   console.error("AES key or IV missing");
      //   console.log("🔄 Redirecting to department selector due to missing encryption keys");
      //   setTimeout(() => {
      //     navigate("/department-selector", { replace: true });
      //   }, 1500);
      //   return;
      // }
 
      const token = await acquireToken("api");
      // if (!token) {
      //   console.error("Failed to acquire token");
      //   console.log("🔄 Redirecting to department selector due to missing token");
      //   setTimeout(() => {
      //     navigate("/department-selector", { replace: true });
      //   }, 1500);
      //   return;
      // }
 
      // if (!user?.id) {
      //   console.error("User ID is undefined or null");
      //   console.log("🔄 Redirecting to department selector due to missing user ID");
      //   setTimeout(() => {
      //     navigate("/department-selector", { replace: true });
      //   }, 1500);
      //   return;
      // }
 
      console.log("Checking user data for userId:", user.id);
 
      // Fetch all users from database
      const response = await fetch(`http://localhost:5181/api/User/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
 
      const allUsers = await response.json();
      console.log("API response (allUsers):", allUsers);
 
      const currentUser = allUsers.find(u => u.userId === user.id);
      console.log("Current user from database:", currentUser);
 
      // Check if user exists and has complete data
      // if (!currentUser) {
      //   console.log("User not found in database - new user, redirecting to department selector");
      //   setTimeout(() => {
      //     navigate("/department-selector", { replace: true });
      //   }, 1500);
      //   return;
      // }
 
      // Decrypt the user's role
      const encryptedRole = currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles[0] : null;
      let decryptedRole = null;
 
      if (encryptedRole) {
        decryptedRole = decryptString(encryptedRole, aesKey, aesIV);
        console.log("Decrypted role:", decryptedRole);
 
        // Update AuthContext with decrypted role
        // setUser({
        //   ...user,
        //   roles: [decryptedRole],
        // });
        // setUserRoles([decryptedRole]);
      } else {
        // If no role in database, use fallback from auth context
        decryptedRole = getPrimaryRole();
        console.log("No encrypted role found, using fallback:", decryptedRole);
      }
 
      // Check if required fields are missing (null, undefined, or empty string)
      const isDepartmentMissing = !currentUser.department || currentUser.department.trim() === "";
      const isSubDepartmentMissing = !currentUser.subDepartment || currentUser.subDepartment.trim() === "";
      const isManagerMissing = !currentUser.manager || currentUser.manager.trim() === "";
 
      const hasIncompleteData = isDepartmentMissing || isSubDepartmentMissing || isManagerMissing ;
 
      console.log("=== USER DATA CHECK ===");
      console.log("Department:", currentUser.department, "Missing:", isDepartmentMissing);
      console.log("SubDepartment:", currentUser.subDepartment, "Missing:", isSubDepartmentMissing);
      console.log("Manager:", currentUser.manager, "Missing:", isManagerMissing);
      console.log("Has incomplete data:", hasIncompleteData);
      console.log("User role:", decryptedRole);
      console.log("=====================");
 
      // Navigation logic based on data completeness
      if (hasIncompleteData && decryptedRole=="user") {
        console.log("🔄 User has incomplete data - redirecting to department selector");
        setTimeout(() => {
          navigate("/department-selector", { replace: true });
        }, 1500);
      } else {
        console.log("✅ User has complete data - navigating to role-based dashboard");
       
        // Navigate to appropriate dashboard based on role
        const navigationMap = {
          admin: "/admin",
          manager: "/manager",
          user: "/tasks",
        };
 
        const destination = navigationMap[decryptedRole] || "/dashboard";
       
        console.log(`📍 Navigating to ${destination} for role: ${decryptedRole}`);
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Error checking user data:", error);
     
      // Handle specific error cases
      if (error.message.includes("401")) {
        console.log("Unauthorized error, redirecting to login");
        navigate("/login");
        return;
      }
 
      // Fallback: If we can't check the database, assume incomplete data and show department selector
      console.log("🔄 Error occurred, falling back to department selector");
      setTimeout(() => {
        navigate("/department-selector", { replace: true });
      }, 1500);
    }
  };
 
  // Handle successful authentication and navigation
  useEffect(() => {
    if (isAuthenticated && isInitialized && authState === "authenticated") {
      setLoginState("success");
      checkUserDataAndNavigate();
    }
  }, [isAuthenticated, isInitialized, authState, navigate, getPrimaryRole, acquireToken]);
 
  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      setLoginState("error");
      setErrorMessage(authError);
    }
  }, [authError]);
 
  // Handle URL error parameters (from OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");
 
    if (errorParam) {
      console.error("OAuth error:", errorParam, errorDescription);
      setLoginState("error");
      setErrorMessage(errorDescription || errorParam);
 
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
 
  const handleLogin = async () => {
    try {
      setLoginState("loading");
      setErrorMessage(null);
      await login();
    } catch (error) {
      console.error("Login failed:", error);
      setLoginState("error");
      setErrorMessage("Authentication failed. Please try again.");
    }
  };
 
  const handleRetry = () => {
    setLoginState("idle");
    setErrorMessage(null);
  };
 
  // Microsoft logo component
  const MicrosoftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.4 3H3v8.4h8.4V3z" fill="#F25022" />
      <path d="M21 3h-8.4v8.4H21V3z" fill="#7FBA00" />
      <path d="M11.4 12.6H3V21h8.4v-8.4z" fill="#00A4EF" />
      <path d="M21 12.6h-8.4V21H21v-8.4z" fill="#FFB900" />
    </svg>
  );
 
  // Success state
  if (loginState === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-[450px]">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome Back!
            </h2>
            <p className="text-gray-600 mb-8">
              Authentication successful. Setting up your profile...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8929fe]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  // Error state
  if (loginState === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-[450px]">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              {errorMessage || "We couldn't sign you in. Please try again."}
            </p>
            <button
              onClick={handleRetry}
              className="bg-[#8929fe] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#7620e0] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  // Main login form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-[450px]">
        <div className="text-center mb-8">
          <div className="w-[70px] h-[70px] mx-auto mb-4 rounded-full flex items-center justify-center">
            <img
              src={Logo}
              alt="Quadrant Technologies Logo"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to Quadrant Technologies
          </h1>
          <p className="text-gray-600">
            Sign in with your Microsoft account to continue
          </p>
        </div>
 
        <button
          onClick={handleLogin}
          disabled={loginState === "loading"}
          className="w-full bg-[#8929fe] text-white py-4 px-5 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-[#7620e0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loginState === "loading" ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Signing you in...
            </>
          ) : (
            <>
              <MicrosoftIcon />
              Sign in with Microsoft
            </>
          )}
        </button>
 
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default Login;
 