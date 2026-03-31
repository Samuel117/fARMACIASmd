import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listBranches } from "../api/branches";
import { listSales, cancelSale } from "../api/sales";

export default function SalesListPage() {
  const [branches, setBranches] = useState([]);
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [branchId, setBranchId] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [err, setErr] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const handleCancel = async (sale) => {
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
  };

  useEffect(() => {
    listBranches().then((r) => {
      setBranches(Array.isArray(r.data) ? r.data : []);
    });
  }, []);

  useEffect(() => {
    setErr(null);
    const filters = { page };
    if (branchId) filters.branch_id = branchId;

    listSales(filters)
      .then((r) => {
        const paginated = r.data;
        setSales(paginated.data ?? []);
        setPagination({
          current: paginated.current_page,
          last: paginated.last_page,
          prevUrl: paginated.prev_page_url,
          nextUrl: paginated.next_page_url,
        });
      })
      .catch(() => setErr("Error al cargar ventas."));
  }, [branchId, page]);

  const handleBranchChange = (e) => {
    setBranchId(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Ventas</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <label>
          Sucursal:{" "}
          <select value={branchId} onChange={handleBranchChange}>
            <option value="">Todas</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </label>
        <Link to="/sales/new"><button>Nueva venta</button></Link>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>#</th>
            <th>Sucursal</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan={5} style={{ paddingTop: 20, color: "#888" }}>
                No hay ventas registradas.
              </td>
            </tr>
          )}
          {sales.map((sale) => (
            <>
              <tr key={sale.id} style={{ borderBottom: "1px solid #333", opacity: sale.status === "cancelled" ? 0.55 : 1 }}>
                <td>{sale.id}</td>
                <td>{sale.branch?.name ?? "—"}</td>
                <td style={{ textDecoration: sale.status === "cancelled" ? "line-through" : "none" }}>
                  ${parseFloat(sale.total).toFixed(2)}
                </td>
                <td>{new Date(sale.created_at).toLocaleString("es-MX")}</td>
                <td>
                  {sale.status === "cancelled"
                    ? <span style={{ color: "crimson", fontSize: 12 }}>Anulada</span>
                    : <span style={{ color: "#2f9e44", fontSize: 12 }}>Activa</span>}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}>
                      {expandedId === sale.id ? "Ocultar" : "Ver"}
                    </button>
                    {sale.status === "active" && (
                      <button
                        onClick={() => handleCancel(sale)}
                        disabled={cancelling === sale.id}
                        style={{ color: "crimson" }}
                      >
                        {cancelling === sale.id ? "…" : "Anular"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>

              {expandedId === sale.id && (
                <tr key={`detail-${sale.id}`} style={{ borderBottom: "1px solid #333" }}>
                  <td colSpan={5} style={{ paddingLeft: 32 }}>
                    <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: 4 }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sale.items ?? []).map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #333" }}>
                            <td>{item.product?.name ?? `#${item.product_id}`}</td>
                            <td>{item.quantity}</td>
                            <td style={{ textAlign: "right" }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}>${parseFloat(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sale.notes && (
                      <p style={{ margin: "6px 0 4px" }}>
                        <em>Notas: {sale.notes}</em>
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button disabled={!pagination.prevUrl} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </button>
          <div>Página {pagination.current} / {pagination.last}</div>
          <button disabled={!pagination.nextUrl} onClick={() => setPage((p) => p + 1)}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
