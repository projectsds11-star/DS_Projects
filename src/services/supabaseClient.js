import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wprxkmxbuwipmymswmgq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcnhrbXhidXdpcG15bXN3bWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjc4NjAsImV4cCI6MjEwMzc0Mzg2MH0.1v8bdsxokG7TWleHilXtHsO9gl5ai7xhYfZ_3GcsENQ';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

// Create the official Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


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
  async uploadEmployeePhoto(file, employeeId) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}_photo_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.EMPLOYEE_PHOTOS)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('Storage upload error:', error.message);
      return URL.createObjectURL(file);
    }

    return supabase.storage.from(STORAGE_BUCKETS.EMPLOYEE_PHOTOS).getPublicUrl(filePath).data.publicUrl;
  },

  async uploadEmployeeDocument(file, employeeId, docType) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}_${docType}_${Date.now()}.${fileExt}`;
    const filePath = `${employeeId}/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('Storage upload error:', error.message);
      return URL.createObjectURL(file);
    }

    return supabase.storage.from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS).getPublicUrl(filePath).data.publicUrl;
  },

  async uploadOfferLetter(file, offerId) {
    if (!file) return null;
    const fileName = `offer_${offerId}_${Date.now()}.pdf`;
    const filePath = `letters/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.OFFER_LETTERS)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('Storage upload error:', error.message);
      return URL.createObjectURL(file);
    }

    return supabase.storage.from(STORAGE_BUCKETS.OFFER_LETTERS).getPublicUrl(filePath).data.publicUrl;
  },

  async uploadTaskAttachment(file, taskCode = 'TASK') {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${taskCode}_${Date.now()}_${sanitizedName}`;
    const filePath = `tasks/${fileName}`;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS)
          .upload(filePath, file, { upsert: true });

        if (!error) {
          return supabase.storage.from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS).getPublicUrl(filePath).data.publicUrl;
        } else {
          console.warn('Task attachment upload error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase storage upload error:', err);
      }
    }

    return URL.createObjectURL(file);
  }
};

