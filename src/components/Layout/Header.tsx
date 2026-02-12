import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell, Settings, LogOut, User, Wallet, ChevronDown, Shield, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from '../Auth/AuthModal';
import Button from '../UI/Button';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Milestones', href: '/milestones' },
  { name: 'Community', href: '/community' },
  { name: 'Programs', href: '/programs' },
];

export default function Header() {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CI</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">Community Impact</span>
            </Link>

            {/* Navigation - Only show if user is authenticated */}
            {user && (
              <nav className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'text-sm font-medium transition-colors duration-200',
                      location.pathname === item.href
                        ? 'text-primary-600 border-b-2 border-primary-600 pb-4'
                        : 'text-gray-600 hover:text-primary-600'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Admin Dashboard Link */}
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>

                  {/* Notifications */}
                  <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  </button>

                  {/* Wallet Status */}
                  {user.wallet_address && (
                    <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}

                  {/* User menu */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                        alt={user.name}
                      />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={clsx(
                                active ? 'bg-gray-50' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              <User className="w-4 h-4 mr-3" />
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={clsx(
                                active ? 'bg-gray-50' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              <Shield className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={clsx(
                                active ? 'bg-gray-50' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              disabled={loading}
                              className={clsx(
                                active ? 'bg-gray-50' : '',
                                'flex items-center w-full px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              {loading ? 'Signing out...' : 'Sign out'}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </>
              ) : (
                /* Sign In Button for non-authenticated users */
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
}