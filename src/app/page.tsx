import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, PieChart, Wallet, CalendarDays, CheckCircle2, Activity, CreditCard, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: 'var(--font-sans)' }}>

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed w-full z-50 top-0 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] sm:h-[68px] flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo-without-bg.png"
              alt="Finanp"
              width={200}
              height={68}
              style={{ height: '52px', width: 'auto' }}
              priority
            />
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/login" className="text-[13px] sm:text-[14px] font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 bg-[#0073ea] text-white text-[13px] sm:text-[14px] font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-[#0060b9] transition-all active:scale-95">
              Dashboard
              <ArrowRight size={13} className="hidden sm:block" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="pt-24 sm:pt-32 pb-0 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Badge */}
          <div className="flex justify-center mb-6 sm:mb-8 pt-6 sm:pt-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-[12px] sm:text-[13px] font-semibold px-3 sm:px-4 py-1.5 rounded-full">
              <Sparkles size={13} className="text-blue-500" />
              Tu gestor financiero personal
            </div>
          </div>

          {/* Headline — mobile-first sizes */}
          <div className="text-center max-w-4xl mx-auto mb-5 sm:mb-6">
            <h1 className="text-[38px] sm:text-[58px] lg:text-[78px] font-extrabold tracking-tighter leading-[1.05] text-gray-900 mb-4 sm:mb-6">
              Controla tu dinero{' '}
              <span style={{ color: '#0073ea' }}>con precisión.</span>
            </h1>
            <p className="text-[15px] sm:text-[18px] lg:text-[20px] text-gray-500 leading-relaxed max-w-2xl mx-auto font-normal">
              Registra gastos, visualiza estadísticas y mantén tu presupuesto bajo control — desde una interfaz clara, rápida y elegante.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 sm:mb-16 px-0">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-[#0073ea] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-[15px] sm:text-[16px] hover:bg-[#0060b9] transition-all hover:shadow-xl hover:shadow-blue-500/30 group w-full sm:w-auto">
              Empezar gratis
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-[15px] sm:text-[16px] hover:bg-gray-100 transition-all w-full sm:w-auto">
              Iniciar sesión
            </Link>
          </div>

          {/* Social proof — horizontal scroll on mobile */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12 sm:mb-20 text-[12px] sm:text-[13px] text-gray-400 font-medium flex-wrap">
            <div className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-green-500" /> Datos seguros</div>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <div className="flex items-center gap-1.5"><TrendingUp size={13} className="text-blue-500" /> Tiempo real</div>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-purple-500" /> Fácil de usar</div>
          </div>

          {/* ─── DASHBOARD SCREENSHOT ─────────────────────────── */}
          <div className="relative">
            {/* Ambient glow */}
            <div className="absolute -inset-x-20 top-10 h-[80%] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />

            {/* Floating stat cards — only desktop */}
            <div className="absolute -left-4 top-12 z-20 hidden lg:block animate-[float_7s_ease-in-out_infinite]">
              <div className="bg-white border border-gray-100 shadow-2xl shadow-gray-200/80 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Activity size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ahorro Mensual</p>
                  <p className="text-[18px] font-extrabold text-green-600 leading-tight">+24.5%</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-20 z-20 hidden lg:block animate-[float_9s_ease-in-out_infinite_reverse]">
              <div className="bg-white border border-gray-100 shadow-2xl shadow-gray-200/80 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={12} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Último gasto</span>
                </div>
                <p className="text-[18px] font-extrabold text-gray-900 font-mono">-$120.00</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Supermercado · Hoy</p>
              </div>
            </div>

            {/* Screenshot */}
            <div className="relative mx-auto max-w-5xl rounded-[12px] sm:rounded-[20px] overflow-hidden border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] sm:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)]">
              <Image
                src="/dashboard-mockup-1.png"
                alt="Vista del Dashboard Financiero"
                width={1280}
                height={800}
                className="w-full h-auto block"
                priority
              />
            </div>

            {/* Bottom fade */}
            <div className="absolute -bottom-px left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[12px] sm:text-[13px] font-bold text-[#0073ea] uppercase tracking-widest mb-3 sm:mb-4">Características</p>
            <h2 className="text-[30px] sm:text-[42px] lg:text-[52px] font-extrabold tracking-tight text-gray-900 leading-tight mb-3 sm:mb-4">
              Diseñado para lo que{' '}
              <span className="text-gray-400">realmente importa.</span>
            </h2>
            <p className="text-[15px] sm:text-[18px] text-gray-500 max-w-xl mx-auto leading-relaxed">
              Gestiona tu dinero de forma rápida, clara y sin complicaciones.
            </p>
          </div>

          {/* Feature grid — 1 col mobile, bento on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">

            {/* Card 1 — Wide */}
            <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <PieChart size={22} className="text-[#0073ea]" />
                </div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-gray-900 mb-2 sm:mb-3">Analítica Visual en Tiempo Real</h3>
                <p className="text-[14px] sm:text-[16px] text-gray-500 leading-relaxed mb-5 sm:mb-8">Gráficos de gastos por categoría, tendencias mensuales y comparativas de ingresos vs. egresos — todo actualizado al instante.</p>

                {/* Mini chart */}
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-end gap-1.5 sm:gap-2 h-12 sm:h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-md transition-all" style={{ height: `${h}%`, backgroundColor: i === 5 ? '#0073ea' : '#e5f0fd' }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'].map(m => (
                      <span key={m} className="text-[9px] sm:text-[10px] text-gray-400 font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="md:col-span-5 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex flex-col h-full">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Wallet size={22} className="text-indigo-600" />
                </div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-gray-900 mb-2 sm:mb-3">Presupuesto Inteligente</h3>
                <p className="text-[14px] sm:text-[16px] text-gray-500 leading-relaxed mb-5 sm:mb-8">Visualiza tu balance disponible proyectado y evita sorpresas a fin de mes.</p>

                <div className="mt-auto bg-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-100">
                  <p className="text-[10px] sm:text-[11px] font-bold text-indigo-400 uppercase tracking-wide mb-1">Disponible este mes</p>
                  <p className="text-[24px] sm:text-[28px] font-extrabold text-indigo-700 font-mono">$1,248.50</p>
                  <div className="mt-2 h-1.5 sm:h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[62%]" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-indigo-400 mt-1.5">62% del presupuesto disponible</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="md:col-span-5 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group hover:border-green-100 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex flex-col h-full">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-5 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <CalendarDays size={22} className="text-green-600" />
                </div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-gray-900 mb-2 sm:mb-3">Pagos Recurrentes</h3>
                <p className="text-[14px] sm:text-[16px] text-gray-500 leading-relaxed mb-5">Marca gastos como recurrentes y olvídate de registrarlos cada mes manualmente.</p>

                <div className="mt-auto space-y-2">
                  {[
                    { name: 'Netflix', amount: '$15', color: 'bg-red-100 text-red-600' },
                    { name: 'Spotify', amount: '$10', color: 'bg-green-100 text-green-600' },
                    { name: 'Internet', amount: '$45', color: 'bg-blue-100 text-blue-600' },
                  ].map(item => (
                    <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <span className="text-[13px] font-semibold text-gray-700">{item.name}</span>
                      <span className={`text-[12px] font-bold px-2 py-0.5 rounded-lg ${item.color}`}>{item.amount}/mes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4 — Wide */}
            <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 group hover:border-purple-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-5 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={22} className="text-purple-600" />
                </div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-gray-900 mb-2 sm:mb-3">Flexibilidad Total</h3>
                <p className="text-[14px] sm:text-[16px] text-gray-500 leading-relaxed mb-5 sm:mb-8">Funciona igual de bien solo o compartido. Columnas, categorías y filtros totalmente personalizables.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { text: 'Sincronización en la nube' },
                    { text: 'Multiusuario opcional' },
                    { text: 'Columnas personalizadas' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-purple-50 rounded-xl px-3 py-3 border border-purple-100">
                      <CheckCircle2 size={15} className="text-purple-600 shrink-0" />
                      <span className="text-[13px] font-semibold text-gray-700 leading-tight">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0073ea] rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-white/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />
            <div className="relative">
              <h2 className="text-[28px] sm:text-[38px] lg:text-[48px] font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
                Empieza a controlar<br />tus finanzas hoy.
              </h2>
              <p className="text-[15px] sm:text-[18px] text-blue-100 mb-8 sm:mb-10 max-w-xl mx-auto">Sin complicaciones. Tu dashboard financiero te espera.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-[#0073ea] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[15px] sm:text-[16px] hover:bg-blue-50 transition-all group">
                Ir al Dashboard
                <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-without-bg.png"
              alt="Finanp"
              width={80}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </div>
          <p className="text-[12px] sm:text-[13px] text-gray-400">
            Desarrollado por{' '}
            <a
              href="https://bescobar-git-master-beck23s-projects.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-600 hover:text-[#0073ea] transition-colors"
            >
              Bryan Escobar
            </a>
          </p>
          <Link href="/login" className="text-[12px] sm:text-[13px] font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            Iniciar Sesión →
          </Link>
        </div>
      </footer>
    </div>
  );
}
