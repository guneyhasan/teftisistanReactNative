import { create } from 'zustand';
import { Audit, Company, User, Branch } from '@src/types';
import { auditService, AuditFilters } from '../services/auditService';

interface AuditListState {
  audits: Audit[];
  companies: Company[];
  fieldUsers: User[];
  branches: Branch[];
  filters: AuditFilters;
  loading: boolean;
  error: string | null;

  fetchAudits: () => Promise<void>;
  fetchFilterData: () => Promise<void>;
  setFilters: (filters: Partial<AuditFilters>) => void;
  deleteAudit: (id: string) => Promise<void>;
}

export const useAuditStore = create<AuditListState>((set, get) => ({
  audits: [],
  companies: [],
  fieldUsers: [],
  branches: [],
  filters: {},
  loading: false,
  error: null,

  fetchAudits: async () => {
    set({ loading: true, error: null });
    try {
      const audits = await auditService.getAudits(get().filters);
      set({ audits, loading: false });
    } catch {
      set({ error: 'Denetimler yüklenemedi', loading: false });
    }
  },

  fetchFilterData: async () => {
    try {
      const [companies, fieldUsers, branches] = await Promise.all([
        auditService.getCompanies(),
        auditService.getFieldUsers(),
        auditService.getBranches(),
      ]);
      set({ companies, fieldUsers, branches });
    } catch {
      // Non-critical
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchAudits();
  },

  deleteAudit: async (id) => {
    await auditService.deleteAudit(id);
    set((state) => ({ audits: state.audits.filter((a) => a.id !== id) }));
  },
}));
