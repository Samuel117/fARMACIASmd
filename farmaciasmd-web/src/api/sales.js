import { api } from "./client";

export async function listSales(filters = {}) {
  const res = await api.get("/sales", { params: filters });
  return res.data;
}

export async function createSale(payload) {
  const res = await api.post("/sales", payload);
  return res.data;
}

export async function getSale(id) {
  const res = await api.get(`/sales/${id}`);
  return res.data;
}

export async function cancelSale(id) {
  const res = await api.post(`/sales/${id}/cancel`);
  return res.data;
}
