import { useState } from "react";
import type { Debt, PaymentResult } from "../App";

interface PaymentWizardScreenProps {
  debts: Debt[];
  selectedDebtIds: number[];
  onComplete: (paidIds: number[], result: PaymentResult) => void;
  onCancel: () => void;
}

const paymentMethods = [
  { id: "efectivo", label: "Efectivo", sub: "Pago en oficina", icon: "💵" },
  { id: "transferencia", label: "Transferencia", sub: "Banco / TEF", icon: "🏦" },
  { id: "debito", label: "Débito", sub: "Transbank WebPay", icon: "💳" },
  { id: "credito", label: "Crédito", sub: "Visa / Mastercard", icon: "💎" },
];

const installmentOptions = [
  { value: 1, label: "1 cuota", sublabel: "Sin interés", rate: 0 },
  { value: 3, label: "3 cuotas", sublabel: "Sin interés", rate: 0 },
  { value: 6, label: "6 cuotas", sublabel: "3.5% interés", rate: 0.035 },
  { value: 12, label: "12 cuotas", sublabel: "5.2% interés", rate: 0.052 },
  { value: 24, label: "24 cuotas", sublabel: "7.8% interés", rate: 0.078 },
];

function formatCLP(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

export function PaymentWizardScreen({ debts, selectedDebtIds, onComplete, onCancel }: PaymentWizardScreenProps) {
  // All debts being paid in this transaction
  const selectedDebts = debts.filter((d) => selectedDebtIds.includes(d.id));
  // Use remaining amount (monto - abonado) as the real base
  const montoBase = selectedDebts.reduce((acc, d) => acc + (d.monto - (d.abonado ?? 0)), 0);
  const isPayAll = selectedDebts.length > 1;

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("credito");
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [transferFileError, setTransferFileError] = useState("");

  const isCredit = method === "credito";
  const isCard = method === "credito" || method === "debito";

  const steps = isCredit
    ? [{ n: 1, label: "Método" }, { n: 2, label: "Datos de Tarjeta" }, { n: 3, label: "Cuotas" }, { n: 4, label: "Confirmar" }]
    : [{ n: 1, label: "Método" }, { n: 2, label: "Datos de Pago" }, { n: 3, label: "Confirmar" }];

  const confirmStep = isCredit ? 4 : 3;

  const selectedInstallment = installmentOptions.find((o) => o.value === installments)!;
  const totalWithInterest = montoBase * (1 + selectedInstallment.rate);
  const monthlyAmount = totalWithInterest / installments;
  const displayTotal = isCredit ? totalWithInterest : montoBase;

  const inputStyle = {
    borderColor: "rgba(26,43,74,0.15)",
    backgroundColor: "#f8f9fc",
    color: "#1A2B4A",
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleMethodChange = (id: string) => {
    setMethod(id);
    setStep(1);
    setInstallments(1);
    setCardErrors({});
    setTransferFile(null);
    setTransferFileError("");
  };

  // Luhn algorithm to validate card number
  function luhn(num: string): boolean {
    const digits = num.replace(/\s/g, "");
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function validateCard(): boolean {
    const errs: Record<string, string> = {};
    const rawNum = cardNumber.replace(/\s/g, "");

    if (rawNum.length !== 16) {
      errs.cardNumber = "El número debe tener 16 dígitos.";
    } else if (!luhn(rawNum)) {
      errs.cardNumber = "Número de tarjeta inválido.";
    }

    if (!cardName.trim() || cardName.trim().split(" ").length < 2) {
      errs.cardName = "Ingrese nombre y apellido como aparece en la tarjeta.";
    }

    if (expiry.length < 5) {
      errs.expiry = "Ingrese la fecha en formato MM/YY.";
    } else {
      const [mm, yy] = expiry.split("/").map(Number);
      const now = new Date();
      const expDate = new Date(2000 + yy, mm - 1, 1);
      if (mm < 1 || mm > 12) {
        errs.expiry = "Mes inválido.";
      } else if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
        errs.expiry = "La tarjeta está vencida.";
      }
    }

    if (cvv.length < 3) {
      errs.cvv = "El CVV debe tener 3 o 4 dígitos.";
    }

    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCardContinue() {
    if (method === "transferencia") {
      if (!transferFile) { setTransferFileError("Debe adjuntar el comprobante de transferencia."); return; }
      setTransferFileError("");
      setStep(3);
    } else if (!isCard || validateCard()) {
      setStep(3);
    }
  }

  if (selectedDebts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f0f2f5" }}>
        <div className="bg-white rounded-2xl p-10 text-center" style={{ boxShadow: "0 4px 24px rgba(26,43,74,0.12)" }}>
          <p className="font-semibold mb-2" style={{ color: "#1A2B4A" }}>No hay deudas pendientes</p>
          <p className="text-sm mb-5" style={{ color: "#6b7a99" }}>Todos sus gastos están al día.</p>
          <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
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
          <span className="font-semibold text-white text-sm">Portal de Pago</span>
        </div>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10" style={{ color: "#8fa0be" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Cancelar
        </button>
      </nav>

      <div className="pt-16 pb-24 px-8 max-w-2xl mx-auto">

        {/* ── DEBT HERO ── */}
        <div className="mt-8 rounded-3xl overflow-hidden mb-6" style={{ boxShadow: "0 8px 32px rgba(26,43,74,0.16)" }}>
          <div className="h-1.5" style={{ backgroundColor: "#F5A623" }} />
          <div className="px-8 py-8" style={{ background: "linear-gradient(135deg, #1A2B4A 0%, #243d6b 100%)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(245,166,35,0.2)", color: "#F5A623" }}>
                  {isPayAll ? `${selectedDebts.length} conceptos seleccionados` : selectedDebts[0].categoria}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(229,57,53,0.15)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>

            {/* Debt item list */}
            <div className="space-y-1.5 mb-6">
              {selectedDebts.map((d) => {
                const remaining = d.monto - (d.abonado ?? 0);
                return (
                  <div key={d.id} className="flex justify-between items-center">
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{d.descripcion}</p>
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">{formatCLP(remaining)}</p>
                      {(d.abonado ?? 0) > 0 && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                          abonado {formatCLP(d.abonado ?? 0)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8fa0be" }}>Total a Pagar</p>
              <p className="font-bold leading-none" style={{ color: "#F5A623", fontSize: "3.5rem", letterSpacing: "-1px" }}>
                {formatCLP(displayTotal)}
              </p>
              {isCredit && installments > 1 && (
                <p className="mt-2 text-sm" style={{ color: "#8fa0be" }}>
                  {installments} cuotas de{" "}
                  <span className="font-semibold text-white">{formatCLP(monthlyAmount)}/mes</span>
                  {selectedInstallment.rate > 0 && (
                    <span style={{ color: "#FB8C00" }}> (interés {(selectedInstallment.rate * 100).toFixed(1)}%)</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── PROGRESS STEPS ── */}
        <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 z-0" style={{ backgroundColor: "rgba(26,43,74,0.1)" }} />
            <div className="absolute top-5 left-0 h-0.5 z-0 transition-all duration-500"
              style={{ backgroundColor: "#F5A623", width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-2 z-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  style={{
                    backgroundColor: step > s.n ? "#43A047" : step === s.n ? "#F5A623" : "#ffffff",
                    color: step > s.n ? "#ffffff" : step === s.n ? "#1A2B4A" : "#6b7a99",
                    border: step <= s.n ? "2px solid rgba(26,43,74,0.15)" : "none",
                    boxShadow: step === s.n ? "0 0 0 4px rgba(245,166,35,0.2)" : "none",
                  }}>
                  {step > s.n
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    : s.n}
                </div>
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: step === s.n ? "#1A2B4A" : "#6b7a99" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 1: METHOD ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
            <h2 className="font-semibold mb-1" style={{ color: "#1A2B4A" }}>Método de Pago</h2>
            <p className="text-sm mb-5" style={{ color: "#6b7a99" }}>Seleccione cómo desea realizar su pago.</p>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((m) => (
                <button key={m.id} onClick={() => handleMethodChange(m.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                  style={{
                    borderColor: method === m.id ? "#F5A623" : "rgba(26,43,74,0.1)",
                    backgroundColor: method === m.id ? "#fffbf0" : "#ffffff",
                    boxShadow: method === m.id ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
                  }}>
                  <span className="text-3xl">{m.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1A2B4A" }}>{m.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>{m.sub}</p>
                  </div>
                  {method === m.id && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F5A623" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A2B4A" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full mt-5 py-3.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── STEP 2: CARD DATA or INFO ── */}
        {step === 2 && (
          <div className="space-y-4">
            {isCard && (
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
                <h3 className="font-semibold mb-5" style={{ color: "#1A2B4A" }}>Datos de la Tarjeta</h3>
                {/* Card preview */}
                <div className="relative rounded-2xl p-6 mb-6 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #1A2B4A 0%, #243d6b 100%)", height: "170px" }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #F5A623 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="relative flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 rounded" style={{ backgroundColor: "#F5A623", opacity: 0.9 }} />
                      <span className="text-white text-xs opacity-60 uppercase tracking-wider">{isCredit ? "Crédito" : "Débito"}</span>
                    </div>
                    <div>
                      <p className="text-white font-mono text-lg tracking-widest">{cardNumber || "•••• •••• •••• ••••"}</p>
                      <div className="flex justify-between mt-2">
                        <div>
                          <p className="text-xs opacity-50 text-white uppercase">Titular</p>
                          <p className="text-white text-sm font-medium">{cardName || "NOMBRE APELLIDO"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-50 text-white uppercase">Vence</p>
                          <p className="text-white text-sm">{expiry || "MM/YY"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Card number */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Número de Tarjeta</label>
                    <input className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-mono"
                      style={{ ...inputStyle, borderColor: cardErrors.cardNumber ? "rgba(229,57,53,0.5)" : inputStyle.borderColor }}
                      placeholder="4242 4242 4242 4242" value={cardNumber}
                      onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardErrors((p) => ({ ...p, cardNumber: "" })); }}
                      onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                      onBlur={(e) => (e.target.style.borderColor = cardErrors.cardNumber ? "rgba(229,57,53,0.5)" : "rgba(26,43,74,0.15)")} />
                    {cardErrors.cardNumber && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#E53935" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {cardErrors.cardNumber}
                    </p>}
                    {/* Luhn live check indicator */}
                    {cardNumber.replace(/\s/g, "").length === 16 && !cardErrors.cardNumber && (
                      <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: luhn(cardNumber) ? "#43A047" : "#E53935" }}>
                        {luhn(cardNumber)
                          ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Tarjeta válida</>
                          : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Número inválido</>
                        }
                      </p>
                    )}
                  </div>

                  {/* Cardholder name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Nombre del Titular</label>
                    <input className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ ...inputStyle, borderColor: cardErrors.cardName ? "rgba(229,57,53,0.5)" : inputStyle.borderColor }}
                      placeholder="Como aparece en la tarjeta" value={cardName}
                      onChange={(e) => { setCardName(e.target.value.toUpperCase()); setCardErrors((p) => ({ ...p, cardName: "" })); }}
                      onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                      onBlur={(e) => (e.target.style.borderColor = cardErrors.cardName ? "rgba(229,57,53,0.5)" : "rgba(26,43,74,0.15)")} />
                    {cardErrors.cardName && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#E53935" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {cardErrors.cardName}
                    </p>}
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A2B4A" }}>Fecha de Vencimiento</label>
                    <input className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ ...inputStyle, borderColor: cardErrors.expiry ? "rgba(229,57,53,0.5)" : inputStyle.borderColor }}
                      placeholder="MM/YY" value={expiry}
                      onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setCardErrors((p) => ({ ...p, expiry: "" })); }}
                      onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                      onBlur={(e) => (e.target.style.borderColor = cardErrors.expiry ? "rgba(229,57,53,0.5)" : "rgba(26,43,74,0.15)")} />
                    {cardErrors.expiry && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#E53935" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {cardErrors.expiry}
                    </p>}
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A2B4A" }}>CVV</label>
                    <input className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ ...inputStyle, borderColor: cardErrors.cvv ? "rgba(229,57,53,0.5)" : inputStyle.borderColor }}
                      placeholder="•••" maxLength={4} value={cvv}
                      onChange={(e) => { setCvv(e.target.value.replace(/\D/g, "")); setCardErrors((p) => ({ ...p, cvv: "" })); }}
                      onFocus={(e) => (e.target.style.borderColor = "#F5A623")}
                      onBlur={(e) => (e.target.style.borderColor = cardErrors.cvv ? "rgba(229,57,53,0.5)" : "rgba(26,43,74,0.15)")} />
                    {cardErrors.cvv && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#E53935" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {cardErrors.cvv}
                    </p>}
                  </div>
                </div>
              </div>
            )}

            {method === "efectivo" && (
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
                <h3 className="font-semibold mb-3" style={{ color: "#1A2B4A" }}>Pago en Efectivo</h3>
                <div className="space-y-2 text-sm" style={{ color: "#6b7a99" }}>
                  <p>📍 Oficina de Administración — Piso 1, Hall Principal</p>
                  <p>🕐 Lunes a Viernes 9:00 – 18:00 hrs</p>
                  <p>📞 +56 2 2345 6789</p>
                </div>
              </div>
            )}

            {method === "transferencia" && (
              <div className="space-y-4">
                {/* Bank details */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
                  <h3 className="font-semibold mb-4" style={{ color: "#1A2B4A" }}>Datos para Transferencia</h3>
                  <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: "#f8f9fc" }}>
                    {[
                      { label: "Banco", value: "Banco Estado" },
                      { label: "Cuenta Corriente", value: "00-123-456789-0" },
                      { label: "RUT", value: "76.543.210-1" },
                      { label: "Nombre", value: "Condominio Edificio Mirador" },
                      { label: "Asunto", value: `Depto. 504 — ${selectedDebts.map(d => d.descripcion).join(", ")}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-4 text-sm">
                        <span className="font-medium flex-shrink-0" style={{ color: "#6b7a99" }}>{label}</span>
                        <span className="font-semibold text-right" style={{ color: "#1A2B4A" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* 7-day notice */}
                  <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ backgroundColor: "#fff8ee", border: "1px solid rgba(251,140,0,0.25)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FB8C00" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-xs" style={{ color: "#FB8C00" }}>
                      <strong>Verificación en hasta 7 días hábiles.</strong> Una vez que adjuntes el comprobante, la administración revisará el pago y actualizará tu estado de cuenta.
                    </p>
                  </div>
                </div>

                {/* File upload */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
                  <h3 className="font-semibold mb-1" style={{ color: "#1A2B4A" }}>Adjuntar Comprobante</h3>
                  <p className="text-sm mb-4" style={{ color: "#6b7a99" }}>
                    Sube una foto o captura de pantalla de la transferencia realizada.
                  </p>

                  {transferFile ? (
                    /* File preview */
                    <div className="flex items-center gap-4 p-4 rounded-xl border-2"
                      style={{ borderColor: "#43A047", backgroundColor: "#f0faf0" }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative"
                        style={{ backgroundColor: "#e8ecf2" }}>
                        {transferFile.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(transferFile)}
                            alt="comprobante"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1A2B4A" }}>{transferFile.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#43A047" }}>
                          ✓ Comprobante adjunto · {(transferFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setTransferFile(null); setTransferFileError(""); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
                        style={{ color: "#E53935" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* Drop zone */
                    <label
                      className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-yellow-400 hover:bg-yellow-50"
                      style={{ borderColor: transferFileError ? "rgba(229,57,53,0.5)" : "rgba(26,43,74,0.15)" }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: "#f0f2f5" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold" style={{ color: "#1A2B4A" }}>
                          Haz clic para subir el comprobante
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#6b7a99" }}>
                          PNG, JPG, PDF — máx. 10 MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            setTransferFileError("El archivo supera los 10 MB.");
                            return;
                          }
                          setTransferFile(file);
                          setTransferFileError("");
                        }}
                      />
                    </label>
                  )}

                  {transferFileError && (
                    <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: "#E53935" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {transferFileError}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-slate-50"
                style={{ borderColor: "rgba(26,43,74,0.2)", color: "#1A2B4A" }}>← Volver</button>
              <button onClick={handleCardContinue} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
                style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
                {isCredit ? "Seleccionar Cuotas →" : "Revisar y Confirmar →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 (credit only): INSTALLMENTS ── */}
        {step === 3 && isCredit && (
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
            <h2 className="font-semibold mb-1" style={{ color: "#1A2B4A" }}>Seleccionar Cuotas</h2>
            <p className="text-sm mb-6" style={{ color: "#6b7a99" }}>
              Elija en cuántas cuotas desea dividir el pago de{" "}
              <strong style={{ color: "#1A2B4A" }}>{formatCLP(montoBase)}</strong>.
            </p>
            <div className="space-y-3 mb-6">
              {installmentOptions.map((opt) => {
                const total = montoBase * (1 + opt.rate);
                const monthly = total / opt.value;
                const selected = installments === opt.value;
                return (
                  <button key={opt.value} onClick={() => setInstallments(opt.value)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: selected ? "#F5A623" : "rgba(26,43,74,0.1)",
                      backgroundColor: selected ? "#fffbf0" : "#ffffff",
                      boxShadow: selected ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
                    }}>
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ borderColor: selected ? "#F5A623" : "rgba(26,43,74,0.2)", backgroundColor: selected ? "#F5A623" : "transparent" }}>
                        {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1A2B4A" }} />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#1A2B4A" }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: opt.rate > 0 ? "#FB8C00" : "#43A047" }}>{opt.sublabel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: selected ? "#F5A623" : "#1A2B4A" }}>
                        {formatCLP(monthly)}<span className="font-normal text-xs" style={{ color: "#6b7a99" }}>/mes</span>
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b7a99" }}>Total: {formatCLP(total)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="rounded-xl p-4 mb-5 flex items-center justify-between" style={{ backgroundColor: "#f8f9fc" }}>
              <div>
                <p className="text-xs" style={{ color: "#6b7a99" }}>Cuota mensual</p>
                <p className="font-bold" style={{ color: "#1A2B4A", fontSize: "1.4rem" }}>
                  {formatCLP(monthlyAmount)}<span className="text-sm font-normal" style={{ color: "#6b7a99" }}>/mes</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#6b7a99" }}>Total final</p>
                <p className="font-bold" style={{ color: "#F5A623", fontSize: "1.4rem" }}>{formatCLP(totalWithInterest)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-slate-50"
                style={{ borderColor: "rgba(26,43,74,0.2)", color: "#1A2B4A" }}>← Volver</button>
              <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
                style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
                Revisar y Confirmar →
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIRM STEP ── */}
        {step === confirmStep && (
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,43,74,0.08)" }}>
            <h2 className="font-semibold mb-1" style={{ color: "#1A2B4A" }}>Confirmar Pago</h2>
            <p className="text-sm mb-6" style={{ color: "#6b7a99" }}>Revise los detalles antes de confirmar.</p>

            <div className="rounded-2xl p-5 space-y-4 mb-6" style={{ backgroundColor: "#f8f9fc" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b7a99" }}>
                  {isPayAll ? `Conceptos (${selectedDebts.length})` : "Deuda"}
                </p>
                {selectedDebts.map((d) => (
                  <div key={d.id} className="flex justify-between text-sm py-0.5">
                    <span style={{ color: "#1A2B4A" }}>{d.descripcion}</span>
                    <span className="font-semibold ml-4 flex-shrink-0" style={{ color: "#1A2B4A" }}>{formatCLP(d.monto)}</span>
                  </div>
                ))}
                {isPayAll && (
                  <div className="flex justify-between text-sm pt-2 mt-1 border-t font-semibold" style={{ borderColor: "rgba(26,43,74,0.1)" }}>
                    <span style={{ color: "#1A2B4A" }}>Subtotal</span>
                    <span style={{ color: "#1A2B4A" }}>{formatCLP(montoBase)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4" style={{ borderColor: "rgba(26,43,74,0.1)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b7a99" }}>Método</p>
                <p className="text-sm font-medium" style={{ color: "#1A2B4A" }}>
                  {paymentMethods.find((m) => m.id === method)?.label}
                </p>
                {isCard && cardNumber && (
                  <p className="text-xs mt-1" style={{ color: "#6b7a99" }}>
                    Tarjeta terminada en {cardNumber.replace(/\s/g, "").slice(-4)}
                    {cardName && ` · ${cardName}`}
                  </p>
                )}
                {method === "transferencia" && transferFile && (
                  <div className="flex items-center gap-2 mt-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-xs" style={{ color: "#43A047" }}>
                      Comprobante adjunto: <span className="font-medium">{transferFile.name}</span>
                    </p>
                  </div>
                )}
              </div>

              {method === "transferencia" && (
                <div className="border-t pt-4" style={{ borderColor: "rgba(26,43,74,0.1)" }}>
                  <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: "#fff8ee", border: "1px solid rgba(251,140,0,0.2)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FB8C00" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-xs" style={{ color: "#FB8C00" }}>
                      Tu pago quedará en estado <strong>Pendiente de Verificación</strong> y será confirmado por la administración en un plazo de <strong>7 días hábiles</strong>.
                    </p>
                  </div>
                </div>
              )}

              {isCredit && (
                <div className="border-t pt-4" style={{ borderColor: "rgba(26,43,74,0.1)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b7a99" }}>Cuotas</p>
                  <p className="text-sm font-medium" style={{ color: "#1A2B4A" }}>
                    {installments} {installments === 1 ? "cuota" : "cuotas"} de{" "}
                    <span style={{ color: "#F5A623" }}>{formatCLP(monthlyAmount)}/mes</span>
                  </p>
                  {selectedInstallment.rate > 0 && (
                    <p className="text-xs mt-1" style={{ color: "#FB8C00" }}>
                      Interés {(selectedInstallment.rate * 100).toFixed(1)}% incluido
                    </p>
                  )}
                </div>
              )}

              <div className="border-t pt-4" style={{ borderColor: "rgba(26,43,74,0.1)" }}>
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold" style={{ color: "#1A2B4A" }}>Total a Pagar</p>
                  <p className="font-bold" style={{ color: "#F5A623", fontSize: "2rem", lineHeight: 1 }}>
                    {formatCLP(displayTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl text-sm font-medium border-2 transition-all hover:bg-red-50"
                style={{ borderColor: "rgba(229,57,53,0.3)", color: "#E53935" }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  const result: PaymentResult = {
                    items: selectedDebts.map((d) => ({ descripcion: d.descripcion, monto: d.monto })),
                    montoBase,
                    totalPagado: displayTotal,
                    method,
                    installments: isCredit ? installments : 1,
                    monthlyAmount: isCredit ? monthlyAmount : displayTotal,
                    cardLastFour: isCard && cardNumber ? cardNumber.replace(/\s/g, "").slice(-4) : undefined,
                    cardName: isCard && cardName ? cardName : undefined,
                  };
                  onComplete(selectedDebtIds, result);
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
                Confirmar Pago ✓
              </button>
            </div>
            <button onClick={() => setStep(confirmStep - 1)} className="w-full mt-3 text-sm text-center hover:underline"
              style={{ color: "#6b7a99" }}>
              ← Modificar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
