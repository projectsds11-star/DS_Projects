// DS PROJECTS — Native Supabase Client & Storage Service
// Direct, zero-bundle-overhead connection to Supabase Auth, PostgreSQL REST & Storage APIs

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wprxkmxbuwipmymswmgq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcnhrbXhidXdpcG15bXN3bWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjc4NjAsImV4cCI6MjEwMzc0Mzg2MH0.1v8bdsxokG7TWleHilXtHsO9gl5ai7xhYfZ_3GcsENQ';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

const defaultHeaders = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
};

/**
 * Native Supabase Client Interface
 */
export const supabase = {
  auth: {
    /**
     * Send 6-Digit OTP to email address
     */
    async signInWithOtp({ email, options = {} }) {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, using simulated OTP dispatch');
        return { data: { message: 'OTP sent (simulated)' }, error: null };
      }

      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/otp`, {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({
            email,
            create_user: options.shouldCreateUser ?? true,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.msg || data.error_description || data.message || 'Failed to dispatch OTP');
        }
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Verify 6-digit OTP token
     */
    async verifyOtp({ email, token, type = 'email' }) {
      if (!isSupabaseConfigured) {
        return { data: { session: { access_token: 'mock-token' } }, error: null };
      }

      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/verify`, {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({
            email,
            token,
            type,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.msg || data.error_description || data.message || 'Invalid verification code');
        }
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
  },

  storage: {
    from(bucketName) {
      return {
        /**
         * Upload file object to Supabase Storage
         */
        async upload(path, file, options = {}) {
          try {
            const formData = new FormData();
            formData.append('cacheControl', options.cacheControl || '3600');
            formData.append('', file);

            const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${path}`, {
              method: 'POST',
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'x-upsert': String(options.upsert ?? true),
              },
              body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');
            return { data, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },

        /**
         * Get public URL for uploaded object
         */
        getPublicUrl(path) {
          return {
            data: {
              publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`,
            },
          };
        },
      };
    },
  },
};

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
  }
};
