import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DogIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/Button";
export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      requiresAuth: true,
    },
    {
      name: "Analyze Video",
      path: "/analyze",
      requiresAuth: true,
    },
    {
      name: "View History",
      path: "/history",
      requiresAuth: true,
    },
    {
      name: "Dog Profiles",
      path: "/dogs",
      requiresAuth: true,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#1A2744] shadow-sm z-40 border-b border-[#1A2744]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="group-hover:opacity-80 transition-opacity flex items-center justify-center p-1 bg-white/5 rounded-xl mr-2">
                <img src="/brand_logo.png" alt="Brand Logo" className="w-14 h-14 object-cover rounded-lg" />
              </div>
              <span className="font-bold text-lg hidden sm:block text-[#BBDEFB]">
                Early Dog Illness Detection System
              </span>
              <span className="font-bold text-lg text-primary sm:hidden">
                EDIDS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? "bg-white/10 text-accent-light font-bold" : "text-accent hover:bg-white/5 hover:text-accent-light"}`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Auth Buttons / User Menu */}
            <div className="ml-4 flex items-center gap-3 border-l border-gray-200 pl-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white hover:text-gray-200 transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Button size="sm" onClick={() => navigate("/signup")}>
                    Sign Up
                  </Button>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        transition={{
                          duration: 0.15,
                        }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-primary truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          {user?.accountType === "vet" && (
                            <Link
                              to="/vet-dashboard"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-secondary font-medium hover:bg-secondary/5"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <DogIcon className="w-4 h-4" /> Vet Portal
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/5 w-full text-left"
                          >
                            <LogOutIcon className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="md:hidden border-b border-gray-200 bg-white overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                if (link.requiresAuth && !isAuthenticated) return null;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path) ? "bg-secondary/10 text-secondary" : "text-gray-700 hover:bg-gray-50 hover:text-primary"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 pb-3 border-t border-gray-200">
              {!isAuthenticated ? (
                <div className="px-5 flex flex-col gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center px-5 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-primary">
                        {user?.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 space-y-1">
                    {user?.accountType === "vet" && (
                      <Link
                        to="/vet-dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-secondary/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Vet Portal
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-danger hover:bg-danger/5"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
