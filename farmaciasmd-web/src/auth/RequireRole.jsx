import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireRole({ role, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ padding: 16 }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <h2 style={{ color: "crimson" }}>Acceso denegado</h2>
        <p>No tienes permiso para ver esta sección.</p>
        <a href="/">Volver al inicio</a>
      </div>
    );
  }
  return children;
}
