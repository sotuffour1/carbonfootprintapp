import { createBrowserClient } from '@supabase/ssr';
import { DEFAULT_EMISSION_FACTORS, EmissionFactor, EmissionSource, Profile, CarbonReport } from '../emissions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (supabaseUrl && supabaseAnonKey) {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return null;
}

// Local storage keys for hybrid / demo fallback
const STORAGE_KEYS = {
  USER: 'footprint_user',
  FACTORS: 'footprint_emission_factors',
  SOURCES: 'footprint_emission_sources',
  REPORTS: 'footprint_reports'
};

// Seed initial mock user and activities if local storage empty
export function initLocalStorageState() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.FACTORS)) {
    localStorage.setItem(STORAGE_KEYS.FACTORS, JSON.stringify(DEFAULT_EMISSION_FACTORS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    const demoUser = {
      id: 'demo-user-123',
      email: 'eco.user@example.com',
      name: 'Jane Doe',
      role: 'USER'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SOURCES)) {
    const initialSources: EmissionSource[] = [
      {
        id: 's-1',
        user_id: 'demo-user-123',
        category: 'TRANSPORT',
        activity_type: 'petrol_car',
        activity_label: 'Petrol Car',
        quantity: 120,
        unit: 'km',
        co2e_kg: 23.04,
        logged_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 's-2',
        user_id: 'demo-user-123',
        category: 'ENERGY',
        activity_type: 'grid_electricity',
        activity_label: 'Grid Electricity',
        quantity: 150,
        unit: 'kWh',
        co2e_kg: 34.95,
        logged_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 's-3',
        user_id: 'demo-user-123',
        category: 'FOOD',
        activity_type: 'beef',
        activity_label: 'Beef',
        quantity: 1.5,
        unit: 'kg',
        co2e_kg: 40.5,
        logged_at: new Date(Date.now() - 8 * 86400000).toISOString()
      },
      {
        id: 's-4',
        user_id: 'demo-user-123',
        category: 'WASTE',
        activity_type: 'landfill',
        activity_label: 'Landfill Waste',
        quantity: 15,
        unit: 'kg',
        co2e_kg: 8.7,
        logged_at: new Date(Date.now() - 12 * 86400000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(initialSources));
  }
}

// Data service wrapping Supabase REST calls with automatic LocalStorage fallback
export const dataService = {
  // Emission Factors
  async getEmissionFactors(): Promise<EmissionFactor[]> {
    const client = createClient();
    if (client) {
      const { data, error } = await client
        .from('emission_factors')
        .select('*')
        .order('category', { ascending: true });
      if (!error && data && data.length > 0) return data as EmissionFactor[];
    }

    // Local storage fallback
    initLocalStorageState();
    const raw = localStorage.getItem(STORAGE_KEYS.FACTORS);
    return raw ? JSON.parse(raw) : DEFAULT_EMISSION_FACTORS;
  },

  async addEmissionFactor(factor: Omit<EmissionFactor, 'id'>): Promise<EmissionFactor> {
    const client = createClient();
    if (client) {
      const { data, error } = await client
        .from('emission_factors')
        .insert([factor])
        .select()
        .single();
      if (!error && data) return data as EmissionFactor;
    }

    const current = await this.getEmissionFactors();
    const newFactor: EmissionFactor = {
      ...factor,
      id: `f-${Date.now()}`
    };
    const updated = [newFactor, ...current];
    localStorage.setItem(STORAGE_KEYS.FACTORS, JSON.stringify(updated));
    return newFactor;
  },

  async updateEmissionFactor(id: string, updates: Partial<EmissionFactor>): Promise<boolean> {
    const client = createClient();
    if (client) {
      const { error } = await client
        .from('emission_factors')
        .update(updates)
        .eq('id', id);
      if (!error) return true;
    }

    const current = await this.getEmissionFactors();
    const index = current.findIndex((f) => f.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.FACTORS, JSON.stringify(current));
      return true;
    }
    return false;
  },

  // Emission Sources
  async getEmissionSources(): Promise<EmissionSource[]> {
    const client = createClient();
    if (client) {
      const { data, error } = await client
        .from('emission_sources')
        .select('*')
        .order('logged_at', { ascending: false });
      if (!error && data) return data as EmissionSource[];
    }

    initLocalStorageState();
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
    return raw ? JSON.parse(raw) : [];
  },

  async logEmissionSource(
    source: Omit<EmissionSource, 'id' | 'user_id'>
  ): Promise<EmissionSource> {
    const client = createClient();
    const user = await this.getCurrentUser();

    if (client && user?.id) {
      const payload = {
        user_id: user.id,
        category: source.category,
        activity_type: source.activity_type,
        quantity: source.quantity,
        unit: source.unit,
        co2e_kg: source.co2e_kg,
        logged_at: source.logged_at
      };
      const { data, error } = await client
        .from('emission_sources')
        .insert([payload])
        .select()
        .single();
      if (!error && data) return data as EmissionSource;
    }

    const current = await this.getEmissionSources();
    const newSource: EmissionSource = {
      ...source,
      id: `s-${Date.now()}`,
      user_id: user?.id || 'demo-user-123'
    };
    const updated = [newSource, ...current];
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(updated));
    return newSource;
  },

  async addEmissionSource(source: Omit<EmissionSource, 'id' | 'user_id'>): Promise<EmissionSource> {
    return this.logEmissionSource(source);
  },

  async deleteEmissionSource(id: string): Promise<boolean> {
    const client = createClient();
    if (client) {
      const { error } = await client.from('emission_sources').delete().eq('id', id);
      if (!error) return true;
    }

    const current = await this.getEmissionSources();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(updated));
    return true;
  },

  // Carbon Reports
  async getCarbonReports(): Promise<CarbonReport[]> {
    const client = createClient();
    if (client) {
      const { data, error } = await client
        .from('carbon_reports')
        .select('*')
        .order('generated_at', { ascending: false });
      if (!error && data) return data as CarbonReport[];
    }

    initLocalStorageState();
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : [];
  },

  async createCarbonReport(report: Omit<CarbonReport, 'id' | 'user_id' | 'generated_at'>): Promise<CarbonReport> {
    const user = await this.getCurrentUser();
    const newReport: CarbonReport = {
      ...report,
      id: `r-${Date.now()}`,
      user_id: user?.id || 'demo-user-123',
      generated_at: new Date().toISOString()
    };

    const current = await this.getCarbonReports();
    const updated = [newReport, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    }
    return newReport;
  },


  // User Profile & Auth helper
  async getCurrentUser(): Promise<{ id: string; email: string; name: string; role: 'USER' | 'ADMIN' } | null> {
    const client = createClient();
    if (client) {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        return {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          role: profile?.role || 'USER'
        };
      }
    }

    initLocalStorageState();
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: { id: string; email: string; name: string; role: 'USER' | 'ADMIN' }) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  logoutUser() {
    const client = createClient();
    if (client) {
      client.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
};
