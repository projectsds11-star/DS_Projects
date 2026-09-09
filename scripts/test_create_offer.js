import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wprxkmxbuwipmymswmgq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testOffer() {
  console.log('Testing Supabase job_offers table...');
  const { data: emps, error: empErr } = await supabase.from('employees').select('*').limit(5);
  console.log('Employees in DB:', emps?.length, empErr?.message || '');
  if (emps && emps.length > 0) {
    console.log('Sample emp:', emps[0].employee_id, emps[0].name || emps[0].full_name, emps[0].email);
  }

  // Test selecting from job_offers
  const { data: offers, error: offerErr } = await supabase.from('job_offers').select('*').limit(5);
  if (offerErr) {
    console.error('Error selecting from job_offers:', offerErr.message, offerErr.code, offerErr.details);
  } else {
    console.log('Current job_offers in DB:', offers?.length);
  }

  // Test API endpoint for email
  console.log('Testing /api/admin/send-onboarding-email endpoint...');
  try {
    const res = await fetch('http://localhost:5000/api/admin/send-onboarding-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: emps?.[0]?.employee_id || 'DS-001',
        fullName: emps?.[0]?.name || emps?.[0]?.full_name || 'Test Candidate',
        email: emps?.[0]?.email || 'balajirockzz9030@gmail.com',
        position: 'Mandal Co-ordinator',
        district: 'Nellore',
        mandal: 'Kavali',
        joiningDate: '2026-09-15',
        salary: {
          basic: 25000,
          travel: 5000,
          monthlyTotal: 30000,
          annualCtc: 360000,
        },
      }),
    });
    const json = await res.json();
    console.log('Email API response status:', res.status, json);
  } catch (apiErr) {
    console.error('Email API fetch error:', apiErr.message);
  }
}

testOffer().catch(console.error);
