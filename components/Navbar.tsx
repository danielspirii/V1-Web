
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            {/* Logo Placeholder - Replicating the Mochi logo style */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#B1EF42] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">MOCHI</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#login" 
              className="text-sm font-medium text-white hover:text-[#B1EF42] transition-colors"
            >
              Log in
            </a>
            <button className="bg-[#B1EF42] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
              Book a demo
            </button>
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
