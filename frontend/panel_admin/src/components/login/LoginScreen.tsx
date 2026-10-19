import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { AdGlobalLogo } from '@/components/AdGlobalLogo';
import { ADMIN_CONFIG } from '@/config/site';
import type { LoginCredentials, LoginResult } from '@/hooks/useAuth';

interface LoginScreenProps {
  onAuthenticate: (credentials: LoginCredentials) => Promise<LoginResult>;
}

export function LoginScreen({ onAuthenticate }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const result = await onAuthenticate({ email, usuario, password, remember });

    setIsLoading(false);
    if (!result.ok) {
      setErrorMessage(result.error ?? 'No se pudo iniciar sesión.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href={ADMIN_CONFIG.publicSiteUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la web</span>
            </a>
            <span className="text-slate-300">|</span>
            <AdGlobalLogo variant="brand" height={28} />
          </div>
        </div>
      </header>

      {/* Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xl relative">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B5C94] to-[#1F4778] flex items-center justify-center mx-auto mb-4 text-white shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Acceso al Sistema Administrativo
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Panel de control, pedidos e inventario de {ADMIN_CONFIG.name}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Email Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  placeholder="nombre@adglobalperu.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-user"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-user"
                  type="text"
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Tu usuario"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5C94] focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#2B5C94] focus:ring-[#2B5C94]"
              />
              Mantener sesión iniciada en este dispositivo
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#2B5C94] hover:bg-[#1F4778] active:scale-[0.99] transition-all duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer mt-5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validando sesión...
                </span>
              ) : (
                <>
                  <span className="text-sm">Ingresar al Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-slate-200 pt-5 text-center text-[11px] text-slate-500">
            Acceso exclusivo para personal autorizado de AD GLOBAL.
          </p>
        </div>
      </main>
    </div>
  );
}
