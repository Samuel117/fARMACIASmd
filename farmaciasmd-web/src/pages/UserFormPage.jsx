import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import * as UsersApi from "../api/users";

const empty = {
  name: "",
  email: "",
  password: "",
  role: "employee",
};

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [model, setModel] = useState(empty);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const resp = await UsersApi.getUser(id);
        setModel({ ...resp.data, password: "" });
      } catch (ex) {
        setErr(ex?.response?.data?.message ?? "Error cargando usuario");
      }
    })();
  }, [id]);

  function setField(k, v) {
    setModel((m) => ({ ...m, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();
    setErr("");
    const payload = { ...model };
    if (isEdit && !payload.password) delete payload.password;

    try {
      if (isEdit) await UsersApi.updateUser(id, payload);
      else await UsersApi.createUser(payload);
      nav("/users");
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

  return (
    <div style={{ padding: 16, maxWidth: 500 }}>
      <h2>{isEdit ? "Editar usuario" : "Nuevo usuario"}</h2>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <form onSubmit={save} style={{ display: "grid", gap: 10 }}>
        <label>Nombre</label>
        <input
          value={model.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={model.email}
          onChange={(e) => setField("email", e.target.value)}
          required
        />

        <label>{isEdit ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}</label>
        <input
          type="password"
          value={model.password}
          onChange={(e) => setField("password", e.target.value)}
          required={!isEdit}
          minLength={8}
        />

        <label>Rol</label>
        <select value={model.role} onChange={(e) => setField("role", e.target.value)}>
          <option value="admin">Administrador</option>
          <option value="employee">Empleado</option>
        </select>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="submit">Guardar</button>
          <Link to="/users"><button type="button">Cancelar</button></Link>
        </div>
      </form>
    </div>
  );
}
