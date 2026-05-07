import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getDashboard } from "../api/reports";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [err,  setErr]  = useState(null);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch(() => setErr("No se pudo cargar el resumen."));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{greeting()}, {user?.name?.split(" ")[0]}</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <Link to="/sales/new" className="btn btn-primary">+ Nueva venta</Link>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {!data && !err && (
        <div className="loading-page"><span className="spinner spinner-lg" /> Cargando…</div>
      )}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Ventas hoy</div>
              <div className="stat-value success">${parseFloat(data.ventas_hoy ?? 0).toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ventas este mes</div>
              <div className="stat-value primary">${parseFloat(data.ventas_mes ?? 0).toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Alertas de stock</div>
              <div className={`stat-value ${(data.stock_bajo?.length ?? 0) > 0 ? "danger" : "success"}`}>
                {data.stock_bajo?.length ?? 0}
              </div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="card">
              <div className="card-title">Últimas ventas</div>
              {(data.ultimas_ventas ?? []).length === 0 ? (
                <div className="empty-state" style={{ padding: "24px 0" }}>
                  <div className="empty-state-title">Sin ventas registradas</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Sucursal</th>
                        <th className="text-right">Total</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ultimas_ventas.map((v) => (
                        <tr key={v.id}>
                          <td className="text-muted">{v.id}</td>
                          <td>{v.branch?.name ?? "—"}</td>
                          <td className="text-right">${parseFloat(v.total).toFixed(2)}</td>
                          <td className="text-muted">{new Date(v.created_at).toLocaleDateString("es-MX")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {isAdmin() && (
              <div className="card">
                <div className="card-title" style={{ color: "var(--warning)" }}>
                  Alertas de stock bajo
                </div>
                {(data.stock_bajo ?? []).length === 0 ? (
                  <div className="empty-state" style={{ padding: "24px 0" }}>
                    <div className="empty-state-title" style={{ color: "var(--success)" }}>
                      Todo el inventario en orden
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-wrap">
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Sucursal</th>
                            <th className="text-right">Actual</th>
                            <th className="text-right">Mínimo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.stock_bajo.map((s, i) => (
                            <tr key={i}>
                              <td>{s.producto}</td>
                              <td className="text-muted">{s.sucursal}</td>
                              <td className="text-right text-danger">{s.stock_actual}</td>
                              <td className="text-right text-muted">{s.stock_minimo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <Link to="/reports" className="btn btn-ghost btn-sm">Ver reporte completo →</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
