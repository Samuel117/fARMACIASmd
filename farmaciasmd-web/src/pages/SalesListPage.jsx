import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listBranches } from "../api/branches";
import { listSales, cancelSale } from "../api/sales";

export default function SalesListPage() {
  const [branches,    setBranches]    = useState([]);
  const [sales,       setSales]       = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [branchId,    setBranchId]    = useState("");
  const [page,        setPage]        = useState(1);
  const [expandedId,  setExpandedId]  = useState(null);
  const [err,         setErr]         = useState(null);
  const [cancelling,  setCancelling]  = useState(null);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    listBranches().then((r) => setBranches(Array.isArray(r.data) ? r.data : []));
  }, []);

  useEffect(() => {
    setErr(null);
    setLoading(true);
    const filters = { page };
    if (branchId) filters.branch_id = branchId;
    listSales(filters)
      .then((r) => {
        const p = r.data;
        setSales(p.data ?? []);
        setPagination({ current: p.current_page, last: p.last_page, prevUrl: p.prev_page_url, nextUrl: p.next_page_url });
      })
      .catch(() => setErr("Error al cargar ventas."))
      .finally(() => setLoading(false));
  }, [branchId, page]);

  async function handleCancel(sale) {
    if (!confirm(`¿Anular la venta #${sale.id}? Se revertirá el stock.`)) return;
    setCancelling(sale.id);
    try {
      await cancelSale(sale.id);
      setSales((prev) => prev.map((s) => s.id === sale.id ? { ...s, status: "cancelled" } : s));
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error al anular la venta.");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Ventas</div>
          <div className="page-subtitle">Historial de transacciones registradas</div>
        </div>
        <Link to="/sales/new" className="btn btn-primary">+ Nueva venta</Link>
      </div>

      <div className="toolbar">
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={branchId}
          onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
        >
          <option value="">Todas las sucursales</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
        </select>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {loading && <div className="loading-page"><span className="spinner" /> Cargando…</div>}

      {!loading && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Sucursal</th>
                <th className="text-right">Total</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-title">Sin ventas registradas</div>
                    <div className="empty-state-sub">Crea la primera venta con el botón de arriba</div>
                  </div>
                </td></tr>
              )}
              {sales.map((sale) => (
                <>
                  <tr key={sale.id} style={{ opacity: sale.status === "cancelled" ? 0.55 : 1 }}>
                    <td className="text-muted">{sale.id}</td>
                    <td>{sale.branch?.name ?? "—"}</td>
                    <td className={`text-right ${sale.status === "cancelled" ? "line-through" : ""}`}>
                      ${parseFloat(sale.total).toFixed(2)}
                    </td>
                    <td className="text-muted">{new Date(sale.created_at).toLocaleString("es-MX")}</td>
                    <td>
                      {sale.status === "cancelled"
                        ? <span className="badge badge-danger">Anulada</span>
                        : <span className="badge badge-success">Activa</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                        >
                          {expandedId === sale.id ? "Ocultar" : "Ver detalle"}
                        </button>
                        {sale.status === "active" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(sale)}
                            disabled={cancelling === sale.id}
                          >
                            {cancelling === sale.id ? "…" : "Anular"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expandedId === sale.id && (
                    <tr key={`detail-${sale.id}`}>
                      <td colSpan={6} className="sub-table-cell">
                        <table className="sub-table">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th className="text-right">Cant.</th>
                              <th className="text-right">Precio unit.</th>
                              <th className="text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(sale.items ?? []).map((item) => (
                              <tr key={item.id}>
                                <td>{item.product?.name ?? `#${item.product_id}`}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                <td className="text-right">${parseFloat(item.subtotal).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {sale.notes && (
                          <div style={{ padding: "8px 14px", fontSize: 12.5, color: "var(--text-2)", fontStyle: "italic" }}>
                            Notas: {sale.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={!pagination.prevUrl} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Anterior</button>
          <span>Página {pagination.current} de {pagination.last}</span>
          <button className="btn btn-ghost btn-sm" disabled={!pagination.nextUrl} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
        </div>
      )}
    </>
  );
}
