import type { PaymentResult } from "../App";

interface ReceiptScreenProps {
  paymentResult: PaymentResult | null;
  onBack: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  credito: "Tarjeta de Crédito (Visa / Mastercard)",
  debito: "Tarjeta de Débito (Transbank WebPay)",
  transferencia: "Transferencia Bancaria",
  efectivo: "Pago en Efectivo",
  fondo: "Fondo de Pago Automático",
};

function formatCLP(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

function generateTxId() {
  return `TXN-2026-0608-${Math.floor(10000 + Math.random() * 90000)}`;
}

function generateBankRef() {
  return `BNK-REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

const TX_ID = generateTxId();
const BANK_REF = generateBankRef();

const now = new Date();
const TIMESTAMP = now.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) +
  ", " + now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function ReceiptScreen({ paymentResult, onBack }: ReceiptScreenProps) {
  // Fallback for demo navigation without a real payment
  const result = paymentResult ?? {
    items: [{ descripcion: "Gastos Comunes — Junio 2026", monto: 85000 }],
    montoBase: 85000,
    totalPagado: 85000,
    method: "efectivo",
    installments: 1,
    monthlyAmount: 85000,
    cardLastFour: undefined,
    cardName: undefined,
  };

  const methodLabel = METHOD_LABELS[result.method] ?? result.method;
  const isCredit = result.method === "credito";
  const isCard = result.method === "credito" || result.method === "debito";

  // Build method detail line
  let methodDetail = methodLabel;
  if (isCard && result.cardLastFour) {
    methodDetail += ` · •••• ${result.cardLastFour}`;
    if (result.cardName) methodDetail += ` · ${result.cardName}`;
  }

  const conceptoLabel = result.items.length === 1
    ? result.items[0].descripcion
    : `${result.items.length} conceptos pagados`;

  const rows: { label: string; value: string; mono?: boolean; highlight?: boolean; badge?: boolean }[] = [
    { label: "ID de Transacción", value: TX_ID, mono: true },
    { label: "Residente", value: "Carlos Rojas" },
    { label: "Departamento", value: "504 — Torre A" },
    { label: "Concepto", value: conceptoLabel },
    { label: "Monto Total Pagado", value: formatCLP(result.totalPagado), highlight: true },
    { label: "Método de Pago", value: methodDetail },
    ...(isCredit && result.installments > 1
      ? [{ label: "Cuotas", value: `${result.installments} cuotas de ${formatCLP(result.monthlyAmount)}/mes` }]
      : []),
    { label: "Fecha y Hora", value: TIMESTAMP },
    { label: "Referencia Bancaria", value: BANK_REF, mono: true },
    { label: "Estado", value: "Aprobado", badge: true },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#f0f2f5" }}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(26,43,74,0.14)" }}>
          {/* Header */}
          <div className="px-8 py-8 flex flex-col items-center text-center"
            style={{ background: "linear-gradient(135deg, #43A047 0%, #2e7d32 100%)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", boxShadow: "0 0 0 8px rgba(255,255,255,0.1)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Pago Registrado Exitosamente ✓</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              Su comprobante ha sido generado y registrado
            </p>
          </div>

          {/* Tear edge top */}
          <div className="w-full h-4 relative" style={{ backgroundColor: "#f0f2f5" }}>
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle, #f0f2f5 6px, #ffffff 6px)",
              backgroundSize: "24px 16px",
            }} />
          </div>

          {/* Data rows */}
          <div className="px-8 py-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-start justify-between py-3.5 border-b gap-4"
                style={{ borderColor: "rgba(26,43,74,0.06)" }}>
                <span className="text-xs font-medium uppercase tracking-wider flex-shrink-0 pt-0.5" style={{ color: "#6b7a99" }}>
                  {row.label}
                </span>
                {row.badge ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: "#f0faf0", color: "#43A047" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {row.value}
                  </span>
                ) : (
                  <span
                    className={`text-sm text-right ${row.mono ? "font-mono" : "font-medium"}`}
                    style={{
                      color: row.highlight ? "#43A047" : "#1A2B4A",
                      fontWeight: row.highlight ? 700 : 500,
                      fontSize: row.highlight ? "1rem" : undefined,
                    }}
                  >
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Tear edge bottom */}
          <div className="w-full h-4 relative mt-2" style={{ backgroundColor: "#f0f2f5" }}>
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle, #f0f2f5 6px, #ffffff 6px)",
              backgroundSize: "24px 16px",
            }} />
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 pt-2 space-y-3">
            <button className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
              style={{ borderColor: "rgba(26,43,74,0.2)", color: "#1A2B4A" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar Comprobante (PDF)
            </button>
            <button onClick={onBack} className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: "#F5A623", color: "#1A2B4A" }}>
              Volver al Inicio
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#6b7a99" }}>
          Este comprobante es válido como respaldo de su pago.{" "}
          <button className="font-medium hover:underline" style={{ color: "#F5A623" }}>Ayuda</button>
        </p>
      </div>
    </div>
  );
}
