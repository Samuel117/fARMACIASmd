import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getDashboard } from "../api/reports";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch(() => setErr("No se pudo cargar el resumen."));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#888" }}>{user?.name} ({user?.email})</span>
          <button onClick={signOut}>Cerrar sesión</button>
        </div>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {/* Tarjetas KPI */}
      {data && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={card("#d0ebff", "#1971c2")}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Ventas hoy</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>${data.ventas_hoy?.toFixed(2)}</div>
          </div>
          <div style={card("#d3f9d8", "#2f9e44")}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Ventas este mes</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>${data.ventas_mes?.toFixed(2)}</div>
          </div>
          <div style={card("#fff3bf", "#e67700")}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Productos con stock bajo</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{data.stock_bajo?.length ?? 0}</div>
          </div>
        </div>
      )}

      {/* Últimas ventas */}
      {data && (
        <>
          <h3>Últimas ventas</h3>
          <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                <th>#</th><th>Sucursal</th><th>Total</th><th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(data.ultimas_ventas ?? []).length === 0 && (
                <tr><td colSpan={4} style={{ color: "#888" }}>Sin ventas registradas.</td></tr>
              )}
              {(data.ultimas_ventas ?? []).map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #333" }}>
                  <td>{v.id}</td>
                  <td>{v.branch?.name ?? "—"}</td>
                  <td>${parseFloat(v.total).toFixed(2)}</td>
                  <td>{new Date(v.created_at).toLocaleString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Alertas de stock bajo */}
      {data && data.stock_bajo?.length > 0 && (
        <>
          <h3 style={{ color: "#c92a2a" }}>⚠ Alertas de stock bajo</h3>
          <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                <th>Producto</th><th>Sucursal</th><th>Stock actual</th><th>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {data.stock_bajo.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #333", color: "#e67700" }}>
                  <td>{s.producto}</td>
                  <td>{s.sucursal}</td>
                  <td style={{ textAlign: "right" }}>{s.stock_actual}</td>
                  <td style={{ textAlign: "right" }}>{s.stock_minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 8 }}>
            <Link to="/reports">Ver reporte completo de stock →</Link>
          </p>
        </>
      )}

      {!data && !err && <p style={{ color: "#888" }}>Cargando…</p>}
    </div>
  );
}

function card(bg, color) {
  return {
    padding: "14px 24px",
    background: bg,
    borderRadius: 8,
    color,
    minWidth: 160,
  };
}
