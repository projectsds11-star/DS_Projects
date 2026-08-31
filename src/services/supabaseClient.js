import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase environment credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ [DS PROJECTS] Supabase credentials not configured in .env yet. Running in offline/mock service mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to connect to live Supabase.'
  );
}

// Create client instance or null if not configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Storage Bucket Constants
export const STORAGE_BUCKETS = {
  EMPLOYEE_PHOTOS: 'employee-photos',
  EMPLOYEE_DOCUMENTS: 'employee-documents',
  OFFER_LETTERS: 'offer-letters',
};

/**
 * Storage Helpers for DS PROJECTS Uploads
 */
export const storageService = {
  /**
   * Upload an employee profile photo to Supabase Storage
   */
  async uploadEmployeePhoto(file, employeeId) {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, generating mock object URL');
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}_photo_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.EMPLOYEE_PHOTOS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.EMPLOYEE_PHOTOS)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  /**
   * Upload an employee verification document (Aadhaar, PAN, Education, Bank Passbook)
   */
  async uploadEmployeeDocument(file, employeeId, docType) {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, generating mock object URL');
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}_${docType}_${Date.now()}.${fileExt}`;
    const filePath = `${employeeId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  /**
   * Upload an offer letter PDF document
   */
  async uploadOfferLetter(file, offerId) {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured, generating mock object URL');
      return URL.createObjectURL(file);
    }

    const fileName = `offer_${offerId}_${Date.now()}.pdf`;
    const filePath = `letters/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.OFFER_LETTERS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.OFFER_LETTERS)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
};
