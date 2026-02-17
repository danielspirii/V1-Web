
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            {/* Logo Placeholder - Replicating the Mochi logo style */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://storage.googleapis.com/msgsndr/iY80Hp6mESzg02IkqB03/media/699397c86bac2456bade8238.png"
                alt="Sistemas con IA Logo"
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {location.pathname !== '/demo' && (
              <Link to="/demo" className="bg-[#B1EF42] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
                DEMO AHORA
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button className="text-white p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
