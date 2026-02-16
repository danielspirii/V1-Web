
import React from 'react';
import { Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#141414] pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#B1EF42] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">MOCHI</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left">
              The First Infrastructure SaaS Built for Info Businesses Running Setter Teams.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <a href="#" className="text-zinc-400 hover:text-[#B1EF42] text-sm font-medium transition-colors">Terms</a>
            <a href="#" className="text-zinc-400 hover:text-[#B1EF42] text-sm font-medium transition-colors">Privacy</a>
            <a href="#" className="text-zinc-400 hover:text-[#B1EF42] text-sm font-medium transition-colors">Contact</a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:border-[#B1EF42] hover:text-[#B1EF42] transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:border-[#B1EF42] hover:text-[#B1EF42] transition-all">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom Text */}
        <div className="text-center">
          <p className="text-zinc-600 text-[10px] leading-relaxed max-w-3xl mx-auto uppercase tracking-widest">
            © 2025 Mochi L.L.C-FZ. Meydan Grandstand, 6th Floor, Meydan Road, Nad Al Sheba, Dubai, United Arab Emirates. License No: 2531534.01 | Email: hey@themochi.app
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
