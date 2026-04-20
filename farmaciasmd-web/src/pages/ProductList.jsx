import { useEffect, useState } from "react";
import * as ProductsApi from "../api/products";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProductsList() {
  const { isAdmin } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [resp, setResp] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await ProductsApi.listProducts(q, page);
      setResp(data.data); // paginated object
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error cargando productos");
    }
  }

  useEffect(() => { load(); }, [page]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Productos</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Buscar por nombre o SKU"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={() => { setPage(1); load(); }}>Buscar</button>
        {isAdmin() && <Link to="/products/new"><button>Nuevo</button></Link>}
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>Imagen</th>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Activo</th>
            {isAdmin() && <th></th>}
          </tr>
        </thead>
        <tbody>
          {resp?.data?.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #333" }}>
              <td>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }} />
                  : <div style={{ width: 48, height: 48, background: "#333", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#888" }}>Sin img</div>
                }
              </td>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.active ? "Sí" : "No"}</td>
              {isAdmin() && (
                <td style={{ display: "flex", gap: 8 }}>
                  <Link to={`/products/${p.id}/edit`}><button>Editar</button></Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {resp && (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button disabled={!resp.prev_page_url} onClick={() => setPage((x)=>Math.max(1,x-1))}>Anterior</button>
          <div>Página {resp.current_page} / {resp.last_page}</div>
          <button disabled={!resp.next_page_url} onClick={() => setPage((x)=>x+1)}>Siguiente</button>
        </div>
      )}
    </div>
  );
}