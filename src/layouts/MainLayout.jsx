import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Eye, BarChart3, CheckSquare, QrCode, LogOut, ChevronDown, AlertTriangle, Shield, Lightbulb } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { Button } from '@components/ui';

// Submit form options
const submitOptions = [
  { name: 'Safety Incident Report', path: '/submit', icon: AlertTriangle },
  { name: 'Job Hazard Analysis', path: '/submit-jha', icon: Shield },
  { name: 'Process Improvement', path: '/submit-kaizen', icon: Lightbulb },
];

const navigation = [
  { name: 'Submit', icon: FileText, public: true, hasDropdown: true },
  { name: 'View Reports', path: '/view', icon: Eye, public: true },
  { name: 'Assigned Reports', path: '/assigned', icon: CheckSquare, public: true },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, public: true },
  { name: 'QR Codes', path: '/qr-codes', icon: QrCode, public: true },
];

export const MainLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitDropdownOpen, setSubmitDropdownOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isSubmitActive = () => submitOptions.some((option) => location.pathname === option.path);

  const filteredNavigation = navigation.filter(
    (item) => item.public || isAuthenticated
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Nucleus Safety Reports</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;

                // Render dropdown for Submit
                if (item.hasDropdown) {
                  return (
                    <div key="submit-dropdown" className="relative">
                      <button
                        onClick={() => setSubmitDropdownOpen(!submitDropdownOpen)}
                        onBlur={() => setTimeout(() => setSubmitDropdownOpen(false), 200)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isSubmitActive()
                            ? 'bg-white bg-opacity-20'
                            : 'hover:bg-white hover:bg-opacity-10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {submitDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                          {submitOptions.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <Link
                                key={option.path}
                                to={option.path}
                                onClick={() => setSubmitDropdownOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                                  isActive(option.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                              >
                                <OptionIcon className="w-5 h-5" />
                                <span>{option.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular navigation item
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-white bg-opacity-20'
                        : 'hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white border-opacity-20">
            <nav className="px-4 py-4 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;

                // Render expandable list for Submit
                if (item.hasDropdown) {
                  return (
                    <div key="submit-mobile" className="space-y-1">
                      <button
                        onClick={() => setSubmitDropdownOpen(!submitDropdownOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isSubmitActive()
                            ? 'bg-white bg-opacity-20'
                            : 'hover:bg-white hover:bg-opacity-10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            submitDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {submitDropdownOpen && (
                        <div className="pl-4 space-y-1">
                          {submitOptions.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <Link
                                key={option.path}
                                to={option.path}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setSubmitDropdownOpen(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                  isActive(option.path)
                                    ? 'bg-white bg-opacity-30'
                                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                                }`}
                              >
                                <OptionIcon className="w-4 h-4" />
                                <span className="text-sm">{option.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular mobile navigation item
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-white bg-opacity-20'
                        : 'hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Nucleus Biologics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
