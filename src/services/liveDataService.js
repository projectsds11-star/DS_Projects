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

  async getEmployeeById(employeeId) {
    if (!employeeId) return null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', employeeId)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getEmployeeById error:', err);
      }
    }
    return _employees.find(e => e.employee_id === employeeId) || null;
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

  async punchCheckIn(employeeId, locationName = 'Field Office') {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });

    const newPunch = {
      employee_id: employeeId,
      punch_date: todayStr,
      check_in_time: nowTime,
      check_out_time: '-- : --',
      effective_hours: '0h 00m',
      location_name: locationName,
      status: 'Present'
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .insert([newPunch])
          .select();
        if (!error && data) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Supabase punchCheckIn error:', err);
      }
    }

    _attendance.unshift(newPunch);
    return { success: true, data: newPunch };
  },

  async punchCheckOut(employeeId) {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('attendance_records')
          .update({ check_out_time: nowTime })
          .eq('employee_id', employeeId)
          .eq('punch_date', todayStr);
      } catch (err) {
        console.warn('Supabase punchCheckOut error:', err);
      }
    }

    const idx = _attendance.findIndex(a => a.employee_id === employeeId && a.punch_date === todayStr);
    if (idx !== -1) {
      _attendance[idx] = { ..._attendance[idx], check_out_time: nowTime };
    }
    return { success: true, check_out_time: nowTime };
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
