import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";
import Sidebar from "./components/Sidebar";
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
import AuditPage from "./pages/AuditPage";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="page">{children}</div>
      </main>
    </div>
  );
}

function AuthRoute({ children }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/"               element={<AuthRoute><Dashboard /></AuthRoute>} />
          <Route path="/products"       element={<AuthRoute><ProductsList /></AuthRoute>} />
          <Route path="/sales"          element={<AuthRoute><SalesListPage /></AuthRoute>} />
          <Route path="/sales/new"      element={<AuthRoute><SaleFormPage /></AuthRoute>} />

          <Route path="/products/new"       element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/products/:id/edit"  element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/branches"           element={<AdminRoute><BranchesPage /></AdminRoute>} />
          <Route path="/branch-inventory"   element={<AdminRoute><BranchInventoryPage /></AdminRoute>} />
          <Route path="/reports"            element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/users"              element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/users/new"          element={<AdminRoute><UserFormPage /></AdminRoute>} />
          <Route path="/users/:id/edit"     element={<AdminRoute><UserFormPage /></AdminRoute>} />
          <Route path="/audit"              element={<AdminRoute><AuditPage /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
