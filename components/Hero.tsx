
import React from 'react';


const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#B1EF42]/10 to-transparent pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#B1EF42]/10 border border-[#B1EF42]/20 mb-8 animate-fade-in">
          <span className="text-[#B1EF42] text-sm font-semibold tracking-wide uppercase">
            El negocio promedio no persigue sus leads
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-white max-w-5xl mx-auto">
          La única herramienta que utilicé para agendar <span className="text-[#B1EF42]">+400 llamadas cualificadas</span>
          <br className="hidden md:block" />
          con cero esfuerzo
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          La mayoría de negocios no fallan en el tráfico; están perdiendo dinero en su proceso comercial.
          Mira cómo triplicamos las llamadas con la misma inversión.
        </p>

        {/* Video Player Container */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border-[8px] border-zinc-900 overflow-hidden shadow-2xl bg-zinc-800 aspect-video">
          <video
            src="https://storage.googleapis.com/msgsndr/iY80Hp6mESzg02IkqB03/media/69938f4d097809dad76366d9.mp4"
            controls
            className="w-full h-full object-cover"
            playsInline
          />
        </div>

        {/* Final CTA Area */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <button className="bg-[#B1EF42] text-black px-12 py-5 rounded-2xl text-xl font-black hover:scale-105 hover:shadow-[0_0_40px_rgba(177,239,66,0.3)] transition-all duration-300 active:scale-95">
            DEMO AHORA
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
              <span className="text-[#B1EF42]">17/25 Plazas Ocupadas</span> Para {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
