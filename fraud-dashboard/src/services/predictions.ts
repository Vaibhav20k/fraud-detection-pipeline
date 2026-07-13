import api from "./api";

export interface Prediction {
  transactionID: string;
  userID: string;
  fraudProbability: number;
  prediction: boolean;
  decision: string;
  threshold: number;
  modelVersion: string;
  riskFlags: string[];
}

export async function getPredictions(): Promise<Prediction[]> {
  const response = await api.get("/predictions");

  return response.data.map((item: any) => ({
    transactionID: item.transactionID,
    userID: item.userID,
    fraudProbability: item.fraudProbability,
    prediction: item.prediction,
    decision: item.decision,
    threshold: item.threshold,
    modelVersion: item.modelVersion,
    riskFlags: item.riskFlags ?? [],
  }));
}