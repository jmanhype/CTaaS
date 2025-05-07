"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Menu, X, LayoutDashboard, FileText, Users, Settings, LogOut, Building, UserCog } from "lucide-react"; // Using Lucide icons

const TopNav = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 right-0 z-50 print:hidden">
      <div className="flex items-center">
        <Link href="/" legacyBehavior>
          <a className="text-xl font-bold text-blue-600 dark:text-blue-400">CTaaS Platform</a>
        </Link>
        {/* Global Search Placeholder - can be enabled later */}
        {/* <div className="ml-10 hidden md:block">
          <input type="search" placeholder="Search..." className="px-3 py-1.5 border dark:border-gray-600 rounded-md text-sm dark:bg-gray-700" />
        </div> */}
      </div>
      {isAuthenticated && user && (
        <div className="flex items-center">
          <span className="mr-3 text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">Welcome, {user.username}</span>
          {/* User Avatar Placeholder - can be replaced with an actual avatar component */}
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 mr-3">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={logout} 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
            aria-label="Logout"
          >
            <LogOut size={18} className="mr-1" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return null; // Don't render sidebar if not authenticated
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard size={20} />, roles: [] }, // Empty roles array means accessible to all authenticated users
    { href: "/trials", label: "Trials", icon: <FileText size={20} />, roles: [] },
    // Example: Global sites might be for Admins or specific roles
    // { href: "/sites-global", label: "Global Sites", icon: <Building size={20} />, roles: ["Administrator", "PlatformManager"] }, 
    { href: "/admin/users", label: "User Management", icon: <UserCog size={20} />, roles: ["Administrator"] },
    // { href: "/settings", label: "Settings", icon: <Settings size={20} />, roles: [] }, // Example settings page
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user || !user.roles) return false; // Should not happen if authenticated
    if (item.roles.length === 0) return true; // Accessible to all authenticated users
    return item.roles.some(role => user.roles.includes(role));
  });

  const sidebarContent = (
    <nav className="flex-grow">
      <ul>
        {filteredNavItems.map((item) => (
          <li key={item.href} className="mb-1">
            <Link href={item.href} legacyBehavior>
              <a 
                className="flex items-center px-3 py-2.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md mx-2 transition-colors duration-150 ease-in-out group"
                onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)} // Close mobile menu on link click
              >
                {React.cloneElement(item.icon, { className: "mr-3 group-hover:text-blue-300 transition-colors duration-150 ease-in-out" })}
                {item.label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button - shown only on small screens */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md shadow print:hidden"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for larger screens */}
      <aside className="bg-gray-800 text-white w-60 min-h-screen fixed left-0 top-16 pt-5 flex-col hidden md:flex print:hidden">
        {sidebarContent}
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          CTaaS Platform v1.0.0
        </div>
      </aside>

      {/* Sidebar for mobile - shown when isMobileMenuOpen is true */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex print:hidden">
          <aside className="bg-gray-800 text-white w-60 min-h-full pt-16 flex flex-col shadow-xl">
            {sidebarContent}
            <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
              CTaaS Platform v1.0.0
            </div>
          </aside>
          {/* Overlay to close menu on click outside */}
          <div onClick={() => setIsMobileMenuOpen(false)} className="flex-1 bg-black opacity-50"></div> 
        </div>
      )}
    </>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If auth is loading, or if not authenticated and not on a public page (e.g. login), show minimal layout or loading
  // This example assumes login page handles its own layout or doesn't use this main Layout
  // For simplicity, we always render TopNav and Sidebar (Sidebar itself checks auth)
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <TopNav />
      <div className={`flex flex-1 pt-16 ${isAuthenticated ? "md:pl-60" : ""} print:pt-0 print:pl-0`}>
        {isAuthenticated && <Sidebar />} {/* Sidebar is only rendered if authenticated */}
        <main className={`flex-1 p-4 sm:p-6 print:p-0 ${!isAuthenticated ? "w-full" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

