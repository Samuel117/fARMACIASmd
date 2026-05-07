import { useEffect, useState } from "react";
import { listBranches } from "../api/branches";
import { reportSales, reportTopProducts, reportLowStock } from "../api/reports";

const TABS = ["Ventas", "Top Productos", "Stock Bajo"];

export default function ReportsPage() {
  const [tab,      setTab]      = useState(0);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [from,     setFrom]     = useState("");
  const [to,       setTo]       = useState("");
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState(null);

  useEffect(() => {
    listBranches().then((r) => setBranches(Array.isArray(r.data) ? r.data : []));
  }, []);

  async function load() {
    setLoading(true); setErr(null); setData(null);
    try {
      const filters = {};
      if (from)     filters.from      = from;
      if (to)       filters.to        = to;
      if (branchId) filters.branch_id = branchId;
      let res;
      if (tab === 0)      res = await reportSales(filters);
      else if (tab === 1) res = await reportTopProducts(filters);
      else                res = await reportLowStock({ branch_id: branchId || undefined });
      setData(res.data);
    } catch { setErr("Error al cargar el reporte."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [tab]);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Reportes</div>
          <div className="page-subtitle">Análisis y consultas del negocio</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={i} className={`tab ${tab === i ? "active" : ""}`} onClick={() => { setTab(i); setData(null); }}>
            {t}
          </button>
        ))}
      </div>

      <div className="toolbar" style={{ marginBottom: 24 }}>
        {tab !== 2 && (
          <>
            <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>Desde</label>
              <input className="form-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 160 }} />
            </div>
            <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <label className="form-label" style={{ whiteSpace: "nowrap" }}>Hasta</label>
              <input className="form-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 160 }} />
            </div>
          </>
        )}
        <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>Sucursal</label>
          <select className="form-select" style={{ width: 200 }} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">Todas</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? <><span className="spinner" /> Cargando…</> : "Aplicar filtros"}
        </button>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* Ventas */}
      {tab === 0 && data && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 480, marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Total ventas</div>
              <div className="stat-value success">${parseFloat(data.total_general ?? 0).toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Transacciones</div>
              <div className="stat-value primary">{data.cantidad ?? 0}</div>
            </div>
          </div>

          {data.por_sucursal?.length > 0 && (
            <>
              <div className="section-title">Por sucursal</div>
              <div className="table-wrap mb-20">
                <table className="tbl">
                  <thead><tr><th>Sucursal</th><th className="text-right">Ventas</th><th className="text-right">Total</th></tr></thead>
                  <tbody>
                    {data.por_sucursal.map((row, i) => (
                      <tr key={i}>
                        <td>{row.sucursal}</td>
                        <td className="text-right">{row.cantidad}</td>
                        <td className="text-right">${parseFloat(row.total ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="section-title">Detalle de ventas</div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>Sucursal</th><th className="text-right">Total</th><th>Fecha</th><th>Notas</th></tr></thead>
              <tbody>
                {(data.ventas ?? []).length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-title">Sin resultados</div></div></td></tr>
                )}
                {(data.ventas ?? []).map((v) => (
                  <tr key={v.id}>
                    <td className="text-muted">{v.id}</td>
                    <td>{v.branch?.name ?? "—"}</td>
                    <td className="text-right">${parseFloat(v.total).toFixed(2)}</td>
                    <td className="text-muted">{new Date(v.created_at).toLocaleDateString("es-MX")}</td>
                    <td className="text-muted" style={{ fontSize: 12 }}>{v.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Top Productos */}
      {tab === 1 && data && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr><th>#</th><th>Producto</th><th>SKU</th><th className="text-right">Unidades</th><th className="text-right">Ingresos</th></tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-title">Sin resultados</div></div></td></tr>
              )}
              {data.map((row, i) => (
                <tr key={row.product_id}>
                  <td className="text-muted">{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--text-2)" }}>{row.sku}</td>
                  <td className="text-right">{row.total_vendido}</td>
                  <td className="text-right">${parseFloat(row.total_ingresos).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Bajo */}
      {tab === 2 && data && (
        data.length === 0 ? (
          <div className="alert alert-success">Todo el inventario está sobre el mínimo requerido.</div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Producto</th><th>SKU</th><th>Sucursal</th><th className="text-right">Actual</th><th className="text-right">Mínimo</th><th className="text-right">Diferencia</th></tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>⚠ {row.producto}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--text-2)" }}>{row.sku}</td>
                    <td className="text-muted">{row.sucursal}</td>
                    <td className="text-right text-warning">{row.stock_actual}</td>
                    <td className="text-right text-muted">{row.stock_minimo}</td>
                    <td className="text-right text-danger">{row.diferencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}
