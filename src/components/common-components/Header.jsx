import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Bell, 
  Search,
  Menu,
  X
} from "lucide-react";
import Logo from "../../../assets/Logo.png";

const Header = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState([]); 
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    user, 
    logout, 
    getPrimaryRole, 
    hasRole,
    isLoading 
  } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavigationItems = () => {
    const items = [];
    
    if (hasRole("admin")) {
      items.push(
        // { label: "Admin Dashboard", path: "/admin", roles: ["admin"] },
        { label: "User Management", path: "/admin", roles: ["admin"] }
     
      );
    }
    
    if (hasRole("manager")) {
      items.push(
        { label: "Manager Dashboard", path: "/manager", roles: ["manager", "admin"] }
      );
    }

    return items.filter(item => 
      item.roles.some(role => hasRole(role))
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const navigationItems = getNavigationItems();
    const currentItem = navigationItems.find(item => item.path === path);
    
    if (currentItem) return currentItem.label;
    
    if (path.includes("/admin")) return "Admin Panel";
    if (path.includes("/manager")) return "Manager Dashboard";
    return "Dashboard";
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const cleanName = user.name.replace(/\s*\(.*?\)\s*/, ""); // Remove text in parentheses
    const names = cleanName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return cleanName.charAt(0).toUpperCase();
};

  const getRoleColor = () => {
    const primaryRole = getPrimaryRole();
    switch (primaryRole) {
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src={Logo} 
                alt="Quadrant Technologies" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                {/* <h1 className="text-lg font-semibold text-gray-900">
                  {getPageTitle()}
                </h1> */}
                <p className="text-lg text-gray-900 font-bold">
                  Quadrant Technologies
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {/* <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button> */}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-[#8929fe] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitials()}
                </div>
                <div className="hidden sm:block text-left">
                  {/* <p className="text-sm font-medium text-gray-900">
                    {user?.name || "User"}
                  </p> */}
                  <p className="text-sm font-medium text-gray-900">
  {user?.name?.split(' (')[0] || "User"}
</p>
 
                  {/* <p className="text-xs text-gray-500 capitalize">
                    {getPrimaryRole()}
                  </p> */}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#8929fe] text-white rounded-full flex items-center justify-center font-medium">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleColor()}`}>
                          {getPrimaryRole()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="py-2">
                    {getNavigationItems().slice(0, 4).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Settings and Logout */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {getNavigationItems().map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-[#8929fe] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;