import api from "./api";

export interface DashboardSummary {
  totalTransactions: number;
  fraudulent: number;
  review: number;
  allowed: number;
  fraudRate: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await api.get("/dashboard/summary");
  return data;
};