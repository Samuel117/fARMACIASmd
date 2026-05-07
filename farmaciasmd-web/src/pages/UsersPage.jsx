import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as UsersApi from "../api/users";

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr(""); setLoading(true);
    try {
      const r = await UsersApi.listUsers();
      setUsers(r.data);
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await UsersApi.deleteUser(id);
      load();
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error eliminando usuario");
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Usuarios</div>
          <div className="page-subtitle">Gestión de accesos y roles del sistema</div>
        </div>
        <Link to="/users/new" className="btn btn-primary">+ Nuevo usuario</Link>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {loading && <div className="loading-page"><span className="spinner" /> Cargando…</div>}

      {!loading && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Sucursal asignada</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-title">Sin usuarios</div>
                  </div>
                </td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    {u.role === "admin"
                      ? <span className="badge badge-primary">Administrador</span>
                      : <span className="badge badge-success">Empleado</span>
                    }
                  </td>
                  <td className="text-muted">{u.branch?.name ?? <span style={{ color: "var(--text-3)" }}>Sin asignar</span>}</td>
                  <td className="text-muted">{new Date(u.created_at).toLocaleDateString("es-MX")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link to={`/users/${u.id}/edit`} className="btn btn-ghost btn-sm">Editar</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
