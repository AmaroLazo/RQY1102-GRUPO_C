import { useState } from "react";
import type { User, UserType } from "../App";

interface AdminPanelScreenProps {
  users: User[];
  onCreateUser: (data: { nombre: string; email: string; password: string; tipo: UserType; depto: string }) => string | null;
  onLogout: () => void;
}

const navItems = [
  { id: "residentes", label: "Residentes", icon: "👥" },
  { id: "informes", label: "Informes", icon: "📊" },
];

// Static extra residents for display richness (not real auth accounts)
const STATIC_RESIDENTS = [
  { depto: "101", nombre: "Pedro Sánchez", deuda: 247000, estado: "Moroso", ultimoPago: "15 Abr 2026", tipo: "arrendatario" },
  { depto: "203", nombre: "Ana Torres", deuda: 85000, estado: "Moroso", ultimoPago: "10 May 2026", tipo: "arrendatario" },
  { depto: "310", nombre: "Roberto Fuentes", deuda: 0, estado: "Al día", ultimoPago: "05 Jun 2026", tipo: "propietario" },
  { depto: "412", nombre: "Isabel Herrera", deuda: 0, estado: "Al día", ultimoPago: "03 Jun 2026", tipo: "propietario" },
  { depto: "702", nombre: "Miguel Reyes", deuda: 117000, estado: "Moroso", ultimoPago: "20 Abr 2026", tipo: "arrendatario" },
  { depto: "801", nombre: "Claudia Vega", deuda: 0, estado: "Al día", ultimoPago: "07 Jun 2026", tipo: "arrendatario" },
];

function formatCLP(n: number) {
  if (n === 0) return "—";
  return `$${n.toLocaleString("es-CL")}`;
}

const BORDER = "rgba(26,43,74,0.15)";
const FIELD_STYLE = { borderColor: BORDER, backgroundColor: "#f8f9fc", color: "#1A2B4A" };

// ── Create Resident Modal ────────────────────────────────────────────────────

function CreateResidentModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (data: { nombre: string; email: string; password: string; tipo: UserType; depto: string }) => string | null;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState<UserType>("arrendatario");
  const [depto, setDepto] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) { setError("Ingrese el nombre completo."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Ingrese un correo válido."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (!depto.trim()) { setError("Ingrese el número de departamento."); return; }
    setLoading(true);
    setTimeout(() => {
      const err = onConfirm({ nombre: nombre.trim(), email: email.trim(), password, tipo, depto: depto.trim() });
      if (err) { setError(err); setLoading(false); }
      else { setSuccess(true); setLoading(false); }
    }, 400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(26,43,74,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(26,43,74,0.3)" }}>

        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1A2B4A 0%, #243d6b 100%)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#8fa0be" }}>
              Administración
            </p>
            <p className="text-lg font-bold text-white">Crear Cuenta de Residente</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "#8fa0be" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="px-7 py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#f0faf0" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-1" style={{ color: "#1A2B4A" }}>Cuenta Creada</h3>
            <p className="text-sm mb-1" style={{ color: "#6b7a99" }}>
              La cuenta de <strong style={{ color: "#1A2B4A" }}>{nombre}</strong> fue creada exitosamente.
            </p>
            <p className="text-xs mb-6" style={{ color: "#6b7a99" }}>
              El residente puede ingresar con <span className="font-mono font-semibold" style={{ color: "#1A2B4A" }}>{email}</span>
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="px-7 py-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ backgroundColor: "#fff0f0", border: "1px solid rgba(229,57,53,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm" style={{ color: "#E53935" }}>{error}</p>
              </div>
            )}

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Tipo de Residente</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "arrendatario", label: "Arrendatario", icon: "🏠" },
                  { value: "propietario", label: "Propietario", icon: "🏢" },
                ] as const).map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setTipo(opt.value)}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left"
                    style={{
                      borderColor: tipo === opt.value ? "#F5A623" : "rgba(26,43,74,0.12)",
                      backgroundColor: tipo === opt.value ? "#fffbf0" : "#f8f9fc",
                    }}>
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: "#1A2B4A" }}>{opt.label}</span>
                    {tipo === opt.value && (
                      <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F5A623" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Nombre Completo</label>
              <input value={nombre} onChange={(e) => { setNombre(e.target.value); setError(null); }}
                placeholder="Ej: Juan Pérez González"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={FIELD_STYLE}
                onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="residente@ejemplo.cl"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={FIELD_STYLE}
                onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)} />
            </div>

            {/* Depto */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Departamento</label>
              <input value={depto} onChange={(e) => { setDepto(e.target.value); setError(null); }}
                placeholder="Ej: 504"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={FIELD_STYLE}
                onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Contraseña Temporal</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={FIELD_STYLE}
                  onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: "#6b7a99" }}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#6b7a99" }}>
                El residente podrá cambiar su contraseña al ingresar.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-slate-50"
                style={{ borderColor: "rgba(26,43,74,0.2)", color: "#1A2B4A" }}>
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
                {loading
                  ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Creando...</>
                  : "Crear Cuenta"
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Admin Panel ──────────────────────────────────────────────────────────────

export function AdminPanelScreen({ users, onCreateUser, onLogout }: AdminPanelScreenProps) {
  const [activeNav, setActiveNav] = useState("residentes");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Merge real users with static display data
  const realResidents = users.map((u) => ({
    depto: u.depto,
    nombre: u.nombre,
    deuda: 0,
    estado: "Al día",
    ultimoPago: "—",
    tipo: u.tipo,
    isReal: true,
  }));

  const allResidents = [
    ...realResidents,
    ...STATIC_RESIDENTS.filter((s) => !realResidents.find((r) => r.depto === s.depto)).map((s) => ({ ...s, isReal: false })),
  ];

  const filtered = allResidents.filter((r) => {
    const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase()) || r.depto.includes(search);
    const matchStatus = statusFilter === "Todos" || r.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRecaudado = 4_850_000;
  const morosos = allResidents.filter((r) => r.estado === "Moroso").length;
  const alDia = allResidents.filter((r) => r.estado === "Al día").length;

  const kpis = [
    { label: "Total Recaudado", value: `$${totalRecaudado.toLocaleString("es-CL")}`, sub: "Mes en curso", color: "#43A047", bg: "#f0faf0", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
    { label: "Residentes Activos", value: `${allResidents.length}`, sub: `${users.length} con acceso al portal`, color: "#1A2B4A", bg: "#e8ecf2", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: "Residentes Morosos", value: `${morosos}`, sub: `${alDia} al día`, color: "#E53935", bg: "#fff0f0", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> },
    { label: "Próximo Vencimiento", value: "15 Jun 2026", sub: "Gastos Comunes", color: "#FB8C00", bg: "#fff8ee", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB8C00" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f2f5" }}>
      {showCreateModal && (
        <CreateResidentModal
          onConfirm={onCreateUser}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col fixed top-0 left-0 bottom-0"
        style={{ backgroundColor: "#1A2B4A", boxShadow: "4px 0 24px rgba(0,0,0,0.12)" }}>
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F5A623" }}>
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="10" width="28" height="22" rx="2" fill="#1A2B4A" />
                <rect x="10" y="16" width="5" height="5" rx="1" fill="#F5A623" />
                <rect x="20" y="16" width="5" height="5" rx="1" fill="#F5A623" />
                <rect x="15" y="24" width="6" height="8" rx="1" fill="#F5A623" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Mirador</p>
              <p className="text-xs mt-0.5" style={{ color: "#8fa0be" }}>Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: activeNav === item.id ? "rgba(245,166,35,0.15)" : "transparent",
                color: activeNav === item.id ? "#F5A623" : "#8fa0be",
              }}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {activeNav === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F5A623" }} />}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              AD
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">Admin Principal</p>
              <p className="text-xs truncate" style={{ color: "#8fa0be" }}>admin@mirador.cl</p>
            </div>
            <button onClick={onLogout} className="ml-auto flex-shrink-0 hover:opacity-70 transition-opacity" style={{ color: "#8fa0be" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 p-8 min-h-screen">

        {/* ── INFORMES VIEW ── */}
        {activeNav === "informes" && (
          <InformesView allResidents={allResidents} />
        )}

        {/* ── RESIDENTES / DASHBOARD VIEW ── */}
        {activeNav !== "informes" && (
          <>
        {/* Top bar */}
        <div className="flex items-center gap-4 mb-7">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7a99" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: "rgba(26,43,74,0.15)", backgroundColor: "#ffffff", color: "#1A2B4A" }}
              placeholder="Buscar residente o departamento..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(26,43,74,0.15)")}
            />
          </div>
          <select
            className="px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer appearance-none"
            style={{ borderColor: "rgba(26,43,74,0.15)", backgroundColor: "#ffffff", color: "#1A2B4A" }}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>Todos</option>
            <option>Al día</option>
            <option>Moroso</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Residente
          </button>
        </div>

        <div className="mb-6">
          <h1 className="font-bold text-xl" style={{ color: "#1A2B4A" }}>Panel de Administración</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7a99" }}>Gestión de residentes y accesos — Junio 2026</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: "#6b7a99" }}>{kpi.label}</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                  {kpi.icon}
                </div>
              </div>
              <p className="font-bold" style={{ color: kpi.color, fontSize: "1.1rem" }}>{kpi.value}</p>
              <p className="text-xs mt-1" style={{ color: "#6b7a99" }}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Residents Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(26,43,74,0.08)" }}>
            <div>
              <h2 className="font-semibold" style={{ color: "#1A2B4A" }}>Listado de Residentes</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#e8ecf2", color: "#1A2B4A" }}>
                {users.length} con acceso al portal
              </span>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:bg-slate-50"
                style={{ borderColor: "rgba(26,43,74,0.15)", color: "#1A2B4A" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#f8f9fc" }}>
                  {["Depto", "Nombre Residente", "Tipo", "Deuda Total", "Estado", "Último Pago", "Acceso Portal", "Acciones"].map((col) => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7a99" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-t transition-colors hover:bg-slate-50" style={{ borderColor: "rgba(26,43,74,0.06)" }}>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm"
                        style={{ backgroundColor: "#e8ecf2", color: "#1A2B4A" }}>{r.depto}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: r.estado === "Moroso" ? "#fff0f0" : "#f0faf0", color: r.estado === "Moroso" ? "#E53935" : "#43A047" }}>
                          {r.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#1A2B4A" }}>{r.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: r.tipo === "arrendatario" ? "#fff8ee" : "#e8ecf2", color: r.tipo === "arrendatario" ? "#FB8C00" : "#1A2B4A" }}>
                        {r.tipo === "arrendatario" ? "Arrendatario" : "Propietario"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold" style={{ color: r.deuda > 0 ? "#E53935" : "#6b7a99" }}>
                        {formatCLP(r.deuda)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: r.estado === "Moroso" ? "#fff0f0" : "#f0faf0", color: r.estado === "Moroso" ? "#E53935" : "#43A047" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.estado === "Moroso" ? "#E53935" : "#43A047" }} />
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm" style={{ color: "#6b7a99" }}>{r.ultimoPago}</span>
                    </td>
                    <td className="px-5 py-4">
                      {(r as any).isReal ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: "#f0faf0", color: "#43A047" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      ) : (
                        <button onClick={() => setShowCreateModal(true)}
                          className="text-xs font-medium hover:underline" style={{ color: "#F5A623" }}>
                          Crear acceso
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: "#e8ecf2", color: "#1A2B4A" }} title="Ver detalles">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: r.estado === "Moroso" ? "#fff0f0" : "#f0faf0", color: r.estado === "Moroso" ? "#E53935" : "#43A047" }}
                          title="Notificar">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between"
            style={{ backgroundColor: "#f8f9fc", borderTop: "1px solid rgba(26,43,74,0.06)" }}>
            <p className="text-xs" style={{ color: "#6b7a99" }}>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Residente
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Informes View ────────────────────────────────────────────────────────────

type Resident = { depto: string; nombre: string; deuda: number; estado: string; ultimoPago: string; tipo: string; isReal?: boolean };

function InformesView({ allResidents }: { allResidents: Resident[] }) {
  const now = new Date();
  const periodo = now.toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  const totalResidentes = allResidents.length;
  const morosos = allResidents.filter((r) => r.estado === "Moroso");
  const alDia = allResidents.filter((r) => r.estado === "Al día");
  const tasaMorosidad = totalResidentes > 0 ? ((morosos.length / totalResidentes) * 100).toFixed(1) : "0.0";

  const totalRecaudado = 4_850_000;
  const deudaTotal = morosos.reduce((s, r) => s + r.deuda, 0) + 580_000; // static + dynamic
  const pagosPeriodo = 14;
  const solicitudesAbiertas = 3;

  const summaryKpis = [
    {
      label: "Total Recaudado", value: `$${totalRecaudado.toLocaleString("es-CL")}`,
      sub: `Período ${periodo}`, color: "#43A047", bg: "#f0faf0",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    },
    {
      label: "Deuda Total", value: `$${deudaTotal.toLocaleString("es-CL")}`,
      sub: `${morosos.length} residente${morosos.length !== 1 ? "s" : ""} con deuda`, color: "#E53935", bg: "#fff0f0",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    },
    {
      label: "Tasa de Morosidad", value: `${tasaMorosidad}%`,
      sub: `${morosos.length} morosos de ${totalResidentes}`, color: "#FB8C00", bg: "#fff8ee",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FB8C00" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    },
    {
      label: "Pagos del Período", value: `${pagosPeriodo}`,
      sub: `${periodo}`, color: "#1A2B4A", bg: "#e8ecf2",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    },
    {
      label: "Solicitudes Abiertas", value: `${solicitudesAbiertas}`,
      sub: "Pendientes de revisión", color: "#8b5cf6", bg: "#f5f3ff",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
      label: "Residentes Al Día", value: `${alDia.length}`,
      sub: `de ${totalResidentes} en total`, color: "#43A047", bg: "#f0faf0",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="23 11 17 17 14 14" /></svg>,
    },
  ];

  // Morosidad bar
  const morosidadPct = Number(tasaMorosidad);

  // Static payment rows for the period
  const pagoRows = [
    { residente: "María González", depto: "504", concepto: "Gastos Comunes Jun 2026", monto: 85000, metodo: "Transferencia", fecha: "02 Jun 2026" },
    { residente: "Roberto Méndez", depto: "201", concepto: "Contribuciones 1er Sem", monto: 180000, metodo: "Crédito (3 cuotas)", fecha: "03 Jun 2026" },
    { residente: "Isabel Herrera", depto: "412", concepto: "Gastos Comunes Jun 2026", monto: 85000, metodo: "Débito", fecha: "04 Jun 2026" },
    { residente: "Claudia Vega", depto: "801", concepto: "Arriendo Jun 2026", monto: 450000, metodo: "Transferencia", fecha: "05 Jun 2026" },
    { residente: "Roberto Fuentes", depto: "310", concepto: "Fondo de Reserva Jun 2026", monto: 32000, metodo: "Efectivo", fecha: "07 Jun 2026" },
  ];

  // Open requests
  const solicitudes = [
    { residente: "Pedro Sánchez", depto: "101", tipo: "Renegociación de deuda", fecha: "01 Jun 2026", prioridad: "Alta" },
    { residente: "Ana Torres", depto: "203", tipo: "Error en cobro", fecha: "04 Jun 2026", prioridad: "Media" },
    { residente: "Miguel Reyes", depto: "702", tipo: "Cambio de método de pago", fecha: "06 Jun 2026", prioridad: "Baja" },
  ];

  const prioridadColor: Record<string, { bg: string; color: string }> = {
    Alta: { bg: "#fff0f0", color: "#E53935" },
    Media: { bg: "#fff8ee", color: "#FB8C00" },
    Baja: { bg: "#f0faf0", color: "#43A047" },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "#1A2B4A" }}>Informes</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7a99" }}>Resumen financiero y de residentes — {periodo}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-slate-50"
          style={{ borderColor: "rgba(26,43,74,0.2)", color: "#1A2B4A" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* KPI grid — 3 columns */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {summaryKpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: "#6b7a99" }}>{k.label}</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: k.bg }}>{k.icon}</div>
            </div>
            <p className="font-bold mb-1" style={{ color: k.color, fontSize: "1.35rem", lineHeight: 1 }}>{k.value}</p>
            <p className="text-xs" style={{ color: "#6b7a99" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Morosidad gauge + breakdown */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-1 bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#6b7a99" }}>Tasa de Morosidad</p>
          <div className="flex items-end gap-3 mb-4">
            <p className="font-bold" style={{ color: morosidadPct > 30 ? "#E53935" : morosidadPct > 15 ? "#FB8C00" : "#43A047", fontSize: "2.5rem", lineHeight: 1 }}>
              {tasaMorosidad}%
            </p>
            <p className="text-sm pb-1" style={{ color: "#6b7a99" }}>del total</p>
          </div>
          {/* Bar */}
          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ backgroundColor: "#f0f2f5" }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(morosidadPct, 100)}%`,
              backgroundColor: morosidadPct > 30 ? "#E53935" : morosidadPct > 15 ? "#FB8C00" : "#43A047",
            }} />
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Al día</span>
              <span className="font-semibold" style={{ color: "#43A047" }}>{alDia.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Morosos</span>
              <span className="font-semibold" style={{ color: "#E53935" }}>{morosos.length}</span>
            </div>
          </div>
        </div>

        {/* Solicitudes abiertas */}
        <div className="col-span-2 bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(26,43,74,0.08)" }}>
            <div>
              <p className="font-semibold" style={{ color: "#1A2B4A" }}>Solicitudes Abiertas</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>{solicitudes.length} pendientes de resolución</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#f5f3ff", color: "#8b5cf6" }}>
              {solicitudes.length} abiertas
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f8f9fc" }}>
                {["Residente", "Depto", "Tipo de Solicitud", "Fecha", "Prioridad"].map((c) => (
                  <th key={c} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7a99" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s, i) => (
                <tr key={i} className="border-t hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(26,43,74,0.06)" }}>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: "#1A2B4A" }}>{s.residente}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#6b7a99" }}>{s.depto}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#1A2B4A" }}>{s.tipo}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#6b7a99" }}>{s.fecha}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: prioridadColor[s.prioridad].bg, color: prioridadColor[s.prioridad].color }}>
                      {s.prioridad}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagos del período */}
      <div className="bg-white rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(26,43,74,0.08)" }}>
          <div>
            <p className="font-semibold" style={{ color: "#1A2B4A" }}>Pagos del Período</p>
            <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>Transacciones registradas en {periodo}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#f0faf0", color: "#43A047" }}>
            {pagosPeriodo} pagos · ${totalRecaudado.toLocaleString("es-CL")}
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#f8f9fc" }}>
              {["Residente", "Depto", "Concepto", "Monto", "Método", "Fecha"].map((c) => (
                <th key={c} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7a99" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagoRows.map((p, i) => (
              <tr key={i} className="border-t hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(26,43,74,0.06)" }}>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#1A2B4A" }}>{p.residente}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7a99" }}>{p.depto}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#1A2B4A" }}>{p.concepto}</td>
                <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#43A047" }}>${p.monto.toLocaleString("es-CL")}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7a99" }}>{p.metodo}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7a99" }}>{p.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-3 border-t flex justify-end" style={{ borderColor: "rgba(26,43,74,0.06)", backgroundColor: "#f8f9fc" }}>
          <p className="text-xs" style={{ color: "#6b7a99" }}>Mostrando 5 de {pagosPeriodo} pagos del período</p>
        </div>
      </div>

      {/* Informe de residentes */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.07)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(26,43,74,0.08)" }}>
          <p className="font-semibold" style={{ color: "#1A2B4A" }}>Informe de Residentes</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>Estado financiero por departamento — {periodo}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#f8f9fc" }}>
              {["Depto", "Residente", "Tipo", "Estado Morosidad", "Deuda Pendiente", "Último Pago"].map((c) => (
                <th key={c} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7a99" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allResidents.map((r, i) => (
              <tr key={i} className="border-t hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(26,43,74,0.06)" }}>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl font-bold text-xs" style={{ backgroundColor: "#e8ecf2", color: "#1A2B4A" }}>
                    {r.depto}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#1A2B4A" }}>{r.nombre}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: r.tipo === "arrendatario" ? "#fff8ee" : "#e8ecf2", color: r.tipo === "arrendatario" ? "#FB8C00" : "#1A2B4A" }}>
                    {r.tipo === "arrendatario" ? "Arrendatario" : "Propietario"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: r.estado === "Moroso" ? "#fff0f0" : "#f0faf0", color: r.estado === "Moroso" ? "#E53935" : "#43A047" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.estado === "Moroso" ? "#E53935" : "#43A047" }} />
                    {r.estado}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm font-semibold" style={{ color: r.deuda > 0 ? "#E53935" : "#6b7a99" }}>
                  {r.deuda > 0 ? `$${r.deuda.toLocaleString("es-CL")}` : "—"}
                </td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7a99" }}>{r.ultimoPago}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-3 border-t" style={{ borderColor: "rgba(26,43,74,0.06)", backgroundColor: "#f8f9fc" }}>
          <p className="text-xs" style={{ color: "#6b7a99" }}>{allResidents.length} residentes en total</p>
        </div>
      </div>
    </div>
  );
}
