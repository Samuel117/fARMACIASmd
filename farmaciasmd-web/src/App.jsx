import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductsList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import BranchesPage from "./pages/BranchesPage";
import BranchInventoryPage from "./pages/BranchInventoryPage";
import SalesListPage from "./pages/SalesListPage";
import SaleFormPage from "./pages/SaleFormPage";
import ReportsPage from "./pages/ReportsPage";

function Layout({ children }) {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: "1px solid #333", display: "flex", gap: 10 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/products">Productos</Link>
        <Link to="/branches">Sucursales</Link>
        <Link to="/branch-inventory">Inventario por sucursal</Link>
        <Link to="/sales">Ventas</Link>
        <Link to="/reports">Reportes</Link>
      </nav>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout><Dashboard /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/products"
            element={
              <RequireAuth>
                <Layout><ProductsList /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/products/new"
            element={
              <RequireAuth>
                <Layout><ProductForm /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/products/:id/edit"
            element={
              <RequireAuth>
                <Layout><ProductForm /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/branches"
            element={
              <RequireAuth>
                <Layout><BranchesPage /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/branch-inventory"
            element={
              <RequireAuth>
                <Layout><BranchInventoryPage /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/sales"
            element={
              <RequireAuth>
                <Layout><SalesListPage /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/sales/new"
            element={
              <RequireAuth>
                <Layout><SaleFormPage /></Layout>
              </RequireAuth>
            }
          />

          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Layout><ReportsPage /></Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}