import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as ProductsApi from "../api/products";

const empty = {
  sku: "",
  name: "",
  brand: "",
  category: "",
  description: "",
  image_url: "",
  price: 0,
  min_stock: 0,
  active: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [model, setModel] = useState(empty);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const resp = await ProductsApi.getProduct(id);
        setModel(resp.data);
      } catch (ex) {
        setErr(ex?.response?.data?.message ?? "Error cargando producto");
      }
    })();
  }, [id]);

  function setField(k, v) {
    setModel((m) => ({ ...m, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();
    setErr("");
    const payload = {
      ...model,
      price: Number(model.price),
      min_stock: Number(model.min_stock),
      active: Boolean(model.active),
    };

    try {
      if (isEdit) await ProductsApi.updateProduct(id, payload);
      else await ProductsApi.createProduct(payload);
      nav("/products");
    } catch (ex) {
      const data = ex?.response?.data;
      if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        setErr(data.errors[firstKey][0]);
      } else {
        setErr(data?.message ?? "Error guardando");
      }
    }
  }

  async function remove() {
    if (!confirm("¿Eliminar producto?")) return;
    setErr("");
    try {
      await ProductsApi.deleteProduct(id);
      nav("/products");
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error eliminando");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h2>{isEdit ? "Editar producto" : "Nuevo producto"}</h2>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <form onSubmit={save} style={{ display: "grid", gap: 10 }}>
        <label>SKU</label>
        <input value={model.sku} onChange={(e)=>setField("sku", e.target.value)} />

        <label>Nombre</label>
        <input value={model.name} onChange={(e)=>setField("name", e.target.value)} />

        <label>Marca</label>
        <input value={model.brand ?? ""} onChange={(e)=>setField("brand", e.target.value)} />

        <label>Categoría</label>
        <input value={model.category ?? ""} onChange={(e)=>setField("category", e.target.value)} />

        <label>Descripción</label>
        <textarea value={model.description ?? ""} onChange={(e)=>setField("description", e.target.value)} />

        <label>URL de imagen</label>
        <input
          placeholder="https://ejemplo.com/imagen.jpg"
          value={model.image_url ?? ""}
          onChange={(e)=>setField("image_url", e.target.value)}
        />
        {model.image_url && (
          <img src={model.image_url} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }} />
        )}

        <label>Precio</label>
        <input type="number" step="0.01" value={model.price} onChange={(e)=>setField("price", e.target.value)} />

        <label>Stock mínimo</label>
        <input type="number" value={model.min_stock} onChange={(e)=>setField("min_stock", e.target.value)} />

        <label>Activo</label>
        <select value={model.active ? "1" : "0"} onChange={(e)=>setField("active", e.target.value === "1")}>
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="submit">Guardar</button>
          <Link to="/products"><button type="button">Cancelar</button></Link>
          {isEdit && <button type="button" onClick={remove}>Eliminar</button>}
        </div>
      </form>
    </div>
  );
}