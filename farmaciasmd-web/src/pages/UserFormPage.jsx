import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as UsersApi    from "../api/users";
import { listBranches } from "../api/branches";

const empty = { name: "", email: "", password: "", role: "employee", branch_id: "" };

export default function UserFormPage() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const nav      = useNavigate();
  const [model,    setModel]    = useState(empty);
  const [branches, setBranches] = useState([]);
  const [err,      setErr]      = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    listBranches().then((r) => setBranches(Array.isArray(r.data) ? r.data : []));
    if (!isEdit) return;
    UsersApi.getUser(id)
      .then((r) => setModel({ ...r.data, password: "", branch_id: r.data.branch_id ?? "" }))
      .catch((ex) => setErr(ex?.response?.data?.message ?? "Error cargando usuario"));
  }, [id]);

  const set = (k, v) => setModel((m) => ({ ...m, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setErr(""); setSaving(true);
    const payload = { ...model, branch_id: model.branch_id || null };
    if (isEdit && !payload.password) delete payload.password;
    try {
      if (isEdit) await UsersApi.updateUser(id, payload);
      else        await UsersApi.createUser(payload);
      nav("/users");
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

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{isEdit ? "Editar usuario" : "Nuevo usuario"}</div>
          <div className="page-subtitle">
            {isEdit ? `Editando usuario #${id}` : "Completa los campos para crear un usuario"}
          </div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card" style={{ maxWidth: 540 }}>
        <form onSubmit={save} className="form-grid">
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" value={model.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <input className="form-input" type="email" value={model.email} onChange={(e) => set("email", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">
              {isEdit ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}
            </label>
            <input
              className="form-input"
              type="password"
              value={model.password}
              onChange={(e) => set("password", e.target.value)}
              required={!isEdit}
              minLength={8}
              autoComplete="new-password"
            />
            <span className="form-hint">Mínimo 8 caracteres</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rol *</label>
              <select className="form-select" value={model.role} onChange={(e) => set("role", e.target.value)}>
                <option value="admin">Administrador</option>
                <option value="employee">Empleado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sucursal asignada</label>
              <select className="form-select" value={model.branch_id} onChange={(e) => set("branch_id", e.target.value)}>
                <option value="">Sin asignar</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <span className="form-hint">Aplica para empleados — pre-selecciona la sucursal en ventas</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Guardando…</> : "Guardar usuario"}
            </button>
            <Link to="/users" className="btn btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </>
  );
}
