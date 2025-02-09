import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  BarChart,
  BarChart3,
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  User,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: FolderKanban, label: "Projects", href: "/app/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/app/tasks" },
  { icon: Users, label: "Clients", href: "/app/clients" },
  { icon: Clock, label: "Time Tracking", href: "/app/time-tracking" },
  { icon: BarChart3, label: "Reports", href: "/app/reports" },
  { icon: Store, label: "App Store", href: "/app-store" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Mobile overlay for small screens
  const MobileOverlay = () => (
    <div
      className={`
        fixed inset-0 bg-black/50 transition-opacity lg:hidden
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
      onClick={() => setIsOpen(false)}
    />
  );

  return (
    <>
      <MobileOverlay />
      <aside
        className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64
        transition-transform duration-300 ease-in-out shadow-lg
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}
        border-r flex flex-col
      `}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            absolute -right-12 top-6 rounded-r-lg p-2 shadow-md transition-all
            lg:hidden flex items-center justify-center w-10 h-10
            ${theme === "dark" ? "bg-red-400 text-gray-200" : "bg-white text-gray-800"}
            border border-l-0
            ${theme === "dark" ? "border-red-800" : "border-gray-200"}
          `}
        >
          <ChevronLeft
            size={20}
            className={`transform transition-transform ${!isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                    transition-all duration-200 shadow-sm
                    ${location.pathname === item.href
                      ? "bg-red-600 text-white"
                      : theme === "dark"
                      ? "text-white hover:bg-red-200/20 hover:text-red-300"
                      : "text-white hover:bg-red-600/10 hover:text-red-600"
                    }
                  `}
                >
                  <item.icon
                    size={20}
                    className={location.pathname === item.href ? "text-white" : ""}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="p-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
              <div
                className={`
                  h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold
                  ${theme === "dark" ? "bg-red-600" : "bg-red-500"} text-white
                `}
              >
                {getInitials(user?.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base text-red-600 font-semibold truncate">{user?.displayName || "User"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-semibold
                transition-all duration-200 shadow-sm mt-3
                ${theme === "dark"
                  ? "bg-red-100 text-white hover:bg-red-500"
                  : "bg-red-500 text-red-700 hover:bg-red-600"
                }
              `}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
