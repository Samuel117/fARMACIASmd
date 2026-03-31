import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listBranches } from "../api/branches";
import { listProducts } from "../api/products";
import { createSale } from "../api/sales";

const emptyItem = () => ({ product_id: "", quantity: 1 });

export default function SaleFormPage() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listBranches().then((r) => {
      setBranches(Array.isArray(r.data) ? r.data : []);
    });
    listProducts("", 1).then((r) => {
      setProducts(r.data?.data ?? []);
    });
  }, []);

  const productMap = Object.fromEntries(products.map((p) => [String(p.id), p]));

  const setItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  // Al cambiar producto: si ya existe en otra fila, acumular cantidad
  const handleProductChange = (index, newProductId) => {
    if (!newProductId) { setItem(index, "product_id", ""); return; }
    const existingIndex = items.findIndex(
      (it, i) => i !== index && String(it.product_id) === String(newProductId)
    );
    if (existingIndex !== -1) {
      setItems((prev) => {
        const updated = prev.map((it, i) => {
          if (i === existingIndex) {
            return { ...it, quantity: parseInt(it.quantity) + parseInt(prev[index].quantity || 1) };
          }
          return it;
        }).filter((_, i) => i !== index);
        return updated;
      });
    } else {
      setItem(index, "product_id", newProductId);
    }
  };

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotalOf = (item) => {
    const p = productMap[String(item.product_id)];
    if (!p) return 0;
    return parseFloat(p.price) * parseInt(item.quantity || 0);
  };

  const total = items.reduce((acc, it) => acc + subtotalOf(it), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!branchId) return setErr("Selecciona una sucursal.");
    if (items.some((it) => !it.product_id))
      return setErr("Todos los ítems deben tener un producto seleccionado.");

    setSaving(true);
    try {
      await createSale({
        branch_id: parseInt(branchId),
        notes: notes || null,
        items: items.map((it) => ({
          product_id: parseInt(it.product_id),
          quantity: parseInt(it.quantity),
        })),
      });
      navigate("/sales");
    } catch (ex) {
      const data = ex?.response?.data;
      setErr(data?.message ?? "Error al registrar la venta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Registrar venta</h2>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <form onSubmit={handleSubmit}>
        {/* Sucursal */}
        <div style={{ marginBottom: 12 }}>
          <label>
            Sucursal:{" "}
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
            >
              <option value="">— Seleccionar —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Tabla de productos */}
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: 8 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
              <th>Producto</th>
              <th style={{ width: 90 }}>Cantidad</th>
              <th style={{ width: 120 }}>Precio unit.</th>
              <th style={{ width: 120 }}>Subtotal</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const prod = productMap[String(item.product_id)];
              return (
                <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                  <td>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductChange(i, e.target.value)}
                      style={{ width: "100%" }}
                      required
                    >
                      <option value="">— Seleccionar —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}]
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setItem(i, "quantity", e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {prod ? `$${parseFloat(prod.price).toFixed(2)}` : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {prod ? `$${subtotalOf(item).toFixed(2)}` : "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "crimson", fontSize: 16 }}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button type="button" onClick={addItem} style={{ marginBottom: 16 }}>
          + Agregar producto
        </button>

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <strong>Total: ${total.toFixed(2)}</strong>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: 16 }}>
          <label>
            Notas (opcional)
            <br />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{ marginTop: 4, width: "100%", boxSizing: "border-box" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar venta"}
          </button>
          <button type="button" onClick={() => navigate("/sales")}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
