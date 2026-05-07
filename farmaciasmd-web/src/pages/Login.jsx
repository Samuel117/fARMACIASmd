import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email,    setEmail]    = useState("admin@farmaciasmd.local");
  const [password, setPassword] = useState("Admin1234!");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signIn(email, password);
      nav("/", { replace: true });
    } catch (ex) {
      setErr(ex?.response?.data?.message ?? "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="login-brand-icon">F</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
            FarmaciasMD
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>
            Sistema de gestión de farmacias
          </div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={onSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: "center", padding: "10px" }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Iniciando sesión…</> : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
