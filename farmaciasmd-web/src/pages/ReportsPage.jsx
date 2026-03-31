import { useEffect, useState } from "react";
import { listBranches } from "../api/branches";
import { reportSales, reportTopProducts, reportLowStock } from "../api/reports";

const TABS = ["Ventas", "Top Productos", "Stock Bajo"];

export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    listBranches().then((r) => setBranches(Array.isArray(r.data) ? r.data : []));
  }, []);

  const load = async () => {
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const filters = {};
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (branchId) filters.branch_id = branchId;

      let res;
      if (tab === 0) res = await reportSales(filters);
      else if (tab === 1) res = await reportTopProducts(filters);
      else res = await reportLowStock({ branch_id: branchId || undefined });

      setData(res.data);
    } catch {
      setErr("Error al cargar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Reportes</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => { setTab(i); setData(null); }}
            style={{
              padding: "6px 14px",
              fontWeight: tab === i ? 700 : 400,
              borderBottom: tab === i ? "2px solid #4dabf7" : "2px solid transparent",
              background: "none",
              border: "none",
              borderBottom: tab === i ? "2px solid #4dabf7" : "2px solid transparent",
              cursor: "pointer",
              color: tab === i ? "#4dabf7" : "inherit",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "flex-end" }}>
        {tab !== 2 && (
          <>
            <label>
              Desde
              <br />
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              Hasta
              <br />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        )}
        <label>
          Sucursal
          <br />
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">Todas</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </label>
        <button onClick={load} disabled={loading}>
          {loading ? "Cargando…" : "Aplicar filtro"}
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {/* Resultados — Ventas */}
      {tab === 0 && data && (
        <>
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <div style={{ padding: "10px 20px", background: "#d0ebff", borderRadius: 6, color: "#1971c2" }}>
              <div style={{ fontSize: 12 }}>Total ventas</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>${data.total_general?.toFixed(2)}</div>
            </div>
            <div style={{ padding: "10px 20px", background: "#d3f9d8", borderRadius: 6, color: "#2f9e44" }}>
              <div style={{ fontSize: 12 }}>Cantidad</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{data.cantidad}</div>
            </div>
          </div>

          {data.por_sucursal?.length > 0 && (
            <>
              <h4 style={{ marginBottom: 6 }}>Por sucursal</h4>
              <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: 20 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                    <th>Sucursal</th><th>Ventas</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.por_sucursal.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                      <td>{row.sucursal}</td>
                      <td>{row.cantidad}</td>
                      <td style={{ textAlign: "right" }}>${row.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h4 style={{ marginBottom: 6 }}>Detalle de ventas</h4>
          <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                <th>#</th><th>Sucursal</th><th>Total</th><th>Fecha</th><th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {(data.ventas ?? []).length === 0 && (
                <tr><td colSpan={5} style={{ color: "#888" }}>Sin resultados.</td></tr>
              )}
              {(data.ventas ?? []).map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #333" }}>
                  <td>{v.id}</td>
                  <td>{v.branch?.name ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>${parseFloat(v.total).toFixed(2)}</td>
                  <td>{new Date(v.created_at).toLocaleDateString("es-MX")}</td>
                  <td style={{ color: "#888", fontSize: 12 }}>{v.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Resultados — Top Productos */}
      {tab === 1 && data && (
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
              <th>#</th><th>Producto</th><th>SKU</th><th>Unidades vendidas</th><th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} style={{ color: "#888" }}>Sin resultados.</td></tr>
            )}
            {data.map((row, i) => (
              <tr key={row.product_id} style={{ borderBottom: "1px solid #333" }}>
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>{row.sku}</td>
                <td style={{ textAlign: "right" }}>{row.total_vendido}</td>
                <td style={{ textAlign: "right" }}>${parseFloat(row.total_ingresos).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Resultados — Stock Bajo */}
      {tab === 2 && data && (
        <>
          {data.length === 0 ? (
            <p style={{ color: "#2f9e44" }}>No hay productos con stock bajo.</p>
          ) : (
            <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                  <th>Producto</th><th>SKU</th><th>Sucursal</th><th>Stock actual</th><th>Mínimo</th><th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #333", color: "#e67700" }}>
                    <td>⚠ {row.producto}</td>
                    <td>{row.sku}</td>
                    <td>{row.sucursal}</td>
                    <td style={{ textAlign: "right" }}>{row.stock_actual}</td>
                    <td style={{ textAlign: "right" }}>{row.stock_minimo}</td>
                    <td style={{ textAlign: "right", color: "crimson" }}>{row.diferencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
