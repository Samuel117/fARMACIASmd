import { useEffect, useState } from "react";
import * as BranchesApi  from "../api/branches";
import * as ProductsApi  from "../api/products";
import * as InventoryApi from "../api/inventory";

const typeLabels = { entry: "Entrada", exit: "Salida", adjustment: "Ajuste" };
const typeBadge  = { entry: "badge-success", exit: "badge-danger", adjustment: "badge-warning" };

export default function BranchInventoryPage() {
  const [branches,       setBranches]       = useState([]);
  const [products,       setProducts]       = useState([]);
  const [stocks,         setStocks]         = useState([]);
  const [movements,      setMovements]      = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [err,            setErr]            = useState("");
  const [saving,         setSaving]         = useState(false);

  const [form, setForm] = useState({ branch_id: "", product_id: "", type: "entry", quantity: 1, notes: "" });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function loadData(branchId = "") {
    try {
      const [sr, mr] = await Promise.all([
        InventoryApi.listBranchStocks(branchId),
        InventoryApi.listStockMovements(branchId),
      ]);
      setStocks(sr.data);
      setMovements(mr.data);
    } catch { setErr("Error cargando inventario"); }
  }

  useEffect(() => {
    Promise.all([BranchesApi.listBranches(), ProductsApi.listProducts()])
      .then(([br, pr]) => {
        setBranches(br.data);
        setProducts(pr.data?.data ?? []);
      });
    loadData();
  }, []);

  useEffect(() => { loadData(selectedBranch); }, [selectedBranch]);

  async function submitMovement(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await InventoryApi.createStockMovement({
        ...form,
        branch_id:  Number(form.branch_id),
        product_id: Number(form.product_id),
        quantity:   Number(form.quantity),
      });
      setForm({ branch_id: "", product_id: "", type: "entry", quantity: 1, notes: "" });
      loadData(selectedBranch);
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error registrando movimiento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Inventario por sucursal</div>
          <div className="page-subtitle">Existencias y movimientos de stock</div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Registrar movimiento</div>
          <form onSubmit={submitMovement} className="form-grid">
            <div className="form-group">
              <label className="form-label">Sucursal *</label>
              <select className="form-select" value={form.branch_id} onChange={(e) => set("branch_id", e.target.value)} required>
                <option value="">Seleccionar…</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Producto *</label>
              <select className="form-select" value={form.product_id} onChange={(e) => set("product_id", e.target.value)} required>
                <option value="">Seleccionar…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo *</label>
              <select className="form-select" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="entry">Entrada</option>
                <option value="exit">Salida</option>
                <option value="adjustment">Ajuste</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad *</label>
              <input className="form-input" type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea className="form-textarea" style={{ minHeight: 60 }} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Guardando…</> : "Guardar movimiento"}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div className="section-title" style={{ margin: 0 }}>Existencias</div>
              <select className="form-select" style={{ maxWidth: 200 }} value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">Todas las sucursales</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Sucursal</th><th>Producto</th><th className="text-right">Stock</th></tr>
                </thead>
                <tbody>
                  {stocks.length === 0 && (
                    <tr><td colSpan={3}><div className="empty-state"><div className="empty-state-title">Sin registros</div></div></td></tr>
                  )}
                  {stocks.map((s) => (
                    <tr key={s.id}>
                      <td className="text-muted">{s.branch?.name}</td>
                      <td>{s.product?.name}</td>
                      <td className="text-right">{s.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="section-title">Movimientos recientes</div>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Producto</th><th>Sucursal</th><th>Tipo</th><th className="text-right">Cantidad</th><th>Notas</th></tr>
                </thead>
                <tbody>
                  {movements.length === 0 && (
                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-title">Sin movimientos</div></div></td></tr>
                  )}
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.product?.name}</td>
                      <td className="text-muted">{m.branch?.name}</td>
                      <td><span className={`badge ${typeBadge[m.type] ?? "badge-neutral"}`}>{typeLabels[m.type] ?? m.type}</span></td>
                      <td className="text-right">{m.quantity}</td>
                      <td className="text-muted" style={{ fontSize: 12 }}>{m.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
