// Live Data Service for DS PROJECTS
// Universal Data Access Layer connected directly to Supabase with Clean/Live State

import { supabase, isSupabaseConfigured } from './supabaseClient';

// Clean, empty local state (No dummy data)
let _employees = [];
let _workTasks = [];
let _attendance = [];
let _documents = [];
let _notifications = [];
let _offers = [];

export const liveDataService = {
  // =========================================================================
  // 1. EMPLOYEES
  // =========================================================================
  async getEmployees() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getEmployees error:', err);
      }
    }
    return [..._employees];
  },

  /**
   * Returns active employees who are eligible for field operations and work assignment.
   * Filters out employees who are marked Inactive or Deleted.
   */
  async getActiveOnboardedEmployees() {
    const allEmps = await this.getEmployees();
    let offers = [];
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('job_offers').select('*');
        offers = data || [];
      } catch (e) {
        console.warn('Could not fetch job offers in getActiveOnboardedEmployees:', e);
      }
    }

    return (allEmps || []).filter(emp => {
      if (emp.deleted_at) return false;
      const status = (emp.status || '').toLowerCase().trim();
      if (status === 'inactive' || status === 'deactivated') return false;

      const empId = emp.employee_id || emp.employeeId || emp.id;
      const matchingOffer = offers.find(o => 
        (o.employee_id === empId || o.employeeId === empId)
      );

      // Attach matching offer data (district, mandal, position) to the employee object
      if (matchingOffer) {
        emp.district = emp.district || emp.district_id || matchingOffer.district;
        emp.mandal = emp.mandal || emp.mandal_id || matchingOffer.mandal;
        emp.position = emp.position || matchingOffer.position;
        emp.designation = emp.designation || matchingOffer.position;
      } else {
        emp.district = emp.district || emp.district_id || 'Nellore';
        emp.mandal = emp.mandal || emp.mandal_id || 'Kavali';
        emp.designation = emp.designation || 'Mandal Field Officer';
      }

      return true;
    });
  },


  async getEmployeeById(employeeId) {
    if (!employeeId) return null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', employeeId)
          .single();
        if (!error && data) {
          // Also fetch latest job offer to sync assigned jurisdiction and designation
          let offer = null;
          try {
            const { data: offerData } = await supabase
              .from('job_offers')
              .select('*')
              .eq('employee_id', employeeId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            offer = offerData;
          } catch (e) {
            console.warn('Could not fetch offer in getEmployeeById:', e);
          }

          const resolvedMandal = offer?.mandal || data.mandal || data.mandal_id || '';
          const resolvedDistrict = offer?.district || data.district || data.district_id || '';
          const resolvedPosition = offer?.position || data.position || data.designation || 'Mandal Co-ordinator';
          const resolvedName = data.full_name || data.name || offer?.employee_name || 'Employee';

          // Resolve public storage URLs
          let photoUrl = null;
          if (data.candidate_photo_path) {
            const { data: pUrlData } = supabase.storage.from('employee-photos').getPublicUrl(data.candidate_photo_path);
            photoUrl = pUrlData?.publicUrl || null;
          }
          let aadhaarDocUrl = null;
          if (data.aadhaar_document_path) {
            const { data: aUrlData } = supabase.storage.from('employee-documents').getPublicUrl(data.aadhaar_document_path);
            aadhaarDocUrl = aUrlData?.publicUrl || null;
          }
          let panDocUrl = null;
          if (data.pan_document_path) {
            const { data: panUrlData } = supabase.storage.from('employee-documents').getPublicUrl(data.pan_document_path);
            panDocUrl = panUrlData?.publicUrl || null;
          }
          let passbookUrl = null;
          if (data.bank_passbook_path) {
            const { data: passUrlData } = supabase.storage.from('employee-documents').getPublicUrl(data.bank_passbook_path);
            passbookUrl = passUrlData?.publicUrl || null;
          }

          return {
            ...data,
            id: data.id,
            employee_id: data.employee_id || employeeId,
            employeeId: data.employee_id || employeeId,
            full_name: resolvedName,
            name: resolvedName,
            mandal: resolvedMandal,
            mandal_id: resolvedMandal,
            district: resolvedDistrict,
            district_id: resolvedDistrict,
            position: resolvedPosition,
            designation: resolvedPosition,
            department: offer?.department || data.department || 'Field Operations',
            photoUrl,
            photo_url: photoUrl,
            photoPath: data.candidate_photo_path,
            aadhaarDocUrl,
            panDocUrl,
            passbookUrl,
            offer,
          };
        }
      } catch (err) {
        console.warn('Supabase getEmployeeById error:', err);
      }
    }
    const local = _employees.find(e => e.employee_id === employeeId || e.id === employeeId);
    if (local) {
      const localOffer = _offers.find(o => o.employee_id === employeeId || o.employeeId === employeeId);
      return {
        ...local,
        mandal: localOffer?.mandal || local.mandal || local.mandal_id || '',
        mandal_id: localOffer?.mandal || local.mandal_id || local.mandal || '',
        district: localOffer?.district || local.district || local.district_id || '',
        district_id: localOffer?.district || local.district_id || local.district || '',
        position: localOffer?.position || local.position || local.designation || 'Mandal Co-ordinator',
        designation: localOffer?.position || local.designation || local.position || 'Mandal Co-ordinator',
        full_name: local.full_name || local.name || localOffer?.employee_name || '',
      };
    }
    return null;
  },

  async createEmployee(employeeData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .insert([employeeData])
          .select();
        if (!error && data) return { success: true, data: data[0] };
        if (error) return { success: false, error: error.message };
      } catch (err) {
        console.warn('Supabase createEmployee error:', err);
      }
    }
    _employees.unshift(employeeData);
    return { success: true, data: employeeData };
  },

  async updateEmployee(employeeId, updates) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .update(updates)
          .eq('employee_id', employeeId)
          .select();
        if (!error && data) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Supabase updateEmployee error:', err);
      }
    }
    const idx = _employees.findIndex(e => e.employee_id === employeeId);
    if (idx !== -1) {
      _employees[idx] = { ..._employees[idx], ...updates };
      return { success: true, data: _employees[idx] };
    }
    return { success: false, error: 'Employee not found' };
  },

  // =========================================================================
  // 2. WORK TASKS
  // =========================================================================
  async getWorkTasks(employeeId) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('work_tasks').select('*').order('created_at', { ascending: false });
        if (employeeId) {
          query = query.eq('assigned_employee_id', employeeId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getWorkTasks error:', err);
      }
    }
    if (employeeId) {
      return _workTasks.filter(t => t.assigned_employee_id === employeeId);
    }
    return [..._workTasks];
  },

  async createWorkTask(taskData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('work_tasks')
          .insert([taskData])
          .select();
        if (!error && data) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Supabase createWorkTask error:', err);
      }
    }
    _workTasks.unshift(taskData);
    return { success: true, data: taskData };
  },

  async updateTaskStatus(taskCode, status) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('work_tasks').update({ status }).eq('task_code', taskCode);
      } catch (err) {
        console.warn('Supabase updateTaskStatus error:', err);
      }
    }
    const idx = _workTasks.findIndex(t => t.task_code === taskCode);
    if (idx !== -1) {
      _workTasks[idx] = { ..._workTasks[idx], status };
    }
    return { success: true };
  },

  async submitWorkReport(taskCode, { reportSummary, attachments = [] }) {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase.from('work_tasks').update({
          status: 'Submitted',
          report_summary: reportSummary,
          attachments,
          submitted_at: now
        }).eq('task_code', taskCode);
      } catch (err) {
        console.warn('Supabase submitWorkReport error:', err);
      }
    }
    const idx = _workTasks.findIndex(t => t.task_code === taskCode);
    if (idx !== -1) {
      _workTasks[idx] = {
        ..._workTasks[idx],
        status: 'Submitted',
        report_summary: reportSummary,
        attachments,
        submitted_at: now
      };
    }
    return { success: true };
  },

  // =========================================================================
  // 3. ATTENDANCE RECORDS
  // =========================================================================
  async getAttendance(employeeId) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('attendance_records').select('*').order('created_at', { ascending: false });
        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAttendance error:', err);
      }
    }
    if (employeeId) {
      return _attendance.filter(a => a.employee_id === employeeId);
    }
    return [..._attendance];
  },

  async punchCheckIn(employeeId, locationName = 'Field Office', coordinates = null) {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
    const records = await this.getAttendance(employeeId);
    
    // Check if a record already exists for today
    const existingToday = records.find(r => r.punch_date === todayStr);

    if (existingToday) {
      if (existingToday.check_out_time && existingToday.check_out_time !== '-- : --' && existingToday.check_out_time !== '--:--') {
        throw new Error('You have already completed your daily shift (1 punch-in & 1 punch-out allowed per day). Next punch available tomorrow.');
      }
      return { success: true, data: existingToday, alreadyActive: true };
    }

    const now = new Date();
    const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Determine status (Late if after 09:30 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = (hours > 9) || (hours === 9 && minutes > 30);
    const status = isLate ? 'Late' : 'Present';

    const newPunch = {
      employee_id: employeeId,
      punch_date: todayStr,
      check_in_time: nowTime,
      check_out_time: '-- : --',
      effective_hours: '0h 00m',
      location_name: locationName || 'Field Office',
      status: status,
      latitude: coordinates?.latitude || null,
      longitude: coordinates?.longitude || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .insert([newPunch])
          .select();
        if (!error && data && data.length > 0) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Supabase punchCheckIn error:', err);
      }
    }

    _attendance.unshift(newPunch);
    return { success: true, data: newPunch };
  },

  async punchCheckOut(employeeId, options = { force: false }) {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
    const records = await this.getAttendance(employeeId);
    const openPunch = records.find(r => r.punch_date === todayStr && (r.check_out_time === '-- : --' || r.check_out_time === '--:--' || !r.check_out_time));

    if (!openPunch) {
      const completedPunch = records.find(r => r.punch_date === todayStr && r.check_out_time && r.check_out_time !== '-- : --' && r.check_out_time !== '--:--');
      if (completedPunch) {
        throw new Error('You have already completed your punch-out for today.');
      }
      throw new Error('No active punch-in found for today. Please punch in first.');
    }

    const now = new Date();
    const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const checkInDate = new Date(openPunch.created_at || now);
    const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const effectiveHours = `${diffHours}h ${diffMins.toString().padStart(2, '0')}m`;

    const MANDATORY_SHIFT_SECONDS = 8 * 3600; // 8 hours mandatory
    const elapsedSeconds = Math.floor(diffMs / 1000);

    // 8-hour mandatory rule verification
    if (elapsedSeconds < MANDATORY_SHIFT_SECONDS && !options.force) {
      const remainingSec = MANDATORY_SHIFT_SECONDS - elapsedSeconds;
      const remHours = Math.floor(remainingSec / 3600);
      const remMins = Math.floor((remainingSec % 3600) / 60);
      return {
        success: false,
        requiresEarlyConfirm: true,
        remainingTime: `${remHours}h ${remMins.toString().padStart(2, '0')}m`,
        elapsedTime: `${diffHours}h ${diffMins.toString().padStart(2, '0')}m`,
        message: `8 Hours Mandatory Shift: You have only worked ${diffHours}h ${diffMins}m. 8 hours of duty is mandatory before punching out (Remaining: ${remHours}h ${remMins}m).`
      };
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('attendance_records')
          .update({
            check_out_time: nowTime,
            effective_hours: effectiveHours,
            updated_at: now.toISOString()
          })
          .eq('id', openPunch.id);
      } catch (err) {
        console.warn('Supabase punchCheckOut error:', err);
      }
    }

    const idx = _attendance.findIndex(a => a.id === openPunch.id || (a.employee_id === employeeId && a.punch_date === todayStr));
    if (idx !== -1) {
      _attendance[idx] = { ..._attendance[idx], check_out_time: nowTime, effective_hours: effectiveHours };
    }
    return { 
      success: true, 
      check_out_time: nowTime, 
      effective_hours: effectiveHours,
      completedToday: true
    };
  },

  async getLiveShiftStatus(employeeId) {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
    const records = await this.getAttendance(employeeId);
    
    const todayRecords = records.filter(r => r.punch_date === todayStr);
    const openRecord = todayRecords.find(r => r.check_out_time === '-- : --' || r.check_out_time === '--:--' || !r.check_out_time);
    const completedRecord = todayRecords.find(r => r.check_out_time && r.check_out_time !== '-- : --' && r.check_out_time !== '--:--');

    const MANDATORY_SHIFT_SECONDS = 8 * 3600; // 8 hours

    if (openRecord) {
      const checkInDate = new Date(openRecord.created_at || Date.now());
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000));
      const remainingSeconds = Math.max(0, MANDATORY_SHIFT_SECONDS - elapsedSeconds);
      const canPunchOut = elapsedSeconds >= MANDATORY_SHIFT_SECONDS;
      const progressPercent = Math.min(100, Math.round((elapsedSeconds / MANDATORY_SHIFT_SECONDS) * 100));

      return {
        status: 'IN_PROGRESS',
        isCheckedIn: true,
        isCompletedToday: false,
        todayRecord: openRecord,
        elapsedSeconds,
        remainingSeconds,
        canPunchOut,
        progressPercent,
        mandatorySeconds: MANDATORY_SHIFT_SECONDS
      };
    }

    if (completedRecord) {
      return {
        status: 'COMPLETED',
        isCheckedIn: false,
        isCompletedToday: true,
        todayRecord: completedRecord,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        canPunchOut: false,
        progressPercent: 100,
        mandatorySeconds: MANDATORY_SHIFT_SECONDS
      };
    }

    return {
      status: 'NOT_PUNCHED',
      isCheckedIn: false,
      isCompletedToday: false,
      todayRecord: null,
      elapsedSeconds: 0,
      remainingSeconds: MANDATORY_SHIFT_SECONDS,
      canPunchOut: false,
      progressPercent: 0,
      mandatorySeconds: MANDATORY_SHIFT_SECONDS
    };
  },

  async requestRegularization(employeeId, { date, category, reason }) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('attendance_records').update({
          is_regularized: true,
          regularization_reason: `${category}: ${reason}`
        }).eq('employee_id', employeeId).eq('punch_date', date);
      } catch (err) {
        console.warn('Supabase regularization error:', err);
      }
    }
    return { success: true };
  },

  // =========================================================================
  // 4. DOCUMENTS
  // =========================================================================
  async getDocuments(employeeId) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('employee_documents').select('*').order('uploaded_at', { ascending: false });
        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getDocuments error:', err);
      }
    }
    if (employeeId) {
      return _documents.filter(d => d.employee_id === employeeId);
    }
    return [..._documents];
  },

  async addDocument(documentData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employee_documents')
          .insert([documentData])
          .select();
        if (!error && data) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Supabase addDocument error:', err);
      }
    }
    _documents.unshift(documentData);
    return { success: true, data: documentData };
  },

  // =========================================================================
  // 5. NOTIFICATIONS
  // =========================================================================
  async getNotifications(employeeId) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getNotifications error:', err);
      }
    }
    if (employeeId) {
      return _notifications.filter(n => n.employee_id === employeeId);
    }
    return [..._notifications];
  },

  async markNotificationRead(id) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (err) {
        console.warn('Supabase markNotificationRead error:', err);
      }
    }
    _notifications = _notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    return { success: true };
  },

  async createNotification(notificationData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([notificationData])
          .select();
        if (!error && data) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Supabase createNotification error:', err);
      }
    }
    _notifications.unshift(notificationData);
    return { success: true, data: notificationData };
  }
};
