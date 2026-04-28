import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, ChevronRight, Truck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Products', href: '/products' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => signOut(auth);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                <img 
                  src="https://datapartner.btpr.online/ProductPictures/41863602642_LOGO.jpg" 
                  alt="Hannanth Petro Chem Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-xl tracking-tighter leading-none group-hover:text-blue-600 transition-colors">HANNANTH</span>
              <span className="text-blue-600 text-[10px] font-black tracking-[.25em] leading-tight uppercase mt-0.5">Petro Chem</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === link.href ? "text-blue-600" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {profile?.role === 'customer' && (
                  <Link 
                    to="/dashboard/portal"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-black shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Customer Portal
                  </Link>
                )}
                <Link 
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{profile?.name || 'Portal'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
              >
                Portal Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-slate-900 border-b border-slate-50 last:border-0"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    {profile?.role === 'customer' && (
                      <Link 
                        to="/dashboard/portal"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                      >
                        Customer Portal
                        <Truck className="w-4 h-4" />
                      </Link>
                    )}
                    <Link 
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-semibold"
                    >
                      Dashboard
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center w-full px-4 py-3 bg-blue-600 rounded-xl text-white font-semibold"
                  >
                    Portal Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
