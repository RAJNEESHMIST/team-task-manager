import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { signOut, user, appUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) => 
    location.pathname === path 
      ? 'text-indigo-600 font-semibold bg-indigo-50 px-3 py-2 rounded-xl' 
      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-3 py-2 rounded-xl';

  const NavLinks = () => (
    <>
      <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
      <Link 
          to="/projects" 
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            location.pathname.startsWith('/projects')
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Projects
        </Link>
        {appUser?.role === 'GLOBAL_ADMIN' && (
          <Link 
            to="/admin" 
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center ${
              location.pathname.startsWith('/admin')
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Hub
          </Link>
        )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-10">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-indigo-200 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Team<span className="text-gradient">Task</span></h1>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 text-sm">
            <NavLinks />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-5">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</span>
            <span className="text-xs font-semibold text-slate-700">{user?.email}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="hidden sm:block text-xs font-bold px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            Logout
          </button>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-2">
            <NavLinks />
          </div>
          <div className="pt-4 border-t border-slate-50 flex flex-col space-y-4">
             <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</span>
              <span className="text-sm font-semibold text-slate-700">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-center py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
