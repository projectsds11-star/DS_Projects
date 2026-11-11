import { supabaseAdmin } from '../services/supabaseAdmin.js';

export async function getAgencies(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    return res.status(200).json({ success: true, agencies: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createAgency(req, res) {
  try {
    const body = req.body;
    if (!body.name?.trim() || !body.phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Agency name and phone number are required.' });
    }

    let agencyCode = (body.agency_code || '').trim();
    if (!agencyCode) {
      const { data: existingCodes } = await supabaseAdmin
        .from('agencies')
        .select('agency_code');
      let maxNum = 0;
      (existingCodes || []).forEach((a) => {
        const match = (a.agency_code || '').match(/AG-(\d+)/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!Number.isNaN(n) && n > maxNum) maxNum = n;
        }
      });
      agencyCode = `AG-${String(maxNum + 1).padStart(3, '0')}`;
    }

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .insert([{
        agency_code: agencyCode,
        name: body.name.trim(),
        contact_person: (body.contact_person || '').trim(),
        phone: body.phone.trim(),
        email: (body.email || '').trim().toLowerCase(),
        state_id: body.state_id || 'AP-STATE-01',
        state_name: body.state_name || 'Andhra Pradesh',
        district_id: body.district_id || '',
        district_name: body.district_name || '',
        mandal_id: body.mandal_id || '',
        mandal_name: body.mandal_name || '',
        address: (body.address || '').trim(),
        pincode: (body.pincode || '').trim(),
        status: body.status || 'active',
        notes: (body.notes || '').trim()
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    return res.status(201).json({ success: true, agency: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateAgency(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const updates = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = String(body.name || '').trim();
    if (body.contact_person !== undefined) updates.contact_person = String(body.contact_person || '').trim();
    if (body.phone !== undefined) updates.phone = String(body.phone || '').trim();
    if (body.email !== undefined) updates.email = String(body.email || '').trim().toLowerCase();
    if (body.state_id !== undefined) updates.state_id = body.state_id;
    if (body.state_name !== undefined) updates.state_name = body.state_name;
    if (body.district_id !== undefined) updates.district_id = body.district_id;
    if (body.district_name !== undefined) updates.district_name = body.district_name;
    if (body.mandal_id !== undefined) updates.mandal_id = body.mandal_id;
    if (body.mandal_name !== undefined) updates.mandal_name = body.mandal_name;
    if (body.address !== undefined) updates.address = String(body.address || '').trim();
    if (body.pincode !== undefined) updates.pincode = String(body.pincode || '').trim();
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = String(body.notes || '').trim();

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    return res.status(200).json({ success: true, agency: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteAgency(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('agencies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    return res.status(200).json({ success: true, message: 'Agency deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
