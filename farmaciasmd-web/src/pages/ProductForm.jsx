import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as ProductsApi from "../api/products";

const empty = {
  sku: "", name: "", brand: "", category: "",
  description: "", image_url: "", price: 0, min_stock: 0, active: true,
};

export default function ProductForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const nav      = useNavigate();
  const [model,  setModel]  = useState(empty);
  const [err,    setErr]    = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    ProductsApi.getProduct(id)
      .then((r) => setModel(r.data))
      .catch((ex) => setErr(ex?.response?.data?.message ?? "Error cargando producto"));
  }, [id]);

  const set = (k, v) => setModel((m) => ({ ...m, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    const payload = { ...model, price: Number(model.price), min_stock: Number(model.min_stock), active: Boolean(model.active) };
    try {
      if (isEdit) await ProductsApi.updateProduct(id, payload);
      else        await ProductsApi.createProduct(payload);
      nav("/products");
    } catch (ex) {
      const data = ex?.response?.data;
      if (data?.errors) {
        const k = Object.keys(data.errors)[0];
        setErr(data.errors[k][0]);
      } else {
        setErr(data?.message ?? "Error guardando");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await ProductsApi.deleteProduct(id);
      nav("/products");
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error eliminando");
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{isEdit ? "Editar producto" : "Nuevo producto"}</div>
          <div className="page-subtitle">
            {isEdit ? `Editando producto #${id}` : "Completa los campos para crear un producto"}
          </div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={save} className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input className="form-input" value={model.sku} onChange={(e) => set("sku", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={model.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-input" value={model.brand ?? ""} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <input className="form-input" value={model.category ?? ""} onChange={(e) => set("category", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" value={model.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">URL de imagen</label>
            <input className="form-input" placeholder="https://ejemplo.com/imagen.jpg" value={model.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} />
            {model.image_url && (
              <img src={model.image_url} alt="preview" className="img-preview" style={{ marginTop: 8 }} />
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio *</label>
              <input className="form-input" type="number" step="0.01" min="0" value={model.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock mínimo *</label>
              <input className="form-input" type="number" min="0" value={model.min_stock} onChange={(e) => set("min_stock", e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={model.active ? "1" : "0"} onChange={(e) => set("active", e.target.value === "1")}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Guardando…</> : "Guardar producto"}
            </button>
            <Link to="/products" className="btn btn-secondary">Cancelar</Link>
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={remove} style={{ marginLeft: "auto" }}>
                Eliminar
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
