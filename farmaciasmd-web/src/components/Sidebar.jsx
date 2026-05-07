import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ICON = {
  dashboard: "⊞",
  products:  "◈",
  sales:     "◉",
  branches:  "⊙",
  inventory: "▦",
  reports:   "◫",
  users:     "◎",
  audit:     "◷",
};

function SLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
    >
      <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  async function handleSignOut() {
    await signOut();
    nav("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">F</div>
        <div>
          <div className="sidebar-brand-name">FarmaciasMD</div>
          <div className="sidebar-brand-sub">Sistema de gestión</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">General</div>
        <SLink to="/"        icon={ICON.dashboard} label="Dashboard" />
        <SLink to="/products" icon={ICON.products}  label="Productos" />
        <SLink to="/sales"    icon={ICON.sales}     label="Ventas" />

        {isAdmin() && (
          <>
            <div className="sidebar-section">Administración</div>
            <SLink to="/branches"        icon={ICON.branches}  label="Sucursales" />
            <SLink to="/branch-inventory" icon={ICON.inventory} label="Inventario" />
            <SLink to="/reports"          icon={ICON.reports}   label="Reportes" />
            <SLink to="/users"            icon={ICON.users}     label="Usuarios" />
            <SLink to="/audit"            icon={ICON.audit}     label="Auditoría" />
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">
              {user?.role === "admin" ? "Administrador" : "Empleado"}
            </div>
          </div>
        </div>
        <button className="btn btn-ghost w-full" style={{ justifyContent: "center" }} onClick={handleSignOut}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
