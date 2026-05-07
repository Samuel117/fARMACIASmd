import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listBranches } from "../api/branches";
import { listProducts } from "../api/products";
import { createSale } from "../api/sales";

const emptyItem = () => ({ product_id: "", quantity: 1 });

export default function SaleFormPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [branches,  setBranches]  = useState([]);
  const [products,  setProducts]  = useState([]);
  const [branchId,  setBranchId]  = useState("");
  const [notes,     setNotes]     = useState("");
  const [items,     setItems]     = useState([emptyItem()]);
  const [err,       setErr]       = useState(null);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    Promise.all([listBranches(), listProducts("", 1)]).then(([br, pr]) => {
      const brList = Array.isArray(br.data) ? br.data : [];
      setBranches(brList);
      setProducts(pr.data?.data ?? []);
      // Pre-seleccionar sucursal del empleado si tiene una asignada
      if (user?.branch_id) {
        setBranchId(String(user.branch_id));
      }
    });
  }, []);

  const productMap = Object.fromEntries(products.map((p) => [String(p.id), p]));

  const setItem = (i, k, v) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const handleProductChange = (index, newPid) => {
    if (!newPid) { setItem(index, "product_id", ""); return; }
    const existingIdx = items.findIndex((it, i) => i !== index && String(it.product_id) === String(newPid));
    if (existingIdx !== -1) {
      setItems((prev) =>
        prev.map((it, i) => {
          if (i === existingIdx) return { ...it, quantity: parseInt(it.quantity) + parseInt(prev[index].quantity || 1) };
          return it;
        }).filter((_, i) => i !== index)
      );
    } else {
      setItem(index, "product_id", newPid);
    }
  };

  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const subtotal = (item) => {
    const p = productMap[String(item.product_id)];
    return p ? parseFloat(p.price) * parseInt(item.quantity || 0) : 0;
  };

  const total = items.reduce((acc, it) => acc + subtotal(it), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (!branchId) return setErr("Selecciona una sucursal.");
    if (items.some((it) => !it.product_id)) return setErr("Todos los ítems deben tener un producto.");
    setSaving(true);
    try {
      await createSale({
        branch_id: parseInt(branchId),
        notes: notes || null,
        items: items.map((it) => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })),
      });
      navigate("/sales");
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error al registrar la venta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Registrar venta</div>
          <div className="page-subtitle">Completa los campos para registrar una nueva venta</div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-row" style={{ maxWidth: 500 }}>
            <div className="form-group">
              <label className="form-label">Sucursal *</label>
              <select
                className="form-select"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                disabled={Boolean(user?.branch_id)}
              >
                <option value="">Seleccionar…</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
              </select>
              {user?.branch_id && (
                <span className="form-hint">Sucursal asignada a tu cuenta</span>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Productos</div>

          <div className="sale-items-header">
            <span>Producto</span>
            <span>Cantidad</span>
            <span className="text-right">Precio unit.</span>
            <span className="text-right">Subtotal</span>
            <span></span>
          </div>

          {items.map((item, i) => {
            const prod = productMap[String(item.product_id)];
            return (
              <div key={i} className="sale-item-row">
                <select
                  className="form-select"
                  value={item.product_id}
                  onChange={(e) => handleProductChange(i, e.target.value)}
                  required
                >
                  <option value="">Seleccionar producto…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>)}
                </select>

                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setItem(i, "quantity", e.target.value)}
                  required
                />

                <div className="text-right text-muted" style={{ fontSize: 13, alignSelf: "center" }}>
                  {prod ? `$${parseFloat(prod.price).toFixed(2)}` : "—"}
                </div>
                <div className="text-right" style={{ fontWeight: 500, alignSelf: "center" }}>
                  {prod ? `$${subtotal(item).toFixed(2)}` : "—"}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 18, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems((p) => [...p, emptyItem()])}>
              + Agregar producto
            </button>
          </div>

          <div className="sale-total-row">
            <span className="sale-total-label">Total de la venta:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 60 }} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" /> Guardando…</> : "Guardar venta"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/sales")}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
