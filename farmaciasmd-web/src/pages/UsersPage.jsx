import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as UsersApi from "../api/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const resp = await UsersApi.listUsers();
      setUsers(resp.data);
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error cargando usuarios");
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await UsersApi.deleteUser(id);
      load();
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Error eliminando usuario");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Usuarios</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/users/new"><button>Nuevo usuario</button></Link>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Creado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #333" }}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: u.role === "admin" ? "#4a90d9" : "#5a8a5a",
                  color: "#fff",
                  fontSize: 12,
                }}>
                  {u.role === "admin" ? "Administrador" : "Empleado"}
                </span>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString("es-MX")}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <Link to={`/users/${u.id}/edit`}><button>Editar</button></Link>
                <button onClick={() => remove(u.id)} style={{ color: "crimson" }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
