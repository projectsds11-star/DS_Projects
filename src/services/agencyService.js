/**
 * src/services/agencyService.js
 * Agency Management Service for DS PROJECTS
 * Connects to Supabase `agencies` table with automatic localStorage caching & offline fallback.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'ds_agencies_cache';

const INITIAL_AGENCIES = [
  {
    id: 'ag-seed-001',
    agency_code: 'AG-001',
    name: 'Apex Field Network & Operations',
    contact_person: 'Ramesh Varma',
    phone: '9848012345',
    email: 'ramesh.apex@dsoperations.org',
    state_id: 'AP-STATE-01',
    state_name: 'Andhra Pradesh',
    district_id: 'AP-DIS-21',
    district_name: 'NTR',
    mandal_id: 'AP-NTR-M01',
    mandal_name: 'Vijayawada Rural',
    address: 'D.No 40-1-28, MG Road, Benz Circle',
    pincode: '520010',
    status: 'active',
    notes: 'Primary field operations and logistics coordination partner for NTR district.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ag-seed-002',
    agency_code: 'AG-002',
    name: 'Godavari Workforce Partners',
    contact_person: 'Srinivasa Rao',
    phone: '9989054321',
    email: 'godavari.workforce@dsoperations.org',
    state_id: 'AP-STATE-01',
    state_name: 'Andhra Pradesh',
    district_id: 'AP-DIS-07',
    district_name: 'East Godavari',
    mandal_id: 'AP-EG-M02',
    mandal_name: 'Rajahmundry Rural',
    address: 'Plot 14, Main Road, Danavaipeta',
    pincode: '533103',
    status: 'active',
    notes: 'Handles mandal-level verification and surveying logistics.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date().toISOString()
  }
];

function getLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AGENCIES));
      return [...INITIAL_AGENCIES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...INITIAL_AGENCIES];
  } catch (e) {
    return [...INITIAL_AGENCIES];
  }
}

function setLocalCache(agencies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agencies));
  } catch (e) {
    console.warn('Failed to save agencies to localStorage cache:', e);
  }
}

export const agencyService = {
  /**
   * Fetch next available agency code (e.g. AG-001, AG-002)
   */
  async getNextAgencyCode() {
    const list = await this.getAgencies();
    let maxNum = 0;
    list.forEach(a => {
      const match = (a.agency_code || '').match(/AG-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `AG-${String(nextNum).padStart(3, '0')}`;
  },

  /**
   * Fetch all non-deleted agencies
   */
  async getAgencies() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          setLocalCache(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase getAgencies error, fallback to local cache:', err);
      }
    }
    return getLocalCache();
  },

  /**
   * Fetch single agency by ID or agency_code
   */
  async getAgencyById(idOrCode) {
    if (!idOrCode) return null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .or(`id.eq.${idOrCode},agency_code.eq.${idOrCode}`)
          .is('deleted_at', null)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAgencyById error:', err);
      }
    }

    const localList = getLocalCache();
    return localList.find(a => a.id === idOrCode || a.agency_code === idOrCode) || null;
  },

  /**
   * Register a new agency
   */
  async createAgency(formData) {
    const code = formData.agency_code || await this.getNextAgencyCode();
    const newRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ag-${Date.now()}`,
      agency_code: code,
      name: (formData.name || '').trim(),
      contact_person: (formData.contact_person || '').trim(),
      phone: (formData.phone || '').trim(),
      email: (formData.email || '').trim().toLowerCase(),
      state_id: formData.state_id || 'AP-STATE-01',
      state_name: formData.state_name || 'Andhra Pradesh',
      district_id: formData.district_id || '',
      district_name: formData.district_name || '',
      mandal_id: formData.mandal_id || '',
      mandal_name: formData.mandal_name || '',
      address: (formData.address || '').trim(),
      pincode: (formData.pincode || '').trim(),
      status: formData.status || 'active',
      notes: (formData.notes || '').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .insert([newRecord])
          .select()
          .maybeSingle();

        if (!error && data) {
          const cached = getLocalCache();
          setLocalCache([data, ...cached.filter(a => a.id !== data.id)]);
          return { success: true, data };
        }
      } catch (err) {
        console.warn('Supabase insert agency failed, saving locally:', err);
      }
    }

    // Save to local cache
    const current = getLocalCache();
    const updated = [newRecord, ...current.filter(a => a.id !== newRecord.id)];
    setLocalCache(updated);
    return { success: true, data: newRecord };
  },

  /**
   * Update an existing agency
   */
  async updateAgency(id, formData) {
    const updateData = {
      name: (formData.name || '').trim(),
      contact_person: (formData.contact_person || '').trim(),
      phone: (formData.phone || '').trim(),
      email: (formData.email || '').trim().toLowerCase(),
      state_id: formData.state_id || 'AP-STATE-01',
      state_name: formData.state_name || 'Andhra Pradesh',
      district_id: formData.district_id || '',
      district_name: formData.district_name || '',
      mandal_id: formData.mandal_id || '',
      mandal_name: formData.mandal_name || '',
      address: (formData.address || '').trim(),
      pincode: (formData.pincode || '').trim(),
      status: formData.status || 'active',
      notes: (formData.notes || '').trim(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .update(updateData)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          const cached = getLocalCache();
          setLocalCache(cached.map(a => a.id === id ? data : a));
          return { success: true, data };
        }
      } catch (err) {
        console.warn('Supabase update agency error:', err);
      }
    }

    const cached = getLocalCache();
    const updated = cached.map(a => (a.id === id ? { ...a, ...updateData } : a));
    setLocalCache(updated);
    const updatedAgency = updated.find(a => a.id === id);
    return { success: true, data: updatedAgency };
  },

  /**
   * Toggle agency status between active and inactive
   */
  async toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return this.updateAgency(id, { status: newStatus });
  },

  /**
   * Soft delete agency
   */
  async deleteAgency(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('agencies')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          const cached = getLocalCache();
          setLocalCache(cached.filter(a => a.id !== id));
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase delete agency error:', err);
      }
    }

    const cached = getLocalCache();
    setLocalCache(cached.filter(a => a.id !== id));
    return { success: true };
  }
};
