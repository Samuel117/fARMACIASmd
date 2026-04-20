import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductsList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import BranchesPage from "./pages/BranchesPage";
import BranchInventoryPage from "./pages/BranchInventoryPage";
import SalesListPage from "./pages/SalesListPage";
import SaleFormPage from "./pages/SaleFormPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import UserFormPage from "./pages/UserFormPage";

function NavBar() {
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  async function handleSignOut() {
    await signOut();
    nav("/login");
  }

  return (
    <nav style={{
      padding: "10px 16px",
      borderBottom: "1px solid #333",
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap",
    }}>
      <Link to="/">Dashboard</Link>
      <Link to="/products">Productos</Link>
      <Link to="/sales">Ventas</Link>

      {isAdmin() && (
        <>
          <Link to="/branches">Sucursales</Link>
          <Link to="/branch-inventory">Inventario</Link>
          <Link to="/reports">Reportes</Link>
          <Link to="/users">Usuarios</Link>
        </>
      )}

      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {user && (
          <span style={{ fontSize: 13, color: "#aaa" }}>
            {user.name} ({user.role === "admin" ? "Admin" : "Empleado"})
          </span>
        )}
        <button onClick={handleSignOut} style={{ fontSize: 13 }}>Cerrar sesión</button>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}

function AdminRoute({ children }) {
  return (
    <RequireAuth>
      <RequireRole role="admin">
        <Layout>{children}</Layout>
      </RequireRole>
    </RequireAuth>
  );
}

function AuthRoute({ children }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rutas para todos los roles autenticados */}
          <Route path="/" element={<AuthRoute><Dashboard /></AuthRoute>} />
          <Route path="/products" element={<AuthRoute><ProductsList /></AuthRoute>} />
          <Route path="/sales" element={<AuthRoute><SalesListPage /></AuthRoute>} />
          <Route path="/sales/new" element={<AuthRoute><SaleFormPage /></AuthRoute>} />

          {/* Rutas solo para admin */}
          <Route path="/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/products/:id/edit" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/branches" element={<AdminRoute><BranchesPage /></AdminRoute>} />
          <Route path="/branch-inventory" element={<AdminRoute><BranchInventoryPage /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/users/new" element={<AdminRoute><UserFormPage /></AdminRoute>} />
          <Route path="/users/:id/edit" element={<AdminRoute><UserFormPage /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
