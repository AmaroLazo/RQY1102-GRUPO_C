import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { PaymentWizardScreen } from "./components/PaymentWizardScreen";
import { ReceiptScreen } from "./components/ReceiptScreen";
import { AdminPanelScreen } from "./components/AdminPanelScreen";

type Screen = "login" | "dashboard" | "payment" | "receipt" | "admin";
export type UserType = "arrendatario" | "propietario" | "admin";

export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  tipo: UserType;
  depto: string;
}

export interface Debt {
  id: number;
  descripcion: string;
  monto: number;
  abonado: number;
  vencimiento: string;
  estado: string;
  categoria: string;
  abonable: boolean;
}

export interface Property {
  id: number;
  nombre: string;
  debts: Debt[];
}

export interface PaymentResult {
  items: { descripcion: string; monto: number }[];
  montoBase: number;
  totalPagado: number;
  method: string;
  installments: number;
  monthlyAmount: number;
  cardLastFour?: string;
  cardName?: string;
}

// ── Seed data ────────────────────────────────────────────────────────────────

const mkTenantDebts = (): Debt[] => [
  { id: 1, descripcion: "Arriendo — Junio 2026", monto: 450000, abonado: 0, vencimiento: "2026-06-05", estado: "Vencido", categoria: "Arriendo", abonable: true },
  { id: 2, descripcion: "Gastos Comunes — Junio 2026", monto: 85000, abonado: 0, vencimiento: "2026-06-15", estado: "Pendiente", categoria: "Gastos Comunes", abonable: true },
  { id: 3, descripcion: "Estacionamiento — Junio 2026", monto: 45000, abonado: 0, vencimiento: "2026-06-20", estado: "Pendiente", categoria: "Estacionamiento", abonable: true },
];

const mkOwnerProps = (depto: string): Property[] => [
  {
    id: 0, nombre: `Depto ${depto} — Torre A`,
    debts: [
      { id: 10, descripcion: "Gastos Comunes — Junio 2026", monto: 95000, abonado: 0, vencimiento: "2026-06-15", estado: "Pendiente", categoria: "Gastos Comunes", abonable: true },
      { id: 11, descripcion: "Contribuciones 2do Trimestre 2026", monto: 156800, abonado: 0, vencimiento: "2026-06-30", estado: "Pendiente", categoria: "Contribuciones", abonable: true },
      { id: 12, descripcion: "Seguro de Incendio — Anual 2026", monto: 48500, abonado: 0, vencimiento: "2026-06-20", estado: "Pendiente", categoria: "Seguro", abonable: true },
    ],
  },
  {
    id: 1, nombre: "Depto 308 — Torre B",
    debts: [
      { id: 20, descripcion: "Gastos Comunes — Junio 2026", monto: 87000, abonado: 0, vencimiento: "2026-06-15", estado: "Pendiente", categoria: "Gastos Comunes", abonable: true },
      { id: 21, descripcion: "Administración Edificio — Junio 2026", monto: 120000, abonado: 0, vencimiento: "2026-06-30", estado: "Pendiente", categoria: "Administración", abonable: true },
      { id: 22, descripcion: "Mantención Ascensores — Junio 2026", monto: 34200, abonado: 0, vencimiento: "2026-06-25", estado: "Pendiente", categoria: "Mantención", abonable: true },
    ],
  },
];

const SEED_USERS: User[] = [
  { id: 1, nombre: "María González", email: "maria@mirador.cl", password: "123456", tipo: "arrendatario", depto: "504" },
  { id: 2, nombre: "Roberto Méndez", email: "roberto@mirador.cl", password: "123456", tipo: "propietario", depto: "201" },
  { id: 99, nombre: "Administrador", email: "admin@mirador.cl", password: "admin2026", tipo: "admin", depto: "" },
];

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDebtIds, setSelectedDebtIds] = useState<number[]>([]);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);


  // Per-user debts (arrendatario) and properties (propietario), keyed by user id
  const [userDebts, setUserDebts] = useState<Record<number, Debt[]>>({
    1: mkTenantDebts(),
  });
  const [userProperties, setUserProperties] = useState<Record<number, Property[]>>({
    2: mkOwnerProps("201"),
  });
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<0 | 1>(0);

  const userType = currentUser?.tipo ?? "arrendatario";
  const isTenant = userType === "arrendatario";

  const activeProperties: Property[] = currentUser ? (userProperties[currentUser.id] ?? []) : [];
  const activeDebts: Debt[] = currentUser
    ? isTenant
      ? (userDebts[currentUser.id] ?? [])
      : (activeProperties[selectedPropertyIndex]?.debts ?? [])
    : [];

  function updateDebts(updated: Debt[]) {
    if (!currentUser) return;
    if (isTenant) {
      setUserDebts((p) => ({ ...p, [currentUser.id]: updated }));
    } else {
      setUserProperties((p) => ({
        ...p,
        [currentUser.id]: (p[currentUser.id] ?? []).map((prop, i) =>
          i === selectedPropertyIndex ? { ...prop, debts: updated } : prop
        ),
      }));
    }
  }

  // ── Auth handlers ─────────────────────────────────────────────────────────

  function handleLogin(email: string, password: string): string | null {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) return "Correo electrónico o contraseña incorrectos.";
    setCurrentUser(user);
    setSelectedPropertyIndex(0);
    setScreen(user.tipo === "admin" ? "admin" : "dashboard");
    return null;
  }

  function handleRegister(data: { nombre: string; email: string; password: string; tipo: UserType; depto: string }): string | null {
    if (users.find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return "Ya existe una cuenta registrada con ese correo electrónico.";
    }
    const newUser: User = { ...data, id: Date.now(), email: data.email.trim() };
    setUsers((p) => [...p, newUser]);
    if (newUser.tipo === "arrendatario") {
      setUserDebts((p) => ({ ...p, [newUser.id]: mkTenantDebts() }));
    } else {
      setUserProperties((p) => ({ ...p, [newUser.id]: mkOwnerProps(newUser.depto) }));
    }
    setCurrentUser(newUser);
    setSelectedPropertyIndex(0);
    setScreen("dashboard");
    return null;
  }

  function handleLogout() {
    setCurrentUser(null);
    setSelectedPropertyIndex(0);
    setScreen("login");
  }

  // ── Payment handlers ──────────────────────────────────────────────────────

  function handlePaymentComplete(paidIds: number[], result: PaymentResult) {
    updateDebts(activeDebts.filter((d) => !paidIds.includes(d.id)));
    setPaymentResult(result);
    setScreen("receipt");
  }

  function handleAbono(debtId: number, amount: number) {
    updateDebts(activeDebts.map((d) => {
      if (d.id !== debtId) return d;
      const newAbonado = d.abonado + amount;
      return newAbonado >= d.monto ? null : { ...d, abonado: newAbonado };
    }).filter(Boolean) as Debt[]);
  }

  // ── Nav bar ───────────────────────────────────────────────────────────────

  const navScreens: { id: Screen; label: string }[] = [
    { id: "login", label: "1. Login" },
    { id: "dashboard", label: "2. Dashboard" },
    { id: "payment", label: "3. Pago" },
    { id: "receipt", label: "4. Comprobante" },
    { id: "admin", label: "5. Admin" },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{ backgroundColor: "rgba(26,43,74,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <span className="text-xs mr-2" style={{ color: "#8fa0be" }}>Pantalla:</span>
        {navScreens.map((s) => (
          <button key={s.id} onClick={() => setScreen(s.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: screen === s.id ? "#F5A623" : "transparent", color: screen === s.id ? "#1A2B4A" : "#8fa0be" }}>
            {s.label}
          </button>
        ))}
      </div>

      {screen === "login" && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {screen === "dashboard" && currentUser && (
        <DashboardScreen
          currentUser={currentUser}
          userType={userType}
          debts={activeDebts}
          properties={activeProperties}
          selectedPropertyIndex={selectedPropertyIndex}
          onSelectProperty={(i) => setSelectedPropertyIndex(i as 0 | 1)}
          onPay={(ids) => { setSelectedDebtIds(ids); setScreen("payment"); }}
          onLogout={handleLogout}
        />
      )}
      {screen === "payment" && (
        <PaymentWizardScreen
          debts={activeDebts}
          selectedDebtIds={selectedDebtIds}
          onComplete={handlePaymentComplete}
          onCancel={() => setScreen("dashboard")}
        />
      )}
      {screen === "receipt" && (
        <ReceiptScreen paymentResult={paymentResult} onBack={() => setScreen("dashboard")} />
      )}
      {screen === "admin" && (
        <AdminPanelScreen
          users={users}
          onCreateUser={handleRegister}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
