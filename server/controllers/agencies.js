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
    if (!body.name || !body.phone) {
      return res.status(400).json({ success: false, message: 'Agency name and phone number are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .insert([{
        agency_code: body.agency_code,
        name: body.name,
        contact_person: body.contact_person || '',
        phone: body.phone,
        email: body.email || '',
        state_id: body.state_id || 'AP-STATE-01',
        state_name: body.state_name || 'Andhra Pradesh',
        district_id: body.district_id || '',
        district_name: body.district_name || '',
        mandal_id: body.mandal_id || '',
        mandal_name: body.mandal_name || '',
        address: body.address || '',
        pincode: body.pincode || '',
        status: body.status || 'active',
        notes: body.notes || ''
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
    const body = req.body;

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .update({
        name: body.name,
        contact_person: body.contact_person,
        phone: body.phone,
        email: body.email,
        district_id: body.district_id,
        district_name: body.district_name,
        mandal_id: body.mandal_id,
        mandal_name: body.mandal_name,
        address: body.address,
        pincode: body.pincode,
        status: body.status,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
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
