import { api } from "./client";

export async function reportSales(filters = {}) {
  const res = await api.get("/reports/sales", { params: filters });
  return res.data;
}

export async function reportTopProducts(filters = {}) {
  const res = await api.get("/reports/top-products", { params: filters });
  return res.data;
}

export async function reportLowStock(filters = {}) {
  const res = await api.get("/reports/low-stock", { params: filters });
  return res.data;
}

export async function getDashboard() {
  const res = await api.get("/dashboard");
  return res.data;
}
