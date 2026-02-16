
import React from 'react';
import { Play } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#B1EF42]/10 to-transparent pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#B1EF42]/10 border border-[#B1EF42]/20 mb-8 animate-fade-in">
          <span className="text-[#B1EF42] text-sm font-semibold tracking-wide uppercase">
            The average coach loses $47K/month
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-white max-w-5xl mx-auto">
          The One Tool I Used to Hit <span className="text-[#B1EF42]">$250K/mo</span>
          <br className="hidden md:block" />
          at 85% Margins With Just 4 People
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Most info businesses aren't broken at the top of funnel. They're leaking money in the backend. 
          Watch how we doubled revenue for 400+ clients.
        </p>

        {/* Video Placeholder Container */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border-[8px] border-zinc-900 overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-zinc-800">
           <img 
            src="https://picsum.photos/seed/mochi/1280/720" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-[#B1EF42] rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Play className="text-black fill-black w-8 h-8 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-left">
            <p className="text-[#B1EF42] font-bold text-sm tracking-widest uppercase mb-1">Success Case Study</p>
            <h3 className="text-white text-xl font-bold">Scaling to $250k/mo: The Infrastructure Blueprint</h3>
          </div>
        </div>

        {/* Final CTA Area */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <button className="bg-[#B1EF42] text-black px-12 py-5 rounded-2xl text-xl font-black hover:scale-105 hover:shadow-[0_0_40px_rgba(177,239,66,0.3)] transition-all duration-300 active:scale-95">
            BOOK A DEMO
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  src={`https://i.pravatar.cc/150?u=${i}`}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-2 border-black"
                />
              ))}
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              <span className="text-[#B1EF42]">17/25 Spots Taken</span> For February
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
