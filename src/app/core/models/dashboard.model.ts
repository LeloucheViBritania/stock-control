export interface DashboardStats {
  produitsTotal: number;
  produitsActifs: number;
  alertesStock: number;
  commandesEnCours: number;
  commandesMois: number;
  chiffreAffaires: number;
  clientsTotal: number;
  mouvementsJour: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}
