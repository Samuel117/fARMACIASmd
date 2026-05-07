import { useEffect, useState } from "react";
import * as BranchesApi from "../api/branches";

const emptyForm = { name: "", code: "", address: "", active: true };

export default function BranchesPage() {
  const [branches,  setBranches]  = useState([]);
  const [form,      setForm]      = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [err,       setErr]       = useState("");

  async function load() {
    try {
      const r = await BranchesApi.listBranches();
      setBranches(r.data);
    } catch { setErr("Error cargando sucursales"); }
  }

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setErr("");
    try {
      if (editingId) await BranchesApi.updateBranch(editingId, form);
      else           await BranchesApi.createBranch(form);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error guardando sucursal");
    }
  }

  function edit(b) {
    setEditingId(b.id);
    setForm({ name: b.name, code: b.code, address: b.address ?? "", active: b.active });
  }

  async function remove(id) {
    if (!confirm("¿Eliminar sucursal?")) return;
    try {
      await BranchesApi.deleteBranch(id);
      load();
    } catch { setErr("Error eliminando sucursal"); }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Sucursales</div>
          <div className="page-subtitle">Gestión de sucursales del sistema</div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">{editingId ? "Editar sucursal" : "Nueva sucursal"}</div>
          <form onSubmit={save} className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Código *</label>
              <input className="form-input" value={form.code} onChange={(e) => set("code", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input className="form-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-select" value={form.active ? "1" : "0"} onChange={(e) => set("active", e.target.value === "1")}>
                <option value="1">Activa</option>
                <option value="0">Inactiva</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? "Actualizar" : "Crear"}</button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state"><div className="empty-state-title">Sin sucursales</div></div>
                </td></tr>
              )}
              {branches.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--text-2)" }}>{b.code}</td>
                  <td className="text-muted">{b.address ?? "—"}</td>
                  <td>
                    {b.active
                      ? <span className="badge badge-success">Activa</span>
                      : <span className="badge badge-neutral">Inactiva</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(b)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(b.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
