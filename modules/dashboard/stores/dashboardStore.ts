import { create } from 'zustand';
import { StatsOverview, AnnualStat, Audit, User, Branch } from '@src/types';
import { statsService } from '../services/statsService';

interface DashboardState {
  overview: StatsOverview | null;
  annualStats: AnnualStat[];
  recentAudits: Audit[];
  fieldUsers: User[];
  branches: Branch[];
  loading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
  fetchFormData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  overview: null,
  annualStats: [],
  recentAudits: [],
  fieldUsers: [],
  branches: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const [overview, annualStats, recentAudits] = await Promise.all([
        statsService.getOverview(),
        statsService.getAnnualStats(),
        statsService.getRecentAudits(),
      ]);
      set({ overview, annualStats, recentAudits, loading: false });
    } catch {
      set({ error: 'Dashboard verileri yüklenemedi', loading: false });
    }
  },

  fetchFormData: async () => {
    try {
      const [fieldUsers, branches] = await Promise.all([
        statsService.getFieldUsers(),
        statsService.getBranches(),
      ]);
      set({ fieldUsers, branches });
    } catch {
      // Non-critical; form data can be retried
    }
  },
}));
