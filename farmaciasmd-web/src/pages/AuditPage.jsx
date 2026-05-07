import { useEffect, useState } from "react";
import { getAudit } from "../api/audit";
import { listBranches } from "../api/branches";

export default function AuditPage() {
  const [activity, setActivity] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState(null);

  const [filters, setFilters] = useState({ user_id: "", branch_id: "", from: "", to: "" });
  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  async function load() {
    setLoading(true); setErr(null);
    try {
      const params = {};
      if (filters.user_id)   params.user_id   = filters.user_id;
      if (filters.branch_id) params.branch_id = filters.branch_id;
      if (filters.from)      params.from      = filters.from;
      if (filters.to)        params.to        = filters.to;

      const r = await getAudit(params);
      setActivity(r.data.activity);
      setUsers(r.data.users);
    } catch { setErr("Error cargando historial."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    listBranches().then((r) => setBranches(Array.isArray(r.data) ? r.data : []));
    load();
  }, []);

  function formatDate(d) {
    return new Date(d).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
  }

  const typeLabel = { venta: "Venta", movimiento: "Movimiento" };
  const typeIcon  = { venta: "◉", movimiento: "▦" };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Auditoría de actividad</div>
          <div className="page-subtitle">Historial de ventas y movimientos de inventario por usuario</div>
        </div>
      </div>

      <div className="card mb-20">
        <div className="toolbar" style={{ margin: 0, flexWrap: "wrap" }}>
          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>Usuario</label>
            <select className="form-select" style={{ width: 180 }} value={filters.user_id} onChange={(e) => setF("user_id", e.target.value)}>
              <option value="">Todos</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <label className="form-label" style={{ whiteSpace: "nowrap" }}>Sucursal</label>
            <select className="form-select" style={{ width: 180 }} value={filters.branch_id} onChange={(e) => setF("branch_id", e.target.value)}>
              <option value="">Todas</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <label className="form-label">Desde</label>
            <input className="form-input" type="date" style={{ width: 150 }} value={filters.from} onChange={(e) => setF("from", e.target.value)} />
          </div>

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <label className="form-label">Hasta</label>
            <input className="form-input" type="date" style={{ width: 150 }} value={filters.to} onChange={(e) => setF("to", e.target.value)} />
          </div>

          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? <><span className="spinner" /> Cargando…</> : "Aplicar filtros"}
          </button>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {loading && <div className="loading-page"><span className="spinner spinner-lg" /> Cargando historial…</div>}

      {!loading && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Tipo</th>
                <th>Descripción</th>
                <th>Usuario</th>
                <th>Sucursal</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {activity.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-title">Sin actividad registrada</div>
                    <div className="empty-state-sub">Ajusta los filtros para ver más resultados</div>
                  </div>
                </td></tr>
              )}
              {activity.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span className={`badge ${item.type === "venta" ? "badge-primary" : "badge-warning"}`}>
                      {typeIcon[item.type]} {typeLabel[item.type]}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.description}</td>
                  <td className="text-muted">{item.user_name}</td>
                  <td className="text-muted">{item.branch_name}</td>
                  <td className="text-muted" style={{ fontSize: 12.5 }}>{formatDate(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activity.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-3)", textAlign: "right" }}>
          Mostrando {activity.length} registros (máx. 200 por consulta)
        </div>
      )}
    </>
  );
}
