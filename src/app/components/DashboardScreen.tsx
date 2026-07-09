import { useState } from "react";
import type { Debt, Property, UserType, User } from "../App";

interface DashboardScreenProps {
  currentUser: User;
  userType: UserType;
  debts: Debt[];
  properties: Property[];
  selectedPropertyIndex: number;
  onSelectProperty: (i: number) => void;
  onPay: (ids: number[]) => void;
  onLogout: () => void;
}

function formatCLP(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Sugerencia / Reclamo Modal ────────────────────────────────────────────────
function SugerenciaModal({ userName, depto, onClose }: { userName: string; depto: string; onClose: () => void }) {
  const [tipo, setTipo] = useState<"sugerencia" | "reclamo">("sugerencia");
  const [categoria, setCategoria] = useState("");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const categorias = {
    sugerencia: ["Áreas comunes", "Servicios del edificio", "Comunicación", "Seguridad", "Otro"],
    reclamo: ["Cobro incorrecto", "Ruido / Molestias", "Mantención pendiente", "Personal", "Seguridad", "Otro"],
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoria) { setError("Seleccione una categoría."); return; }
    if (!asunto.trim()) { setError("Ingrese un asunto."); return; }
    if (descripcion.trim().length < 20) { setError("La descripción debe tener al menos 20 caracteres."); return; }
    setError("");
    setSubmitted(true);
  }

  const BORDER = "rgba(26,43,74,0.15)";
  const isReclamo = tipo === "reclamo";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(26,43,74,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(26,43,74,0.3)" }}>
        <div className="px-7 py-5 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${isReclamo ? "#c62828" : "#1A2B4A"} 0%, ${isReclamo ? "#e53935" : "#243d6b"} 100%)` }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              Depto. {depto} · {userName}
            </p>
            <p className="text-lg font-bold text-white">{isReclamo ? "Enviar Reclamo" : "Enviar Sugerencia"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="px-7 py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: isReclamo ? "#fff0f0" : "#f0faf0" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isReclamo ? "#E53935" : "#43A047"} strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#1A2B4A" }}>{isReclamo ? "Reclamo Enviado" : "Sugerencia Enviada"}</h3>
            <p className="text-sm mb-1" style={{ color: "#6b7a99" }}>Tu {tipo} ha sido recibida por la administración.</p>
            <p className="text-xs mb-6" style={{ color: "#6b7a99" }}>
              Nº de seguimiento: <span className="font-mono font-semibold" style={{ color: "#1A2B4A" }}>
                {isReclamo ? "REC" : "SUG"}-2026-{Math.floor(1000 + Math.random() * 9000)}
              </span>
            </p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="px-7 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["sugerencia", "reclamo"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setTipo(t); setCategoria(""); setError(""); }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all"
                  style={{
                    borderColor: tipo === t ? (t === "reclamo" ? "#E53935" : "#F5A623") : "rgba(26,43,74,0.12)",
                    backgroundColor: tipo === t ? (t === "reclamo" ? "#fff0f0" : "#fffbf0") : "#f8f9fc",
                    color: tipo === t ? (t === "reclamo" ? "#E53935" : "#1A2B4A") : "#6b7a99",
                  }}>
                  {t === "sugerencia"
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: "#fff0f0", border: "1px solid rgba(229,57,53,0.2)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm" style={{ color: "#E53935" }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Categoría</label>
              <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setError(""); }}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none cursor-pointer"
                style={{ borderColor: BORDER, backgroundColor: "#f8f9fc", color: categoria ? "#1A2B4A" : "#6b7a99" }}
                onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}>
                <option value="">Seleccione una categoría...</option>
                {categorias[tipo].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Asunto</label>
              <input value={asunto} onChange={(e) => { setAsunto(e.target.value); setError(""); }}
                placeholder={tipo === "sugerencia" ? "Ej: Mejorar iluminación del estacionamiento" : "Ej: Cobro duplicado en gastos comunes"}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: BORDER, backgroundColor: "#f8f9fc", color: "#1A2B4A" }}
                onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A2B4A" }}>
                Descripción <span className="font-normal" style={{ color: "#6b7a99" }}>(mín. 20 caracteres)</span>
              </label>
              <textarea value={descripcion} onChange={(e) => { setDescripcion(e.target.value); setError(""); }}
                rows={4} placeholder={tipo === "sugerencia" ? "Describa su sugerencia con detalle..." : "Describa el problema con detalle, incluyendo fechas y montos si aplica..."}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
                style={{ borderColor: BORDER, backgroundColor: "#f8f9fc", color: "#1A2B4A" }}
                onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)} />
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={{ color: descripcion.length < 20 ? "#E53935" : "#43A047" }}>
                  {descripcion.length} / 20 mín.
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-slate-50"
                style={{ borderColor: "rgba(26,43,74,0.2)", color: "#1A2B4A" }}>Cancelar</button>
              <button type="submit"
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2"
                style={{ backgroundColor: isReclamo ? "#E53935" : "#F5A623", color: isReclamo ? "#ffffff" : "#1A2B4A" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Enviar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function DashboardScreen({
  currentUser, userType, debts, properties, selectedPropertyIndex,
  onSelectProperty, onPay, onLogout,
}: DashboardScreenProps) {
  const [showSugerencia, setShowSugerencia] = useState(false);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const totalDeuda = debts.reduce((sum, d) => sum + (d.monto - d.abonado), 0);
  const isDeudor = totalDeuda > 0;
  const isTenant = userType === "arrendatario";
  const userName = currentUser.nombre;
  const userRole = isTenant ? "Arrendatario" : "Propietario";
  const userSub = isTenant ? `Depto ${currentUser.depto} · Torre A` : `${properties.length} propiedades`;
  const userInitials = userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const checkedDebts = debts.filter((d) => checkedIds.includes(d.id));
  const checkedTotal = checkedDebts.reduce((s, d) => s + (d.monto - d.abonado), 0);
  const allChecked = debts.length > 0 && debts.every((d) => checkedIds.includes(d.id));

  function toggleCheck(id: number) {
    setCheckedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    setCheckedIds(allChecked ? [] : debts.map((d) => d.id));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f2f5" }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ backgroundColor: "#1A2B4A", boxShadow: "0 2px 16px rgba(0,0,0,0.18)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5A623" }}>
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
              <rect x="4" y="10" width="28" height="22" rx="2" fill="#1A2B4A" />
              <rect x="10" y="16" width="5" height="5" rx="1" fill="#F5A623" />
              <rect x="20" y="16" width="5" height="5" rx="1" fill="#F5A623" />
              <rect x="15" y="24" width="6" height="8" rx="1" fill="#F5A623" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">Edificio Mirador</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>{userInitials}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium leading-none">{userName}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: isTenant ? "rgba(251,140,0,0.2)" : "rgba(255,255,255,0.12)", color: isTenant ? "#FB8C00" : "#8fa0be" }}>
                {userRole}
              </span>
            </div>
            <p className="text-xs leading-none mt-0.5" style={{ color: "#8fa0be" }}>{userSub}</p>
          </div>
          <button onClick={() => setShowSugerencia(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: "rgba(245,166,35,0.15)", color: "#F5A623", border: "1px solid rgba(245,166,35,0.3)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Sugerencia / Reclamo
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: "#8fa0be" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </div>
      </nav>

      <div className="pt-16 px-8 py-8 max-w-6xl mx-auto">

        {/* Welcome Banner */}
        <div className="rounded-2xl p-7 mb-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1A2B4A 0%, #243d6b 100%)", boxShadow: "0 4px 24px rgba(26,43,74,0.18)" }}>
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #F5A623 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <p className="text-sm mb-1" style={{ color: "#8fa0be" }}>Bienvenido/a</p>
          <h1 className="text-2xl font-bold text-white">
            {userName} — <span style={{ color: "#F5A623" }}>{userSub}</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: isTenant ? "rgba(251,140,0,0.2)" : "rgba(67,160,71,0.2)", color: isTenant ? "#FB8C00" : "#43A047" }}>
              {userRole}
            </span>
            <span className="text-xs" style={{ color: "#8fa0be" }}>Período activo: Junio 2026</span>
          </div>
        </div>

        {/* Property selector (owner only) */}
        {!isTenant && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6b7a99" }}>Sus Propiedades</p>
            <div className="grid grid-cols-2 gap-4">
              {properties.map((prop, i) => {
                const propDeuda = prop.debts.reduce((s, d) => s + (d.monto - d.abonado), 0);
                const isActive = i === selectedPropertyIndex;
                return (
                  <button key={prop.id} onClick={() => { onSelectProperty(i); setCheckedIds([]); }}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: isActive ? "#F5A623" : "rgba(26,43,74,0.1)",
                      backgroundColor: isActive ? "#fffbf0" : "#ffffff",
                      boxShadow: isActive ? "0 0 0 3px rgba(245,166,35,0.12)" : "0 2px 8px rgba(26,43,74,0.07)",
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isActive ? "#F5A623" : "#e8ecf2" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={isActive ? "#1A2B4A" : "#6b7a99"} strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "#1A2B4A" }}>{prop.nombre}</p>
                      <p className="text-xs mt-0.5" style={{ color: propDeuda > 0 ? "#E53935" : "#43A047" }}>
                        {propDeuda > 0 ? `Deuda: ${formatCLP(propDeuda)}` : "Al día"}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#F5A623" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: "#6b7a99" }}>Deuda Pendiente</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isDeudor ? "#fff0f0" : "#f0faf0" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={isDeudor ? "#E53935" : "#43A047"} strokeWidth="2">
                  {isDeudor
                    ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                    : <><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></>}
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: isDeudor ? "#E53935" : "#43A047" }}>
              {formatCLP(totalDeuda)}
            </p>
            <p className="text-xs mt-2" style={{ color: "#6b7a99" }}>
              {isDeudor ? `${debts.length} cuota${debts.length !== 1 ? "s" : ""} pendiente${debts.length !== 1 ? "s" : ""}` : "Sin deudas pendientes"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: "#6b7a99" }}>Estado de Cuenta</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isDeudor ? "#fff0f0" : "#f0faf0" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={isDeudor ? "#E53935" : "#43A047"} strokeWidth="2">
                  {isDeudor
                    ? <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
                    : <polyline points="20 6 9 17 4 12" />}
                </svg>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: isDeudor ? "#fff0f0" : "#f0faf0", color: isDeudor ? "#E53935" : "#43A047" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isDeudor ? "#E53935" : "#43A047" }} />
              {isDeudor ? "Moroso" : "Al día"}
            </span>
            <p className="text-xs mt-2" style={{ color: "#6b7a99" }}>
              {isDeudor ? "Tiene pagos vencidos o pendientes" : "Todos sus pagos están al corriente"}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(26,43,74,0.08)" }}>
            <div>
              <h2 className="font-semibold" style={{ color: "#1A2B4A" }}>Cuentas por Pagar</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>
                {checkedIds.length > 0
                  ? <span style={{ color: "#F5A623" }}>{checkedIds.length} seleccionada{checkedIds.length !== 1 ? "s" : ""} — {formatCLP(checkedTotal)}</span>
                  : "Selecciona una o más deudas para pagar juntas"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: isDeudor ? "#fff0f0" : "#f0faf0", color: isDeudor ? "#E53935" : "#43A047" }}>
              {debts.length} pendiente{debts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isTenant && debts.some((d) => d.categoria === "Arriendo") && (
            <div className="mx-4 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#fff8ee", border: "1px solid rgba(251,140,0,0.25)" }}>
              <span className="text-base mt-0.5">⚠️</span>
              <p className="text-xs font-medium" style={{ color: "#FB8C00" }}>
                El <strong>arriendo debe pagarse antes del día 5 de cada mes</strong>. El no pago oportuno puede generar multas.
              </p>
            </div>
          )}

          {debts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#f0faf0" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: "#1A2B4A" }}>¡Sin deudas pendientes!</h3>
              <p className="text-sm" style={{ color: "#6b7a99" }}>Todos sus gastos están al día.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fc" }}>
                      <th className="pl-5 pr-2 py-3 w-10" />
                      {["Descripción", "Monto", "Pendiente", "Vencimiento", "Estado", "Acción"].map((col) => (
                        <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#6b7a99" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map((d) => {
                      const remaining = d.monto - d.abonado;
                      const pct = d.monto > 0 ? (d.abonado / d.monto) * 100 : 0;
                      const isArriendo = d.categoria === "Arriendo";
                      const isChecked = checkedIds.includes(d.id);

                      return (
                        <tr key={d.id}
                          onClick={() => toggleCheck(d.id)}
                          className="border-t transition-colors cursor-pointer"
                          style={{
                            borderColor: "rgba(26,43,74,0.06)",
                            backgroundColor: isChecked ? "#fffbf0" : isArriendo ? "rgba(229,57,53,0.02)" : undefined,
                          }}
                          onMouseEnter={(e) => { if (!isChecked) (e.currentTarget as HTMLElement).style.backgroundColor = "#f8f9fc"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isChecked ? "#fffbf0" : isArriendo ? "rgba(229,57,53,0.02)" : ""; }}>

                          {/* Checkbox */}
                          <td className="pl-5 pr-2 py-4" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={isChecked} onChange={() => toggleCheck(d.id)}
                              className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: "#F5A623" }} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isArriendo && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: "#fff0f0", color: "#E53935" }}>🔑 Arriendo</span>
                              )}
                              <p className="text-sm font-medium" style={{ color: isArriendo ? "#E53935" : "#1A2B4A" }}>
                                {d.descripcion}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-medium" style={{ color: "#1A2B4A" }}>{formatCLP(d.monto)}</span>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <span className="text-sm font-semibold" style={{ color: isArriendo ? "#E53935" : "#1A2B4A" }}>
                                {formatCLP(remaining)}
                              </span>
                              {d.abonado > 0 && (
                                <div className="w-14 h-1.5 rounded-full mt-1" style={{ backgroundColor: "#e8ecf2" }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#43A047" }} />
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm" style={{ color: "#6b7a99" }}>{formatDate(d.vencimiento)}</span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: isArriendo || d.estado === "Vencido" ? "#fff0f0" : "#fff8ee",
                                color: isArriendo || d.estado === "Vencido" ? "#E53935" : "#FB8C00",
                              }}>
                              <span className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: isArriendo || d.estado === "Vencido" ? "#E53935" : "#FB8C00" }} />
                              {d.estado}
                            </span>
                          </td>

                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => onPay([d.id])}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
                              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
                              Pagar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex items-center justify-between border-t"
                style={{ borderColor: "rgba(26,43,74,0.06)", backgroundColor: "#f8f9fc" }}>
                {/* Select-all checkbox with label */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: "#F5A623" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "#1A2B4A" }}>
                    Seleccionar todo
                  </span>
                  {checkedIds.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: "#fffbf0", color: "#F5A623", border: "1px solid rgba(245,166,35,0.3)" }}>
                      {checkedIds.length} de {debts.length}
                    </span>
                  )}
                </label>

                {/* Pay button — always visible, disabled when nothing selected */}
                <button
                  onClick={() => checkedIds.length > 0 && onPay(checkedIds)}
                  disabled={checkedIds.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  {checkedIds.length === 0
                    ? "Selecciona deudas para pagar"
                    : `Pagar ${checkedIds.length === debts.length ? "todo" : checkedIds.length === 1 ? "1 deuda" : `${checkedIds.length} deudas`} — ${formatCLP(checkedTotal)}`
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSugerencia && (
        <SugerenciaModal
          userName={currentUser.nombre}
          depto={currentUser.depto}
          onClose={() => setShowSugerencia(false)}
        />
      )}
    </div>
  );
}
