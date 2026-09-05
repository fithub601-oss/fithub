import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/subscriptions', label: 'Subscriptions' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-baseline gap-0.5">
            <span className="font-display text-2xl tracking-wider text-slate-900">FIT</span>
            <span className="font-display text-2xl tracking-wider bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">HUB</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 rounded-full p-1.5">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-white text-primary-600 shadow-soft'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="relative text-slate-600 hover:text-slate-900 transition-colors" aria-label="Cart">
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-r from-primary-600 to-neon-pink text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm text-slate-800 hover:text-primary-600 transition-colors font-medium"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-neon-pink flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.name?.split(' ')[0]}
                  <FaChevronDown className={`text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2">
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                    </Link>
                    {!isAdmin && (
                      <>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          onClick={() => setDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/transactions"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          onClick={() => setDropdownOpen(false)}
                        >
                          My Transactions
                        </Link>
                      </>
                    )}
                    <div className="my-1 border-t border-slate-100"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-neon-pink text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity shadow-md shadow-primary-600/25"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-slate-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm ${location.pathname === link.to ? 'text-primary-600 font-medium' : 'text-slate-600'} hover:text-slate-900`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-primary-600 font-medium"
              >
                <FaShoppingCart /> Cart {cartCount > 0 && <span className="text-neon-pink font-bold">({cartCount})</span>}
              </Link>
            </div>
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-primary-600 font-medium"
                >
                  {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                </Link>
                {!isAdmin && (
                  <>
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm text-slate-600"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/transactions"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm text-slate-600"
                    >
                      My Transactions
                    </Link>
                  </>
                )}
                <button onClick={handleLogout} className="text-sm text-red-500 text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-slate-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-neon-pink text-white text-sm font-semibold rounded-full text-center shadow-md shadow-primary-600/25"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;