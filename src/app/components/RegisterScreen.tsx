import { useState } from "react";
import type { UserType } from "../App";

interface RegisterScreenProps {
  onRegister: (data: { nombre: string; email: string; password: string; tipo: UserType; depto: string }) => string | null;
  onGoLogin: () => void;
}

const FIELD_BORDER = "rgba(26,43,74,0.15)";
const FIELD_STYLE = { borderColor: FIELD_BORDER, backgroundColor: "#f8f9fc", color: "#1A2B4A" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ type = "text", value, onChange, placeholder, right }: {
  type?: string; value: string; onChange: (v: string) => void; placeholder?: string; right?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
        style={{ ...FIELD_STYLE, paddingRight: right ? "2.75rem" : undefined }}
        onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
        onBlur={(e) => (e.target.style.borderColor = FIELD_BORDER)}
      />
      {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
    </div>
  );
}

export function RegisterScreen({ onRegister, onGoLogin }: RegisterScreenProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tipo, setTipo] = useState<UserType>("arrendatario");
  const [depto, setDepto] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Débil", "Regular", "Fuerte"][passwordStrength];
  const strengthColor = ["", "#E53935", "#FB8C00", "#43A047"][passwordStrength];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) { setError("Ingrese su nombre completo."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Ingrese un correo electrónico válido."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (!depto.trim()) { setError("Ingrese su número de departamento."); return; }
    setLoading(true);
    setTimeout(() => {
      const err = onRegister({ nombre: nombre.trim(), email, password, tipo, depto: depto.trim() });
      if (err) { setError(err); setLoading(false); }
    }, 400);
  }

  const EyeIcon = ({ open }: { open: boolean }) => open
    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ backgroundColor: "#1A2B4A" }}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 25px 25px, #F5A623 2px, transparent 0), radial-gradient(circle at 75px 75px, #F5A623 2px, transparent 0)",
        backgroundSize: "100px 100px",
      }} />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl p-10" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1A2B4A" }}>
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="10" width="28" height="22" rx="2" fill="#F5A623" />
                <rect x="8" y="2" width="20" height="10" rx="2" fill="#F5A623" opacity="0.7" />
                <rect x="10" y="16" width="5" height="5" rx="1" fill="#1A2B4A" />
                <rect x="20" y="16" width="5" height="5" rx="1" fill="#1A2B4A" />
                <rect x="15" y="24" width="6" height="8" rx="1" fill="#1A2B4A" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "#1A2B4A" }}>Crear Cuenta</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7a99" }}>Edificio Mirador — Portal Residentes</p>
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

            {/* Tipo de residente */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Tipo de Residente</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "arrendatario", label: "Arrendatario", icon: "🏠", desc: "Inquilino" },
                  { value: "propietario", label: "Propietario", icon: "🏢", desc: "Dueño" },
                ] as const).map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setTipo(opt.value)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: tipo === opt.value ? "#F5A623" : "rgba(26,43,74,0.12)",
                      backgroundColor: tipo === opt.value ? "#fffbf0" : "#f8f9fc",
                    }}>
                    <span className="text-xl">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A2B4A" }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: "#6b7a99" }}>{opt.desc}</p>
                    </div>
                    {tipo === opt.value && (
                      <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F5A623" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <Field label="Nombre Completo">
              <Input value={nombre} onChange={setNombre} placeholder="Ej: Juan Pérez González" />
            </Field>

            {/* Email */}
            <Field label="Correo Electrónico">
              <Input type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.cl" />
            </Field>

            {/* Departamento */}
            <Field label="Número de Departamento">
              <Input value={depto} onChange={setDepto} placeholder="Ej: 504" />
            </Field>

            {/* Password */}
            <Field label="Contraseña">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={FIELD_STYLE}
                  onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                  onBlur={(e) => (e.target.style.borderColor = FIELD_BORDER)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: "#6b7a99" }}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ backgroundColor: n <= passwordStrength ? strengthColor : "rgba(26,43,74,0.1)" }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirmar Contraseña">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    ...FIELD_STYLE,
                    borderColor: confirm && password !== confirm ? "rgba(229,57,53,0.4)" : FIELD_BORDER,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                  onBlur={(e) => (e.target.style.borderColor = confirm && password !== confirm ? "rgba(229,57,53,0.4)" : FIELD_BORDER)}
                />
                {confirm.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {password === confirm
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    }
                  </span>
                )}
              </div>
            </Field>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              {loading
                ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Creando cuenta...</>
                : "Crear Cuenta"
              }
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#6b7a99" }}>
            ¿Ya tienes cuenta?{" "}
            <button onClick={onGoLogin} className="font-semibold hover:underline" style={{ color: "#F5A623" }}>
              Inicia sesión
            </button>
          </p>
        </div>

        <p className="text-center text-xs mt-5 opacity-40 text-white">
          © 2026 Edificio Mirador — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
