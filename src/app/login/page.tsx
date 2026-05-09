"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--monday-purple)] to-[var(--monday-light-blue)]" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="w-11 h-11 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-2xl shadow-md">
                F
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">Finanzas</h1>
            </div>

            <h2 className="text-xl font-semibold mb-1 text-center text-gray-800">Bienvenido de vuelta</h2>
            <p className="text-sm text-gray-400 text-center mb-7">Ingresa tus datos para continuar</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm text-sm mb-5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-medium">O CON CORREO</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm bg-gray-50 text-gray-800 placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm bg-gray-50 text-gray-800 placeholder-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[var(--primary)] focus:ring-[var(--primary)]" />
                  <span className="text-gray-500">Recordarme</span>
                </label>
                <a href="#" className="text-[var(--primary)] hover:underline font-medium">¿Olvidaste tu contraseña?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-70 text-white font-semibold py-2.5 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  <><LogIn size={17} /> Iniciar Sesión</>
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="text-[var(--primary)] hover:underline font-semibold">Regístrate aquí</a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">© {new Date().getFullYear()} Finanzas App · Todos los derechos reservados</p>
      </div>
    </div>
  );
}
