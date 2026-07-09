import { useState } from "react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => string | null;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Ingrese su correo electrónico."); return; }
    if (!password) { setError("Ingrese su contraseña."); return; }
    setLoading(true);
    setTimeout(() => {
      const err = onLogin(email, password);
      if (err) { setError(err); setLoading(false); }
    }, 400);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1A2B4A" }}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 25px 25px, #F5A623 2px, transparent 0), radial-gradient(circle at 75px 75px, #F5A623 2px, transparent 0)",
        backgroundSize: "100px 100px",
      }} />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl p-10" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1A2B4A" }}>
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="10" width="28" height="22" rx="2" fill="#F5A623" />
                <rect x="8" y="2" width="20" height="10" rx="2" fill="#F5A623" opacity="0.7" />
                <rect x="10" y="16" width="5" height="5" rx="1" fill="#1A2B4A" />
                <rect x="20" y="16" width="5" height="5" rx="1" fill="#1A2B4A" />
                <rect x="15" y="24" width="6" height="8" rx="1" fill="#1A2B4A" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "#1A2B4A" }}>Edificio Mirador</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7a99" }}>Portal Residentes — Iniciar Sesión</p>
          </div>

          {/* Demo hint */}
          <div className="mb-5 px-4 py-3 rounded-xl" style={{ backgroundColor: "#f8f9fc", border: "1px solid rgba(26,43,74,0.08)" }}>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "#1A2B4A" }}>Cuentas de demostración</p>
            {[
              { email: "maria@mirador.cl", password: "123456", label: "Arrendataria", color: "#FB8C00", bg: "#fff8ee" },
              { email: "roberto@mirador.cl", password: "123456", label: "Propietario", color: "#1A2B4A", bg: "#e8ecf2" },
              { email: "admin@mirador.cl", password: "admin2026", label: "Admin", color: "#43A047", bg: "#f0faf0" },
            ].map((u) => (
              <button key={u.email} onClick={() => { setEmail(u.email); setPassword(u.password); setError(null); }}
                className="flex items-center justify-between w-full mt-1 px-3 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: u.bg }}>
                <span className="text-xs font-mono" style={{ color: "#1A2B4A" }}>{u.email}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white" style={{ color: u.color }}>
                  {u.label}
                </span>
              </button>
            ))}
            <p className="text-xs mt-2" style={{ color: "#6b7a99" }}>Residentes: <span className="font-mono font-semibold" style={{ color: "#1A2B4A" }}>123456</span> · Admin: <span className="font-mono font-semibold" style={{ color: "#1A2B4A" }}>admin2026</span></p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ backgroundColor: "#fff0f0", border: "1px solid rgba(229,57,53,0.25)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm" style={{ color: "#E53935" }}>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7a99" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="correo@edificiomirador.cl"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: "rgba(26,43,74,0.15)", backgroundColor: "#f8f9fc", color: "#1A2B4A" }}
                  onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(26,43,74,0.15)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7a99" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: "rgba(26,43,74,0.15)", backgroundColor: "#f8f9fc", color: "#1A2B4A" }}
                  onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(26,43,74,0.15)")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: "#6b7a99" }}>
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "#F5A623" }} />
                <span className="text-sm" style={{ color: "#6b7a99" }}>Recordarme</span>
              </label>
              <button type="button" className="text-sm font-medium hover:underline" style={{ color: "#F5A623" }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              {loading
                ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Verificando...</>
                : "Ingresar"
              }
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "#6b7a99" }}>
            Para solicitar acceso, contacte a la administración del edificio.
          </p>
        </div>

        <p className="text-center text-xs mt-5 opacity-40 text-white">
          © 2026 Edificio Mirador — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
