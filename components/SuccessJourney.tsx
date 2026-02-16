
import React, { useRef, useState, useEffect } from 'react';
import { Instagram, Mail, MessageSquare, Facebook, Send, BarChart2, Clock, Calendar as CalendarIcon, Loader, RefreshCw, Smartphone, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

/* 
   -----------------------------
   Visual Components Definition (Must be defined before use in 'steps')
   -----------------------------
*/

const OmnichannelVisual: React.FC = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Central Hub */}
            <div className="relative z-10 w-24 h-24 bg-[#B1EF42]/20 border border-[#B1EF42] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(177,239,66,0.3)]">
                <div className="w-12 h-12 bg-[#B1EF42] rounded-full flex items-center justify-center">
                    <Loader className="w-6 h-6 text-black animate-spin" />
                </div>
            </div>

            {/* Icons */}
            <div className="absolute top-1/4 left-1/4 p-3 bg-zinc-800 rounded-full border border-white/10">
                <Instagram className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="absolute top-1/4 right-1/4 p-3 bg-zinc-800 rounded-full border border-white/10">
                <Facebook className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="absolute bottom-1/4 left-1/4 p-3 bg-zinc-800 rounded-full border border-white/10">
                <Mail className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 p-3 bg-zinc-800 rounded-full border border-white/10">
                <MessageSquare className="w-6 h-6 text-zinc-400" />
            </div>
        </div>
    );
};

const PersonalizationVisual: React.FC = () => {
    return (
        <div className="w-full max-w-md p-6 bg-zinc-950 rounded-xl border border-white/5 font-mono text-sm relative overflow-hidden">
            <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="space-y-2">
                <div className="text-zinc-500">// Mensaje Genérico</div>
                <div className="text-zinc-600 line-through">Hola amigo, te interesa el servicio?</div>
                <div className="h-4" />

                <div className="text-[#B1EF42]">// Mensaje Personalizado (IA)</div>
                <div className="text-white">
                    Hola <span className="bg-[#B1EF42]/20 text-[#B1EF42] px-1 rounded">Daniel</span>,
                    vi que te interesa escalar tu <span className="bg-[#B1EF42]/20 text-[#B1EF42] px-1 rounded">Agencia de Marketing</span>.
                </div>
            </div>

            <div className="absolute right-4 bottom-4">
                <div className="bg-[#B1EF42] text-black text-xs font-bold px-3 py-1 rounded-full">
                    98% Match
                </div>
            </div>
        </div>
    );
};

const TimelineVisual: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
            <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-zinc-800 -translate-x-1/2" />
            <div className="space-y-12 relative z-10 w-full max-w-sm">
                {[
                    { time: 'Día 1', text: 'Contacto Inicial' },
                    { time: 'Semana 2', text: 'Aporte de Valor' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-1/3 text-right text-[#B1EF42] font-bold text-sm">{item.time}</div>
                        <div className="w-4 h-4 rounded-full bg-[#B1EF42] border-4 border-black z-20 flex-shrink-0" />
                        <div className="w-1/2 bg-zinc-800/80 p-3 rounded-lg border border-white/5 text-xs text-zinc-300">
                            {item.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CalendarVisual: React.FC = () => {
    return (
        <div className="w-full max-w-md bg-zinc-900 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="bg-zinc-800 p-4 border-b border-white/5 flex justify-between items-center">
                <span className="font-bold text-white">Febrero 2026</span>
                <CalendarIcon className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 p-4">
                {[...Array(28)].map((_, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs relative overflow-hidden ${Math.random() > 0.3 ? 'bg-[#B1EF42]/10 border border-[#B1EF42]/30' : 'bg-zinc-800/50'}`}
                    >
                        <span className="z-10 text-zinc-500 opacity-50">{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


/* 
   -----------------------------
   Main Components
   -----------------------------
*/

const SuccessJourney: React.FC = () => {
    return (
        <div className="bg-black text-white min-h-screen">
            <ComparisonSection />
            <StickyScrollSection />
            <FinalCTA />
            <CaseStudiesSection />
        </div>
    );
};

const ComparisonSection: React.FC = () => {
    const [view, setView] = useState<'traditional' | 'ecosystem'>('traditional');

    return (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">La Diferencia es <span className="text-[#B1EF42]">Abismal</span></h2>
                <div className="inline-flex bg-zinc-900 p-1 rounded-full border border-white/10">
                    <button
                        onClick={() => setView('traditional')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'traditional' ? 'bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Negocio Tradicional
                    </button>
                    <button
                        onClick={() => setView('ecosystem')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'ecosystem' ? 'bg-[#B1EF42]/20 text-[#B1EF42] shadow-[0_0_20px_rgba(177,239,66,0.2)]' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Ecosistema con IA
                    </button>
                </div>
            </div>

            <div className="relative h-[400px] md:h-[500px] bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden transition-all duration-500">
                {view === 'traditional' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in">
                        <div className="grid grid-cols-3 gap-8 w-full max-w-2xl opacity-50 grayscale">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-zinc-500" />
                                </div>
                                <p className="text-zinc-500 text-sm text-center">Respuesta Tardía (+4h)</p>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 text-zinc-500" />
                                </div>
                                <p className="text-zinc-500 text-sm text-center">Mensajes Genéricos</p>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center relative">
                                    <BarChart2 className="w-8 h-8 text-red-500" />
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                                </div>
                                <p className="text-red-500 font-bold text-sm text-center">LEADS PERDIDOS</p>
                            </div>
                        </div>
                        <p className="mt-12 text-zinc-600 text-lg max-w-lg text-center">
                            "Si no respondes en 5 minutos, la probabilidad de contacto cae un 80%."
                        </p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#B1EF42]/5 to-transparent animate-fade-in">
                        <div className="grid grid-cols-3 gap-8 w-full max-w-2xl relative z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-[#B1EF42]/10 border border-[#B1EF42] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(177,239,66,0.2)]">
                                    <RefreshCw className="w-8 h-8 text-[#B1EF42] animate-spin" />
                                </div>
                                <p className="text-[#B1EF42] font-bold text-sm text-center">Respuesta Inmediata (&lt;2min)</p>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-[#B1EF42]/10 border border-[#B1EF42] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(177,239,66,0.2)]">
                                    <Smartphone className="w-8 h-8 text-[#B1EF42]" />
                                </div>
                                <p className="text-[#B1EF42] font-bold text-sm text-center">Ultra Personalizado</p>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-[#B1EF42] text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(177,239,66,0.4)] animate-pulse">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <p className="text-white font-bold text-sm text-center">VENTAS ESCALABLES</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

// Moved 'steps' definition here to ensure Visual components are defined
const steps = [
    {
        title: "Captura Omnicanal",
        description: "La IA detecta el lead en < 2 min desde cualquier red social (Instagram, WhatsApp, Email, Facebook) y lo centraliza en el CRM.",
        visual: <OmnichannelVisual />
    },
    {
        title: "Personalización Extrema",
        description: "El contenido genérico se transforma instantáneamente en un mensaje específico para ese lead, usando variables de su perfil.",
        visual: <PersonalizationVisual />
    },
    {
        title: "Persecución Infinita",
        description: "Nuestro sistema no olvida. Contactos automáticos a las 2 semanas, 2 meses y 2 años. Recuperamos el 30% de leads perdidos.",
        visual: <TimelineVisual />
    },
    {
        title: "El Cierre (Maximización)",
        description: "Tu calendario se llena automáticamente mientras duermes. El sistema cualifica y agenda solo a los mejores prospectos.",
        visual: <CalendarVisual />
    },
];

const StickyScrollSection: React.FC = () => {
    // Note: We use a ref based state update only when necessary to prevent loops
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pb-40">
            <div className="flex flex-col md:flex-row gap-12 md:gap-20">
                {/* Left: Sticky Text Container */}
                <div className="hidden md:flex w-1/3 flex-col justify-center h-screen sticky top-0 transition-opacity duration-300">
                    {/* Render active step details */}
                    <div key={activeStep} className="space-y-6 animate-fade-in">
                        <div className="inline-flex items-center px-3 py-1 bg-[#B1EF42]/10 rounded-lg border border-[#B1EF42]/20 mb-4">
                            <span className="text-[#B1EF42] text-xs font-bold uppercase tracking-wider">Paso 0{activeStep + 1}</span>
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-black">{steps[activeStep].title}</h3>
                        <p className="text-zinc-400 text-lg leading-relaxed">{steps[activeStep].description}</p>
                    </div>
                </div>

                {/* Right: Scrolling Visuals */}
                <div className="w-full md:w-2/3">
                    {steps.map((step, index) => (
                        <VisualSection key={index} index={index} setActiveStep={setActiveStep}>
                            {/* Mobile Text (Visible only on mobile) */}
                            <div className="md:hidden mb-8 pt-20">
                                <div className="inline-flex items-center px-3 py-1 bg-[#B1EF42]/10 rounded-lg border border-[#B1EF42]/20 mb-4">
                                    <span className="text-[#B1EF42] text-xs font-bold uppercase tracking-wider">Paso 0{index + 1}</span>
                                </div>
                                <h3 className="text-3xl font-black mb-4">{step.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                            </div>

                            <div className="h-[50vh] md:h-[80vh] bg-zinc-900/50 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center shadow-2xl sticky top-20 md:top-auto md:sticky-none transform transition-transform duration-500 hover:scale-[1.01]">
                                {step.visual}
                            </div>
                        </VisualSection>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VisualSection: React.FC<{ index: number; setActiveStep: (i: number) => void; children: React.ReactNode }> = ({ index, setActiveStep, children }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Only update if intersecting significantly
                if (entry.isIntersecting) {
                    setActiveStep(index);
                }
            },
            { threshold: 0.5 } // 50% visibility required
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [index, setActiveStep]); // Correct dependencies

    return (
        <div ref={ref} className="min-h-[80vh] md:min-h-screen flex flex-col justify-center py-20">
            {children}
        </div>
    );
};

const FinalCTA: React.FC = () => {
    return (
        <section className="py-20 bg-[#B1EF42]/5 border-y border-[#B1EF42]/10 relative overflow-hidden">
            {/* Background glow pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#B1EF42]/10 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-[#B1EF42]/10 rounded-full mb-8 animate-bounce">
                    <Smartphone className="w-8 h-8 text-[#B1EF42]" />
                </div>

                <h2 className="text-3xl md:text-5xl font-black mb-6">
                    ¡Revisa tu WhatsApp!
                </h2>

                <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-2xl mx-auto">
                    Nuestro equipo <span className="text-[#B1EF42] font-bold">ya te ha contactado</span>.
                    Accede ahora para continuar con tu sesión estratégica.
                </p>

                <a
                    href="https://wa.me/34673024992"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-5 rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(37,211,102,0.3)] animate-pulse"
                >
                    <MessageSquare className="w-6 h-6" />
                    Abrir WhatsApp Ahora
                </a>
            </div>
        </section>
    );
};

const CaseStudiesSection: React.FC = () => {
    const cases = [
        {
            name: "Matias Noble Tattoo",
            category: "Infoproducto & Academia",
            description: "Academia online de tatuajes y formación presencial escalada con el Ecosistema.",
            icon: <CheckCircle className="w-5 h-5 text-[#B1EF42]" />
        },
        {
            name: "Visa Homes",
            category: "Inmobiliaria & Construcción",
            description: "Promotora de casas industrializadas captando inversores y compradores cualificados.",
            icon: <CheckCircle className="w-5 h-5 text-[#B1EF42]" />
        },
        {
            name: "Noble Art",
            category: "Estudios Internacionales",
            description: "Red de estudios de tatuajes gestionando citas en múltiples países automáticamente.",
            icon: <CheckCircle className="w-5 h-5 text-[#B1EF42]" />
        },
        {
            name: "Homologate",
            category: "Servicios Legales",
            description: "Empresa de homologación de títulos universitarios simplificando la burocracia.",
            icon: <CheckCircle className="w-5 h-5 text-[#B1EF42]" />
        },
        {
            name: "FondeateLab",
            category: "Finanzas & Trading",
            description: "Venta de bots de trading y formación financiera con alta conversión.",
            icon: <CheckCircle className="w-5 h-5 text-[#B1EF42]" />
        },
        {
            name: "Finca el Sarao",
            category: "Ocio & Formación",
            description: "Hípica vendiendo rutas a caballo y cursos online de equitación.",
            icon: <CheckCircle className="w-5 h-5 text-[#B1EF42]" />
        }
    ];

    return (
        <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">
                    El Ecosistema en Acción
                </h2>
                <p className="text-xl text-zinc-400">
                    Utilizado en <span className="text-[#B1EF42] font-bold">+30 sectores distintos</span> con resultados probados.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((project, i) => (
                    <div
                        key={i}
                        className="group bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-[#B1EF42]/30 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-zinc-800 rounded-lg group-hover:bg-[#B1EF42]/20 transition-colors">
                                {project.icon}
                            </div>
                            <span className="text-xs font-mono text-zinc-500 border border-white/10 px-2 py-1 rounded bg-black">
                                {project.category}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#B1EF42] transition-colors flex items-center gap-2">
                            {project.name}
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h3>

                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {project.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <p className="text-zinc-500 text-sm">
                    ¿Tu negocio es diferente? <span className="text-[#B1EF42]">El sistema se adapta a cualquier flujo de venta.</span>
                </p>
            </div>
        </section>
    );
};

export default SuccessJourney;
