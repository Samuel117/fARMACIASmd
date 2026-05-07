import { api } from "./client";

export async function getAudit(filters = {}) {
  const res = await api.get("/audit", { params: filters });
  return res.data;
}
