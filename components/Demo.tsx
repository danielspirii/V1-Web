
import React, { useState } from 'react';
import { Send, CheckCircle, Smartphone, Mail } from 'lucide-react';
import SuccessJourney from './SuccessJourney';

const Demo: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await fetch('https://n8n.srv789864.hstgr.cloud/webhook/4a54227f-32e8-4000-b38c-ec9902441dab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            setIsSubmitted(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Hubo un error al enviar tus datos. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen pt-32 animate-fade-in pb-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#B1EF42]/10 border border-[#B1EF42]/20 mb-8 animate-fade-in">
                        <CheckCircle className="w-5 h-5 text-[#B1EF42] mr-2" />
                        <span className="text-[#B1EF42] text-sm font-semibold tracking-wide uppercase">
                            ¡Datos Recibidos Exitosamente!
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-white max-w-4xl mx-auto">
                        Tu viaje para <span className="text-[#B1EF42]">Maximizar Agendamientos</span> comienza ahora
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        En menos de 2 minutos recibirás un WhatsApp de nuestro equipo. Mientras esperas, descubre exactamente cómo funciona el sistema que acabas de activar.
                    </p>
                </div>

                <SuccessJourney />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#B1EF42]/5 to-transparent pointer-events-none opacity-30" />

            <div className="relative z-10 w-full max-w-lg">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                        Prueba el Ecosistema
                    </h1>
                    <p className="text-zinc-400">
                        Ingresa tus datos para experimentar la potencia de nuestros sistemas de IA.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">Nombre</label>
                        <input
                            type="text"
                            id="name"
                            required
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#B1EF42] transition-colors"
                            placeholder="Tu nombre completo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                type="email"
                                id="email"
                                required
                                className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#B1EF42] transition-colors"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                            Teléfono <span className="text-[#B1EF42] text-xs ml-1">(con prefijo obligatorio)</span>
                        </label>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                type="tel"
                                id="phone"
                                required
                                className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#B1EF42] transition-colors"
                                placeholder="+34 600 000 000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#B1EF42] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            'Enviando...'
                        ) : (
                            <>
                                PROBAR AHORA <Send className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Demo;
