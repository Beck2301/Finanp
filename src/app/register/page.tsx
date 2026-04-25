"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={34} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm mb-6">Revisa tu correo y confirma tu cuenta para empezar a usar Finanzas.</p>
          <a href="/login" className="inline-block bg-[var(--primary)] text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-[var(--primary-hover)] transition-colors">
            Ir al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#e8f0fe] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--monday-purple)] to-[var(--monday-light-blue)]" />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="w-11 h-11 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-2xl shadow-md">F</div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">Finanzas</h1>
            </div>
            <h2 className="text-xl font-semibold mb-1 text-center text-gray-800">Crea tu cuenta</h2>
            <p className="text-sm text-gray-400 text-center mb-7">Empieza a controlar tus finanzas hoy</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Bryan García" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm bg-gray-50 text-gray-800 placeholder-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ejemplo@correo.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm bg-gray-50 text-gray-800 placeholder-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm bg-gray-50 text-gray-800 placeholder-gray-300" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-70 text-white font-semibold py-2.5 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 shadow-sm text-sm">
                {loading ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Creando cuenta...</span>
                ) : <><UserPlus size={17} /> Crear Cuenta</>}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-[var(--primary)] hover:underline font-semibold">Inicia sesión</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
