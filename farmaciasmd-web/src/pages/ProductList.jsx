import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as ProductsApi from "../api/products";
import { useAuth } from "../auth/AuthContext";

export default function ProductsList() {
  const { isAdmin } = useAuth();
  const [q,    setQ]    = useState("");
  const [page, setPage] = useState(1);
  const [resp, setResp] = useState(null);
  const [err,  setErr]  = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await ProductsApi.listProducts(q, page);
      setResp(data.data);
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error cargando productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Productos</div>
          <div className="page-subtitle">Catálogo de productos disponibles</div>
        </div>
        {isAdmin() && <Link to="/products/new" className="btn btn-primary">+ Nuevo producto</Link>}
      </div>

      <div className="toolbar">
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Buscar por nombre o SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
        />
        <button className="btn btn-secondary" onClick={() => { setPage(1); load(); }}>Buscar</button>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {loading && <div className="loading-page"><span className="spinner" /> Cargando…</div>}

      {!loading && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 56 }}>Img</th>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th className="text-right">Precio</th>
                <th>Estado</th>
                {isAdmin() && <th></th>}
              </tr>
            </thead>
            <tbody>
              {resp?.data?.length === 0 && (
                <tr>
                  <td colSpan={isAdmin() ? 8 : 7}>
                    <div className="empty-state">
                      <div className="empty-state-title">Sin productos</div>
                      <div className="empty-state-sub">Ajusta la búsqueda o crea uno nuevo</div>
                    </div>
                  </td>
                </tr>
              )}
              {resp?.data?.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="img-thumb" />
                      : <div className="img-placeholder">IMG</div>
                    }
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--text-2)" }}>{p.sku}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td className="text-muted">{p.brand ?? "—"}</td>
                  <td className="text-muted">{p.category ?? "—"}</td>
                  <td className="text-right">${Number(p.price).toFixed(2)}</td>
                  <td>
                    {p.active
                      ? <span className="badge badge-success">Activo</span>
                      : <span className="badge badge-neutral">Inactivo</span>
                    }
                  </td>
                  {isAdmin() && (
                    <td>
                      <Link to={`/products/${p.id}/edit`} className="btn btn-ghost btn-sm">Editar</Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resp && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={!resp.prev_page_url} onClick={() => setPage((x) => Math.max(1, x - 1))}>← Anterior</button>
          <span>Página {resp.current_page} de {resp.last_page}</span>
          <button className="btn btn-ghost btn-sm" disabled={!resp.next_page_url} onClick={() => setPage((x) => x + 1)}>Siguiente →</button>
        </div>
      )}
    </>
  );
}
