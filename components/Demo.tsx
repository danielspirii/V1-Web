
import React, { useState } from 'react';
import { Send, CheckCircle, Smartphone, Mail } from 'lucide-react';
import SuccessJourney from './SuccessJourney';

const Demo: React.FC = () => {
    // 1. Separé el teléfono del formData general
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    
    // 2. Nuevos estados para controlar el prefijo y el número por separado
    const [prefix, setPrefix] = useState('+34');
    const [phoneInput, setPhoneInput] = useState('');
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 3. Juntamos el prefijo y el número justo antes de enviarlo a n8n
        const dataToSend = {
            ...formData,
            phone: `${prefix} ${phoneInput}`
        };

        try {
            await fetch('https://n8n.srv789864.hstgr.cloud/webhook/4a54227f-32e8-4000-b38c-ec9902441dab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
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

                    {/* 4. Aquí está el nuevo diseño del campo del teléfono con el selector */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                            WhatsApp
                        </label>
                        <div className="flex gap-2">
                            <div className="relative w-[130px]">
                                <select
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-[#B1EF42] transition-colors appearance-none cursor-pointer text-sm"
                                >
                                    <option value="+34">🇪🇸 +34</option>
                                    <option value="+52">🇲🇽 +52</option>
                                    <option value="+54">🇦🇷 +54</option>
                                    <option value="+57">🇨🇴 +57</option>
                                    <option value="+56">🇨🇱 +56</option>
                                    <option value="+51">🇵🇪 +51</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+593">🇪🇨 +593</option>
                                    <option value="+58">🇻🇪 +58</option>
                                    <option value="+502">🇬🇹 +502</option>
                                </select>
                            </div>
                            <div className="relative flex-1">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#B1EF42] transition-colors"
                                    placeholder="600 000 000"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                />
                            </div>
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
